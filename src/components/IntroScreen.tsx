import React, { useEffect, useState, useRef } from 'react';
import { PlayerData } from '../types/game';
import { getStoresForPlayer, MAP_VARIANTS } from '../data/stores';
import { soundEffects } from '../services/soundEffects';
import { Sparkles, Ghost } from 'lucide-react';

interface FallingItem {
  id: number;
  x: number;
  speed: number;
  delay: number;
  size: number;
  rotationSpeed: number;
  type: 'pumpkin' | 'potion' | 'book' | 'ghost';
}

interface IntroScreenProps {
  player?: PlayerData | null;
  onStart: () => void;
}

const CRITICAL_ASSETS = [
  // Fondo e ilustraciones del Intro
  '/intro/fondo_morado.webp',
  '/intro/calabaza.webp',
  '/intro/fantasma.webp',
  '/intro/libro.webp',
  '/intro/pocion.webp',
  '/LOGO03B.png',

  // Fondos del Juego
  '/fondo_animado_juego.gif',

  // Castillo Central, Bruja y Candados
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

  // HUD Candados
  '/hud/qr_acertado.png',
  '/hud/qr_por_acertar.png',
];

const SPOOKY_TIPS = [
  'Invocando la niebla en Unicentro Maracay...',
  'Despertando a los fantasmas traviesos...',
  'Encendiendo las calabazas encantadas...',
  'Hechizando las tiendas de tu ruta...',
  'Asegurando los 10 candados del Castillo Central...',
  '¡Todo listo para entrar a las tiendas!',
];

