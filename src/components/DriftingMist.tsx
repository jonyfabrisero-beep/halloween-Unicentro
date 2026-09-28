import React from 'react';

/**
 * DriftingMist Component
 * Provides a cinematic, subtle multi-layered Halloween mist/fog
 * that drifts horizontally across the game screen.
 * Configured with subtle opacity and pointer-events-none so it never obscures
 * the map illustration or interferes with user interactions.
 */
interface DriftingMistProps {
  fullScreen?: boolean;
}

export const DriftingMist: React.FC<DriftingMistProps> = ({ fullScreen = false }) => {
  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 z-5' : 'absolute inset-0 z-22'
      } overflow-hidden pointer-events-none select-none`}
      aria-hidden="true"
    >
      {/* Layer 1: Low-lying ground fog drifting smoothly from left to right */}
      <div
        className={`absolute inset-y-0 -left-[100%] w-[300%] flex ${
          fullScreen ? 'opacity-15' : 'opacity-25'
        } animate-fogDriftSlow mix-blend-screen`}
      >
        <svg
          viewBox="0 0 1600 400"
          preserveAspectRatio="none"
          className="w-full h-full object-cover filter blur-[22px]"
        >
          <defs>
            <radialGradient id="mistPuff1" cx="30%" cy="60%" r="50%">
              <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#67E8F9" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mistPuff2" cx="70%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.4" />
              <stop offset="45%" stopColor="#A7F3D0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mistPuff3" cx="50%" cy="75%" r="45%">
              <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#94A3B8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Organic mist clouds billow 1 */}
          <ellipse cx="250" cy="260" rx="320" ry="110" fill="url(#mistPuff1)" />
          <ellipse cx="680" cy="290" rx="420" ry="120" fill="url(#mistPuff2)" />
          <ellipse cx="1180" cy="250" rx="380" ry="115" fill="url(#mistPuff3)" />
          <ellipse cx="1500" cy="280" rx="310" ry="100" fill="url(#mistPuff1)" />

          {/* Upper wisps */}
          <ellipse cx="450" cy="140" rx="280" ry="70" fill="url(#mistPuff2)" />
          <ellipse cx="980" cy="120" rx="340" ry="80" fill="url(#mistPuff1)" />
        </svg>
      </div>

      {/* Layer 2: Mid-level ethereal wisps drifting in counter-flow */}
      <div
        className={`absolute inset-y-0 -left-[50%] w-[250%] flex ${
          fullScreen ? 'opacity-15' : 'opacity-22'
        } animate-fogDriftFast mix-blend-screen`}
      >
        <svg
          viewBox="0 0 1400 400"
          preserveAspectRatio="none"
          className="w-full h-full object-cover filter blur-[28px]"
        >
          <defs>
            <radialGradient id="mistGlowCyan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A5F3FC" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#818CF8" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="mistGlowSilver" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Drifting wisp patches */}
          <ellipse cx="180" cy="180" rx="260" ry="90" fill="url(#mistGlowCyan)" />
          <ellipse cx="540" cy="230" rx="320" ry="100" fill="url(#mistGlowSilver)" />
          <ellipse cx="920" cy="190" rx="300" ry="85" fill="url(#mistGlowCyan)" />
          <ellipse cx="1280" cy="220" rx="280" ry="95" fill="url(#mistGlowSilver)" />
        </svg>
      </div>

      {/* Layer 3: Faint undulating ground haze along the bottom edge */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-purple-950/25 via-indigo-950/10 to-transparent pointer-events-none opacity-40 filter blur-[8px]" />
    </div>
  );
};
