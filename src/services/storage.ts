import { PlayerData } from '../types/game';

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
      all[index] = {
        ...all[index],
        prizeDelivered: newStatus,
        prizeDeliveredAt: newStatus ? new Date().toISOString() : undefined,
      };

      localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify(all));

      // Synchronize active player if currently playing
      const current = this.getCurrentPlayer();
      if (current && current.id === playerId) {
        const updatedCurrent = {
          ...current,
          prizeDelivered: newStatus,
          prizeDeliveredAt: all[index].prizeDeliveredAt,
        };
        localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(updatedCurrent));
      }

      return all[index];
    } catch (e) {
      console.error('Error toggling prize delivered', e);
      return null;
    }
  },

  clearCurrentPlayer(): void {
    localStorage.removeItem(CURRENT_PLAYER_KEY);
  },

  clearAllPlayers(): void {
    try {
      localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify([]));
      localStorage.removeItem(CURRENT_PLAYER_KEY);
      localStorage.removeItem('unicentro_dulce_truco_all_players_v1');
    } catch (e) {
      console.error('Error clearing all players', e);
    }
  },

  exportToCSV(): void {
    const players = this.getAllPlayers();

    const headers = [
      'ID Participante',
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
      const historyStr = (p.scanHistory || [])
        .map((h) => `${h.storeName} (${h.timestamp.slice(11, 19)})`)
        .join(' | ');

      return [
        `"${p.id}"`,
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
