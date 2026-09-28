import React, { useState, useRef } from 'react';
import { PlayerData, StoreInfo } from '../types/game';
import { STORES_DATA } from '../data/stores';
import { HauntedHouse } from './HauntedHouse';
import { CentralCastle } from './CentralCastle';
import { InteractiveGhostsAndPumpkins } from './InteractiveGhostsAndPumpkins';
import { InteractiveTrees } from './InteractiveTrees';
import { ParticleCanvas, ParticleTrigger } from './ParticleCanvas';
import { DriftingMist } from './DriftingMist';
import { QrScannerModal } from './QrScannerModal';
import { VictoryModal } from './VictoryModal';
import { soundEffects } from '../services/soundEffects';
import { storageService } from '../services/storage';
import confetti from 'canvas-confetti';

interface InteractiveMapProps {
  player: PlayerData;
  onUpdatePlayer: (updated: PlayerData) => void;
  onRestartGame: () => void;
  selectedStoreFromHud: StoreInfo | null;
  onClearSelectedStore: () => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  player,
  onUpdatePlayer,
  onRestartGame,
  selectedStoreFromHud,
  onClearSelectedStore,
}) => {
  const [activeStoreModal, setActiveStoreModal] = useState<StoreInfo | null>(null);
  const [animatingStoreId, setAnimatingStoreId] = useState<string | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const particleTriggerRef = useRef<ParticleTrigger | null>(null);

  // If a store was clicked from the top HUD padlocks, open its scanner modal
  React.useEffect(() => {
    if (selectedStoreFromHud) {
      setActiveStoreModal(selectedStoreFromHud);
      onClearSelectedStore();
    }
  }, [selectedStoreFromHud, onClearSelectedStore]);

  const completedCount = player.unlockedStores?.length || 0;
  const isAllComplete = completedCount >= 10;

  // Handle successful store QR scan
  const handleScanSuccess = (store: StoreInfo) => {
    setActiveStoreModal(null);
    setAnimatingStoreId(store.id);

    // Progressive star filling animation matching PDF Page 2
    soundEffects.playStarChime(1);

    setTimeout(() => {
      soundEffects.playStarChime(2);
    }, 450);

    setTimeout(() => {
      soundEffects.playStarChime(3);

      // Particle stars and confetti on the house
      if (particleTriggerRef.current && mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        const posX = (store.x / 100) * rect.width;
        const posY = (store.y / 100) * rect.height - 30;
        particleTriggerRef.current.burstStars(posX, posY);
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: store.x / 100, y: store.y / 100 },
        colors: ['#F59E0B', '#10B981', '#F472B6'],
      });

      // Update player state with 3 stars and unlocked store
      const updatedUnlocked = Array.from(new Set([...(player.unlockedStores || []), store.id]));
      const updatedStars = {
        ...(player.storeStars || {}),
        [store.id]: 3,
      };

      const updatedHistory = [
        ...(player.scanHistory || []),
        {
          storeId: store.id,
          storeName: store.name,
          timestamp: new Date().toISOString(),
          code: store.code,
        },
      ];

      const allNowComplete = updatedUnlocked.length >= 10;

      const updatedPlayer: PlayerData = {
        ...player,
        unlockedStores: updatedUnlocked,
        storeStars: updatedStars,
        scanHistory: updatedHistory,
        completedAt: allNowComplete ? new Date().toISOString() : player.completedAt,
      };

      storageService.saveCurrentPlayer(updatedPlayer);
      onUpdatePlayer(updatedPlayer);

      setAnimatingStoreId(null);

      // If all 10 stores are unlocked, open the central castle lock with fanfare!
      if (allNowComplete) {
        setTimeout(() => {
          soundEffects.playUnlock();
          setShowVictoryModal(true);
        }, 1200);
      }
    }, 900);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden pt-12 select-none">
      {/* Subtle Full-Screen Ambient Mist drifting across the background */}
      <DriftingMist fullScreen />

      {/* 16:9 Landscape Game Canvas Container matching PDF Layout */}
      <div
        ref={mapContainerRef}
        className="relative w-full max-w-[1440px] aspect-[16/9] max-h-[calc(100vh-3.2rem)] shadow-2xl overflow-hidden bg-slate-900 border-x border-purple-900/40"
      >
        {/* Themed Isometric Map Background matching the user's authentic mapa de fondo.png */}
        <img
          src="/mapa_de_fondo.png"
          alt="Mapa de Fondo Unicentro Maracay"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
          loading="eager"
        />

        {/* Ambient Spooky Overlay & Mist */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Subtle In-Map Atmospheric Mist drifting across the landscape */}
        <DriftingMist />

        {/* High performance Canvas Particle Layer for Ghost & Pumpkin bursts */}
        <ParticleCanvas ref={particleTriggerRef} />

        {/* Interactive Ghosts, Pumpkins & Real Falling Autumn Leaves (No emojis!) */}
        <InteractiveGhostsAndPumpkins
          particleTriggerRef={particleTriggerRef}
          containerRef={mapContainerRef}
        />

        {/* 16 Realistic Autumn Trees swaying in the breeze on grass patches */}
        <InteractiveTrees
          particleTriggerRef={particleTriggerRef}
          containerRef={mapContainerRef}
        />

        {/* 10 Realistic Isometric Haunted Houses matching Mall Stores */}
        {STORES_DATA.map((store) => {
          const isUnlocked = (player.unlockedStores || []).includes(store.id);
          const stars = player.storeStars?.[store.id] || (isUnlocked ? 3 : 0);

          return (
            <HauntedHouse
              key={store.id}
              store={store}
              stars={stars}
              isUnlocked={isUnlocked}
              onSelect={(s) => setActiveStoreModal(s)}
              animatingStoreId={animatingStoreId}
            />
          );
        })}

        {/* Central Castle on stone platform (Always in front of all houses) */}
        <CentralCastle
          completedCount={completedCount}
          totalStores={10}
          isUnlocked={isAllComplete}
          onOpenVictory={() => setShowVictoryModal(true)}
        />
      </div>

      {/* QR Camera Scanner Modal (Page 7) */}
      {activeStoreModal && (
        <QrScannerModal
          store={activeStoreModal}
          isAlreadyUnlocked={(player.unlockedStores || []).includes(activeStoreModal.id)}
          onSuccess={handleScanSuccess}
          onClose={() => setActiveStoreModal(null)}
        />
      )}

      {/* Victory Celebration Modal (Page 8) */}
      {showVictoryModal && (
        <VictoryModal
          player={player}
          onClose={() => setShowVictoryModal(false)}
          onRestart={onRestartGame}
        />
      )}
    </div>
  );
};
