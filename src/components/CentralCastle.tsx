import React, { useState } from 'react';
import { soundEffects } from '../services/soundEffects';

interface CentralCastleProps {
  completedCount: number;
  totalStores: number;
  isUnlocked: boolean;
  onOpenVictory: () => void;
}

export const CentralCastle: React.FC<CentralCastleProps> = ({
  completedCount,
  totalStores,
  isUnlocked,
  onOpenVictory,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 400);

    if (isUnlocked) {
      soundEffects.playVictoryFanfare();
      onOpenVictory();
    } else {
      soundEffects.playPumpkinSquish();
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`absolute left-[53%] top-[58.5%] -translate-x-1/2 -translate-y-[75%] z-25 cursor-pointer select-none origin-bottom transition-transform duration-200 ${
        isBouncing
          ? 'animate-groundedWobble'
          : 'hover:scale-y-[1.05] hover:scale-x-[0.98]'
      }`}
    >
      {/* Tooltip if locked */}
      {showTooltip && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-xl bg-purple-950/95 border-2 border-amber-400 text-amber-200 text-xs font-bold font-['Fredoka'] whitespace-nowrap shadow-xl z-40 animate-bounce">
          🔒 ¡Te faltan {totalStores - completedCount} casas por escanear!
        </div>
      )}

      {/* Castle Illustration Container matching PROTOTIPO JUEGO HALLOWEEN.png */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 flex items-center justify-center">
        {/* Ambient glow if unlocked */}
        {isUnlocked && (
          <div className="absolute inset-0 rounded-full bg-amber-400/35 blur-3xl animate-pulse pointer-events-none" />
        )}

        <img
          src="/houses/castillo_central.png"
          alt="Castillo Embrujado Central"
          className="w-full h-full object-contain"
          loading="eager"
        />

        {/* Central Padlock ("candado central" - Page 2 & 4) */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          {isUnlocked ? (
            // Giant Unlocked Shackle & Glowing Golden Emblem
            <div className="relative flex flex-col items-center animate-bounce" style={{ animationDuration: '2s' }}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 p-1 shadow-[0_0_30px_rgba(251,191,36,0.95)] border-2 border-white flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-10 h-10 filter drop-shadow-md">
                  <ellipse cx="50" cy="54" rx="40" ry="34" fill="#F97316" stroke="#9A3412" strokeWidth="3" />
                  <ellipse cx="50" cy="54" rx="20" ry="34" fill="#FB923C" stroke="#9A3412" strokeWidth="2" />
                  <polygon points="36,40 44,48 30,48" fill="#451A03" />
                  <polygon points="64,40 70,48 56,48" fill="#451A03" />
                  <path d="M30 64 L36 72 L42 64 L50 72 L58 64 L64 72 L70 64 Z" fill="#451A03" />
                </svg>
              </div>
              <span className="mt-1 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] sm:text-xs font-black font-['Lilita_One'] uppercase tracking-wider shadow-lg animate-pulse">
                ¡ABIERTO!
              </span>
            </div>
          ) : (
            // Giant Locked Central Padlock
            <div className="relative flex flex-col items-center group">
              {/* Golden Shackle (parte superior candado.png) */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 border-4 sm:border-6 border-amber-400 rounded-t-full bg-transparent -mb-2 shadow-lg" />

              {/* Purple/Ruby Lock Body (parte inferior candado.png) */}
              <div className="w-13 h-11 sm:w-15 sm:h-13 rounded-2xl bg-gradient-to-b from-purple-600 via-purple-800 to-indigo-950 border-2 sm:border-3 border-amber-400 flex flex-col items-center justify-center shadow-[0_6px_20px_rgba(0,0,0,0.9)]">
                {/* Keyhole */}
                <div className="w-3.5 h-4.5 bg-amber-300 rounded-full flex flex-col items-center justify-end p-0.5 shadow-inner">
                  <div className="w-1 h-2 bg-slate-950" />
                </div>
              </div>

              {/* Lock Progress Indicator */}
              <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/95 border border-amber-400/80 text-amber-300 text-[10px] sm:text-[11px] font-bold font-mono shadow-md">
                {completedCount}/10
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
