import React, { useState, useEffect } from 'react';
import { Maximize, RotateCw, Sparkles, Smartphone, CheckCircle2, ChevronRight } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { ambientSound } from '../services/ambientAudio';

interface OrientationSetupScreenProps {
  onContinue: () => void;
}

export const OrientationSetupScreen: React.FC<OrientationSetupScreenProps> = ({ onContinue }) => {
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > window.innerHeight;
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      mozFullScreenElement?: Element;
      msFullscreenElement?: Element;
    };
    return !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );
  });

  // Track screen orientation changes
  useEffect(() => {
    const handleResizeOrOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);

      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
      };
      setIsFullscreen(
        !!(
          doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
        )
      );
    };

    handleResizeOrOrientation();
    window.addEventListener('resize', handleResizeOrOrientation, { passive: true });
    window.addEventListener('orientationchange', handleResizeOrOrientation, { passive: true });
    document.addEventListener('fullscreenchange', handleResizeOrOrientation);
    document.addEventListener('webkitfullscreenchange', handleResizeOrOrientation);

    return () => {
      window.removeEventListener('resize', handleResizeOrOrientation);
      window.removeEventListener('orientationchange', handleResizeOrOrientation);
      document.removeEventListener('fullscreenchange', handleResizeOrOrientation);
      document.removeEventListener('webkitfullscreenchange', handleResizeOrOrientation);
    };
  }, []);

  const handleActivateFullscreenAndContinue = async () => {
    soundEffects.playBounce();
    ambientSound.start();

    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen could not be enabled:', err);
    }

    try {
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
      };
      if (orientation?.lock) {
        await orientation.lock('landscape').catch(() => {});
      }
    } catch {
      // Ignore orientation lock restriction if not supported
    }

    // Small delay to allow fullscreen render before screen transition
    setTimeout(() => {
      onContinue();
    }, 250);
  };

  const handleContinueWithoutFullscreen = () => {
    soundEffects.playBounce();
    ambientSound.start();
    onContinue();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none font-['Fredoka'] text-white">
      {/* Ambient Animated Spooky Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Central Radiant Glow Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-radial from-amber-500/15 via-purple-600/10 to-transparent blur-3xl animate-pulse" />
      </div>

      {/* Floating Halloween Bats Silhouette in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[12%] left-[10%] animate-pulse">
          <svg className="w-8 h-8 text-purple-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4c-1.5 0-3 1-3.5 2.5C7.5 5 5 4.5 3 6c1 2 2 3 3.5 3C5 10 3 12 2 15c2.5-1 5 0 6.5 1.5.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5C17 15 19.5 14 22 15c-1-3-3-5-4.5-6 1.5 0 2.5-1 3.5-3-2-1.5-4.5-1-5.5.5C15 5 13.5 4 12 4z" />
          </svg>
        </div>
        <div className="absolute top-[18%] right-[15%] animate-pulse delay-700">
          <svg className="w-12 h-12 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4c-1.5 0-3 1-3.5 2.5C7.5 5 5 4.5 3 6c1 2 2 3 3.5 3C5 10 3 12 2 15c2.5-1 5 0 6.5 1.5.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5C17 15 19.5 14 22 15c-1-3-3-5-4.5-6 1.5 0 2.5-1 3.5-3-2-1.5-4.5-1-5.5.5C15 5 13.5 4 12 4z" />
          </svg>
        </div>
        <div className="absolute bottom-[20%] left-[8%] animate-pulse delay-1000">
          <svg className="w-6 h-6 text-purple-300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4c-1.5 0-3 1-3.5 2.5C7.5 5 5 4.5 3 6c1 2 2 3 3.5 3C5 10 3 12 2 15c2.5-1 5 0 6.5 1.5.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5C17 15 19.5 14 22 15c-1-3-3-5-4.5-6 1.5 0 2.5-1 3.5-3-2-1.5-4.5-1-5.5.5C15 5 13.5 4 12 4z" />
          </svg>
        </div>
      </div>

      {/* TOP HEADER: Badge */}
      <div className="relative z-10 flex flex-col items-center text-center mt-2 sm:mt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-amber-300 text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Configuración Óptima del Juego</span>
          <span className="text-base">🎃</span>
        </div>
      </div>

      {/* CENTER CARD: Phone Rotation Graphic & Clear Instructions */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg w-full my-auto px-2">
        {/* Dynamic Main Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-wide drop-shadow-md mb-2">
          Gira tu celular horizontalmente
        </h1>
        <p className="text-sm sm:text-base text-purple-200/90 font-medium max-w-md mx-auto mb-6">
          Para ver toda la isla de Halloween, explorar el mapa y encontrar las 10 casas embrujadas con facilidad.
        </p>

        {/* Animated Phone Graphic (Rotating 0 to 90 degrees) */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center my-2">
          {/* Subtle Outer Orbit Ring with Rotation Arrows */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_10s_linear_infinite]" />

          {/* Rotating Phone Container */}
          <div className="relative w-24 h-40 sm:w-28 sm:h-44 rounded-2xl p-1.5 bg-slate-900 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all animate-phoneRotate">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-slate-700" />

            {/* Inner Phone Screen with Spooky Mini-Island Preview */}
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center relative p-1.5 border border-purple-900/60">
              <div className="text-2xl sm:text-3xl mb-1 animate-pulse">🏰</div>
              <div className="text-[9px] sm:text-[10px] text-amber-300 font-bold tracking-tight">
                ISLA MÁGICA
              </div>
              <div className="text-[8px] text-purple-300/80">Modo 20:9</div>

              {/* Little pumpkins in the phone display */}
              <div className="flex gap-1.5 mt-2">
                <span className="text-xs">🎃</span>
                <span className="text-xs">👻</span>
                <span className="text-xs">🍬</span>
              </div>
            </div>
          </div>

          {/* Curved Directional Arrow Graphic */}
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-2 sm:p-2.5 rounded-full shadow-lg border-2 border-white animate-spin">
            <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Real-Time Device Orientation Status Badge */}
        <div className="mt-4 mb-2">
          {isLandscape ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-bold shadow-md animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>¡Excelente! Tu celular ya está en posición horizontal</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs sm:text-sm font-bold shadow-md animate-pulse">
              <Smartphone className="w-4 h-4 text-amber-400 rotate-90 shrink-0" />
              <span>Gira tu teléfono de lado para la mejor experiencia</span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTIONS: Highly Prominent Fullscreen Button */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto gap-3 pb-3 sm:pb-6">
        {/* BIG HYPER-ATTRACTIVE FULLSCREEN BUTTON */}
        <button
          onClick={handleActivateFullscreenAndContinue}
          className="relative group w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:via-orange-400 hover:to-amber-400 text-slate-950 font-black text-base sm:text-lg tracking-wide uppercase shadow-[0_0_35px_rgba(245,158,11,0.65)] hover:shadow-[0_0_50px_rgba(245,158,11,0.9)] active:scale-98 transition-all duration-200 cursor-pointer overflow-hidden border-2 border-white/60 flex items-center justify-center gap-3 animate-pulse"
        >
          {/* Shimmer light sweep animation */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
            <Maximize className="w-5 h-5 text-slate-950 stroke-[3]" />
          </div>

          <div className="flex flex-col items-start text-left leading-tight">
            <span className="text-sm sm:text-base font-black">
              {isFullscreen ? 'PANTALLA COMPLETA ACTIVADA' : 'COLOCAR EN PANTALLA COMPLETA'}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-900/80">
              Toca aquí para expandir y comenzar ➔
            </span>
          </div>
        </button>

        {/* Secondary Alternative: Continue directly */}
        <button
          onClick={handleContinueWithoutFullscreen}
          className="px-4 py-1.5 rounded-xl text-xs sm:text-sm text-purple-300/80 hover:text-white hover:bg-white/5 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-medium"
        >
          <span>Continuar sin pantalla completa</span>
          <ChevronRight className="w-4 h-4 text-purple-400" />
        </button>
      </div>

      {/* Embedded CSS animations for phone rotation preview */}
      <style>{`
        @keyframes phoneRotate {
          0%, 20% {
            transform: rotate(0deg);
          }
          40%, 80% {
            transform: rotate(90deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-phoneRotate {
          animation: phoneRotate 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};
