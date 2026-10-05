import React, { useState, useEffect, useRef } from 'react';
import { soundEffects } from '../services/soundEffects';
import { ParticleTrigger } from './ParticleCanvas';

interface GhostState {
  id: string;
  x: number; // percentage
  y: number; // percentage
  type: 'green' | 'pumpkin' | 'book' | 'flame' | 'side';
  isPoofed: boolean;
  opacity: number;
  scale: number;
  isFading?: boolean;
  bubbleText?: string | null;
}

// Spooky fun Halloween phrases that ghosts murmur across the mall
const GHOST_PHRASES = [
  '¡Booo! 👻',
  '¡Dulce o Truco! 🍬',
  '¿Tienes dulces? 🍭',
  '¡Buuuh! 🦇',
  '¡Mwahahaha! 🎃',
  '¡Feliz Halloween! 🧙‍♀️',
  '¡Dame caramelos! 🍫',
  '¡Cuidado con la niebla! 🌫️',
  '¡No me asustes tú! 😱',
  '¿Viste esa calabaza? 🎃',
  '¡Noche de brujas! 🧹',
  '¡Qué miedo! 🕷️',
];

// Curated authentic positions along stone pathways, cemetery, riverbank, and grass
// Adjusted for 2400x1080 island map (all positions kept safely inside the island)
const GHOST_SPAWN_SPOTS: { x: number; y: number }[] = [
  { x: 18.8, y: 59.5 }, // Cemetery gate
  { x: 16.0, y: 72.0 }, // Far left grass
  { x: 21.6, y: 38.0 }, // Left forest path
  { x: 28.8, y: 45.0 }, // Near path intersection
  { x: 36.8, y: 92.5 }, // Bottom left meadow
  { x: 30.8, y: 64.0 }, // Between west houses
  { x: 40.4, y: 19.0 }, // North-west tree line
  { x: 51.2, y: 25.0 }, // North bridge
  { x: 58.4, y: 83.0 }, // South riverbank path
  { x: 65.6, y: 44.5 }, // East plaza path
  { x: 68.0, y: 26.0 }, // North-east trail
  { x: 75.6, y: 66.0 }, // East curved trail
  { x: 83.2, y: 38.0 }, // Far east trail
  { x: 87.2, y: 56.5 }, // Far right edge by Galler
  { x: 78.8, y: 84.0 }, // South-east bridge approach
  { x: 48.4, y: 92.0 }, // Bottom center grass
  { x: 60.4, y: 36.0 }, // North trail curve
  { x: 24.4, y: 82.0 }, // Lower west grass
  { x: 73.2, y: 48.0 }, // Mid-east crossroads
  { x: 42.0, y: 76.0 }, // South-west river trail
];

interface PumpkinState {
  id: string;
  x: number;
  y: number;
  wobbling: boolean;
  imageSrc: string;
  isBuried?: boolean;
  widthPercent: string;
}

interface InteractiveGhostsAndPumpkinsProps {
  particleTriggerRef?: React.RefObject<ParticleTrigger | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const InteractiveGhostsAndPumpkins: React.FC<InteractiveGhostsAndPumpkinsProps> = ({
  particleTriggerRef,
  containerRef,
}) => {
  // 7 interactive ghosts on the map matching PROTOTIPO JUEGO HALLOWEEN.png (adjusted for 2400x1080)
  const [ghosts, setGhosts] = useState<GhostState[]>([
    { id: 'g1', x: 18.8, y: 59.5, type: 'pumpkin', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g2', x: 36.8, y: 92.5, type: 'green', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g3', x: 51.2, y: 25.0, type: 'side', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g4', x: 58.4, y: 83.0, type: 'flame', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g5', x: 65.6, y: 44.5, type: 'green', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g6', x: 75.6, y: 66.0, type: 'book', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g7', x: 87.2, y: 56.5, type: 'side', isPoofed: false, opacity: 1, scale: 1, isFading: false },
  ]);

  // Keep a reference to current ghosts state for timeout callbacks
  const ghostsRef = useRef(ghosts);
  ghostsRef.current = ghosts;

  // Helper to pick a non-colliding random spot
  const getRandomSpot = (excludeGhostId: string) => {
    const otherGhosts = ghostsRef.current.filter((g) => g.id !== excludeGhostId && !g.isPoofed);
    const available = GHOST_SPAWN_SPOTS.filter((spot) => {
      return !otherGhosts.some((other) => Math.hypot(other.x - spot.x, other.y - spot.y) < 13);
    });

    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }
    return GHOST_SPAWN_SPOTS[Math.floor(Math.random() * GHOST_SPAWN_SPOTS.length)];
  };

