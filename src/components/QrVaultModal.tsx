import React, { useState } from 'react';
import { StoreInfo } from '../types/game';
import { X, Printer, QrCode, Sparkles } from 'lucide-react';
import { PrintableQrModal } from './PrintableQrModal';
import { getQrCardTheme } from '../data/qrCardThemes';

interface QrVaultModalProps {
  stores: StoreInfo[];
  onSimulateScan: (store: StoreInfo) => void;
  onClose: () => void;
}

export const QrVaultModal: React.FC<QrVaultModalProps> = ({
  stores,
  onSimulateScan,
  onClose,
}) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 text-white overflow-y-auto select-none">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-950 via-[#100624] to-slate-950 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.3)] my-auto max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-purple-900/60 pb-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider mb-1">
              <QrCode className="w-3.5 h-3.5" />
              <span>Carpeta de Respaldo de QRs</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Lilita_One']">
              Tiendas Embrujadas en Unicentro Maracay
            </h2>
            <p className="text-xs text-purple-200/80 font-['Fredoka'] mt-0.5">
              Tarjetas oficiales temáticas de respaldo. Puedes probar el canje o abrir la hoja para imprimir.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-['Fredoka'] cursor-pointer"
              title="Imprimir tarjetas QR"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir / Descargar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Store QR Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1">
          {stores.map((store, idx) => {
            const theme = getQrCardTheme(store.slotNumber ? store.slotNumber - 1 : idx);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
              store.code
            )}&color=000000&bgcolor=FFFFFF`;

            return (
              <div
                key={store.id}
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.borderColor,
                  boxShadow: `0 4px 16px rgba(${theme.borderRgb}, 0.15)`,
                }}
                className="p-3.5 rounded-2xl border-2 flex flex-col items-center text-center relative group"
              >
                {/* Game Title */}
                <div
                  style={{ color: theme.primaryColor }}
                  className="text-[10px] font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1 font-sans"
                >
                  <span>{theme.titleEmoji}</span>
                  <span>Tiendas embrujadas en unicentro maracay</span>
                  <span>{theme.titleEmoji}</span>
                </div>

                {/* Store Name */}
                <h4
                  style={{ color: theme.darkColor }}
                  className="font-black font-['Lilita_One'] text-base tracking-wide uppercase mb-1"
                >
                  {store.name}
                </h4>

                {/* Framed QR Code Container with 4 Corner Emojis */}
                <div
                  style={{ borderColor: theme.borderColor }}
                  className="w-32 h-32 p-2 bg-white rounded-xl shadow-md border-2 flex items-center justify-center my-1 relative"
                >
                  <span className="absolute -top-2.5 -left-2.5 text-base select-none">
                    {theme.cornerEmojis[0]}
                  </span>
                  <span className="absolute -top-2.5 -right-2.5 text-base select-none">
                    {theme.cornerEmojis[1]}
                  </span>
                  <span className="absolute -bottom-2.5 -left-2.5 text-base select-none">
                    {theme.cornerEmojis[2]}
                  </span>
                  <span className="absolute -bottom-2.5 -right-2.5 text-base select-none">
                    {theme.cornerEmojis[3]}
                  </span>

                  <img
                    src={qrUrl}
                    alt={`QR de ${store.name}`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Manual Code Pill */}
                <div
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                    borderColor: theme.badgeBorder,
                  }}
                  className="mt-2 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border truncate max-w-full"
                >
                  CÓDIGO: {store.code}
                </div>

                {/* Test button */}
                <button
                  onClick={() => {
                    onSimulateScan(store);
                    onClose();
                  }}
                  className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs font-['Fredoka'] transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Probar / Canjear QR</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showPrintModal && (
        <PrintableQrModal
          stores={stores}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
