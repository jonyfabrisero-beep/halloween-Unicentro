import { useState, useEffect } from 'react';
import { Smartphone, RotateCw } from 'lucide-react';

export default function OrientationWarning() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if width < height and width < 900 (mobile portrait)
      const portrait = window.innerWidth < window.innerHeight && window.innerWidth < 850;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center animate-pulse">
          <Smartphone className="w-12 h-12 text-orange-400 rotate-90 transition-transform duration-700" />
        </div>
        <RotateCw className="w-8 h-8 text-amber-300 absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      <h2 className="text-2xl font-black text-amber-400 tracking-wide mb-2 font-['Lilita_One']">
        ¡GIRA TU CELULAR!
      </h2>
      <p className="text-sm text-slate-300 max-w-xs mb-6 font-['Fredoka']">
        Para disfrutar al máximo el mapa interactivo de <span className="text-orange-400 font-bold">Unicentro Maracay</span>, juega con el teléfono en posición horizontal.
      </p>

      <button
        onClick={() => setDismissed(true)}
        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-transform"
      >
        Continuar de todos modos
      </button>
    </div>
  );
}