  // Autonomous ghost drifting, fading out and rematerializing in new random locations
  useEffect(() => {
    const relocationInterval = setInterval(() => {
      // Pick one eligible ghost that is visible, calm and not already in transition
      const eligible = ghostsRef.current.filter(
        (g) => !g.isPoofed && !g.isFading && g.opacity >= 0.95
      );
      if (eligible.length === 0) return;

      const chosen = eligible[Math.floor(Math.random() * eligible.length)];

      // Step 1: Smoothly fade out the chosen ghost and clear any bubble
      setGhosts((prev) =>
        prev.map((g) =>
          g.id === chosen.id
            ? { ...g, opacity: 0, scale: 0.5, isFading: true, bubbleText: null }
            : g
        )
      );

      // Step 2: Once fully invisible (after 1000ms CSS transition), move to a new random spot
      setTimeout(() => {
        const newSpot = getRandomSpot(chosen.id);

        setGhosts((prev) =>
          prev.map((g) =>
            g.id === chosen.id
              ? { ...g, x: newSpot.x, y: newSpot.y, opacity: 0, scale: 0.5, bubbleText: null }
              : g
          )
        );

        // Step 3: Materialize gently at the new coordinates
        setTimeout(() => {
          setGhosts((prev) =>
            prev.map((g) =>
              g.id === chosen.id
                ? { ...g, opacity: 1, scale: 1, isFading: false }
                : g
            )
          );
        }, 300);
      }, 1050);
    }, 4200);

    return () => clearInterval(relocationInterval);
  }, []);

  // Autonomous ghost speech bubbles in random moments
  useEffect(() => {
    const bubbleInterval = setInterval(() => {
      // Pick one eligible ghost that is fully visible, not poofed, not fading and not already talking
      const eligible = ghostsRef.current.filter(
        (g) => !g.isPoofed && !g.isFading && g.opacity >= 0.95 && !g.bubbleText
      );
      if (eligible.length === 0) return;

      const chosen = eligible[Math.floor(Math.random() * eligible.length)];
      const phrase = GHOST_PHRASES[Math.floor(Math.random() * GHOST_PHRASES.length)];

      setGhosts((prev) =>
        prev.map((g) => (g.id === chosen.id ? { ...g, bubbleText: phrase } : g))
      );

      // Dissolve speech bubble after 3.2 seconds
      setTimeout(() => {
        setGhosts((prev) =>
          prev.map((g) => (g.id === chosen.id ? { ...g, bubbleText: null } : g))
        );
      }, 3200);
    }, 5500);

    return () => clearInterval(bubbleInterval);
  }, []);

