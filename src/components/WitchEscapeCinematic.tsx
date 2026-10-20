import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEffects } from '../services/soundEffects';
import { Sparkles } from 'lucide-react';

interface WitchEscapeCinematicProps {
  isActive: boolean;
  onComplete: () => void;
}

export const WitchEscapeCinematic: React.FC<WitchEscapeCinematicProps> = ({
  isActive,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'idle' | 'unlock' | 'burst' | 'flying' | 'exit'>('idle');
  const [witchPos, setWitchPos] = useState({ x: 50.5, y: 46, scale: 0.2, opacity: 0, rotate: 0 });

  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      return;
    }

    // Phase 1: Center & Castle Unlock Shockwave (0ms)
    setPhase('unlock');
    try {
      soundEffects.playUnlock();
    } catch {}

    // Phase 2: Witch appears & floats/hovers above the castle for 3.5 seconds (1000ms - 4500ms)
    const tHover = setTimeout(() => {
      setPhase('burst');
      try {
        soundEffects.playWitchEscape();
      } catch {}
      setWitchPos({
        x: 50.5,
        y: 43.5,
        scale: 0.68,
        opacity: 1,
        rotate: -4,
      });
    }, 1000);

    // Phase 3: After floating for 3.5 seconds, she flees furiously towards the LEFT and exits map (4500ms)
    const tFlight = setTimeout(() => {
      setPhase('flying');
      setWitchPos({
        x: -25,
        y: 14,
        scale: 0.8,
        opacity: 0.95,
        rotate: -15,
      });

      // Victory fanfare and celebratory confetti
      setTimeout(() => {
        try {
          soundEffects.playVictoryFanfare();
        } catch {}

        try {
          confetti({
            particleCount: 70,
            spread: 90,
            origin: { y: 0.4 },
            colors: ['#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#FBBF24'],
          });
        } catch {}
      }, 700);
    }, 4500);

    // Phase 4: Finalize and open Victory Modal (6600ms)
    const tComplete = setTimeout(() => {
      setPhase('exit');
      onComplete();
    }, 6600);

    return () => {
      clearTimeout(tHover);
      clearTimeout(tFlight);
      clearTimeout(tComplete);
    };
  }, [isActive, onComplete]);

  if (!isActive && phase === 'idle') return null;

  return (
    <>
      {/* Cinematic Top Letterbox Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-black/95 border-b-2 border-amber-500/80 flex items-center justify-center transition-all duration-700 ease-out shadow-2xl pointer-events-none select-none ${
          phase !== 'idle' && phase !== 'exit' ? 'h-14 sm:h-16' : 'h-0 -translate-y-full opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 text-amber-300 font-['Lilita_One'] tracking-widest text-base sm:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
          <span>¡EL CANDADO CENTRAL HA SIDO DESTRUIDO!</span>
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Cinematic Bottom Letterbox Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t-2 border-purple-500/80 flex items-center justify-center transition-all duration-700 ease-out shadow-2xl pointer-events-none select-none ${
          phase !== 'idle' && phase !== 'exit' ? 'h-12 sm:h-14' : 'h-0 translate-y-full opacity-0'
        }`}
      >
        <p className="text-purple-200 text-xs sm:text-sm font-['Fredoka'] font-bold tracking-wider animate-pulse">
          ⚡ ¡La bruja huye derrotada de Unicentro Maracay! ⚡
        </p>
      </div>

      {/* Castle Shockwave Rings during 'unlock' & 'burst' (Positioned over map coordinates) */}
      {(phase === 'unlock' || phase === 'burst') && (
        <div
          style={{ left: '50.5%', top: '51.5%' }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-35 pointer-events-none"
        >
          {/* Pulsing Magic Shockwaves */}
          <div className="w-48 h-48 rounded-full border-4 border-amber-400/90 animate-ping" />
          <div className="absolute inset-0 w-64 h-64 -translate-x-8 -translate-y-8 rounded-full border-2 border-purple-400/70 animate-ping" style={{ animationDelay: '200ms' }} />
          <div className="absolute inset-0 w-80 h-80 -translate-x-16 -translate-y-16 bg-gradient-radial from-amber-400/30 to-transparent rounded-full blur-xl animate-pulse" />
        </div>
      )}

      {/* The Fleeing Witch on Broom (bruja_huyendo.png) */}
      {(phase === 'burst' || phase === 'flying') && (
        <div
          style={{
            left: `${witchPos.x}%`,
            top: `${witchPos.y}%`,
            transform: `translate(-50%, -50%) scale(${witchPos.scale}) rotate(${witchPos.rotate}deg)`,
            opacity: witchPos.opacity,
            transition: phase === 'flying' 
              ? 'left 2.1s cubic-bezier(0.25, 0.1, 0.25, 1), top 2.1s cubic-bezier(0.25, 0.1, 0.25, 1), transform 2.1s ease-out, opacity 2.1s ease-in'
              : 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          className="absolute z-40 pointer-events-none select-none flex flex-col items-center"
        >
          {/* Comic Panic Speech Bubble */}
          <div className="relative mb-1 px-2 py-0.5 rounded-xl bg-white border border-slate-900 text-slate-900 font-['Lilita_One'] text-[10px] sm:text-[11px] tracking-wide shadow-xl whitespace-nowrap">
            <span>¡NOOO! ¡MIS HECHIZOS! ¡ME VOY!</span>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-3 border-x-transparent border-t-4 border-t-white" />
          </div>

          {/* Witch Illustration - Compact and gently floating */}
          <div 
            className={`relative w-14 sm:w-18 md:w-22 ${phase === 'burst' ? 'animate-bounce' : ''}`}
            style={{ animationDuration: '1.4s' }}
          >
            <img
              src="/bruja_huyendo.png"
              alt="Bruja Huyendo en Escoba"
              className="w-full h-auto object-contain filter drop-shadow-[0_0_12px_rgba(236,72,153,0.7)]"
              loading="eager"
            />

            {/* Trailing Magic Sparks behind the broom (on the RIGHT because she flies to the LEFT) */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-8 h-2 bg-gradient-to-l from-transparent via-purple-500/80 to-amber-400 rounded-full blur-[1px] animate-pulse" />
              <div className="absolute top-0 left-0 text-amber-300 text-[9px] animate-ping">✨</div>
              <div className="absolute -bottom-2 left-1 text-pink-400 text-[9px] animate-bounce">💫</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
