import React from 'react';

// Star Badge matching PROTOTIPO JUEGO HALLOWEEN.png: 3 glowing stars floating directly above each house
export const StarsBadge: React.FC<{
  stars: number; // 0, 1, 2, or 3
  isAnimating?: boolean;
}> = ({ stars, isAnimating = false }) => {
  return (
    <div className={`relative flex items-center justify-center gap-1.5 transition-all duration-300 pointer-events-none select-none ${isAnimating ? 'scale-125' : 'scale-100'}`}>
      {[1, 2, 3].map((starIdx) => {
        const isFilled = stars >= starIdx;
        return (
          <div
            key={starIdx}
            className={`relative transition-all duration-500 transform ${
              isFilled
                ? 'scale-110 drop-shadow-[0_0_12px_rgba(250,204,21,1)]'
                : 'scale-95 drop-shadow-[0_0_8px_rgba(56,189,248,0.85)]'
            } ${isAnimating && stars === starIdx ? 'animate-bounce' : ''}`}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              viewBox="0 0 24 24"
              fill={isFilled ? 'url(#starGradFilled)' : 'url(#starGradCyanEmpty)'}
              stroke={isFilled ? '#CA8A04' : '#0284C7'}
              strokeWidth="1.5"
            >
              <defs>
                <linearGradient id="starGradFilled" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="50%" stopColor="#FACC15" />
                  <stop offset="100%" stopColor="#EAB308" />
                </linearGradient>
                <linearGradient id="starGradCyanEmpty" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0284C7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#0369A1" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

// Padlock for HUD matching PROTOTIPO JUEGO HALLOWEEN.png: beveled bronze square frame with rivets
export const HudPadlock: React.FC<{
  unlocked: boolean;
  storeName: string;
  index: number;
  onClick?: () => void;
}> = ({ unlocked, storeName, index, onClick }) => {
  return (
    <button
      onClick={onClick}
      title={`${storeName} (${unlocked ? 'Completado' : 'Pendiente'})`}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 border-2 ${
        unlocked
          ? 'bg-gradient-to-b from-emerald-600 via-emerald-800 to-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)] hover:scale-110'
          : 'bg-gradient-to-b from-[#8C5320] via-[#5C3210] to-[#2E1605] border-[#F59E0B] shadow-[0_3px_8px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.4)] opacity-90 hover:opacity-100 hover:scale-105'
      }`}
    >
      {/* Corner rivets */}
      <span className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-amber-200/80" />
      <span className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-200/80" />
      <span className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-amber-200/80" />
      <span className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-amber-200/80" />

      {unlocked ? (
        // Green skull icon matching PROTOTIPO JUEGO HALLOWEEN.png
        <div className="relative flex items-center justify-center animate-scaleUp">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200 drop-shadow-[0_0_6px_#34d399]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a7.5 7.5 0 0 0-7.5 7.5c0 2.5 1.2 4.7 3.1 6.1v2.4a1 1 0 0 0 1 1h6.8a1 1 0 0 0 1-1V15.6c1.9-1.4 3.1-3.6 3.1-6.1A7.5 7.5 0 0 0 12 2zm-2.8 8.2a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zm5.6 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zm-2.8 6.8c-.8 0-1.4-.4-1.8-1h3.6c-.4.6-1 1-1.8 1z" />
          </svg>
        </div>
      ) : (
        // Bronze closed padlock with shackle and keyhole
        <div className="relative flex flex-col items-center">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </div>
      )}
    </button>
  );
};

// Flapping Animated Bat for QR Scanner and Atmosphere
export const AnimatedBat: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => {
  return (
    <div className={`pointer-events-none select-none ${className}`} style={style}>
      <svg
        className="w-10 h-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] animate-batFlap"
        viewBox="0 0 100 60"
        fill="currentColor"
      >
        <path d="M50 30 C35 15, 15 10, 0 30 C15 38, 25 50, 40 42 C45 40, 48 35, 50 38 C52 35, 55 40, 60 42 C75 50, 85 38, 100 30 C85 10, 65 15, 50 30 Z" />
        <circle cx="47" cy="32" r="1.5" fill="#EF4444" />
        <circle cx="53" cy="32" r="1.5" fill="#EF4444" />
      </svg>
    </div>
  );
};

// Cute Halloween Avatars (Niña brujita / Niño monstruo)
export const GirlAvatar: React.FC<{ isSelected?: boolean; className?: string }> = ({ isSelected = false, className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl p-3 cursor-pointer transition-all duration-300 ${isSelected ? 'bg-purple-900/60 border-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-105' : 'bg-slate-900/60 border-2 border-purple-500/40 hover:scale-102 opacity-85 hover:opacity-100'} ${className}`}>
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-purple-500 to-indigo-900 flex items-center justify-center shadow-inner relative overflow-hidden">
        {/* Witch hat & cute face */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-1">
          {/* Hair */}
          <path d="M25 50 C20 70, 30 85, 35 90 C45 80, 55 80, 65 90 C70 85, 80 70, 75 50 Z" fill="#7C2D12" />
          {/* Face */}
          <circle cx="50" cy="55" r="24" fill="#FED7AA" />
          {/* Eyes */}
          <circle cx="42" cy="52" r="3.5" fill="#3B0764" />
          <circle cx="58" cy="52" r="3.5" fill="#3B0764" />
          <circle cx="43" cy="51" r="1" fill="#FFFFFF" />
          <circle cx="59" cy="51" r="1" fill="#FFFFFF" />
          {/* Blush */}
          <ellipse cx="37" cy="58" rx="3" ry="1.5" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="63" cy="58" rx="3" ry="1.5" fill="#FDA4AF" opacity="0.8" />
          {/* Smile */}
          <path d="M45 61 Q50 67 55 61" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Witch Hat brim */}
          <ellipse cx="50" cy="38" rx="38" ry="8" fill="#4C1D95" stroke="#7C3AED" strokeWidth="2" />
          {/* Witch Hat cone */}
          <path d="M22 38 Q48 10 75 8 Q55 22 78 38 Z" fill="#581C87" />
          {/* Hat band */}
          <path d="M26 38 Q50 33 74 38" stroke="#F59E0B" strokeWidth="5" fill="none" />
          <rect x="46" y="32" width="8" height="7" fill="#FBBF24" rx="1" />
        </svg>
      </div>

      <span className="mt-2 text-base font-bold text-purple-200 font-['Lilita_One']">
        Niña
      </span>

      {isSelected && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg animate-bounce">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
};

export const BoyAvatar: React.FC<{ isSelected?: boolean; className?: string }> = ({ isSelected = false, className = '' }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl p-3 cursor-pointer transition-all duration-300 ${isSelected ? 'bg-emerald-950/70 border-4 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-105' : 'bg-slate-900/60 border-2 border-emerald-500/40 hover:scale-102 opacity-85 hover:opacity-100'} ${className}`}>
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-emerald-600 to-teal-950 flex items-center justify-center shadow-inner relative overflow-hidden">
        {/* Cute Frankenstein / Monster kid */}
        <svg viewBox="0 0 100 100" className="w-full h-full p-1">
          {/* Face */}
          <rect x="26" y="32" width="48" height="48" rx="12" fill="#86EFAC" />
          {/* Monster Hair */}
          <path d="M26 40 L26 30 L32 38 L38 30 L44 38 L50 30 L56 38 L62 30 L68 38 L74 30 L74 40 Z" fill="#1E293B" />
          {/* Bolts */}
          <rect x="18" y="52" width="8" height="6" fill="#94A3B8" rx="1" />
          <rect x="74" y="52" width="8" height="6" fill="#94A3B8" rx="1" />
          {/* Eyes */}
          <circle cx="40" cy="50" r="4.5" fill="#0F172A" />
          <circle cx="60" cy="50" r="4.5" fill="#0F172A" />
          <circle cx="41" cy="49" r="1.5" fill="#FFFFFF" />
          <circle cx="61" cy="49" r="1.5" fill="#FFFFFF" />
          {/* Stitch */}
          <line x1="33" y1="42" x2="43" y2="42" stroke="#166534" strokeWidth="2" />
          <line x1="36" y1="39" x2="36" y2="45" stroke="#166534" strokeWidth="1.5" />
          <line x1="40" y1="39" x2="40" y2="45" stroke="#166534" strokeWidth="1.5" />
          {/* Grin with tooth */}
          <path d="M42 64 Q50 72 58 64" stroke="#14532D" strokeWidth="2.5" fill="none" />
          <polygon points="48,64 52,64 50,68" fill="#FFFFFF" />
        </svg>
      </div>

      <span className="mt-2 text-base font-bold text-emerald-200 font-['Lilita_One']">
        Niño
      </span>

      {isSelected && (
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg animate-bounce">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
};
