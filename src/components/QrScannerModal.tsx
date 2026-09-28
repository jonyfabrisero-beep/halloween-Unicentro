import React, { useEffect, useState, useRef } from 'react';
import { StoreInfo } from '../types/game';
import { AnimatedBat } from './GameIcons';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, QrCode, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
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

  // Stop scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear();
        });
      }
    };
  }, []);

  const triggerVictory = () => {
    setScanStatus('SUCCESS');
    soundEffects.playUnlock();

    // Trigger colorful Halloween confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#F97316'],
    });

    setTimeout(() => {
      onSuccess(store);
    }, 1400);
  };

  const handleQrPayload = (decodedText: string) => {
    const text = decodedText.trim().toUpperCase();
    const expected = store.code.toUpperCase();

    // Allow exact code or matching store id/number
    if (
      text === expected ||
      text.includes(store.brand.toUpperCase()) ||
      text.includes(store.id.toUpperCase())
    ) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
      triggerVictory();
    } else {
      soundEffects.playPumpkinSquish();
      setCameraError(`Ese QR no corresponde a "${store.name}". ¡Busca el cartel de ${store.brand}!`);
      setTimeout(() => setCameraError(null), 3500);
    }
  };

  const startCameraScanner = async () => {
    setCameraError(null);
    setScannerActive(true);

    try {
      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleQrPayload(decodedText);
        },
        () => {
          // Frame error (normal during searching)
        }
      );
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      setCameraError('No se pudo acceder a la cámara. Puedes usar el botón de prueba o ingresar el código manual.');
      setScannerActive(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const input = manualCode.trim().toUpperCase();
    const expected = store.code.toUpperCase();

    // Check if matches
    if (input === expected || input === store.id.toUpperCase() || input === store.brand.toUpperCase()) {
      triggerVictory();
    } else {
      soundEffects.playPumpkinSquish();
      setCameraError(`Código incorrecto para "${store.name}".`);
      setTimeout(() => setCameraError(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      {/* Animated flapping bats around modal matching PDF Page 1 & 7 */}
      {bats.map((bat, idx) => (
        <AnimatedBat
          key={idx}
          className="absolute z-60 hidden xs:block"
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

      {/* Main Modal Box (Page 7 green frame) */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#18082e] via-[#0f0422] to-[#080214] border-3 sm:border-4 border-emerald-400 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(52,211,153,0.5)] text-center text-white max-h-[95vh] overflow-y-auto my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-red-950 hover:border-red-500 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Store Title & Badge */}
        <div className="mb-3 sm:mb-4">
          <div
            className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold text-white mb-1 shadow-sm font-['Fredoka']"
            style={{ backgroundColor: store.color }}
          >
            {store.category} · {store.location}
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-amber-300 font-['Lilita_One'] tracking-wide">
            {store.name}
          </h2>
          <p className="text-[11px] sm:text-xs text-purple-200/80 font-['Fredoka'] mt-0.5">
            {store.description}
          </p>
        </div>

        {/* Success State */}
        {scanStatus === 'SUCCESS' ? (
          <div className="py-4 sm:py-6 flex flex-col items-center justify-center animate-scaleUp">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/20 border-3 sm:border-4 border-emerald-400 flex items-center justify-center mb-2 sm:mb-3 shadow-[0_0_30px_rgba(52,211,153,0.8)] animate-bounce">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-300 font-['Lilita_One']">
              ¡QR CORRECTO!
            </h3>
            <p className="text-xs sm:text-sm text-purple-200 font-['Fredoka'] mt-1">
              ¡Completaste esta casa! Se están rellenando tus estrellas... ⭐⭐⭐
            </p>
          </div>
        ) : isAlreadyUnlocked ? (
          /* Already completed */
          <div className="py-3 sm:py-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-emerald-300 font-['Lilita_One']">
              ¡Esta casa ya fue liberada!
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 font-['Fredoka'] max-w-xs mt-1">
              Ya tienes las 3 estrellas de <span className="text-amber-300 font-bold">{store.name}</span>. Visita las demás tiendas para abrir el castillo central.
            </p>
            <button
              onClick={onClose}
              className="mt-3 sm:mt-4 px-5 py-1.5 sm:px-6 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Regresar al mapa
            </button>
          </div>
        ) : (
          /* Active Scan Options */
          <div>
            {/* Header prompt (Page 7: "Escanea el Qr") */}
            <div className="mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider font-['Lilita_One']">
                Escanea el QR de la tienda
              </span>
            </div>

            {/* Camera Viewfinder container */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto rounded-2xl bg-black border-2 border-emerald-400/80 overflow-hidden shadow-inner flex flex-col items-center justify-center">
              <div id={readerElementId} className="w-full h-full" />

              {!scannerActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2.5 text-center bg-slate-950/90">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center mb-1.5 sm:mb-2 shadow-md">
                    <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                  </div>
                  <button
                    onClick={startCameraScanner}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black text-xs font-['Lilita_One'] tracking-wide shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Abrir Cámara</span>
                  </button>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 mt-1.5 sm:mt-2 font-['Fredoka']">
                    Apunta al código QR físico ubicado en el mostrador
                  </p>
                </div>
              )}
            </div>

            {/* Error banner */}
            {cameraError && (
              <div className="mt-2.5 p-2 rounded-lg bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 justify-center font-['Fredoka']">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Manual Code Input Form or Toggle */}
            {showManualInput ? (
              <form onSubmit={handleManualSubmit} className="mt-2.5 flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={`Código (ej: ${store.code})`}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-purple-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Validar
                </button>
              </form>
            ) : null}

            {/* Action buttons (Demo scan & Manual input toggle) */}
            <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-purple-900/40 flex flex-wrap items-center justify-center gap-2 text-xs">
              <button
                onClick={triggerVictory}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:bg-purple-800 hover:text-white font-['Fredoka'] font-medium transition-colors cursor-pointer text-[11px] sm:text-xs"
                title="Simular escaneo de esta tienda"
              >
                ⚡ Simular Escaneo
              </button>

              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 font-['Fredoka'] transition-colors flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{showManualInput ? 'Ocultar código' : 'Ingresar código manual'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
