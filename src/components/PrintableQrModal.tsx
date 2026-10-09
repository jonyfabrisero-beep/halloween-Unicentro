import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { StoreInfo } from '../types/game';
import { Printer, Download, X, QrCode, Scissors, Check, FileDown, Loader2 } from 'lucide-react';

interface PrintableQrModalProps {
  stores: StoreInfo[];
  onClose: () => void;
}

interface QrItem {
  store: StoreInfo;
  qrDataUrl: string;
}

export const PrintableQrModal: React.FC<PrintableQrModalProps> = ({ stores, onClose }) => {
  const [qrItems, setQrItems] = useState<QrItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Generate crisp local high-resolution QR codes without external API dependency
  useEffect(() => {
    let isMounted = true;

    const generateQrs = async () => {
      setLoading(true);
      const items: QrItem[] = [];

      for (const store of stores) {
        try {
          const url = await QRCode.toDataURL(store.code, {
            width: 320,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H',
          });
          items.push({ store, qrDataUrl: url });
        } catch (err) {
          console.error(`Error generating QR for ${store.name}:`, err);
        }
      }

      if (isMounted) {
        setQrItems(items);
        setLoading(false);
      }
    };

    generateQrs();

    return () => {
      isMounted = false;
    };
  }, [stores]);

  // Robust printing with iframe fallback for sandbox/mobile environments
  const handlePrint = () => {
    // 1. Direct browser print call
    try {
      window.print();
    } catch (e) {
      console.warn('Direct window.print() failed:', e);
    }

    // 2. Invisible iframe fallback for iframes/embedded webviews
    try {
      const existingFrame = document.getElementById('qr-print-fallback-frame');
      if (existingFrame) existingFrame.remove();

      const printFrame = document.createElement('iframe');
      printFrame.id = 'qr-print-fallback-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.style.visibility = 'hidden';
      document.body.appendChild(printFrame);

      const cardsHtml = qrItems
        .map(
          (item, idx) => `
        <div style="border: 2px dashed #333; border-radius: 12px; padding: 14px; text-align: center; page-break-inside: avoid; break-inside: avoid; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
          <div style="font-size: 10px; font-weight: bold; background: #eee; padding: 2px 8px; border-radius: 999px; margin-bottom: 4px; text-transform: uppercase;">
            Tienda #${item.store.slotNumber ?? idx + 1} · ${item.store.category}
          </div>
          <div style="font-size: 16px; font-weight: 900; color: #111; margin-bottom: 2px; font-family: sans-serif;">
            ${item.store.name}
          </div>
          <div style="font-size: 11px; color: #666; margin-bottom: 8px;">
            ${item.store.location}
          </div>
          <div style="background: #fff; padding: 6px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 8px;">
            <img src="${item.qrDataUrl}" style="width: 140px; height: 140px; display: block;" />
          </div>
          <div style="font-family: monospace; font-size: 11px; font-weight: bold; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; word-break: break-all;">
            Código Manual: <strong>${item.store.code}</strong>
          </div>
          <div style="font-size: 9px; color: #888; margin-top: 6px;">
            ✂️ Recortar y colocar en mostrador
          </div>
        </div>
      `
        )
        .join('');

      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>QRs Oficiales Unicentro Maracay</title>
          <style>
            @page { size: A4; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; padding: 0; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 12px; margin-bottom: 16px; }
            .header h1 { margin: 0 0 4px 0; font-size: 22px; color: #d97706; }
            .header p { margin: 0; font-size: 12px; color: #444; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
            @media print {
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎃 DULCE O TRUCO 2024 · UNICENTRO MARACAY</h1>
            <p><strong>CÓDIGOS QR OFICIALES DE LAS TIENDAS EMBRUJADAS</strong></p>
            <p style="font-size: 11px; color: #666; margin-top: 4px;">Instrucciones: Recorta cada tarjeta por la línea punteada y ubícala visiblemente en el mostrador para el escaneo de los niños.</p>
          </div>
          <div class="grid">
            ${cardsHtml}
          </div>
        </body>
        </html>
      `;

      if (printFrame.contentDocument) {
        printFrame.contentDocument.open();
        printFrame.contentDocument.write(fullHtml);
        printFrame.contentDocument.close();

        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch {}
          setTimeout(() => {
            try {
              printFrame.remove();
            } catch {}
          }, 3000);
        }, 500);
      }
    } catch (frameErr) {
      console.warn('Iframe fallback print failed:', frameErr);
    }
  };

  // Download entire printable sheet as a high-resolution PNG image
  const handleDownloadSheetImage = async () => {
    if (isExportingImage || qrItems.length === 0) return;
    setIsExportingImage(true);

    try {
      const canvas = document.createElement('canvas');
      const cols = 3;
      const rows = Math.ceil(qrItems.length / cols);

      const cardWidth = 360;
      const cardHeight = 440;
      const padding = 40;
      const gap = 24;
      const headerHeight = 160;

      canvas.width = padding * 2 + cols * cardWidth + (cols - 1) * gap;
      canvas.height = padding * 2 + headerHeight + rows * cardHeight + (rows - 1) * gap;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto 2D');

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = '#110426';
      ctx.fillRect(padding, padding, canvas.width - padding * 2, headerHeight - 20);

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎃 DULCE O TRUCO · UNICENTRO MARACAY', canvas.width / 2, padding + 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('CÓDIGOS QR OFICIALES DE LAS TIENDAS EMBRUJADAS', canvas.width / 2, padding + 85);

      ctx.fillStyle = '#D8B4FE';
      ctx.font = '14px sans-serif';
      ctx.fillText(
        'Instrucciones: Recorta cada tarjeta y ubícala en el mostrador para el escaneo de los participantes.',
        canvas.width / 2,
        padding + 115
      );

      // Helper to load image
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      // Draw each store card
      for (let i = 0; i < qrItems.length; i++) {
        const item = qrItems[i];
        const col = i % cols;
        const row = Math.floor(i / cols);

        const cardX = padding + col * (cardWidth + gap);
        const cardY = padding + headerHeight + row * (cardHeight + gap);

        // Dashed border card container
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
        ctx.setLineDash([]); // Reset line dash

        // Card header background
        ctx.fillStyle = '#F8FAFC';
        ctx.fillRect(cardX + 2, cardY + 2, cardWidth - 4, 75);

        // Slot badge
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(cardX + 16, cardY + 12, 110, 24);
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`TIENDA #${item.store.slotNumber ?? i + 1}`, cardX + 24, cardY + 28);

        // Category
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(item.store.category.slice(0, 22), cardX + cardWidth - 16, cardY + 28);

        // Store Name
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.store.name, cardX + cardWidth / 2, cardY + 62);

        // Location
        ctx.fillStyle = '#64748B';
        ctx.font = '12px sans-serif';
        ctx.fillText(item.store.location, cardX + cardWidth / 2, cardY + 100);

        // Draw QR Image
        try {
          const qrImg = await loadImage(item.qrDataUrl);
          const qrSize = 190;
          const qrX = cardX + (cardWidth - qrSize) / 2;
          const qrY = cardY + 115;

          // Border around QR
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3;
          ctx.strokeRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch {}

        // Code string pill
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(cardX + 20, cardY + 335, cardWidth - 40, 32);
        ctx.fillStyle = '#FCD34D';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Código: ${item.store.code}`, cardX + cardWidth / 2, cardY + 356);

        // Scissors footnote
        ctx.fillStyle = '#94A3B8';
        ctx.font = '11px sans-serif';
        ctx.fillText('✂️ Recortar por la línea punteada', cardX + cardWidth / 2, cardY + 400);
      }

      // Convert canvas to downloadable link
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'QRs_Oficiales_Unicentro_Maracay.png';
      downloadLink.href = dataUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (err) {
      console.error('Error generating sheet image:', err);
    } finally {
      setIsExportingImage(false);
    }
  };

  // Download individual QR image
  const handleDownloadSingleQr = (item: QrItem) => {
    const link = document.createElement('a');
    link.download = `QR_${item.store.name.replace(/\s+/g, '_')}.png`;
    link.href = item.qrDataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {}
  };

  return (
    <div
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 text-white overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-gradient-to-b from-slate-950 via-[#100624] to-slate-950 border-2 sm:border-3 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.4)] my-auto max-h-[95vh] flex flex-col text-slate-100">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/60 pb-3 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider mb-1">
              <QrCode className="w-3.5 h-3.5" />
              <span>Impresión y Descarga de QRs</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white font-['Lilita_One']">
              Tarjetas Oficiales de Escaneo · Unicentro Maracay
            </h2>
            <p className="text-xs text-purple-200/80 font-['Fredoka']">
              Imprime en papel para los mostradores de cada tienda o descarga la hoja de respaldo.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Primary Print Button */}
            <button
              onClick={handlePrint}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm font-['Lilita_One'] tracking-wide flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Abrir diálogo de impresión o guardar en PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            {/* Download Full Sheet PNG Button */}
            <button
              onClick={handleDownloadSheetImage}
              disabled={loading || isExportingImage}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm font-['Lilita_One'] tracking-wide flex items-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Descargar imagen PNG completa lista para imprimir o enviar por WhatsApp"
            >
              {isExportingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Descargar Hoja PNG</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs text-amber-200 font-['Fredoka']">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Tip:</strong> Si estás en el celular y no tienes impresora conectada, pulsa <strong>"Descargar Hoja PNG"</strong> para guardar la imagen completa y enviarla a imprimir.
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-sm font-['Fredoka'] text-purple-200">Generando códigos QR en alta resolución...</p>
          </div>
        ) : (
          /* Printable Cards Grid */
          <div
            ref={sheetRef}
            id="printable-qr-sheet"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1 flex-1 pb-4"
          >
            {qrItems.map((item, idx) => (
              <div
                key={item.store.id}
                className="p-3.5 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-slate-400 shadow-md flex flex-col items-center text-center relative group hover:border-amber-500 transition-colors"
              >
                {/* Store Index Badge */}
                <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-bold text-slate-700 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-300">
                  #{item.store.slotNumber ?? idx + 1}
                </span>

                {/* Category Pill */}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 mt-0.5">
                  {item.store.category}
                </span>

                {/* Store Name */}
                <h4 className="font-black text-slate-900 font-['Lilita_One'] text-lg tracking-wide leading-tight">
                  {item.store.name}
                </h4>

                {/* Location */}
                <div className="text-[11px] text-slate-500 font-['Fredoka'] mb-2">
                  {item.store.location}
                </div>

                {/* QR Code Container */}
                <div className="w-36 h-36 p-2 bg-white rounded-xl shadow-inner border-2 border-emerald-500 flex items-center justify-center my-1 relative">
                  <img
                    src={item.qrDataUrl}
                    alt={`QR ${item.store.name}`}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Code Pill with copy action */}
                <div
                  onClick={() => handleCopyCode(item.store.code)}
                  className="mt-2 text-[11px] font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-300 cursor-pointer transition-colors flex items-center gap-1.5"
                  title="Toca para copiar código"
                >
                  <span className="text-slate-500 font-sans font-normal text-[10px]">Cód:</span>
                  <span>{item.store.code}</span>
                  {copiedCode === item.store.code ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : null}
                </div>

                {/* Download individual card button */}
                <div className="mt-2.5 pt-2 border-t border-slate-200 w-full flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    <span>Línea de corte</span>
                  </span>
                  <button
                    onClick={() => handleDownloadSingleQr(item)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Guardar QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
