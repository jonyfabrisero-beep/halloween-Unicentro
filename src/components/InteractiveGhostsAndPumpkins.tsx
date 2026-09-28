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
// All positions are carefully spaced and clear of mall stores and the central castle
const GHOST_SPAWN_SPOTS: { x: number; y: number }[] = [
  { x: 11.0, y: 59.5 }, // Cemetery gate
  { x: 7.5, y: 72.0 },  // Far left grass
  { x: 14.5, y: 38.0 }, // Left forest path
  { x: 23.5, y: 45.0 }, // Near path intersection
  { x: 33.5, y: 92.5 }, // Bottom left meadow
  { x: 26.0, y: 64.0 }, // Between west houses
  { x: 38.0, y: 19.0 }, // North-west tree line
  { x: 51.5, y: 25.0 }, // North bridge
  { x: 60.5, y: 83.0 }, // South riverbank path
  { x: 69.5, y: 44.5 }, // East plaza path
  { x: 72.5, y: 26.0 }, // North-east trail
  { x: 82.0, y: 66.0 }, // East curved trail
  { x: 91.5, y: 38.0 }, // Far east trail
  { x: 96.5, y: 56.5 }, // Far right edge by Galler
  { x: 86.0, y: 84.0 }, // South-east bridge approach
  { x: 48.0, y: 92.0 }, // Bottom center grass
  { x: 63.0, y: 36.0 }, // North trail curve
  { x: 18.0, y: 82.0 }, // Lower west grass
  { x: 79.0, y: 48.0 }, // Mid-east crossroads
  { x: 40.0, y: 76.0 }, // South-west river trail
];

interface PumpkinState {
  id: string;
  x: number;
  y: number;
  wobbling: boolean;
  imageSrc: string;
  isBuried?: boolean;
  sizeClass: string;
  shadowWidth: string;
}

