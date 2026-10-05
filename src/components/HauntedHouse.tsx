import React, { useState } from 'react';
import { StoreInfo } from '../types/game';
import { StarsBadge } from './GameIcons';
import { soundEffects } from '../services/soundEffects';

interface HauntedHouseProps {
  store: StoreInfo;
  stars: number; // 0, 1, 2, 3
  isUnlocked: boolean;
  onSelect: (store: StoreInfo) => void;
  animatingStoreId?: string | null;
}

export const HauntedHouse: React.FC<HauntedHouseProps> = ({
  store,
  stars,
  isUnlocked,
  onSelect,
  animatingStoreId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const isAnimating = animatingStoreId === store.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBouncing(true);
    soundEffects.playBounce();
    setTimeout(() => setIsBouncing(false), 400);
    onSelect(store);
  };

  // House architectural variations matching PDF Page 4
  const houseVariation = ((store.houseType - 1) % 4) + 1; // 1 to 4

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        left: `${store.x}%`,
        top: `${store.y}%`,
        width: store.customWidthPercent || `${6.2 * (store.scaleFactor || 1.0)}%`,
        zIndex: store.zIndex ?? 15,
      }}
      className={`absolute -translate-x-1/2 -translate-y-[85%] cursor-pointer select-none origin-bottom transition-transform duration-200 ${
        isBouncing || isAnimating
          ? 'animate-groundedWobble'
          : isHovered
          ? 'scale-y-[1.07] scale-x-[0.96]'
          : 'scale-100'
      }`}
    >
      {/* 3-Stars Badge floating right above the roof (Page 1 & 2) */}
      <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap origin-bottom">
        <StarsBadge stars={stars} isAnimating={isAnimating} />
      </div>

      {/* Authentic Isometric Haunted Building Container matching PROTOTIPO JUEGO HALLOWEEN.png */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        {/* User's authentic house illustration */}
        <img
          src={store.imagePath}
          alt={`Tienda de ${store.name}`}
          className="w-full h-full object-contain pointer-events-none"
          loading="eager"
        />

        {/* Unlocked check badge if done */}
        {isUnlocked && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 rounded-full bg-amber-400 border border-slate-950 flex items-center justify-center text-slate-950 text-[8px] sm:text-[10px] font-black shadow-md animate-bounce">
            ✓
          </div>
        )}

        {/* Permanent Number Badge on the house to easily identify slot ordering */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-md bg-slate-950/95 border border-amber-400/90 text-amber-300 font-mono font-black text-[9px] sm:text-[11px] shadow-[0_0_8px_rgba(245,158,11,0.6)] flex items-center justify-center z-20 pointer-events-none whitespace-nowrap">
          <span>#{store.slotNumber}</span>
        </div>

        {/* Store brand label on hover */}
        {isHovered && (
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg border text-center shadow-xl whitespace-nowrap pointer-events-none z-30 animate-fadeIn"
            style={{
              backgroundColor: '#1E120Ce6',
              borderColor: store.accentColor,
              boxShadow: `0 4px 12px rgba(0,0,0,0.9), 0 0 10px ${store.color}88`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: store.accentColor }}
              />
              <span
                className="text-xs font-black font-['Lilita_One'] tracking-wide"
                style={{ color: store.accentColor }}
              >
                {store.brand}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
