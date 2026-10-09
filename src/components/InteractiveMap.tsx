import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface InteractiveMapProps {
  player: PlayerData;
  onUpdatePlayer: (updated: PlayerData) => void;
  onRestartGame: () => void;
  selectedStoreFromHud: StoreInfo | null;
  onClearSelectedStore: () => void;
}

const MIN_SCALE = 1.0;
const MAX_SCALE = 2.6;

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
  
  // Touch Gestures: Zoom & Pan state
  const [scale, setScale] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [showPanHint, setShowPanHint] = useState(false);

  // Dynamic Orientation & Container Dimension Tracking for Responsive Vertical & Horizontal Adaptation
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth;
  });

  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const screenContainerRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapContentRef = useRef<HTMLDivElement | null>(null);
  const particleTriggerRef = useRef<ParticleTrigger | null>(null);
  const momentumAnimRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let ro: ResizeObserver | null = null;
    if (mapContainerRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      });
      ro.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (ro) ro.disconnect();
    };
  }, []);

  // When switching between portrait and landscape, reset zoom/pan smoothly to centered view
  useEffect(() => {
    setScale(1.0);
    setPan({ x: 0, y: 0 });
  }, [isPortrait]);

  // Gesture tracking refs (avoid re-rendering during 60fps drag/pinch)
  const touchStateRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    prevX: number;
    prevY: number;
    startPanX: number;
    startPanY: number;
    initialDistance: number;
    initialScale: number;
    dragDistance: number;
    lastTapTime: number;
    lastTime: number;
    vx: number;
    vy: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    prevX: 0,
    prevY: 0,
    startPanX: 0,
    startPanY: 0,
    initialDistance: 0,
    initialScale: 1.0,
    dragDistance: 0,
    lastTapTime: 0,
    lastTime: 0,
    vx: 0,
    vy: 0,
  });

  // Clamp pan coordinates strictly to the GIF image borders across both vertical & horizontal modes
  // The scaled map content edges will never pull away from or cross inside the container viewport
  const clampPan = useCallback((x: number, y: number, currentScale: number) => {
    if (!mapContainerRef.current) {
      return { x: 0, y: 0 };
    }
    const containerRect = mapContainerRef.current.getBoundingClientRect();
    const containerW = containerRect.width;
    const containerH = containerRect.height;

    // The map background has an architectural 2400:1080 (20:9) aspect ratio
    // In portrait, base height fills containerH and base width is containerH * (2400 / 1080)
    // In landscape, base width and height match container dimensions
    const baseH = containerH;
    const baseW = Math.max(containerW, containerH * (2400 / 1080));

    const renderedW = baseW * currentScale;
    const renderedH = baseH * currentScale;

    // Strict boundary limits: image edge must never pull inward from container viewport
    const maxX = Math.max(0, (renderedW - containerW) / 2);
    const maxY = Math.max(0, (renderedH - containerH) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }, []);

  // Zoom helpers with bounds clamping and centered snap
  const handleZoom = (newScale: number, targetPan?: { x: number; y: number }) => {
    const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
    
    // When zoomed out fully or near 1.0, snap cleanly back to centered full-view
    if (clampedScale <= 1.02) {
      setScale(1.0);
      setPan({ x: 0, y: 0 });
      setShowPanHint(false);
      return;
    }

    setScale(clampedScale);
    const p = targetPan || pan;
    setPan(clampPan(p.x, p.y, clampedScale));
  };

  const handleResetZoom = () => {
    soundEffects.playBounce();
    setScale(1.0);
    setPan({ x: 0, y: 0 });
    setShowPanHint(false);
  };

  const handleZoomIn = () => {
    soundEffects.playBounce();
    handleZoom(scale + 0.35);
  };

  const handleZoomOut = () => {
    soundEffects.playBounce();
    handleZoom(scale - 0.35);
  };

  // Touch Gesture Listeners: Pinch-to-zoom & 1-finger pan with native preventDefault and momentum
  useEffect(() => {
    // Listen on the full-screen container so touches anywhere on screen scroll the map
    const container = screenContainerRef.current || mapContainerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      // If a modal is open, completely bypass map touch gestures to allow smooth native modal scrolling
      const target = e.target as HTMLElement | null;
      if (
        activeStoreModal ||
        showVictoryModal ||
        target?.closest('.modal-container') ||
        target?.closest('[role="dialog"]')
      ) {
        return;
      }

      // Cancel any ongoing momentum flick animation immediately on finger touch
      if (momentumAnimRef.current) {
        cancelAnimationFrame(momentumAnimRef.current);
        momentumAnimRef.current = null;
      }

      const touches = e.touches;
      const ts = touchStateRef.current;
      ts.dragDistance = 0;

      if (touches.length === 1) {
        // Single touch: potential pan or double-tap
        ts.isDragging = true;
        ts.startX = touches[0].clientX;
        ts.startY = touches[0].clientY;
        ts.prevX = touches[0].clientX;
        ts.prevY = touches[0].clientY;
        ts.startPanX = pan.x;
        ts.startPanY = pan.y;
        ts.lastTime = Date.now();
        ts.vx = 0;
        ts.vy = 0;
        setIsInteracting(true);

        // Check for double-tap zoom
        const now = Date.now();
        if (now - ts.lastTapTime < 320) {
          e.preventDefault();
          if (scale > 1.05) {
            handleResetZoom();
          } else {
            // Zoom in centered around tap
            soundEffects.playBounce();
            const target = mapContainerRef.current || container;
            const rect = target.getBoundingClientRect();
            const tapX = touches[0].clientX - (rect.left + rect.width / 2);
            const tapY = touches[0].clientY - (rect.top + rect.height / 2);
            const targetScale = 1.8;
            handleZoom(targetScale, { x: -tapX * 0.8, y: -tapY * 0.8 });
          }
          ts.lastTapTime = 0;
          return;
        }
        ts.lastTapTime = now;
      } else if (touches.length === 2) {
        // Two fingers: Pinch-to-zoom
        if (e.cancelable) e.preventDefault();
        ts.isDragging = false;
        const dist = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );
        ts.initialDistance = dist;
        ts.initialScale = scale;
        setIsInteracting(true);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // If a modal is open, completely bypass map touch gestures to allow smooth native modal scrolling
      const target = e.target as HTMLElement | null;
      if (
        activeStoreModal ||
        showVictoryModal ||
        target?.closest('.modal-container') ||
        target?.closest('[role="dialog"]')
      ) {
        return;
      }

      const touches = e.touches;
      const ts = touchStateRef.current;

      if (touches.length === 2 && ts.initialDistance > 0) {
        // Pinch zoom active
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          touches[0].clientX - touches[1].clientX,
          touches[0].clientY - touches[1].clientY
        );
        const factor = dist / ts.initialDistance;
        const rawScale = ts.initialScale * factor;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, rawScale));
        
        setScale(newScale);
        setPan((prev) => clampPan(prev.x, prev.y, newScale));
        setShowPanHint(true);
      } else if (touches.length === 1 && ts.isDragging) {
        // 1-finger pan active across the entire screen
        const dx = touches[0].clientX - ts.startX;
        const dy = touches[0].clientY - ts.startY;
        ts.dragDistance = Math.hypot(dx, dy);

        // Always prevent native browser scrolling/pulling
        if (e.cancelable) {
          e.preventDefault();
        }

        // Measure speed for natural momentum inertia
        const now = Date.now();
        const dt = Math.max(1, now - ts.lastTime);
        if (dt > 0 && dt < 120) {
          const moveDx = touches[0].clientX - ts.prevX;
          const moveDy = touches[0].clientY - ts.prevY;
          ts.vx = ts.vx * 0.35 + (moveDx / dt) * 0.65;
          ts.vy = ts.vy * 0.35 + (moveDy / dt) * 0.65;
        }
        ts.prevX = touches[0].clientX;
        ts.prevY = touches[0].clientY;
        ts.lastTime = now;

        const targetX = ts.startPanX + dx;
        const targetY = ts.startPanY + dy;
        setPan(clampPan(targetX, targetY, scale));
        setShowPanHint(true);
      }
    };

    const onTouchEnd = () => {
      const ts = touchStateRef.current;
      ts.isDragging = false;
      ts.initialDistance = 0;
      setIsInteracting(false);

      // Smooth inertia momentum glide if user flicked with finger
      const speed = Math.hypot(ts.vx, ts.vy);
      if (speed > 0.12 && ts.dragDistance > 8) {
        if (momentumAnimRef.current) cancelAnimationFrame(momentumAnimRef.current);
        
        let vx = ts.vx * 14;
        let vy = ts.vy * 14;

        const momentumStep = () => {
          vx *= 0.92;
          vy *= 0.92;

          if (Math.abs(vx) < 0.25 && Math.abs(vy) < 0.25) {
            return;
          }

          setPan((curr) => {
            const nextX = curr.x + vx;
            const nextY = curr.y + vy;
            return clampPan(nextX, nextY, scale);
          });

          momentumAnimRef.current = requestAnimationFrame(momentumStep);
        };

        momentumAnimRef.current = requestAnimationFrame(momentumStep);
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      if (momentumAnimRef.current) {
        cancelAnimationFrame(momentumAnimRef.current);
      }
    };
  }, [scale, pan, clampPan, activeStoreModal, showVictoryModal]);

  // Mouse wheel / trackpad zoom & mouse drag on desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.15 : -0.15;
      handleZoom(scale + zoomFactor);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    const ts = touchStateRef.current;
    ts.isDragging = true;
    ts.startX = e.clientX;
    ts.startY = e.clientY;
    ts.startPanX = pan.x;
    ts.startPanY = pan.y;
    ts.dragDistance = 0;
    setIsInteracting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const ts = touchStateRef.current;
    if (!ts.isDragging) return;
    const dx = e.clientX - ts.startX;
    const dy = e.clientY - ts.startY;
    ts.dragDistance = Math.hypot(dx, dy);

    setPan(clampPan(ts.startPanX + dx, ts.startPanY + dy, scale));
  };

  const handleMouseUp = () => {
    touchStateRef.current.isDragging = false;
    setIsInteracting(false);
  };

  // If a store was clicked from the top HUD padlocks, open its scanner modal
  useEffect(() => {
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

    // Progressive star filling and purification sequence
    try {
      soundEffects.playStarChime(1);
    } catch {}

    setTimeout(() => {
      try {
        soundEffects.playStarChime(2);
      } catch {}
    }, 400);

    setTimeout(() => {
      try {
        soundEffects.playStarChime(3);
      } catch {}

      // Subtle celebratory sparkles directly over the store
      try {
        if (particleTriggerRef.current && mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          const posX = (store.x / 100) * rect.width;
          const posY = (store.y / 100) * rect.height - 30;
          particleTriggerRef.current.burstStars(posX, posY);
        }
      } catch {}

      try {
        confetti({
          particleCount: 28,
          spread: 45,
          ticks: 60,
          gravity: 0.8,
          origin: { x: store.x / 100, y: Math.max(0.1, store.y / 100 - 0.05) },
          colors: ['#F59E0B', '#10B981', '#FBBF24', '#34D399', '#A78BFA'],
        });
      } catch {}

      try {
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

        // If all 10 stores are unlocked, open the central castle lock with fanfare!
        if (allNowComplete) {
          setTimeout(() => {
            try {
              soundEffects.playUnlock();
            } catch {}
            setShowVictoryModal(true);
          }, 1600);
        }
      } catch (err) {
        console.error('Error updating player scan state:', err);
      }
    }, 700);

    // End purification animation after transformation settles
    setTimeout(() => {
      setAnimatingStoreId(null);
    }, 2400);
  };

  const handleHouseSelect = (store: StoreInfo) => {
    // If the user just dragged/panned the map, ignore click to prevent accidental modal popup
    if (touchStateRef.current.dragDistance > 8) {
      return;
    }
    setActiveStoreModal(store);
  };

  const baseMapWidth =
    isPortrait && containerSize.height > 0
      ? Math.round(containerSize.height * (2400 / 1080))
      : undefined;

  return (
    <div
      ref={screenContainerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ touchAction: 'none' }}
      className={`relative w-full h-[100dvh] min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-center overflow-hidden px-1 sm:px-2 pb-1 select-none touch-none cursor-grab active:cursor-grabbing ${
        isPortrait ? 'pt-10 sm:pt-12' : 'pt-9 sm:pt-12'
      }`}
    >
      {/* Subtle Full-Screen Ambient Mist drifting across the background */}
      <DriftingMist fullScreen />

      {/* Game Canvas Viewport Container: Adaptive Full-Height in Portrait & 20:9 in Landscape */}
      <div
        ref={mapContainerRef}
        style={
          isPortrait
            ? {
                width: 'calc(100vw - 8px)',
                height: 'calc(100dvh - 54px)',
                maxWidth: '768px',
                touchAction: 'none',
              }
            : {
                width: 'min(calc(100vw - 8px), calc((100dvh - 44px) * (2400 / 1080)))',
                height: 'min(calc((100vw - 8px) * (1080 / 2400)), calc(100dvh - 44px))',
                maxWidth: '1920px',
                touchAction: 'none',
              }
        }
        className={`relative shadow-2xl overflow-hidden bg-slate-900 border border-purple-900/50 rounded-xl sm:rounded-2xl mx-auto shrink-0 select-none ${
          isPortrait ? 'w-full flex-1 my-auto' : 'aspect-[20/9]'
        }`}
      >
        {/* Zoom & Pan Transform Layer */}
        <div
          ref={mapContentRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            height: '100%',
            width: isPortrait && baseMapWidth ? `${baseMapWidth}px` : '100%',
            aspectRatio: '2400 / 1080',
            transform: `translate3d(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px), 0) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isInteracting ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="will-change-transform select-none"
        >
          {/* Animated 2400x1080 Map Background matching fondo animado juego.gif */}
          <img
            src="/fondo_animado_juego.gif"
            alt="Fondo Animado del Juego Unicentro Maracay"
            className="absolute inset-0 w-full h-full object-fill object-center pointer-events-none select-none"
            loading="eager"
            onError={(e) => {
              // Fallback to static png if needed
              (e.target as HTMLImageElement).src = '/mapa_de_fondo.png';
            }}
          />

          {/* Ambient Spooky Overlay & Mist */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 via-transparent to-slate-950/40 pointer-events-none" />

          {/* Subtle In-Map Atmospheric Mist drifting across the landscape */}
          <DriftingMist />

          {/* High performance Canvas Particle Layer for Ghost & Pumpkin bursts */}
          <ParticleCanvas ref={particleTriggerRef} />

          {/* Interactive Ghosts, Pumpkins & Real Falling Autumn Leaves */}
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
                onSelect={handleHouseSelect}
                animatingStoreId={animatingStoreId}
                isPurifying={animatingStoreId === store.id}
              />
            );
          })}

          {/* Central Castle on stone platform (Always in front of all houses) */}
          <CentralCastle
            completedCount={completedCount}
            totalStores={10}
            isUnlocked={isAllComplete}
            onOpenVictory={() => {
              if (touchStateRef.current.dragDistance <= 8) {
                setShowVictoryModal(true);
              }
            }}
          />
        </div>

        {/* Floating Mini-Controls for Mobile Touch Zoom & Pan (Bottom-Right) */}
        <div className="absolute bottom-2 right-2 z-40 flex items-center gap-1 bg-slate-950/90 backdrop-blur-md px-1.5 py-1 rounded-xl border border-purple-500/40 shadow-xl pointer-events-auto">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= MIN_SCALE}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              scale <= MIN_SCALE
                ? 'text-slate-600 opacity-50 cursor-not-allowed'
                : 'text-amber-300 hover:bg-purple-900/60 active:scale-95'
            }`}
            title="Alejar mapa"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Level Indicator / Reset */}
          <button
            onClick={handleResetZoom}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
              scale > 1.05
                ? 'bg-amber-500 text-slate-950 shadow-sm animate-pulse'
                : 'text-purple-300 hover:text-white'
            }`}
            title="Toca para restablecer vista al 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={scale >= MAX_SCALE}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              scale >= MAX_SCALE
                ? 'text-slate-600 opacity-50 cursor-not-allowed'
                : 'text-amber-300 hover:bg-purple-900/60 active:scale-95'
            }`}
            title="Acercar mapa"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Reset button shown when zoomed */}
          {scale > 1.05 && (
            <button
              onClick={handleResetZoom}
              className="p-1 rounded-lg text-emerald-400 hover:bg-purple-900/60 active:scale-95 transition-colors cursor-pointer border-l border-purple-800/60 ml-0.5"
              title="Restablecer vista 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subtle helper pill when in portrait or zoomed */}
        {(scale > 1.05 || isPortrait) && (
          <div className="absolute top-2 left-2 z-40 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/85 border border-purple-500/40 text-[10px] text-amber-300 font-['Fredoka'] animate-fadeIn shadow-lg backdrop-blur-sm">
            <Move className="w-3 h-3 text-amber-400" />
            <span>
              {scale > 1.05
                ? 'Arrastra con 1 dedo para moverte · Pellizca para zoom'
                : 'Desliza para explorar la isla · Pellizca para zoom'}
            </span>
          </div>
        )}
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
          onPlayerUpdate={onUpdatePlayer}
        />
      )}
    </div>
  );
};
