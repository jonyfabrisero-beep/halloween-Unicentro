import React from 'react';
import { PlayerData, StoreInfo } from '../types/game';
import { HudPadlock } from './GameIcons';
import { soundEffects } from '../services/soundEffects';
import { Volume2, Volume1, VolumeX, FolderKey, ShieldAlert, Sparkles } from 'lucide-react';

interface TopHudProps {
  player: PlayerData;
  stores: StoreInfo[];
  isMuted: boolean;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onSelectStore: (store: StoreInfo) => void;
  onOpenVault: () => void;
  onOpenAdmin: () => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  player,
  stores,
  isMuted,
  volume,
  onVolumeChange,
  onToggleMute,
  onSelectStore,
  onOpenVault,
  onOpenAdmin,
}) => {
  const completedCount = player.unlockedStores?.length || 0;
  const isAllComplete = completedCount >= 10;
  const displayPercent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-3 py-1.5 sm:px-6 sm:py-2 flex items-center justify-between gap-2 pointer-events-none select-none">
      {/* Left: Player Profile & Progress */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-purple-500/30 shadow-lg">
        <div className="relative">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 p-0.5 shadow-sm">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-sm sm:text-base">
              {player.gender === 'girl' ? '🧙‍♀️' : '🧟‍♂️'}
            </div>
          </div>
          {isAllComplete && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-slate-950 font-black animate-bounce">
              👑
            </span>
          )}
        </div>

        <div className="hidden xs:block text-left">
          <div className="text-xs sm:text-sm font-bold text-white font-['Fredoka'] truncate max-w-[100px] sm:max-w-[130px] leading-tight">
            {player.playerName}
          </div>
          <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>{completedCount}/10 Casas</span>
          </div>
        </div>
      </div>

      {/* Center: 10 Padlocks matching PROTOTIPO JUEGO HALLOWEEN.png */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-2 py-1 rounded-2xl bg-black/60 backdrop-blur-md border border-amber-600/40 shadow-xl overflow-x-auto max-w-full no-scrollbar">
        {stores.map((store, index) => {
          const unlocked = (player.unlockedStores || []).includes(store.id);
          return (
            <HudPadlock
              key={store.id}
              index={index}
              storeName={store.name}
              unlocked={unlocked}
              onClick={() => {
                soundEffects.playBounce();
                onSelectStore(store);
              }}
            />
          );
        })}
      </div>

      {/* Right Actions: Sound & Volume Control, QR Vault, Admin */}
      <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded-2xl border border-purple-500/30 shadow-lg">
        {/* Interactive Volume Controller */}
        <div className="flex items-center gap-1 bg-slate-900/90 rounded-xl px-1.5 py-0.5 border border-purple-500/20">
          <button
            onClick={onToggleMute}
            className={`p-1 sm:p-1.5 rounded-lg border transition-colors ${
              isMuted || displayPercent === 0
                ? 'bg-slate-900 border-slate-700 text-slate-500'
                : 'bg-purple-900/50 border-purple-500/50 text-amber-300 hover:bg-purple-800/50'
            }`}
            title={isMuted ? 'Activar sonido y música' : 'Silenciar sonido'}
          >
            {isMuted || displayPercent === 0 ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : volume < 0.45 ? (
              <Volume1 className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Volume Slider Bar */}
          <div className="flex items-center gap-1.5">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={displayPercent}
              onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
              className="w-12 sm:w-16 h-1.5 accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
              title={`Volumen de música: ${displayPercent}%`}
            />
            <span className="text-[10px] font-mono font-bold text-amber-300 w-6 text-right select-none">
              {displayPercent}%
            </span>
          </div>
        </div>

        {/* QR Vault backup for offline or print */}
        <button
          onClick={onOpenVault}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-amber-300 hover:border-amber-400/50 transition-colors"
          title="Ver QRs de Respaldo de Tiendas"
        >
          <FolderKey className="w-4 h-4 text-amber-400" />
        </button>

        {/* Admin modal */}
        <button
          onClick={onOpenAdmin}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 hover:border-emerald-400/50 transition-colors"
          title="Supervisión / Descargar CSV"
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
        </button>
      </div>
    </header>
  );
};
