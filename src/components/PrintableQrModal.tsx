import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { StoreInfo } from '../types/game';
import { Printer, Download, X, QrCode, Check, FileDown, Loader2, Sparkles } from 'lucide-react';
import { getQrCardTheme, QrCardTheme } from '../data/qrCardThemes';

interface PrintableQrModalProps {
  stores: StoreInfo[];
  onClose: () => void;
}

interface QrItem {
  store: StoreInfo;
  qrDataUrl: string;
  theme: QrCardTheme;
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

      for (let i = 0; i < stores.length; i++) {
        const store = stores[i];
        const theme = getQrCardTheme(store.slotNumber ? store.slotNumber - 1 : i);
        try {
          const url = await QRCode.toDataURL(store.code, {
            width: 340,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'H',
          });
          items.push({ store, qrDataUrl: url, theme });
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
        .map((item) => {
          const theme = item.theme;
          return `
        <div style="box-sizing: border-box; border: 3px solid ${theme.borderColor}; border-radius: 18px; padding: 18px 14px; text-align: center; page-break-inside: avoid; break-inside: avoid; background: ${theme.cardBg}; display: flex; flex-direction: column; align-items: center; justify-content: space-between; position: relative; box-shadow: 0 4px 12px rgba(${theme.borderRgb}, 0.15);">
          <!-- Top game name banner -->
          <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; color: ${theme.primaryColor}; margin-bottom: 6px; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>${theme.titleEmoji}</span>
            <span>Tiendas embrujadas en unicentro maracay</span>
            <span>${theme.titleEmoji}</span>
          </div>

          <!-- Store Name -->
          <div style="font-size: 20px; font-weight: 900; color: ${theme.darkColor}; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase; letter-spacing: 0.5px;">
            ${item.store.name}
          </div>

          <!-- Themed Framed QR container with corner ornaments -->
          <div style="position: relative; background: #ffffff; padding: 10px; border: 3.5px solid ${theme.borderColor}; border-radius: 14px; margin-bottom: 12px; box-shadow: 0 4px 12px rgba(${theme.borderRgb}, 0.2);">
            <!-- Corner Emojis -->
            <span style="position: absolute; top: -12px; left: -12px; font-size: 20px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">${theme.cornerEmojis[0]}</span>
            <span style="position: absolute; top: -12px; right: -12px; font-size: 20px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">${theme.cornerEmojis[1]}</span>
            <span style="position: absolute; bottom: -12px; left: -12px; font-size: 20px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">${theme.cornerEmojis[2]}</span>
            <span style="position: absolute; bottom: -12px; right: -12px; font-size: 20px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));">${theme.cornerEmojis[3]}</span>

            <img src="${item.qrDataUrl}" style="width: 155px; height: 155px; display: block;" />
          </div>

          <!-- Manual Code Pill -->
          <div style="font-family: monospace; font-size: 13px; font-weight: 900; background: ${theme.badgeBg}; color: ${theme.badgeText}; border: 1.5px solid ${theme.badgeBorder}; padding: 6px 14px; border-radius: 999px; letter-spacing: 1px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
            CÓDIGO: <strong>${item.store.code}</strong>
          </div>

          <!-- Themed ornament footnote -->
          <div style="font-size: 10px; font-weight: bold; color: ${theme.primaryColor}; margin-top: 8px; letter-spacing: 0.3px;">
            ${theme.ornament}
          </div>
        </div>
      `;
        })
        .join('');

      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Tiendas Embrujadas en Unicentro Maracay - QRs Oficiales</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #111; margin: 0; padding: 0; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 14px; }
            .header h1 { margin: 0 0 4px 0; font-size: 22px; color: #d97706; }
            .header p { margin: 0; font-size: 13px; color: #333; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
            @media print {
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎃 TIENDAS EMBRUJADAS EN UNICENTRO MARACAY</h1>
            <p><strong>CÓDIGOS QR OFICIALES DE LAS TIENDAS</strong></p>
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

  // Helper to load image for canvas
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Helper to draw rounded rectangle on canvas
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Download entire printable sheet as a high-resolution PNG image
  const handleDownloadSheetImage = async () => {
    if (isExportingImage || qrItems.length === 0) return;
    setIsExportingImage(true);

    try {
      const canvas = document.createElement('canvas');
      const cols = 3;
      const rows = Math.ceil(qrItems.length / cols);

      const cardWidth = 380;
      const cardHeight = 460;
      const padding = 40;
      const gap = 24;
      const headerHeight = 150;

      canvas.width = padding * 2 + cols * cardWidth + (cols - 1) * gap;
      canvas.height = padding * 2 + headerHeight + rows * cardHeight + (rows - 1) * gap;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo obtener el contexto 2D');

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = '#110426';
      drawRoundedRect(ctx, padding, padding, canvas.width - padding * 2, headerHeight - 20, 16);
      ctx.fill();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎃 TIENDAS EMBRUJADAS EN UNICENTRO MARACAY 🎃', canvas.width / 2, padding + 52);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('CÓDIGOS QR OFICIALES DE CADA TIENDA', canvas.width / 2, padding + 90);

      // Draw each store card
      for (let i = 0; i < qrItems.length; i++) {
        const item = qrItems[i];
        const theme = item.theme;
        const col = i % cols;
        const row = Math.floor(i / cols);

        const cardX = padding + col * (cardWidth + gap);
        const cardY = padding + headerHeight + row * (cardHeight + gap);

        // 1. Card background with subtle theme tint
        ctx.fillStyle = theme.cardBg;
        drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 18);
        ctx.fill();

        // 2. Card themed outer border
        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 3.5;
        drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 18);
        ctx.stroke();

        // 3. Top Game Name Title
        ctx.fillStyle = theme.primaryColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${theme.titleEmoji} Tiendas embrujadas en unicentro maracay ${theme.titleEmoji}`,
          cardX + cardWidth / 2,
          cardY + 32
        );

        // 4. Store Name
        ctx.fillStyle = theme.darkColor;
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.store.name.toUpperCase(), cardX + cardWidth / 2, cardY + 66);

        // 5. Framed QR Code Container
        const qrSize = 195;
        const qrX = cardX + (cardWidth - qrSize) / 2;
        const qrY = cardY + 88;

        // QR frame white background
        ctx.fillStyle = '#FFFFFF';
        drawRoundedRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 14);
        ctx.fill();

        // QR frame border
        ctx.strokeStyle = theme.borderColor;
        ctx.lineWidth = 3.5;
        drawRoundedRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 14);
        ctx.stroke();

        // Draw QR Image
        try {
          const qrImg = await loadImage(item.qrDataUrl);
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
        } catch {}

        // 6. Draw Corner Emojis on QR frame
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Top-left
        ctx.fillText(theme.cornerEmojis[0], qrX - 8, qrY - 8);
        // Top-right
        ctx.fillText(theme.cornerEmojis[1], qrX + qrSize + 8, qrY - 8);
        // Bottom-left
        ctx.fillText(theme.cornerEmojis[2], qrX - 8, qrY + qrSize + 8);
        // Bottom-right
        ctx.fillText(theme.cornerEmojis[3], qrX + qrSize + 8, qrY + qrSize + 8);
        ctx.textBaseline = 'alphabetic'; // reset

        // 7. Manual Code Pill
        const pillWidth = cardWidth - 50;
        const pillHeight = 36;
        const pillX = cardX + 25;
        const pillY = cardY + 340;

        ctx.fillStyle = theme.badgeBg;
        drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 18);
        ctx.fill();

        ctx.strokeStyle = theme.badgeBorder;
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 18);
        ctx.stroke();

        ctx.fillStyle = theme.badgeText;
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`CÓDIGO: ${item.store.code}`, cardX + cardWidth / 2, pillY + 23);

        // 8. Theme Bottom Ornament
        ctx.fillStyle = theme.primaryColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(theme.ornament, cardX + cardWidth / 2, cardY + 418);
      }

      // Convert canvas to downloadable link
      const dataUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'Tiendas_Embrujadas_Unicentro_Maracay_QRs.png';
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

  // Download individual store card as a high-resolution PNG image
  const handleDownloadSingleCard = async (item: QrItem) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 740;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const theme = item.theme;

      // Card Background
      ctx.fillStyle = theme.cardBg;
      drawRoundedRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 26);
      ctx.fill();

      // Card Border
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 26);
      ctx.stroke();

      // Top Game Name Title
      ctx.fillStyle = theme.primaryColor;
      ctx.font = 'bold 19px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${theme.titleEmoji} Tiendas embrujadas en unicentro maracay ${theme.titleEmoji}`,
        canvas.width / 2,
        75
      );

      // Store Name
      ctx.fillStyle = theme.darkColor;
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.store.name.toUpperCase(), canvas.width / 2, 130);

      // Framed QR Code Container
      const qrSize = 340;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 170;

      // QR Frame White Background
      ctx.fillStyle = '#FFFFFF';
      drawRoundedRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 20);
      ctx.fill();

      // QR Frame Border
      ctx.strokeStyle = theme.borderColor;
      ctx.lineWidth = 5;
      drawRoundedRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 20);
      ctx.stroke();

      // Draw QR Image
      const qrImg = await loadImage(item.qrDataUrl);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Draw Corner Emojis on QR frame
      ctx.font = '34px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(theme.cornerEmojis[0], qrX - 14, qrY - 14);
      ctx.fillText(theme.cornerEmojis[1], qrX + qrSize + 14, qrY - 14);
      ctx.fillText(theme.cornerEmojis[2], qrX - 14, qrY + qrSize + 14);
      ctx.fillText(theme.cornerEmojis[3], qrX + qrSize + 14, qrY + qrSize + 14);
      ctx.textBaseline = 'alphabetic';

      // Manual Code Pill
      const pillWidth = canvas.width - 120;
      const pillHeight = 56;
      const pillX = 60;
      const pillY = 565;

      ctx.fillStyle = theme.badgeBg;
      drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 28);
      ctx.fill();

      ctx.strokeStyle = theme.badgeBorder;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 28);
      ctx.stroke();

