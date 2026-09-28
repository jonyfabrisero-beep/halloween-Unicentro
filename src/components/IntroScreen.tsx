import React, { useEffect, useState } from 'react';
import { soundEffects } from '../services/soundEffects';

interface FallingItem {
  id: number;
  x: number;
  speed: number;
  delay: number;
  size: number;
  rotationSpeed: number;
  type: 'pumpkin' | 'potion' | 'book' | 'flame' | 'candy';
}

export const IntroScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const [items, setItems] = useState<FallingItem[]>([]);

  useEffect(() => {
    // Generate 16 fun falling spooky items matching Page 6
    const generated: FallingItem[] = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: 5 + Math.random() * 90,
      speed: 4 + Math.random() * 5,
      delay: Math.random() * 4,
      size: 32 + Math.random() * 28,
      rotationSpeed: (Math.random() - 0.5) * 80,
      type: (['pumpkin', 'potion', 'book', 'flame', 'candy'] as const)[i % 5],
    }));
    setItems(generated);
  }, []);

  const handleStart = () => {
    soundEffects.playBounce();
    soundEffects.startMusic();
    onStart();
  };

  return (
    <div
      onClick={handleStart}
      className="relative w-full h-full min-h-screen flex flex-col items-center justify-between p-6 overflow-hidden bg-gradient-to-b from-[#2e0854] via-[#1a0536] to-[#0d021f] text-white cursor-pointer select-none"
    >
      {/* Background illustration overlay */}
      <img
        src="/src/assets/images/halloween_intro_splash_1790615262295.jpg"
        alt="Halloween Unicentro"
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none mix-blend-screen"
        referrerPolicy="no-referrer"
      />

      {/* Radiant glow rays in the center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-radial from-amber-500/20 via-purple-600/10 to-transparent blur-3xl animate-pulse" />
      </div>

      {/* Falling objects (calabazas, pociones, libros, fuegos fatuos) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute animate-fall"
            style={{
              left: `${item.x}%`,
              animationDuration: `${item.speed}s`,
              animationDelay: `${item.delay}s`,
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          >
            {item.type === 'pumpkin' && (
              <svg viewBox="0 0 100 90" className="w-full h-full filter drop-shadow-[0_0_8px_#f97316]">
                <ellipse cx="50" cy="50" rx="42" ry="34" fill="#EA580C" stroke="#9A3412" strokeWidth="2.5" />
                <ellipse cx="50" cy="50" rx="22" ry="34" fill="#F97316" stroke="#9A3412" strokeWidth="2" />
                <rect x="47" y="10" width="7" height="10" rx="2" fill="#15803D" />
                <polygon points="36,40 43,48 30,48" fill="#451A03" />
                <polygon points="64,40 70,48 57,48" fill="#451A03" />
                <path d="M32 60 L38 68 L44 60 L50 68 L56 60 L62 68 L68 60 Z" fill="#451A03" />
              </svg>
            )}
            {item.type === 'potion' && (
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_#c084fc]">
                <rect x="43" y="12" width="14" height="16" fill="#64748B" rx="2" />
                <path d="M43 28 L24 75 Q20 85 32 88 L68 88 Q80 85 76 75 L57 28 Z" fill="#9333EA" stroke="#C084FC" strokeWidth="2.5" />
                <ellipse cx="50" cy="72" rx="16" ry="6" fill="#C084FC" opacity="0.6" />
                <circle cx="44" cy="55" r="3" fill="#E9D5FF" />
                <circle cx="56" cy="62" r="2" fill="#E9D5FF" />
              </svg>
            )}
            {item.type === 'book' && (
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_#ef4444]">
                <rect x="22" y="18" width="56" height="66" rx="5" fill="#991B1B" stroke="#F59E0B" strokeWidth="2.5" />
                <circle cx="50" cy="50" r="14" stroke="#FBBF24" strokeWidth="2" fill="none" />
                <polygon points="50,38 53,47 62,47 55,52 58,61 50,56 42,61 45,52 38,47 47,47" fill="#FBBF24" />
              </svg>
            )}
            {item.type === 'flame' && (
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_#38bdf8]">
                <path d="M50 8 C30 24, 24 50, 28 72 C36 86, 64 86, 72 72 C76 50, 70 24, 50 8 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                <ellipse cx="44" cy="48" rx="3.5" ry="5" fill="#0C4A6E" />
                <ellipse cx="56" cy="48" rx="3.5" ry="5" fill="#0C4A6E" />
                <path d="M46 60 Q50 66 54 60" stroke="#0C4A6E" strokeWidth="2" fill="none" />
              </svg>
            )}
            {item.type === 'candy' && (
              <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_#fbbf24]">
                <rect x="30" y="38" width="40" height="24" rx="4" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
                <line x1="38" y1="38" x2="44" y2="62" stroke="#FFFFFF" strokeWidth="2.5" />
                <line x1="56" y1="38" x2="62" y2="62" stroke="#FFFFFF" strokeWidth="2.5" />
                <polygon points="30,50 16,36 16,64" fill="#D97706" />
                <polygon points="70,50 84,36 84,64" fill="#D97706" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Top subtitle */}
      <div className="z-10 pt-2 text-center">
        <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-300 bg-purple-950/70 px-4 py-1.5 rounded-full border border-amber-400/30 shadow-md">
          Especial de Halloween 2026
        </span>
      </div>

      {/* Center Brand Lockup matching PDF Page 6 */}
      <div className="z-10 flex flex-col items-center justify-center text-center my-auto px-4 max-w-2xl">
        {/* Official Mall Logo matching LOGO03B.png - Static */}
        <div className="flex items-center justify-center mb-1">
          <img
            src="/LOGO03B.png"
            alt="Unicentro Maracay"
            className="w-56 h-56 sm:w-72 sm:h-72 md:w-84 md:h-84 lg:w-96 lg:h-96 max-h-[35vh] object-contain filter drop-shadow-[0_6px_24px_rgba(245,158,11,0.5)] select-none pointer-events-none"
            loading="eager"
          />
        </div>

        {/* Game Title with Playful Bounce Animation */}
        <div className="relative mt-2 mb-3 animate-bounce" style={{ animationDuration: '3s' }}>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 font-['Lilita_One'] drop-shadow-[0_4px_12px_rgba(249,115,22,0.6)]">
            Dulce o Truco
          </h2>
          <p className="text-sm sm:text-base text-purple-200 font-['Fredoka'] font-medium mt-1">
            ¡El Gran Recorrido de Halloween por las Tiendas!
          </p>
        </div>

        {/* Big Play CTA Button */}
        <div className="mt-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            className="group relative px-10 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-slate-950 font-black text-xl sm:text-2xl font-['Lilita_One'] tracking-wide shadow-[0_0_25px_rgba(52,211,153,0.7)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-200"
          >
            <span className="flex items-center gap-2">
              <span>¡TOCAR PARA JUGAR!</span>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">🎃</span>
            </span>
          </button>
        </div>

        <p className="text-xs text-purple-300/80 mt-4 font-['Fredoka']">
          Toca en cualquier parte de la pantalla para comenzar
        </p>
      </div>

      {/* Footer details */}
      <div className="z-10 pb-2 text-center text-xs text-slate-400 font-['Fredoka']">
        Centro Comercial Unicentro Maracay · Actividad Infantil de Halloween
      </div>
    </div>
  );
};