interface InteractiveGhostsAndPumpkinsProps {
  particleTriggerRef?: React.RefObject<ParticleTrigger | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const InteractiveGhostsAndPumpkins: React.FC<InteractiveGhostsAndPumpkinsProps> = ({
  particleTriggerRef,
  containerRef,
}) => {
  // 7 interactive ghosts on the map matching PROTOTIPO JUEGO HALLOWEEN.png
  const [ghosts, setGhosts] = useState<GhostState[]>([
    { id: 'g1', x: 11.0, y: 59.5, type: 'pumpkin', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g2', x: 33.5, y: 92.5, type: 'green', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g3', x: 51.5, y: 25.0, type: 'side', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g4', x: 60.5, y: 83.0, type: 'flame', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g5', x: 69.5, y: 44.5, type: 'green', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g6', x: 82.0, y: 66.0, type: 'book', isPoofed: false, opacity: 1, scale: 1, isFading: false },
    { id: 'g7', x: 96.5, y: 56.5, type: 'side', isPoofed: false, opacity: 1, scale: 1, isFading: false },
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

  // 10 authentic pumpkins matching PROTOTIPO JUEGO HALLOWEEN.png
  const [pumpkins, setPumpkins] = useState<PumpkinState[]>([
    {
      id: 'p1',
      x: 4.8,
      y: 89.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_rostro.png',
      sizeClass: 'w-7 h-7 sm:w-8 sm:h-8',
      shadowWidth: 'w-7 sm:w-8',
    }, // maze
    {
      id: 'p2',
      x: 17.5,
      y: 65.5,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_sin_rostro.png',
      sizeClass: 'w-7 h-7 sm:w-8 sm:h-8',
      shadowWidth: 'w-7 sm:w-8',
    }, // left path
    {
      id: 'p3',
      x: 31.5,
      y: 32.5,
      wobbling: false,
      imageSrc: '/pumpkins/trio_calabazas.png',
      sizeClass: 'w-11 h-7 sm:w-13 sm:h-8',
      shadowWidth: 'w-11 sm:w-13',
    }, // upper left
    {
      id: 'p4',
      x: 38.5,
      y: 42.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabazas_duo.png',
      sizeClass: 'w-8 h-8 sm:w-9 sm:h-9',
      shadowWidth: 'w-8 sm:w-9',
    }, // next to opticolor
    {
      id: 'p5',
      x: 23.5,
      y: 79.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_rostro.png',
      sizeClass: 'w-7 h-7 sm:w-8 sm:h-8',
      shadowWidth: 'w-7 sm:w-8',
    }, // south-west path near AG Decoraciones
    {
      id: 'p6',
      x: 73.0,
      y: 33.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_rostro.png',
      sizeClass: 'w-7 h-7 sm:w-8 sm:h-8',
      shadowWidth: 'w-7 sm:w-8',
    }, // north-east curve between Clarks and Movilmat
    {
      id: 'p7',
      x: 56.0,
      y: 27.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabaza_sin_rostro.png',
      sizeClass: 'w-7 h-7 sm:w-8 sm:h-8',
      shadowWidth: 'w-7 sm:w-8',
    }, // upper road
    {
      id: 'p8',
      x: 87.0,
      y: 73.0,
      wobbling: false,
      imageSrc: '/pumpkins/calabazas_duo.png',
      sizeClass: 'w-8 h-8 sm:w-9 sm:h-9',
      shadowWidth: 'w-8 sm:w-9',
    }, // right road
    {
      id: 'p9',
      x: 61.5,
      y: 93.5,
      wobbling: false,
      imageSrc: '/pumpkins/trio_calabazas_enterradas.png',
      isBuried: true,
      sizeClass: 'w-14 h-8 sm:w-18 sm:h-10',
      shadowWidth: 'w-14 sm:w-18',
    }, // bottom dirt patch - SEMI-ENTERRADAS (sin animación de movimiento, con partículas de tierra)
    {
      id: 'p10',
      x: 67.5,
      y: 94.5,
      wobbling: false,
      imageSrc: '/pumpkins/trio_calabazas.png',
      sizeClass: 'w-10 h-6 sm:w-12 sm:h-7',
      shadowWidth: 'w-10 sm:w-12',
    }, // bottom right grass
  ]);

  // Ghost tap handler: canvas particle burst + sound
  const handleGhostTap = (ghost: GhostState, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playGhostPop();

    if (particleTriggerRef?.current && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      particleTriggerRef.current.burstGhost(clientX, clientY);
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

    if (particleTriggerRef?.current && containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (p.isBuried) {
        // Special dirt particles for semi-buried pumpkins (no jump, no wobble)
        particleTriggerRef.current.burstDirt(clientX, clientY);
      } else {
        // Candy and pulp fountain for free pumpkins
        particleTriggerRef.current.burstPumpkin(clientX, clientY);
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
      {/* Realistic Vector Autumn Leaves Drifting in 3D wind (No emojis!) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
        {[
          { id: 1, top: 12, dur: 11, delay: 0.5, color1: '#F97316', color2: '#DC2626' },
          { id: 2, top: 28, dur: 9, delay: 2.2, color1: '#EA580C', color2: '#B45309' },
          { id: 3, top: 45, dur: 12, delay: 4.0, color1: '#FBBF24', color2: '#D97706' },
          { id: 4, top: 62, dur: 10, delay: 1.5, color1: '#C2410C', color2: '#991B1B' },
          { id: 5, top: 78, dur: 13, delay: 3.5, color1: '#F59E0B', color2: '#EA580C' },
        ].map((leaf) => (
          <div
            key={leaf.id}
            className="absolute animate-driftLeaf select-none"
            style={{
              top: `${leaf.top}%`,
              left: '-4%',
              animationDuration: `${leaf.dur}s`,
              animationDelay: `${leaf.delay}s`,
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
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
            onClick={(e) => handleGhostTap(ghost, e)}
            style={{
              left: `${ghost.x}%`,
              top: `${ghost.y}%`,
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
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-3 rounded-full bg-black blur-xs pointer-events-none transition-opacity duration-1000"
            />

            {/* Mini Ghost Speech Bubble */}
            {ghost.bubbleText && !ghost.isPoofed && ghost.opacity > 0.5 && (
              <div className="absolute -top-7 sm:-top-8 left-1/2 -translate-x-1/2 pointer-events-none z-30 animate-bubblePop whitespace-nowrap">
                <div className="relative px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-950/95 border border-purple-400/80 shadow-[0_2px_12px_rgba(0,0,0,0.85)] backdrop-blur-xs text-[10px] sm:text-[11px] font-bold text-amber-300 font-['Fredoka'] tracking-wide flex items-center justify-center">
                  <span>{ghost.bubbleText}</span>
                  {/* Bubble pointer tail */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-purple-400/80" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[4px] border-t-slate-950" />
                </div>
              </div>
            )}

            <div className="relative w-9 h-11 sm:w-11 sm:h-13 filter drop-shadow-[0_0_10px_rgba(167,243,208,0.5)] animate-ghostFloat">
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
            onClick={(e) => handlePumpkinTap(p, e)}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
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
            {/* Authentic Hand-Illustrated Pumpkin Container without artificial shadows */}
            <div
              className={`relative ${p.sizeClass} flex items-center justify-center`}
            >
              <img
                src={p.imageSrc}
                alt="Calabaza de Halloween"
                className="w-full h-full object-contain pointer-events-none select-none"
                loading="eager"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
