import React, { useState, useEffect } from 'react';
import { StoreInfo } from '../types/game';
import { StarsBadge } from './GameIcons';
import { soundEffects } from '../services/soundEffects';

interface HauntedHouseProps {
  store: StoreInfo;
  stars: number; // 0, 1, 2, 3
  isUnlocked: boolean;
  onSelect: (store: StoreInfo) => void;
  animatingStoreId?: string | null;
  isPurifying?: boolean;
}

export const HauntedHouse: React.FC<HauntedHouseProps> = ({
  store,
  stars,
  isUnlocked,
  onSelect,
  animatingStoreId,
  isPurifying = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [purifyPhase, setPurifyPhase] = useState<'idle' | 'charging' | 'saved'>('idle');
  const [savedImgFailed, setSavedImgFailed] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);

  // Array of possible candidate paths for the saved/desencantada version
  const cleanName = store.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const cleanBrand = store.brand.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const candidatePaths: string[] = [
    store.savedImagePath || '',
    `/tiendas/salvadas/${cleanName}_salvada.webp`,
    `/tiendas/salvadas/${cleanBrand}_salvada.webp`,
    `/tiendas/salvadas/${store.slotNumber}_salvada.webp`,
    `/tiendas/salvadas/tienda_${String(store.slotNumber).padStart(2, '0')}_salvada.webp`,
    `/tiendas/salvadas/tienda_${store.slotNumber}_salvada.webp`,
    `/tiendas/salvadas/${store.slotNumber}_salvada.png`,
    `/tiendas/salvadas/${cleanName}_salvada.png`,
    `/tiendas/salvadas/${cleanBrand}_salvada.png`,
    `/tiendas/salvadas/${store.slotNumber}.png`,
  ].filter(Boolean);

  const isAnimating = animatingStoreId === store.id;
  const isNowSaved = isUnlocked || purifyPhase === 'saved';

  useEffect(() => {
    if (isPurifying) {
      setPurifyPhase('charging');

      const savedTimer = setTimeout(() => {
        setPurifyPhase('saved');
        soundEffects.playVictoryFanfare();
      }, 700);

      const finishTimer = setTimeout(() => {
        setPurifyPhase('idle');
      }, 2400);

      return () => {
        clearTimeout(savedTimer);
        clearTimeout(finishTimer);
      };
    } else {
      setPurifyPhase('idle');
    }
  }, [isPurifying]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Subtle organic feedback on click: no vertical lift, strictly grounded
    setIsBouncing(true);
    soundEffects.playBounce();
    setTimeout(() => setIsBouncing(false), 250);
    onSelect(store);
  };

  // Determine active image source
  const currentSavedSrc = candidatePaths[candidateIndex];
  const activeImgSrc = isNowSaved && !savedImgFailed && currentSavedSrc
    ? currentSavedSrc
    : store.imagePath;

  const handleImageError = () => {
    // If current saved image candidate failed, try next candidate
    if (isNowSaved && !savedImgFailed) {
      if (candidateIndex < candidatePaths.length - 1) {
        setCandidateIndex((prev) => prev + 1);
      } else {
        // All saved image candidates failed, mark failed to gracefully use styled base image
        setSavedImgFailed(true);
      }
    }
  };

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
      className={`absolute -translate-x-1/2 -translate-y-[85%] cursor-pointer select-none origin-bottom transition-all duration-300 ${
        isBouncing
          ? 'scale-x-[1.03] scale-y-[0.97]'
          : isHovered
          ? 'scale-x-[1.02] scale-y-[1.02]'
          : 'scale-100'
      }`}
    >
      {/* Store Name and Stars above the store - No boxes, no backgrounds, pure text */}
      <div className="absolute -top-7 sm:-top-8 md:-top-9 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap origin-bottom pointer-events-none flex flex-col items-center">
        {/* Visible Store Name above stars: without boxes or background, colored for haunted vs saved */}
        <span
          className="text-[9px] sm:text-[11px] md:text-xs font-black tracking-wide uppercase select-none transition-colors duration-300 pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] drop-shadow-[0_0_6px_rgba(0,0,0,0.9)]"
          style={{
            color: isUnlocked ? '#34D399' : '#FB923C', // Salvado: Emerald Green (#34D399), Embrujado: Spooky Pumpkin Orange (#FB923C)
            textShadow: isUnlocked
              ? '0 0 10px rgba(52,211,153,0.8), 0 2px 4px rgba(0,0,0,0.95)'
              : '0 0 10px rgba(251,146,60,0.8), 0 2px 4px rgba(0,0,0,0.95)',
          }}
        >
          {store.name}
        </span>
        {/* 3-Stars Badge directly under store name */}
        <div className="mt-0.5">
          <StarsBadge stars={stars} isAnimating={isAnimating} />
        </div>
      </div>

      {/* Isometric Building Container */}
      <div className="relative w-full aspect-square flex items-center justify-center">
        {/* Authentic Store Illustration */}
        <img
          src={activeImgSrc}
          alt={`Tienda de ${store.name}`}
          onError={handleImageError}
          style={{
            // When saved without separate PNG file, enhance with vibrant festive lighting
            filter: isNowSaved && savedImgFailed
              ? 'brightness(1.08) saturate(1.15) contrast(1.02) drop-shadow(0 0 10px rgba(251,191,36,0.4))'
              : !isNowSaved
              ? 'brightness(0.93) contrast(1.05)'
              : undefined,
          }}
          className={`w-full h-full object-contain pointer-events-none transition-all duration-500 ${
            purifyPhase === 'charging' ? 'opacity-85' : 'opacity-100'
          }`}
          loading="eager"
        />

        {/* Gentle Golden / Emerald Sparkle Aura when Purified (Subtle, never blinding) */}
        {purifyPhase === 'charging' && (
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-t from-amber-400/20 to-emerald-400/10 animate-pulse" />
        )}

        {/* Unlocked check badge if done */}
        {isUnlocked && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-4.5 md:h-4.5 rounded-full bg-emerald-400 border border-slate-950 flex items-center justify-center text-slate-950 text-[8px] sm:text-[10px] font-black shadow-[0_0_8px_rgba(52,211,153,0.7)] z-20 pointer-events-none">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};