      ctx.fillStyle = theme.badgeText;
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CÓDIGO: ${item.store.code}`, canvas.width / 2, pillY + 36);

      // Bottom Ornament
      ctx.fillStyle = theme.primaryColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(theme.ornament, canvas.width / 2, 670);

      // Download link
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `QR_${item.store.name.replace(/\s+/g, '_')}_Unicentro.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Error exporting single card:', e);
    }
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
              Tiendas Embrujadas en Unicentro Maracay
            </h2>
            <p className="text-xs text-purple-200/80 font-['Fredoka']">
              Diseño temático exclusivo para cada tienda. Imprime la hoja completa o descarga cada tarjeta individualmente.
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
              title="Descargar imagen PNG completa con todas las tarjetas"
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

        {/* Tip banner */}
        <div className="bg-purple-950/50 border border-purple-800/40 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs text-purple-200 font-['Fredoka']">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Cada tienda cuenta con su propio marco decorativo y el título oficial <strong>"Tiendas embrujadas en unicentro maracay"</strong>.
            </span>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-sm font-['Fredoka'] text-purple-200">Generando tarjetas con marcos embrujados...</p>
          </div>
        ) : (
          /* Printable Themed Cards Grid */
          <div
            ref={sheetRef}
            id="printable-qr-sheet"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1 flex-1 pb-4"
          >
            {qrItems.map((item) => {
              const theme = item.theme;

              return (
                <div
                  key={item.store.id}
                  style={{
                    backgroundColor: theme.cardBg,
                    borderColor: theme.borderColor,
                    boxShadow: `0 4px 18px rgba(${theme.borderRgb}, 0.18)`,
                  }}
                  className="p-4 rounded-2xl border-3 flex flex-col items-center text-center relative group transition-all"
                >
                  {/* Game Name Title */}
                  <div
                    style={{ color: theme.primaryColor }}
                    className="text-[11px] font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5 font-sans"
                  >
                    <span>{theme.titleEmoji}</span>
                    <span>Tiendas embrujadas en unicentro maracay</span>
                    <span>{theme.titleEmoji}</span>
                  </div>

                  {/* Store Name */}
                  <h4
                    style={{ color: theme.darkColor }}
                    className="font-black font-['Lilita_One'] text-xl tracking-wide leading-tight uppercase my-1"
                  >
                    {item.store.name}
                  </h4>

                  {/* Themed Framed QR Container with Corner Decorations */}
                  <div
                    style={{
                      borderColor: theme.borderColor,
                      boxShadow: `0 4px 14px rgba(${theme.borderRgb}, 0.25)`,
                    }}
                    className="w-40 h-40 p-2.5 bg-white rounded-2xl border-3 flex items-center justify-center my-2 relative"
                  >
                    {/* 4 Themed Corner Emojis */}
                    <span className="absolute -top-3 -left-3 text-xl drop-shadow-md select-none">
                      {theme.cornerEmojis[0]}
                    </span>
                    <span className="absolute -top-3 -right-3 text-xl drop-shadow-md select-none">
                      {theme.cornerEmojis[1]}
                    </span>
                    <span className="absolute -bottom-3 -left-3 text-xl drop-shadow-md select-none">
                      {theme.cornerEmojis[2]}
                    </span>
                    <span className="absolute -bottom-3 -right-3 text-xl drop-shadow-md select-none">
                      {theme.cornerEmojis[3]}
                    </span>

                    <img
                      src={item.qrDataUrl}
                      alt={`QR ${item.store.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Code Pill with copy action */}
                  <div
                    onClick={() => handleCopyCode(item.store.code)}
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      borderColor: theme.badgeBorder,
                    }}
                    className="mt-2 text-xs font-mono font-bold px-3 py-1 rounded-full border shadow-xs cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    title="Toca para copiar código"
                  >
                    <span>CÓDIGO:</span>
                    <span className="tracking-wider">{item.store.code}</span>
                    {copiedCode === item.store.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : null}
                  </div>

                  {/* Themed Ornament Footnote */}
                  <div
                    style={{ color: theme.primaryColor }}
                    className="text-[10px] font-bold mt-2"
                  >
                    {theme.ornament}
                  </div>

                  {/* Download individual card button */}
                  <div className="mt-2.5 pt-2 border-t border-black/10 w-full flex items-center justify-center">
                    <button
                      onClick={() => handleDownloadSingleCard(item)}
                      style={{ color: theme.primaryColor }}
                      className="text-[11px] font-bold flex items-center gap-1.5 hover:underline cursor-pointer py-0.5"
                      title="Descargar esta tarjeta con su marco decorativo en alta resolución"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Tarjeta</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
