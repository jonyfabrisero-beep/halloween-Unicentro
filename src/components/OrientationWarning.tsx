import { useState, useEffect } from 'react';
import { Smartphone, X } from 'lucide-react';

export default function OrientationWarning() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Instant check: only show if portrait orientation on smaller screens
      const isMobile = window.innerWidth < 850;
      const portrait = window.matchMedia('(orientation: portrait)').matches || (window.innerWidth < window.innerHeight);
      setIsPortrait(portrait && isMobile);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation, { passive: true });
    window.addEventListener('orientationchange', checkOrientation, { passive: true });

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  return (
    <div
      className="fixed bottom-12 sm:bottom-14 left-3 right-3 sm:left-auto sm:right-4 z-40 max-w-sm sm:max-w-md pointer-events-auto select-none transition-all duration-300 animate-slideUp"
      style={{
        // Pure CSS guarantee: disappears instantaneously when rotated to landscape with zero JS lag
      }}
    >
      <style>{`
        @media screen and (orientation: landscape) {
          .orientation-banner-container {
            display: none !important;
          }
        }
      `}</style>
      <div className="orientation-banner-container rounded-2xl bg-slate-950/85 backdrop-blur-md border-2 border-amber-500/70 p-3 sm:p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex items-center gap-3">
        {/* Animated Rotating Phone Icon */}
        <div className="relative shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-purple-600/30 border border-amber-400/50 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-amber-300 animate-pulse rotate-90" />
        </div>

        {/* Text Prompt */}
        <div className="flex-1 text-left min-w-0">
          <h4 className="text-xs font-black text-amber-300 tracking-wide font-['Lilita_One'] uppercase leading-tight">
            ¡Gira tu celular en horizontal!
          </h4>
          <p className="text-[11px] text-slate-300 font-['Fredoka'] leading-tight mt-0.5">
            Para recorrer cómodamente la isla y encontrar todas las casas.
          </p>
        </div>

        {/* Close / Dismiss Button */}
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer shrink-0"
          title="Cerrar aviso"
          aria-label="Cerrar aviso de orientación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
