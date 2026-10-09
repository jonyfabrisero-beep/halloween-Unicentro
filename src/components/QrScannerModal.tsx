import React, { useEffect, useState, useRef } from 'react';
import { StoreInfo } from '../types/game';
import { AnimatedBat } from './GameIcons';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, CheckCircle2, AlertCircle, RefreshCw, Loader2, KeyRound, Sparkles } from 'lucide-react';

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
  const [inputMode, setInputMode] = useState<'camera' | 'code'>('camera');
  const [scannerActive, setScannerActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS'>('IDLE');
  
  // Manual Code State
  const [manualCode, setManualCode] = useState('');
  const [manualError, setManualError] = useState<string | null>(null);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

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

    try {
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
    } finally {
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

      setScannerActive(false);
      setIsStartingCamera(false);
      isStoppingRef.current = false;
    }
  };

  // Safe unmount cleanup
  useEffect(() => {
    return () => {
      stopCameraScanner().catch(() => {});
    };
  }, []);

  const handleClose = async () => {
    await stopCameraScanner();
    onClose();
  };

  const handleSwitchToCode = async () => {
    if (scannerActive || isStartingCamera) {
      await stopCameraScanner();
    }
    setCameraError(null);
    setManualError(null);
    setInputMode('code');
  };

  const handleSwitchToCamera = () => {
    setManualError(null);
    setInputMode('camera');
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

  // Manual code validation & submit
  const handleManualCodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isHandlingScanRef.current || isSubmittingCode) return;

    const raw = (manualCode || '').trim();
    if (!raw) {
      setManualError('Por favor introduce el código de la tienda.');
      return;
    }

    setIsSubmittingCode(true);
    setManualError(null);

    const upper = raw.toUpperCase();
    const cleanInput = upper.replace(/[^A-Z0-9]/g, '');
    const expected = (store.code || '').toUpperCase();
    const cleanExpected = expected.replace(/[^A-Z0-9]/g, '');

    // Allow exact code, clean code (e.g. without hyphens), or brand / name fallback
    const isMatch =
      upper === expected ||
      cleanInput === cleanExpected ||
      upper.includes(expected) ||
      cleanInput.includes(cleanExpected) ||
      upper.includes(store.name.toUpperCase()) ||
      upper.includes(store.brand.toUpperCase());

    if (isMatch) {
      await triggerVictory();
    } else {
      try {
        soundEffects.playPumpkinSquish();
      } catch {}
      setManualError(`Código no válido para "${store.name}". Revisa el cartel en el mostrador.`);
      setIsSubmittingCode(false);
      setTimeout(() => setManualError(null), 4000);
    }
  };

  const handleQrPayload = async (decodedText: string) => {
    if (isHandlingScanRef.current || isStoppingRef.current) return;

    const raw = (decodedText || '').trim();
    const upper = raw.toUpperCase();
    const cleanRaw = upper.replace(/[^A-Z0-9]/g, '');
    const expected = (store.code || '').toUpperCase();
    const cleanExpected = expected.replace(/[^A-Z0-9]/g, '');
    const brandUpper = store.brand.toUpperCase();
    const nameUpper = store.name.toUpperCase();
    const idUpper = store.id.toUpperCase();
    const slotStr = String(store.slotNumber);
    const slotPadded = String(store.slotNumber).padStart(2, '0');

    // Flexible match against code, clean code, brand, name, ID, or slot parameter/URL
    const isMatch =
      upper === expected ||
      cleanRaw === cleanExpected ||
      upper.includes(expected) ||
      cleanRaw.includes(cleanExpected) ||
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
    if (isStartingCamera || scannerActive) return;

    setCameraError(null);
    setIsStartingCamera(true);

    try {
      // 1. Cleanly stop any previous scanner instance without resetting states
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch {}
        try {
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }

      // 2. Ensure container exists in DOM
      const container = document.getElementById(readerElementId);
      if (!container) {
        throw new Error('Elemento de cámara no listo en el DOM');
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      const scanConfig = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.max(160, Math.floor(minEdge * 0.72));
          return { width: qrboxSize, height: qrboxSize };
        },
        aspectRatio: 1.0,
      };

      const onScanSuccess = (decodedText: string) => {
        handleQrPayload(decodedText);
      };

      const onScanFailure = () => {
        // Continuous frame analysis miss is normal
      };

      // 3. Attempt to start camera with environment rear camera first
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          scanConfig,
          onScanSuccess,
          onScanFailure
        );
      } catch (envErr) {
        console.warn('Attempt with facingMode environment failed, trying device list...', envErr);
        
        // Fallback: enumerate available cameras and choose rear camera
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            const backCam =
              devices.find((d) => /back|rear|environment|trasera|posterior/i.test(d.label)) ||
              devices[devices.length - 1];
            await html5QrCode.start(
              backCam.id,
              scanConfig,
              onScanSuccess,
              onScanFailure
            );
          } else {
            // Fallback to default user camera
            await html5QrCode.start(
              { facingMode: 'user' },
              scanConfig,
              onScanSuccess,
              onScanFailure
            );
          }
        } catch (listErr) {
          console.warn('Fallback to enumerated devices failed, trying default start...', listErr);
          await html5QrCode.start(
            {},
            scanConfig,
            onScanSuccess,
            onScanFailure
          );
        }
      }

      // 4. Set scanner as active and turn off loading indicator
      setScannerActive(true);
      setIsStartingCamera(false);
    } catch (err: unknown) {
      console.error('Camera activation failed completely:', err);
      setIsStartingCamera(false);
      setScannerActive(false);

      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
        setCameraError('Permiso de cámara denegado. Permite el acceso a la cámara o usa el código manual.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('No se encontró cámara disponible en este dispositivo. Puedes usar el código manual.');
      } else {
        setCameraError('No se pudo activar la cámara. Revisa permisos o utiliza el código manual.');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-white overflow-y-auto select-none"
      onClick={handleClose}
    >
      {/* Animated flapping bats around modal */}
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
        onClick={(e) => e.stopPropagation()}
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
              ¡TIENDA DESBLOQUEADA!
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
          /* Main Interaction Layout */
          <div className="flex flex-col items-center">
            {/* Store Name */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-300 font-['Lilita_One'] tracking-wide leading-tight mb-2">
              {store.name}
            </h2>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-purple-950/70 border border-purple-500/30 mb-3 w-full max-w-xs">
              <button
                type="button"
                onClick={handleSwitchToCamera}
                className={`flex-1 py-1.5 px-3 rounded-xl font-['Fredoka'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputMode === 'camera'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Escanear Cámara</span>
              </button>
              <button
                type="button"
                onClick={handleSwitchToCode}
                className={`flex-1 py-1.5 px-3 rounded-xl font-['Fredoka'] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputMode === 'code'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'text-purple-200 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Código Manual</span>
              </button>
            </div>

            {/* MODE 1: Camera Scanner */}
            <div className={`w-full flex flex-col items-center ${inputMode === 'camera' ? 'block' : 'hidden'}`}>
              {/* Error banner */}
              {cameraError && (
                <div className="w-full mb-3 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2 justify-center font-['Fredoka']">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Large Camera Viewfinder */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 max-w-full aspect-square mx-auto rounded-2xl bg-black border-2 sm:border-3 border-emerald-400 overflow-hidden shadow-[0_0_30px_rgba(52,211,153,0.3)] flex flex-col items-center justify-center">
                {/* Camera reader div is ALWAYS firmly in the DOM, never unmounted prematurely */}
                <div id={readerElementId} className="w-full h-full" />

                {/* Viewfinder Target Reticle when camera is active */}
                {scannerActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                      <span className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-amber-400 rounded-tl-md" />
                      <span className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-amber-400 rounded-tr-md" />
                      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-amber-400 rounded-bl-md" />
                      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-amber-400 rounded-br-md" />
                      <div className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                )}

                {/* Overlay button when camera is NOT active */}
                {!scannerActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/95 z-20">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400/60 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                      {isStartingCamera ? (
                        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-spin" />
                      ) : (
                        <Camera className="w-9 h-9 sm:w-11 sm:h-11 text-emerald-400" />
                      )}
                    </div>
                    <button
                      onClick={startCameraScanner}
                      disabled={isStartingCamera}
                      className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-slate-950 font-black text-sm sm:text-base font-['Lilita_One'] tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
                    >
                      {isStartingCamera ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Iniciando Cámara...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span>Abrir Cámara</span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-400 mt-2.5 font-['Fredoka'] max-w-[200px] leading-tight">
                      {isStartingCamera
                        ? 'Solicitando acceso a la cámara...'
                        : 'Toca para enfocar y escanear el QR en el mostrador'}
                    </p>
                  </div>
                )}
              </div>

              {/* Helper shortcut to switch to manual code */}
              <button
                type="button"
                onClick={handleSwitchToCode}
                className="mt-3 text-xs text-amber-300 hover:text-amber-200 underline underline-offset-4 decoration-amber-400/40 font-['Fredoka'] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>¿No abre la cámara o falla la red? Ingresar código manual</span>
              </button>
            </div>

            {/* MODE 2: Manual Secret Code Entry */}
            {inputMode === 'code' && (
              <div className="w-full flex flex-col items-center animate-fadeIn">
                {manualError && (
                  <div className="w-full mb-3 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-center gap-2 justify-center font-['Fredoka']">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{manualError}</span>
                  </div>
                )}

                <div className="w-full p-4 sm:p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-2 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  
                  <h4 className="text-base font-black text-amber-300 font-['Lilita_One'] tracking-wide">
                    CÓDIGO SECRETO DE LA TIENDA
                  </h4>
                  <p className="text-xs text-purple-200/90 font-['Fredoka'] text-center mt-1 max-w-xs leading-relaxed">
                    Escribe el código secreto que está en el cartel o mostrador de <span className="text-amber-300 font-bold">{store.name}</span>:
                  </p>

                  <form onSubmit={handleManualCodeSubmit} className="w-full max-w-xs mt-3.5 flex flex-col gap-2.5">
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => {
                          setManualCode(e.target.value);
                          if (manualError) setManualError(null);
                        }}
                        placeholder="Ej: LUNA-42"
                        maxLength={20}
                        autoFocus
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border-2 border-amber-400/70 focus:border-amber-300 focus:outline-none text-white text-center font-mono font-bold text-base sm:text-lg tracking-widest placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal placeholder:font-sans uppercase selection:bg-amber-500 selection:text-black"
                      />
                      {manualCode && (
                        <button
                          type="button"
                          onClick={() => setManualCode('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!manualCode.trim() || isSubmittingCode}
                      className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 text-slate-950 font-black text-sm sm:text-base font-['Lilita_One'] tracking-wide shadow-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Desbloquear Tienda</span>
                    </button>
                  </form>

                  <div className="mt-3 text-[11px] text-slate-400 font-['Fredoka'] text-center flex items-center gap-1.5 justify-center">
                    <span>⚡ Funciona sin cámara y sin conexión a internet</span>
                  </div>
                </div>

                {/* Back to camera link */}
                <button
                  type="button"
                  onClick={handleSwitchToCamera}
                  className="mt-3 text-xs text-purple-300 hover:text-white font-['Fredoka'] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Volver a escanear con la cámara</span>
                </button>
              </div>
            )}

            {/* Bottom Controls: Stop camera option if active, and test simulate scan button */}
            <div className="w-full mt-3 pt-3 border-t border-purple-900/40 flex flex-col items-center gap-2">
              {scannerActive && inputMode === 'camera' && (
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

        {/* Hidden persistent container if in success state so DOM element is never unmounted unexpectedly */}
        {scanStatus === 'SUCCESS' && (
          <div className="hidden" aria-hidden="true">
            <div id={`${readerElementId}-safe`} />
          </div>
        )}
      </div>
    </div>
  );
};