export const IntroScreen: React.FC<IntroScreenProps> = ({ player, onStart }) => {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPreloadComplete, setIsPreloadComplete] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Generar lluvia de elementos auténticos (calabaza, fantasma, libro, poción)
  useEffect(() => {
    const generated: FallingItem[] = Array.from({ length: 16 }).map((_, i) => {
      const speed = 5.5 + Math.random() * 4.5; // 5.5s a 10s
      return {
        id: i,
        x: 4 + (i * 6.2 + Math.random() * 3) % 91, // Distribución horizontal equilibrada
        speed,
        delay: -Math.random() * speed, // Delay negativo: ya están cayendo a distintas alturas desde el segundo 0
        size: 32 + Math.random() * 18, // Tamaño balanceado (32px a 50px)
        rotationSpeed: (Math.random() - 0.5) * 50,
        type: (['pumpkin', 'ghost', 'book', 'potion'] as const)[i % 4],
      };
    });
    setItems(generated);
  }, []);

  // Rotar frases mágicas cada 1.8s
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % SPOOKY_TIPS.length);
    }, 1800);
    return () => clearInterval(tipInterval);
  }, []);

  // Red de seguridad: permitir avanzar tras 3.5s si la red es lenta
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
      setIsPreloadComplete(true);
      setProgress(100);
    }, 3500);
    return () => clearTimeout(skipTimer);
  }, []);

  // Pre-carga invisible en segundo plano de imágenes y assets
  useEffect(() => {
    const storeAssets: string[] = [];

    if (player) {
      const stores = getStoresForPlayer(player);
      stores.forEach((s) => {
        if (s.imagePath) storeAssets.push(s.imagePath);
        if (s.savedImagePath) storeAssets.push(s.savedImagePath);
      });
    } else {
      // Si aún no está registrado, pre-cargamos tiendas de las variantes
      MAP_VARIANTS.forEach((variant) => {
        variant.stores.forEach((s) => {
          if (s.imagePath) storeAssets.push(s.imagePath);
        });
      });
    }

    const allUrls = Array.from(new Set([...CRITICAL_ASSETS, ...storeAssets]));
    const total = allUrls.length;
    let loaded = 0;

    const handleOneAsset = () => {
      loaded += 1;
      const pct = Math.min(100, Math.round((loaded / total) * 100));
      setProgress(pct);

      if (loaded >= total && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsPreloadComplete(true);
        soundEffects.playStarChime(3);
      }
    };

    allUrls.forEach((url) => {
      const img = new Image();
      img.onload = handleOneAsset;
      img.onerror = handleOneAsset;
      img.src = url;
    });
  }, [player]);

  const handleStart = () => {
    if (!isPreloadComplete && !canSkip && progress < 30) return;

    soundEffects.playBounce();
    soundEffects.startMusic();
    onStart();
  };

  const isReady = isPreloadComplete || canSkip || progress >= 95;

  return (
    <div
      onClick={isReady ? handleStart : undefined}
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      className={`relative w-full min-h-[100dvh] flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto overflow-x-hidden bg-[#18032b] text-white select-none touch-pan-y transition-colors duration-500 ${
        isReady ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Fondo morado oficial */}
      <img
        src="/intro/fondo_morado.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-85"
        draggable={false}
      />

      {/* Degradado para óptimo contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#18032b]/40 via-transparent to-[#0a0118]/70 pointer-events-none" />

      {/* Resplandor radial de fondo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-gradient-radial from-amber-500/15 via-purple-600/10 to-transparent blur-3xl animate-pulse" />
      </div>

      {/* Lluvia de elementos temáticos con las imágenes oficiales proporcionadas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute animate-fall"
            style={{
              top: '-90px',
              left: `${item.x}%`,
              animationDuration: `${item.speed}s`,
              animationDelay: `${item.delay}s`,
              width: `${item.size}px`,
              height: `${item.size}px`,
              willChange: 'transform',
            }}
          >
            <img
              src={
                item.type === 'pumpkin'
                  ? '/intro/calabaza.webp'
                  : item.type === 'potion'
                  ? '/intro/pocion.webp'
                  : item.type === 'book'
                  ? '/intro/libro.webp'
                  : '/intro/fantasma.webp'
              }
              alt=""
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)] pointer-events-none select-none"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Espaciador superior (badge removido según instrucción) */}
      <div className="z-10 pt-2" />

      {/* Bloque central: Logo + Título 'Tiendas Encantadas' + Preload + Botón */}
      <div className="z-10 flex flex-col items-center justify-center text-center my-auto px-2 sm:px-4 max-w-xl w-full">
        {/* Logo Oficial de Unicentro Maracay */}
        <div className="flex items-center justify-center mb-1">
          <img
            src="/LOGO03B.png"
            alt="Unicentro Maracay"
            className="w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 max-h-[28vh] object-contain filter drop-shadow-[0_8px_28px_rgba(245,158,11,0.55)] select-none pointer-events-none"
            loading="eager"
          />
        </div>

        {/* Título Oficial del Juego: Tiendas Encantadas */}
        <div className="relative mt-1 mb-2">
          <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-black tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 font-['Lilita_One'] drop-shadow-[0_4px_14px_rgba(249,115,22,0.65)]">
            Tiendas Encantadas
          </h1>
          <p className="text-xs sm:text-base text-purple-200 font-['Fredoka'] font-medium mt-0.5">
            ¡El Gran Recorrido de Halloween por las Tiendas!
          </p>
        </div>

        {/* Barra de Pre-carga Integrada */}
        <div className="w-full max-w-sm mt-3 px-2">
          {!isReady ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-full bg-purple-950/70 border border-purple-800/80 rounded-full h-3.5 p-0.5 shadow-inner overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-200/90 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>{SPOOKY_TIPS[tipIndex]}</span>
                <span className="font-mono font-bold text-amber-300">({progress}%)</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-emerald-300 font-semibold bg-emerald-950/50 border border-emerald-500/40 px-3 py-1 rounded-full shadow-md animate-fade-in">
              <Ghost className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>
                {player ? `¡Bienvenido de nuevo, ${player.playerName}! Todo listo.` : '¡Todo el mapa encantado está cargado!'}
              </span>
            </div>
          )}
        </div>

        {/* Botón de Acción Principal */}
        <div className="mt-4 sm:mt-6 w-full flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStart();
            }}
            disabled={!isReady}
            className={`group relative px-8 sm:px-12 py-3 sm:py-4 rounded-full font-black text-lg sm:text-2xl font-['Lilita_One'] tracking-wide transition-all duration-300 cursor-pointer ${
              isReady
                ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.8)] hover:scale-105 active:scale-95 border-2 border-emerald-200 animate-pulse'
                : 'bg-purple-950/80 text-purple-300/70 border border-purple-800/60 shadow-inner opacity-80 cursor-wait'
            }`}
          >
            <span className="flex items-center gap-2.5">
              {isReady ? (
                <>
                  <span>¡TOCAR PARA JUGAR!</span>
                  <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform">🎃</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                  <span>PREPARANDO MAGIA...</span>
                </>
              )}
            </span>
          </button>
        </div>

        {isReady && (
          <p className="text-[11px] sm:text-xs text-purple-300/80 mt-3 font-['Fredoka'] animate-pulse">
            Toca el botón o cualquier parte de la pantalla para comenzar
          </p>
        )}
      </div>

      {/* Pie de pantalla */}
      <div className="z-10 pb-2 text-center text-xs text-slate-400 font-['Fredoka']">
        Centro Comercial Unicentro Maracay · Actividad Infantil de Halloween
      </div>
    </div>
  );
};
