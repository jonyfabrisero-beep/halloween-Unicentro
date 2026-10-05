import { PlayerData } from '../types/game';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';

const CURRENT_PLAYER_KEY = 'unicentro_dulce_truco_current_player';
const ALL_PLAYERS_KEY = 'unicentro_dulce_truco_all_players_v2';

export const storageService = {
  getCurrentPlayer(): PlayerData | null {
    try {
      const data = localStorage.getItem(CURRENT_PLAYER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCurrentPlayer(player: PlayerData): void {
    try {
      localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(player));
      this.upsertToAllPlayers(player);

      // Asynchronous cloud sync to Firestore
      const cleanData: Record<string, any> = {
        id: player.id,
        playerName: player.playerName || '',
        parentName: player.parentName || '',
        gender: player.gender || 'boy',
        unlockedStores: player.unlockedStores || [],
        storeStars: player.storeStars || {},
        scanHistory: player.scanHistory || [],
        createdAt: player.createdAt || new Date().toISOString(),
        prizeDelivered: !!player.prizeDelivered,
      };

      if (player.completedAt) {
        cleanData.completedAt = player.completedAt;
      }
      if (player.prizeDeliveredAt) {
        cleanData.prizeDeliveredAt = player.prizeDeliveredAt;
      }

      setDoc(doc(db, 'players', player.id), cleanData, { merge: true }).catch((err) => {
        console.warn('Notice: Firestore sync fallback to local storage:', err);
      });
    } catch (e) {
      console.error('Error saving current player', e);
    }
  },

  getAllPlayers(): PlayerData[] {
    try {
      // Purge legacy sample data keys so the database begins 100% clean
      localStorage.removeItem('unicentro_dulce_truco_all_players_v1');
      const data = localStorage.getItem(ALL_PLAYERS_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  upsertToAllPlayers(player: PlayerData): void {
    try {
      const all = this.getAllPlayers();
      const index = all.findIndex((p) => p.id === player.id);
      if (index >= 0) {
        all[index] = player;
      } else {
        all.unshift(player);
      }
      localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Error upserting player', e);
    }
  },

  togglePrizeDelivered(playerId: string): PlayerData | null {
    try {
      const all = this.getAllPlayers();
      const index = all.findIndex((p) => p.id === playerId);
      if (index === -1) return null;

      const currentPrize = !!all[index].prizeDelivered;
      const newStatus = !currentPrize;
      const deliveredTime = newStatus ? new Date().toISOString() : undefined;

      all[index] = {
        ...all[index],
        prizeDelivered: newStatus,
        prizeDeliveredAt: deliveredTime,
      };

      localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify(all));

      // Synchronize active player if currently playing
      const current = this.getCurrentPlayer();
      if (current && current.id === playerId) {
        const updatedCurrent = {
          ...current,
          prizeDelivered: newStatus,
          prizeDeliveredAt: deliveredTime,
        };
        localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(updatedCurrent));
      }

      // Sync to cloud Firestore
      updateDoc(doc(db, 'players', playerId), {
        prizeDelivered: newStatus,
        prizeDeliveredAt: deliveredTime || null,
      }).catch((err) => {
        console.warn('Notice: Firestore prize update fallback:', err);
      });

      return all[index];
    } catch (e) {
      console.error('Error toggling prize delivered', e);
      return null;
    }
  },

  deletePlayer(playerId: string): void {
    try {
      // 1. Remove from local storage
      const all = this.getAllPlayers().filter((p) => p.id !== playerId);
      localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify(all));

      const current = this.getCurrentPlayer();
      if (current && current.id === playerId) {
        localStorage.removeItem(CURRENT_PLAYER_KEY);
      }

      // 2. Delete from cloud Firestore
      deleteDoc(doc(db, 'players', playerId)).catch((err) => {
        console.warn('Notice: Firestore deleteDoc fallback:', err);
      });
    } catch (e) {
      console.error('Error deleting player', e);
    }
  },

  clearCurrentPlayer(): void {
    localStorage.removeItem(CURRENT_PLAYER_KEY);
  },

  clearAllPlayers(): void {
    try {
      const all = this.getAllPlayers();
      localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify([]));
      localStorage.removeItem(CURRENT_PLAYER_KEY);
      localStorage.removeItem('unicentro_dulce_truco_all_players_v1');

      // Delete from cloud Firestore
      all.forEach((p) => {
        deleteDoc(doc(db, 'players', p.id)).catch((err) => {
          console.warn('Notice: Firestore clearAll deleteDoc fallback:', err);
        });
      });
    } catch (e) {
      console.error('Error clearing all players', e);
    }
  },

  /**
   * Real-time subscription to all players in Firestore.
   * Enables the Admin PC dashboard to display new registrations and scans live without refresh.
   */
  subscribeToAllPlayers(callback: (players: PlayerData[]) => void): () => void {
    try {
      const playersCol = collection(db, 'players');
      const q = query(playersCol, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const remoteList: PlayerData[] = [];
          snapshot.forEach((snapDoc) => {
            const data = snapDoc.data() as PlayerData;
            remoteList.push(data);
          });

          if (remoteList.length > 0) {
            localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify(remoteList));
            callback(remoteList);
          } else {
            callback(this.getAllPlayers());
          }
        },
        (error) => {
          console.warn('Firestore subscription fallback to local cache:', error);
          callback(this.getAllPlayers());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Could not establish real-time Firestore listener, using local storage:', e);
      callback(this.getAllPlayers());
      return () => {};
    }
  },

  /**
   * Real-time subscription to a single player's document.
   * If the administrator marks their prize delivered from the PC,
   * the child's phone instantly updates to "CANJEADO" in real-time.
   */
  subscribeToPlayer(playerId: string, callback: (player: PlayerData) => void): () => void {
    try {
      const playerRef = doc(db, 'players', playerId);
      return onSnapshot(
        playerRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as PlayerData;
            localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(data));
            this.upsertToAllPlayers(data);
            callback(data);
          }
        },
        (err) => {
          console.warn('Player document listener notice:', err);
        }
      );
    } catch {
      return () => {};
    }
  },

  exportToCSV(): void {
    const players = this.getAllPlayers();

    const headers = [
      'ID Participante',
      'Código de Canje (Ticket)',
      'Fecha Registro',
      'Nombre del Niño',
      'Nombre del Representante',
      'Género / Avatar',
      'Tiendas Completadas (Total)',
      'Total Estrellas Obtenidas',
      'Mapa Completado (Castillo)',
      'Hora Finalización',
      'Premio Entregado',
      'Fecha y Hora Entrega Premio',
      'Historial de Tiendas Escaneadas',
    ];

    const rows = players.map((p) => {
      const storesDone = p.unlockedStores?.length || 0;
      const totalStars = Object.values(p.storeStars || {}).reduce((acc, v) => acc + v, 0);
      const isCompleted = storesDone >= 10 ? 'SÍ' : 'NO';
      const prizeStatus = p.prizeDelivered ? 'SÍ' : 'NO';
      const prizeTime = p.prizeDeliveredAt ? p.prizeDeliveredAt : 'Pendiente';
      const ticketCode = `DULCE-${p.id.slice(-6).toUpperCase()}`;
      const historyStr = (p.scanHistory || [])
        .map((h) => `${h.storeName} (${h.timestamp.slice(11, 19)})`)
        .join(' | ');

      return [
        `"${p.id}"`,
        `"${ticketCode}"`,
        `"${p.createdAt}"`,
        `"${p.playerName.replace(/"/g, '""')}"`,
        `"${p.parentName.replace(/"/g, '""')}"`,
        `"${p.gender === 'girl' ? 'Niña' : 'Niño'}"`,
        storesDone,
        totalStars,
        `"${isCompleted}"`,
        `"${p.completedAt || 'En Progreso'}"`,
        `"${prizeStatus}"`,
        `"${prizeTime}"`,
        `"${historyStr.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `unicentro_maracay_halloween_participantes_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
