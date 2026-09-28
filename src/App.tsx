/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GameScreen, PlayerData, StoreInfo } from './types/game';
import { STORES_DATA } from './data/stores';
import { storageService } from './services/storage';
import { soundEffects } from './services/soundEffects';
import { ambientSound } from './services/ambientAudio';
import OrientationWarning from './components/OrientationWarning';
import { IntroScreen } from './components/IntroScreen';
import { RegistrationScreen } from './components/RegistrationScreen';
import { InteractiveMap } from './components/InteractiveMap';
import { TopHud } from './components/TopHud';
import { AdminModal } from './components/AdminModal';
import { QrVaultModal } from './components/QrVaultModal';

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerData | null>(() =>
    storageService.getCurrentPlayer()
  );

  const [currentScreen, setCurrentScreen] = useState<GameScreen>(() => {
    const existing = storageService.getCurrentPlayer();
    return existing ? 'MAP' : 'INTRO';
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => soundEffects.getIsMuted());
  const [volume, setVolume] = useState<number>(() => soundEffects.getMusicVolume());
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [selectedStoreFromHud, setSelectedStoreFromHud] = useState<StoreInfo | null>(null);

  // Auto-open admin modal if user navigates to /csv or #csv
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.includes('csv') || hash.includes('csv') || search.includes('admin')) {
        setShowAdminModal(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  // Web Audio Autoplay Policy: Initialize ambient audio on first user gesture
  useEffect(() => {
    const handleFirstGesture = () => {
      if (!isMuted) {
        ambientSound.start();
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, [isMuted]);

  const handleToggleMute = () => {
    const newMuted = soundEffects.toggleMute();
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    soundEffects.setMusicVolume(newVol);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const handleStartFromIntro = () => {
    if (!isMuted) {
      ambientSound.start();
    }
    if (currentPlayer) {
      setCurrentScreen('MAP');
    } else {
      setCurrentScreen('REGISTRATION');
    }
  };

  const handleRegistered = (newPlayer: PlayerData) => {
    if (!isMuted) {
      ambientSound.start();
    }
    setCurrentPlayer(newPlayer);
    setCurrentScreen('MAP');
  };

  const handleRestartGame = () => {
    storageService.clearCurrentPlayer();
    setCurrentPlayer(null);
    setCurrentScreen('REGISTRATION');
  };

  const handleSimulateScanFromVault = (store: StoreInfo) => {
    if (!currentPlayer) return;

    const updatedUnlocked = Array.from(new Set([...(currentPlayer.unlockedStores || []), store.id]));
    const updatedStars = {
      ...(currentPlayer.storeStars || {}),
      [store.id]: 3,
    };
    const updatedHistory = [
      ...(currentPlayer.scanHistory || []),
      {
        storeId: store.id,
        storeName: store.name,
        timestamp: new Date().toISOString(),
        code: store.code,
      },
    ];

    const allNowComplete = updatedUnlocked.length >= 10;

    const updated: PlayerData = {
      ...currentPlayer,
      unlockedStores: updatedUnlocked,
      storeStars: updatedStars,
      scanHistory: updatedHistory,
      completedAt: allNowComplete ? new Date().toISOString() : currentPlayer.completedAt,
    };

    storageService.saveCurrentPlayer(updated);
    setCurrentPlayer(updated);
    soundEffects.playUnlock();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 font-['Fredoka'] text-white select-none overflow-x-hidden">
      {/* Mobile Landscape Orientation Advisory */}
      <OrientationWarning />

      {/* Screen Router */}
      {currentScreen === 'INTRO' && (
        <IntroScreen onStart={handleStartFromIntro} />
      )}

      {currentScreen === 'REGISTRATION' && (
        <RegistrationScreen
          onRegistered={handleRegistered}
          onOpenAdmin={() => setShowAdminModal(true)}
        />
      )}

      {currentScreen === 'MAP' && currentPlayer && (
        <>
          {/* Top HUD with 10 Padlocks, Player Avatar, and Controls */}
          <TopHud
            player={currentPlayer}
            stores={STORES_DATA}
            isMuted={isMuted}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onSelectStore={(store) => setSelectedStoreFromHud(store)}
            onOpenVault={() => setShowVaultModal(true)}
            onOpenAdmin={() => setShowAdminModal(true)}
          />

          {/* 16:9 Interactive Landscape Map */}
          <InteractiveMap
            player={currentPlayer}
            onUpdatePlayer={(p) => setCurrentPlayer(p)}
            onRestartGame={handleRestartGame}
            selectedStoreFromHud={selectedStoreFromHud}
            onClearSelectedStore={() => setSelectedStoreFromHud(null)}
          />
        </>
      )}

      {/* Supervisor & Luma CSV Sync Admin Modal */}
      {showAdminModal && (
        <AdminModal
          onClose={() => setShowAdminModal(false)}
          onRefreshCurrentPlayer={() => {
            setCurrentPlayer(null);
            setCurrentScreen('REGISTRATION');
          }}
        />
      )}

      {/* Backup Store QR Cards Vault Modal */}
      {showVaultModal && (
        <QrVaultModal
          stores={STORES_DATA}
          onSimulateScan={handleSimulateScanFromVault}
          onClose={() => setShowVaultModal(false)}
        />
      )}
    </div>
  );
}