  // 10 authentic pumpkins matching PROTOTIPO JUEGO HALLOWEEN.png adjusted for 2400x1080 island map
  const [pumpkins, setPumpkins] = useState<PumpkinState[]>([
    {
      id: 'p1',
      x: 64.0,
      y: 53.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_rostro.png',
      widthPercent: '2.7%',
    }, // path below central castle plaza stairs
    {
      id: 'p4',
      x: 40.8,
      y: 42.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabazas_duo.png',
      widthPercent: '3.2%',
    }, // next to opticolor
    {
      id: 'p5',
      x: 47.0,
      y: 26.5,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_rostro.png',
      widthPercent: '2.7%',
    }, // curve of road north of castle
    {
      id: 'p6',
      x: 71.5,
      y: 41.5,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_rostro.png',
      widthPercent: '2.7%',
    }, // road curve shoulder before bridge
    {
      id: 'p7',
      x: 53.0,
      y: 31.5,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_sin_rostro.png',
      widthPercent: '2.7%',
    }, // grass patch below road northeast of castle
    {
      id: 'p8',
      x: 73.5,
      y: 73.5,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_rostro.png',
      widthPercent: '2.7%',
    }, // southeast road next to lamppost
    {
      id: 'p9',
      x: 49.0,
      y: 83.5,
      wobbling: false,
      imageSrc: '/pumpkins/trio_calabazas_enterradas.png',
      widthPercent: '4.2%',
    }, // left grass bank near waterfall (moved further left towards house)
    {
      id: 'p10',
      x: 64.2,
      y: 81.0,
      wobbling: false,
      imageSrc: '/pumpkins/trio_calabazas.png',
      widthPercent: '3.8%',
    }, // right grass bank near waterfall (moved higher onto grass)
  ]);

  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  const recordTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const isDragGesture = (e: React.MouseEvent): boolean => {
    if (touchStartRef.current.time === 0) return false;
    const dist = Math.hypot(
      e.clientX - touchStartRef.current.x,
      e.clientY - touchStartRef.current.y
    );
    return dist > 8;
  };

  // Ghost tap handler: canvas particle burst + sound
  const handleGhostTap = (ghost: GhostState, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragGesture(e)) return;
    soundEffects.playGhostPop();

    if (particleTriggerRef?.current) {
      // Trigger burst from the exact center of the ghost on the canvas
      particleTriggerRef.current.burstGhost(ghost.x, ghost.y, true);
    }

    // Instantly hide the tapped ghost
    setGhosts((prev) =>
      prev.map((g) =>
        g.id === ghost.id
          ? { ...g, isPoofed: true, opacity: 0, scale: 0.5, isFading: true, bubbleText: null }
          : g
      )
    );

