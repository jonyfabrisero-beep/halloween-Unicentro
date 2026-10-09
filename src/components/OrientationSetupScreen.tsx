import React, { useState, useEffect } from 'react';
import { Maximize, RotateCw, Sparkles, ChevronRight } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { ambientSound } from '../services/ambientAudio';

interface OrientationSetupScreenProps {
  onContinue: () => void;
}

export const OrientationSetupScreen: React.FC<OrientationSetupScreenProps> = ({ onContinue }) => {
  const [, setIsLandscape] = useState<boolean>(() => {
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

  const [supportsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    const elem = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      mozRequestFullScreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };
    return !!(
      elem.requestFullscreen ||
      elem.webkitRequestFullscreen ||
      elem.mozRequestFullScreen ||
      elem.msRequestFullscreen
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

    if (supportsFullscreen) {
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
    }

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
    <div
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      className="relative w-full min-h-[100dvh] bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto overflow-x-hidden select-none font-['Fredoka'] text-white touch-pan-y"
    >
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
      </div>

      {/* TOP HEADER: Badge */}
      <div className="relative z-10 flex flex-col items-center text-center mt-1 sm:mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-500/40 text-amber-300 text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Configuración de Pantalla Recomendada</span>
          <span className="text-base">🎃</span>
        </div>
      </div>

      {/* CENTER CARD: Phone Rotation Graphic & Clear Instructions */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg w-full my-auto px-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-wide drop-shadow-md mb-1.5">
          Gira tu celular horizontalmente
        </h1>
        <p className="text-xs sm:text-sm text-purple-200/90 font-medium max-w-md mx-auto mb-3">
          Para recorrer toda la isla de Halloween, explorar el mapa y encontrar las 10 tiendas embrujadas.
        </p>

        {/* Animated Phone Graphic (Rotating 0 to 90 degrees) */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center my-1">
          {/* Subtle Outer Orbit Ring with Rotation Arrows */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_10s_linear_infinite]" />

          {/* Rotating Phone Container */}
          <div className="relative w-20 h-32 sm:w-24 sm:h-38 rounded-2xl p-1.5 bg-slate-900 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.45)] transition-all animate-phoneRotate">
            {/* Camera notch */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-1 rounded-full bg-slate-700" />

            {/* Inner Phone Screen with Spooky Mini-Island Preview */}
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 flex flex-col items-center justify-center relative p-1 border border-purple-900/60">
              <div className="text-xl sm:text-2xl mb-0.5 animate-pulse">🏰</div>
              <div className="text-[8px] sm:text-[9px] text-amber-300 font-bold tracking-tight">
                ISLA MÁGICA
              </div>
              <div className="text-[7px] text-purple-300/80">Modo Horizontal</div>
              <div className="flex gap-1 mt-1">
                <span className="text-[10px]">🎃</span>
                <span className="text-[10px]">👻</span>
              </div>
            </div>
          </div>

          {/* Curved Directional Arrow Graphic */}
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-2 rounded-full shadow-lg border-2 border-white animate-spin">
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Direct Action Button without extraneous orientation banners */}
      </div>

      {/* BOTTOM ACTIONS: Highly Prominent Button */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md mx-auto gap-2 pb-2 sm:pb-4">
        {/* BIG HYPER-ATTRACTIVE BUTTON */}
        <button
          onClick={handleActivateFullscreenAndContinue}
          className="relative group w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:via-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base tracking-wide uppercase shadow-[0_0_35px_rgba(245,158,11,0.65)] hover:shadow-[0_0_50px_rgba(245,158,11,0.9)] active:scale-98 transition-all duration-200 cursor-pointer overflow-hidden border-2 border-white/60 flex items-center justify-center gap-3 animate-pulse"
        >
          {/* Shimmer light sweep animation */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="w-7 h-7 rounded-xl bg-slate-950/20 flex items-center justify-center shrink-0">
            {supportsFullscreen ? (
              <Maximize className="w-4 h-4 text-slate-950 stroke-[3]" />
            ) : (
              <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            )}
          </div>

          <div className="flex flex-col items-start text-left leading-tight">
            <span className="text-xs sm:text-sm font-black">
              {supportsFullscreen
                ? isFullscreen
                  ? 'PANTALLA COMPLETA ACTIVADA'
                  : 'COLOCAR EN PANTALLA COMPLETA'
                : 'CONTINUAR AL JUEGO'}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-900/80">
              {supportsFullscreen
                ? 'Toca aquí para expandir y comenzar ➔'
                : 'Toca aquí para comenzar la aventura ➔'}
            </span>
          </div>
        </button>

        {/* Secondary Alternative: Continue directly if on fullscreen-supported device */}
        {supportsFullscreen && (
          <button
            onClick={handleContinueWithoutFullscreen}
            className="px-4 py-1 text-xs text-purple-300/80 hover:text-white hover:bg-white/5 active:scale-95 transition-all flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>Continuar sin pantalla completa</span>
            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
          </button>
        )}
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
