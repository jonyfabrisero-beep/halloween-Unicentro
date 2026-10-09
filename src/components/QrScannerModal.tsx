import React, { useEffect, useState, useRef } from 'react';
import { StoreInfo } from '../types/game';
import { AnimatedBat } from './GameIcons';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface QrScannerModalProps {
  store: StoreInfo;
  isAlreadyUnlocked: boolean;
  onSuccess: (store: StoreInfo) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  store,
  isAlreadyUnlocked,
  onSuccess,
  onClose,
}) => {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isHandlingScanRef = useRef<boolean>(false);
  const isStoppingRef = useRef<boolean>(false);
  const readerElementId = 'html5-qr-reader';

  // Bats positions around modal
  const bats = [
    { top: '-15px', left: '-20px', delay: '0s', size: 1 },
    { top: '-20px', right: '-15px', delay: '0.4s', size: 0.9 },
    { top: '35%', left: '-35px', delay: '0.2s', size: 0.8 },
    { top: '40%', right: '-35px', delay: '0.6s', size: 0.85 },
    { bottom: '-20px', left: '15%', delay: '0.5s', size: 0.9 },
    { bottom: '-25px', right: '15%', delay: '0.3s', size: 1.1 },
  ];

  // Gracefully stop camera media tracks & scanner instance
  const stopCameraScanner = async (): Promise<void> => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;

    // Direct stream stop safeguard for mobile WebKit & Blink
    try {
      const videoEl = document.querySelector(`#${readerElementId} video`) as HTMLVideoElement | null;
      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        stream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        videoEl.srcObject = null;
      }
    } catch {}

    const scanner = scannerRef.current;
    scannerRef.current = null;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (err) {
        console.warn('Notice: Html5Qrcode stop notice:', err);
      }

      try {
        scanner.clear();
      } catch (err) {
        console.warn('Notice: Html5Qrcode clear notice:', err);
      }
    }

    setScannerActive(false);
    isStoppingRef.current = false;
  };

  // Safe unmount cleanup
  useEffect(() => {
    return () => {
      // Fire-and-forget safe cleanup
      stopCameraScanner().catch(() => {});
    };
  }, []);

  const handleClose = async () => {
    await stopCameraScanner();
    onClose();
  };

  const triggerVictory = async () => {
    if (isHandlingScanRef.current) return;
    isHandlingScanRef.current = true;

    // First stop camera hardware gracefully
    await stopCameraScanner();

    // Set success UI state
    setScanStatus('SUCCESS');

    // Play unlock sound
    try {
      soundEffects.playUnlock();
    } catch {}

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#F97316'],
      });
    } catch {}

    // Notify parent to unlock house and update stars
    setTimeout(() => {
      try {
        onSuccess(store);
      } catch (e) {
        console.error('Error invoking onSuccess:', e);
        onClose();
      }
    }, 750);
  };

  const handleQrPayload = async (decodedText: string) => {
    if (isHandlingScanRef.current || isStoppingRef.current) return;

    const raw = (decodedText || '').trim();
    const upper = raw.toUpperCase();
    const expected = store.code.toUpperCase();
    const brandUpper = store.brand.toUpperCase();
    const nameUpper = store.name.toUpperCase();
    const idUpper = store.id.toUpperCase();
    const slotStr = String(store.slotNumber);
    const slotPadded = String(store.slotNumber).padStart(2, '0');

    // Flexible match against code, brand, name, ID, or slot parameter/URL
    const isMatch =
      upper === expected ||
      upper.includes(expected) ||
      upper.includes(brandUpper) ||
      upper.includes(nameUpper) ||
      upper.includes(idUpper) ||
      upper.includes(`STORE=${slotStr}`) ||
      upper.includes(`TIENDA=${slotStr}`) ||
      upper.includes(`TIENDA_${slotStr}`) ||
      upper.includes(`TIENDA-${slotStr}`) ||
      upper.includes(`TIENDA_${slotPadded}`) ||
      upper.includes(`TIENDA-${slotPadded}`) ||
      upper.endsWith(`/${slotStr}`) ||
      upper.endsWith(`/${slotPadded}`) ||
      raw === slotStr ||
      raw === slotPadded;

    if (isMatch) {
      await triggerVictory();
    } else {
      try {
        soundEffects.playPumpkinSquish();
      } catch {}
      setCameraError(`QR detectado (${raw.slice(0, 24)}...), pero no corresponde a "${store.name}". ¡Busca el cartel de ${store.brand}!`);
      setTimeout(() => setCameraError(null), 3800);
    }
  };

  const startCameraScanner = async () => {
    setCameraError(null);
    setScannerActive(true);

    try {
      // Ensure any existing instance is cleaned up
      await stopCameraScanner();

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.max(180, Math.floor(minEdge * 0.72));
            return { width: qrboxSize, height: qrboxSize };
          },
        },
        (decodedText) => {
          handleQrPayload(decodedText);
        },
        () => {
          // Frame error during active video scan is standard
        }
      );
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      setCameraError('No se pudo acceder a la cámara. Por favor autoriza el permiso de la cámara.');
      setScannerActive(false);
      scannerRef.current = null;
    }
  };

  return (
    <div 
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn overflow-y-auto overscroll-contain"
    >
      {/* Animated flapping bats around modal matching PDF Page 1 & 7 */}
      {bats.map((bat, idx) => (
        <AnimatedBat
          key={idx}
          className="absolute z-60 hidden xs:block pointer-events-none"
          style={{
            top: bat.top,
            left: bat.left,
            right: bat.right,
            bottom: bat.bottom,
            transform: `scale(${bat.size})`,
            animationDelay: bat.delay,
          }}
        />
      ))}

      {/* Main Modal Box (Green frame) */}
      <div 
        role="dialog"
        aria-modal="true"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
        className="modal-container relative w-full max-w-sm sm:max-w-md md:max-w-lg bg-gradient-to-b from-[#18082e] via-[#0f0422] to-[#080214] border-3 sm:border-4 border-emerald-400 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(52,211,153,0.5)] text-center text-white max-h-[94dvh] overflow-y-auto overscroll-contain my-auto"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-red-950 hover:border-red-500 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Overlay View */}
        {scanStatus === 'SUCCESS' ? (
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center animate-scaleUp">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-bounce">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-300 font-['Lilita_One']">
              ¡QR CORRECTO!
            </h3>
            <p className="text-sm text-purple-200 font-['Fredoka'] mt-1">
              ¡Completaste <span className="text-amber-300 font-bold">{store.name}</span>! Se están rellenando tus estrellas... ⭐⭐⭐
            </p>
          </div>
        ) : isAlreadyUnlocked ? (
          /* Already completed */
          <div className="py-4 sm:py-6 flex flex-col items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-emerald-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-emerald-300 font-['Lilita_One']">
              ¡Esta tienda ya fue liberada!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-['Fredoka'] max-w-xs mt-1.5">
              Ya tienes las 3 estrellas de <span className="text-amber-300 font-bold">{store.name}</span>. Visita las demás tiendas para abrir el castillo central.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              Regresar al mapa
            </button>
          </div>
        ) : (
          /* Main Scanning Layout: Clean, uncluttered, large camera viewfinder */
          <div className="flex flex-col items-center">
            {/* Store Name - ONLY name, no description, no clutter */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 font-['Lilita_One'] tracking-wide leading-tight mb-3">
              {store.name}
            </h2>

            {/* Error banner */}
            {cameraError && (
              <div className="w-full mb-3 p-2 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2 justify-center font-['Fredoka']">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Large Camera Viewfinder */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 max-w-full aspect-square mx-auto rounded-2xl bg-black border-2 sm:border-3 border-emerald-400 overflow-hidden shadow-[0_0_30px_rgba(52,211,153,0.3)] flex flex-col items-center justify-center">
              {/* Camera reader div is ALWAYS firmly in the DOM, never unmounted prematurely */}
              <div id={readerElementId} className="w-full h-full" />

              {!scannerActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/95 z-20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400/60 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                    <Camera className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-400" />
                  </div>
                  <button
                    onClick={startCameraScanner}
                    className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-slate-950 font-black text-sm sm:text-base font-['Lilita_One'] tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Abrir Cámara</span>
                  </button>
                  <p className="text-xs text-slate-400 mt-2.5 font-['Fredoka'] max-w-[200px] leading-tight">
                    Toca para enfocar y escanear el QR en el mostrador
                  </p>
                </div>
              )}
            </div>

            {/* Controls underneath camera: Stop camera option if active, and simulate scan button */}
            <div className="w-full mt-3 pt-3 border-t border-purple-900/40 flex flex-col items-center gap-2">
              {scannerActive && (
                <button
                  onClick={stopCameraScanner}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Detener cámara</span>
                </button>
              )}

              <button
                onClick={triggerVictory}
                className="px-3.5 py-1.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:bg-purple-800 hover:text-white font-['Fredoka'] font-medium transition-colors cursor-pointer text-xs active:scale-95"
                title="Simular escaneo de esta tienda"
              >
                ⚡ Simular Escaneo
              </button>
            </div>
          </div>
        )}

        {/* Hidden persistent placeholder for html5-qr-reader if in success/unlocked state, ensuring DOM node is never missing */}
        {scanStatus === 'SUCCESS' && (
          <div className="hidden pointer-events-none" aria-hidden="true">
            <div id={`${readerElementId}-backup`} />
          </div>
        )}
      </div>
    </div>
  );
};