    // Respawn after 3.6 seconds at a new random location
    setTimeout(() => {
      const newSpot = getRandomSpot(ghost.id);

      setGhosts((prev) =>
        prev.map((g) =>
          g.id === ghost.id
            ? {
                ...g,
                x: newSpot.x,
                y: newSpot.y,
                isPoofed: false,
                opacity: 0,
                scale: 0.5,
              }
            : g
        )
      );

      // Smoothly fade in at the new position
      setTimeout(() => {
        setGhosts((prev) =>
          prev.map((g) =>
            g.id === ghost.id
              ? { ...g, opacity: 1, scale: 1, isFading: false }
              : g
          )
        );
      }, 150);
    }, 3600);
  };

  // Pumpkin tap handler: dirt particles for buried, candies/wobble for others
  const handlePumpkinTap = (p: PumpkinState, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragGesture(e)) return;

    if (particleTriggerRef?.current) {
      if (p.isBuried) {
        // Special dirt particles for semi-buried pumpkins (at ground contact point)
        particleTriggerRef.current.burstDirt(p.x, p.y + 0.6, true);
      } else {
        // Candy and pulp fountain from exact pumpkin center
        particleTriggerRef.current.burstPumpkin(p.x, p.y, true);
      }
    }

    soundEffects.playPumpkinSquish();

    // Do NOT wobble if semi-buried!
    if (!p.isBuried) {
      setPumpkins((prev) =>
        prev.map((item) => (item.id === p.id ? { ...item, wobbling: true } : item))
      );

      setTimeout(() => {
        setPumpkins((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, wobbling: false } : item))
        );
      }, 1000);
    }
  };

  return (
    <>
      {/* Realistic Vector Autumn Leaves Drifting in 3D wind with high randomness & varied trajectories */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
        {[
          { id: 1, left: -6, top: 8, dur: 9.5, delay: 0.2, anim: 'animate-leafDiagonal', size: 'w-4 h-4 sm:w-5 sm:h-5', color1: '#F97316', color2: '#DC2626' },
          { id: 2, left: 15, top: -8, dur: 8.0, delay: 1.8, anim: 'animate-leafSwirl', size: 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5', color1: '#EA580C', color2: '#B45309' },
          { id: 3, left: -5, top: 38, dur: 11.2, delay: 3.5, anim: 'animate-leafTumble', size: 'w-4.5 h-4.5 sm:w-5.5 sm:h-5.5', color1: '#FBBF24', color2: '#D97706' },
          { id: 4, left: 42, top: -10, dur: 13.0, delay: 0.8, anim: 'animate-leafFloatDown', size: 'w-4 h-4 sm:w-5 sm:h-5', color1: '#C2410C', color2: '#991B1B' },
          { id: 5, left: -4, top: 62, dur: 10.5, delay: 2.6, anim: 'animate-leafDiagonal', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', color1: '#F59E0B', color2: '#EA580C' },
          { id: 6, left: 68, top: -8, dur: 9.0, delay: 4.2, anim: 'animate-leafSwirl', size: 'w-4 h-4 sm:w-5 sm:h-5', color1: '#EF4444', color2: '#991B1B' },
          { id: 7, left: -5, top: 22, dur: 12.5, delay: 1.1, anim: 'animate-leafTumble', size: 'w-5 h-5 sm:w-6 sm:h-6', color1: '#F97316', color2: '#7C2D12' },
          { id: 8, left: 85, top: -10, dur: 14.0, delay: 3.0, anim: 'animate-leafFloatDown', size: 'w-3.5 h-3.5 sm:w-4 sm:h-4', color1: '#D97706', color2: '#78350F' },
          { id: 9, left: -6, top: 50, dur: 8.8, delay: 5.0, anim: 'animate-leafDiagonal', size: 'w-4 h-4 sm:w-5 sm:h-5', color1: '#FB923C', color2: '#C2410C' },
          { id: 10, left: 30, top: -6, dur: 10.2, delay: 6.2, anim: 'animate-leafSwirl', size: 'w-3 h-3 sm:w-4 sm:h-4', color1: '#E11D48', color2: '#881337' },
          { id: 11, left: -5, top: 75, dur: 11.8, delay: 2.0, anim: 'animate-leafTumble', size: 'w-4.5 h-4.5 sm:w-5 sm:h-5', color1: '#FBBF24', color2: '#B45309' },
          { id: 12, left: 55, top: -8, dur: 12.0, delay: 4.8, anim: 'animate-leafFloatDown', size: 'w-4 h-4 sm:w-5 sm:h-5', color1: '#F97316', color2: '#9A3412' },
        ].map((leaf) => (
          <div
            key={leaf.id}
            className={`absolute ${leaf.anim} select-none`}
            style={{
              top: `${leaf.top}%`,
              left: `${leaf.left}%`,
              animationDuration: `${leaf.dur}s`,
              animationDelay: `${leaf.delay}s`,
            }}
          >
            <svg viewBox="0 0 24 24" className={`${leaf.size} filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
              <path
                d="M12 2 C8 6, 4 9, 3 14 C2 17, 5 20, 9 20 C10 20, 11 21, 11 23 L13 23 C13 21, 14 20, 15 20 C19 20, 22 17, 21 14 C20 9, 16 6, 12 2 Z"
                fill={leaf.color1}
                stroke={leaf.color2}
                strokeWidth="1"
              />
              <line x1="12" y1="4" x2="12" y2="21" stroke={leaf.color2} strokeWidth="1" opacity="0.7" />
              <line x1="12" y1="9" x2="8" y2="13" stroke={leaf.color2} strokeWidth="0.8" opacity="0.7" />
              <line x1="12" y1="13" x2="16" y2="16" stroke={leaf.color2} strokeWidth="0.8" opacity="0.7" />
            </svg>
          </div>
        ))}
      </div>

      {/* Interactive Ghosts with autonomous fade in/out and random relocations */}
      {ghosts.map((ghost) => {
        if (ghost.isPoofed && ghost.opacity === 0) return null;

        return (
          <div
            key={ghost.id}
            onTouchStart={recordTouchStart}
            onClick={(e) => handleGhostTap(ghost, e)}
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`,
              width: '2.6%',
              opacity: ghost.isPoofed ? 0 : ghost.opacity,
              transform: `translate(-50%, -50%) scale(${ghost.scale})`,
            }}
            className={`absolute z-20 cursor-pointer select-none transition-all duration-1000 ease-in-out ${
              ghost.opacity > 0.3 && !ghost.isPoofed
                ? 'pointer-events-auto hover:scale-125 active:scale-95'
                : 'pointer-events-none'
            }`}
            title="¡Tócame para hacerme desaparecer con partículas!"
          >
            {/* Ground shadow beneath floating ghost with synchronized fade */}
            <div
              style={{ opacity: (ghost.isPoofed ? 0 : ghost.opacity) * 0.45 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-2 rounded-full bg-black blur-xs pointer-events-none transition-opacity duration-1000"
            />

            <div className="relative w-full aspect-[100/115] filter drop-shadow-[0_0_8px_rgba(167,243,208,0.5)] animate-ghostFloat">
              {/* Mini Ghost Speech Bubble Anchored directly over the ghost's head */}
              {ghost.bubbleText && !ghost.isPoofed && ghost.opacity > 0.5 && (
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-bubblePop whitespace-nowrap scale-[0.55] xs:scale-[0.65] sm:scale-[0.75] md:scale-[0.85] origin-bottom">
                  <div className="relative px-1.5 py-0.5 rounded-full bg-slate-950/95 border border-purple-400/70 shadow-[0_2px_8px_rgba(0,0,0,0.85)] text-[8px] sm:text-[9px] font-bold text-amber-300 font-['Fredoka'] tracking-tight flex items-center justify-center">
                    <span>{ghost.bubbleText}</span>
                    {/* Bubble pointer tail */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-purple-400/70" />
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-t-[3px] border-t-slate-950" />
                  </div>
                </div>
              )}
              {ghost.type === 'green' && (
                <svg viewBox="0 0 100 115" className="w-full h-full">
                  <defs>
                    <linearGradient id="ghostGradGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#DCFCE7" />
                      <stop offset="60%" stopColor="#86EFAC" />
                      <stop offset="100%" stopColor="#4ADE80" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M50 10 C26 10, 18 32, 18 64 C18 92, 28 88, 38 94 C48 98, 52 88, 62 94 C72 88, 82 92, 82 64 C82 32, 74 10, 50 10 Z"
                    fill="url(#ghostGradGreen)"
                    stroke="#22C55E"
                    strokeWidth="2.5"
                  />
                  <ellipse cx="38" cy="48" rx="4.5" ry="6" fill="#14532D" />
                  <ellipse cx="62" cy="48" rx="4.5" ry="6" fill="#14532D" />
                  <ellipse cx="50" cy="62" rx="4" ry="7" fill="#166534" />
                </svg>
              )}

              {ghost.type === 'pumpkin' && (
                <svg viewBox="0 0 100 115" className="w-full h-full">
                  <defs>
                    <linearGradient id="ghostGradWhite" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="70%" stopColor="#F1F5F9" />
                      <stop offset="100%" stopColor="#CBD5E1" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M50 10 C26 10, 18 32, 18 64 C18 92, 28 88, 38 94 C48 98, 52 88, 62 94 C72 88, 82 92, 82 64 C82 32, 74 10, 50 10 Z"
                    fill="url(#ghostGradWhite)"
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                  <circle cx="38" cy="46" r="4.5" fill="#0F172A" />
                  <circle cx="62" cy="46" r="4.5" fill="#0F172A" />
                  <path d="M44 58 Q50 64 56 58" stroke="#0F172A" strokeWidth="2.5" fill="none" />
                  {/* Little Pumpkin held in hand */}
                  <circle cx="50" cy="74" r="10" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
                  <rect x="48" y="61" width="4" height="4" fill="#15803D" />
                  <polygon points="46,72 49,76 44,76" fill="#451A03" />
                  <polygon points="54,72 56,76 51,76" fill="#451A03" />
                </svg>
              )}

              {ghost.type === 'book' && (
                <svg viewBox="0 0 100 115" className="w-full h-full">
                  <path
                    d="M50 10 C26 10, 18 32, 18 64 C18 92, 28 88, 38 94 C48 98, 52 88, 62 94 C72 88, 82 92, 82 64 C82 32, 74 10, 50 10 Z"
                    fill="#F8FAFC"
                    stroke="#CBD5E1"
                    strokeWidth="2"
                  />
                  <circle cx="40" cy="44" r="3.5" fill="#1E293B" />
                  <circle cx="60" cy="44" r="3.5" fill="#1E293B" />
                  <circle cx="40" cy="44" r="7" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
                  <circle cx="60" cy="44" r="7" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
                  <line x1="47" y1="44" x2="53" y2="44" stroke="#F59E0B" strokeWidth="1.5" />
                  <rect x="34" y="66" width="32" height="18" rx="2" fill="#7C2D12" stroke="#451A03" strokeWidth="1.5" />
                  <rect x="36" y="68" width="13" height="14" fill="#FEF08A" />
                  <rect x="51" y="68" width="13" height="14" fill="#FEF08A" />
                </svg>
              )}

              {ghost.type === 'flame' && (
                <svg viewBox="0 0 100 115" className="w-full h-full">
                  <defs>
                    <linearGradient id="ghostGradPink" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#F472B6" />
                      <stop offset="100%" stopColor="#DB2777" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M50 8 C30 22, 22 46, 24 72 C32 86, 52 86, 62 74 C72 50, 70 24, 50 8 Z"
                    fill="url(#ghostGradPink)"
                    stroke="#BE185D"
                    strokeWidth="2.5"
                  />
                  <circle cx="40" cy="46" r="4.5" fill="#831843" />
                  <circle cx="60" cy="46" r="4.5" fill="#831843" />
                  <path d="M44 58 Q50 64 56 58" stroke="#831843" strokeWidth="2.5" fill="none" />
                </svg>
              )}

              {ghost.type === 'side' && (
                <svg viewBox="0 0 100 115" className="w-full h-full">
                  <path
                    d="M44 12 C28 16, 20 38, 24 64 C28 86, 44 82, 54 86 C64 82, 74 82, 78 64 C78 36, 64 12, 44 12 Z"
                    fill="#F1F5F9"
                    stroke="#94A3B8"
                    strokeWidth="2"
                  />
                  <circle cx="56" cy="44" r="4.5" fill="#0F172A" />
                  <circle cx="68" cy="44" r="3.5" fill="#0F172A" />
                  <ellipse cx="64" cy="56" rx="4" ry="5" fill="#0F172A" />
                </svg>
              )}
            </div>
          </div>
        );
      })}

      {/* Authentic Isometric Pumpkins firmly anchored to the ground with realistic cast shadows */}
      {pumpkins.map((p) => {
        return (
          <div
            key={p.id}
            onTouchStart={recordTouchStart}
            onClick={(e) => handlePumpkinTap(p, e)}
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.widthPercent }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 z-15 cursor-pointer select-none transition-transform duration-200 ${
              p.isBuried
                ? 'hover:brightness-110 active:brightness-95' // No jumping or wobbling for semi-buried
                : p.wobbling
                ? 'animate-wiggle scale-135'
                : 'hover:scale-115'
            }`}
            title={
              p.isBuried
                ? '¡Calabazas enterradas! Tócalas para levantar polvo de tierra'
                : '¡Tócame para ver saltar dulces!'
            }
          >
            {/* Authentic Hand-Illustrated Pumpkin Container */}
            <div className="relative w-full flex items-center justify-center">
              <img
                src={p.imageSrc}
                alt="Calabaza de Halloween"
                className="w-full h-auto object-contain pointer-events-none select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                loading="eager"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
