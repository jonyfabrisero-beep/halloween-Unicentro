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
      style={{ width: '12.4%' }}
      className={`absolute left-[50.5%] top-[51.5%] -translate-x-1/2 -translate-y-[75%] z-25 cursor-pointer select-none origin-bottom transition-transform duration-200 ${
        isBouncing
          ? 'animate-groundedWobble'
          : 'hover:scale-y-[1.05] hover:scale-x-[0.98]'
      }`}
    >
      {/* Tooltip if locked */}
      {showTooltip && (
        <div className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-purple-950/95 border-2 border-amber-400 text-amber-200 text-[10px] sm:text-xs font-bold font-['Fredoka'] whitespace-nowrap shadow-xl z-40 animate-bounce">
          🔒 ¡Te faltan {totalStores - completedCount} tiendas por escanear!
        </div>
      )}

      {/* Castle Illustration Container matching PROTOTIPO JUEGO HALLOWEEN.png */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        {/* Ambient glow if unlocked */}
        {isUnlocked && (
          <div className="absolute inset-0 rounded-full bg-amber-400/35 blur-2xl animate-pulse pointer-events-none" />
        )}

        <img
          src="/houses/castillo_central.png"
          alt="Castillo Embrujado Central"
          className="w-full h-full object-contain"
          loading="eager"
        />

        {/* Central Padlock ("candado central" using authentic parte superior & inferior) */}
        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none w-[22%] pointer-events-none">
          <div className="relative flex flex-col items-center w-full">
            {/* Shackle: parte superior candado.png (Animates lifting up & rotating open when unlocked) */}
            <div
              className={`relative transition-all duration-700 ease-out z-10 w-[72%] ${
                isUnlocked
                  ? '-translate-y-1 sm:-translate-y-2 -rotate-[24deg] origin-bottom-right drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                  : 'translate-y-0 rotate-0 drop-shadow-md'
              }`}
            >
              <img
                src="/castle/parte_superior_candado.png"
                alt="Grillete del Candado"
                className="w-full h-auto object-contain -mb-[22%] pointer-events-none"
                loading="eager"
              />
            </div>

            {/* Lock Body: parte inferior candado.png */}
            <div className="relative z-20 w-full">
              <img
                src="/castle/parte_inferior_candado.png"
                alt="Cuerpo del Candado"
                className={`w-full h-auto object-contain pointer-events-none transition-all duration-500 ${
                  isUnlocked
                    ? 'filter drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-pulse'
                    : 'filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]'
                }`}
                loading="eager"
              />
            </div>

            {/* Badge Indicator: ¡ABIERTO! or Progress Count */}
            {isUnlocked ? (
              <span className="mt-0.5 px-1 sm:px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 text-[6.5px] sm:text-[8px] font-black font-['Lilita_One'] uppercase tracking-wider shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white whitespace-nowrap">
                ¡ABIERTO!
              </span>
            ) : (
              <span className="mt-0.5 px-1 py-0.2 rounded-full bg-slate-950/95 border border-amber-400/80 text-amber-300 text-[6.5px] sm:text-[8px] font-bold font-mono shadow-sm whitespace-nowrap">
                {completedCount}/10
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
