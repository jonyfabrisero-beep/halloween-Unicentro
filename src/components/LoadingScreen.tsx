import React, { useState, useEffect, useRef } from 'react';
import { PlayerData } from '../types/game';
import { getStoresForPlayer, getVariantById } from '../data/stores';
import { soundEffects } from '../services/soundEffects';
import { ambientSound } from '../services/ambientAudio';
import { Sparkles, Ghost, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoadingScreenProps {
  player: PlayerData | null;
  onLoaded: () => void;
}

const CRITICAL_ASSETS = [
  // Fondos y Logo
  '/fondo_animado_juego.gif',
  '/LOGO03B.png',
  
  // Castillo Central, Bruja y Candado
  '/houses/castillo_central.png',
  '/castle/parte_superior_candado.png',
  '/castle/parte_inferior_candado.png',
  '/bruja_huyendo.png',
  '/bruja_derrotada.png',
  
  // Calabazas Interactivas
  '/pumpkins/calabaza_rostro.png',
  '/pumpkins/calabaza_sin_rostro.png',
  '/pumpkins/calabazas_duo.png',
  '/pumpkins/trio_calabazas.png',
  
  // Árboles
  '/trees/arbol_01.png',
  '/trees/arbol_02.png',
  '/trees/arbol_03.png',
  '/trees/arbol_04.png',
  '/trees/arbol_05.png',
  
  // HUD Padlocks
  '/hud/qr_acertado.png',
  '/hud/qr_por_acertar.png',
];

const SPOOKY_TIPS = [
  'Invocando la niebla en Unicentro Maracay...',
  'Despertando a los fantasmas traviesos de la isla...',
  'Encendiendo las calabazas encantadas en los caminos...',
  'Hechizando las tiendas y escaparates de tu ruta...',
  'Asegurando los 10 candados del Castillo Central...',
  'Alistando las bolsas para los caramelos...',
  '¡El mapa embrujado está casi listo!',
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ player, onLoaded }) => {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const hasTriggeredComplete = useRef(false);

  // Rotate spooky tips every 1.8 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SPOOKY_TIPS.length);
    }, 1800);
    return () => clearInterval(tipInterval);
  }, []);

  // Allow skip button after 3.5 seconds as a network safety net
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3500);
    return () => clearTimeout(skipTimer);
  }, []);

  // Asset preloading
  useEffect(() => {
    const stores = getStoresForPlayer(player);
    const storeAssets: string[] = [];

    stores.forEach((store) => {
      if (store.imagePath) storeAssets.push(store.imagePath);
      if (store.savedImagePath) storeAssets.push(store.savedImagePath);
    });

    const allUrls = Array.from(new Set([...CRITICAL_ASSETS, ...storeAssets]));
    const total = allUrls.length;
    setTotalCount(total);

    let loaded = 0;

    const handleOneAssetComplete = () => {
      loaded += 1;
      setLoadedCount(loaded);
      const pct = Math.min(100, Math.round((loaded / total) * 100));
      setProgress(pct);

      if (loaded >= total && !hasTriggeredComplete.current) {
        hasTriggeredComplete.current = true;
        setIsComplete(true);
        soundEffects.playStarChime(3);

        // Auto-advance smoothly into the map after 700ms
        setTimeout(() => {
          onLoaded();
        }, 700);
      }
    };

    // Preload each image via Image()
    allUrls.forEach((url) => {
      const img = new Image();
      img.onload = handleOneAssetComplete;
      img.onerror = () => {
        // Resolve anyway so a broken network resource doesn't block the game
        handleOneAssetComplete();
      };
      img.src = url;
    });

    // Safety timeout: If after 7 seconds anything is still hanging, finish anyway
    const safetyTimeout = setTimeout(() => {
      if (!hasTriggeredComplete.current) {
        hasTriggeredComplete.current = true;
        setProgress(100);
        setIsComplete(true);
        setTimeout(() => {
          onLoaded();
        }, 500);
      }
    }, 7000);

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [player, onLoaded]);

  const handleManualEnter = () => {
    soundEffects.playBounce();
    ambientSound.start();
    onLoaded();
  };

  const currentVariant = player?.variantId ? getVariantById(player.variantId) : null;

  return (
    <div className="relative w-full min-h-[100dvh] bg-gradient-to-b from-slate-950 via-purple-950/80 to-slate-950 flex flex-col items-center justify-center p-4 select-none overflow-hidden text-white">
      {/* Mystical Background Atmospheric Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Animated Pumpkins / Spooky Lights in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-12 left-10 text-3xl animate-bounce" style={{ animationDuration: '3s' }}>
          🎃
        </div>
        <div className="absolute top-20 right-14 text-2xl animate-bounce" style={{ animationDuration: '4s' }}>
          👻
        </div>
        <div className="absolute bottom-16 left-16 text-3xl animate-bounce" style={{ animationDuration: '3.5s' }}>
          🍬
        </div>
        <div className="absolute bottom-20 right-12 text-2xl animate-bounce" style={{ animationDuration: '2.8s' }}>
          ✨
        </div>
      </div>

      {/* Main Content Box */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center">
        {/* Unicentro Logo */}
        <div className="relative mb-4 group">
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 to-purple-600 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500" />
          <div className="relative bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-md">
            <img
              src="/LOGO03B.png"
              alt="Unicentro Maracay"
              className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 tracking-wide drop-shadow-md mb-1">
          TIENDAS EMBRUJADAS
        </h1>
        <p className="text-purple-300 text-xs md:text-sm font-medium tracking-wider uppercase mb-5 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          Cacería de Halloween · Unicentro Maracay
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
        </p>

        {/* Player Welcome Badge */}
        {player && (
          <div className="mb-6 inline-flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs text-purple-200 backdrop-blur-sm shadow-inner">
            <span className="text-base">{player.gender === 'girl' ? '👧' : '👦'}</span>
            <span>
              Jugador: <strong className="text-amber-300 font-bold">{player.playerName}</strong>
            </span>
            {currentVariant && (
              <>
                <span className="text-purple-400">•</span>
                <span className="text-amber-400 font-semibold">{currentVariant.name}</span>
              </>
            )}
          </div>
        )}

        {/* Glowing Progress Card */}
        <div className="w-full bg-slate-900/80 border border-purple-500/40 rounded-3xl p-5 md:p-6 shadow-2xl backdrop-blur-md relative overflow-hidden mb-5">
          {/* Top Info inside card */}
          <div className="flex items-center justify-between text-xs font-semibold mb-2.5">
            <span className="text-purple-300 flex items-center gap-1.5">
              <Ghost className="w-4 h-4 text-amber-400 animate-pulse" />
              Preparando el Mapa y Tiendas
            </span>
            <span className="text-amber-400 font-black text-sm">
              {progress}%
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative w-full h-6 bg-slate-950/90 rounded-full border border-amber-500/30 p-1 overflow-hidden shadow-inner mb-3">
            {/* Animated Fill Bar */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 transition-all duration-300 relative shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              style={{ width: `${Math.max(6, progress)}%` }}
            >
              {/* Shimmer light effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite] -skew-x-12" />
            </div>
          </div>

          {/* Counter details */}
          <div className="flex items-center justify-between text-[11px] text-purple-300/80 px-1 font-mono">
            <span>
              Recursos cargados: {loadedCount} / {totalCount}
            </span>
            <span>
              {isComplete ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ¡Completado!
                </span>
              ) : (
                'Descargando imágenes...'
              )}
            </span>
          </div>

          {/* Alternating Spooky Flavor Text */}
          <div className="mt-4 pt-3.5 border-t border-purple-800/40 min-h-[40px] flex items-center justify-center">
            <p className="text-xs md:text-sm text-amber-200/90 italic font-medium transition-all duration-500">
              «{SPOOKY_TIPS[tipIndex]}»
            </p>
          </div>
        </div>

        {/* Action Button: Visible when completed or if user clicks skip after wait */}
        {isComplete ? (
          <button
            onClick={handleManualEnter}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.6)] transform active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <span>¡ENTRAR AL MAPA EMBRUJADO!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : canSkip ? (
          <button
            onClick={handleManualEnter}
            className="mt-1 text-xs text-purple-400 hover:text-amber-300 underline underline-offset-4 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Pasar directo al mapa (si tu conexión es lenta)</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-purple-400/70 mt-1">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Optimizando gráficos para evitar retrasos al jugar...</span>
          </div>
        )}
      </div>

      {/* Footer copyright / info */}
      <div className="absolute bottom-3 text-center text-[10px] text-purple-400/50">
        Unicentro Maracay · Sistema de Precarga de Gráficos e Imágenes
      </div>
    </div>
  );
};
