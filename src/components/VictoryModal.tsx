import React, { useEffect } from 'react';
import { PlayerData } from '../types/game';
import { soundEffects } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { Award, Gift, Sparkles, Check, X } from 'lucide-react';

interface VictoryModalProps {
  player: PlayerData;
  onClose: () => void;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  player,
  onClose,
  onRestart,
}) => {
  useEffect(() => {
    soundEffects.playVictoryFanfare();

    // Trigger grand celebration confetti cannon
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const interval: number = window.setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#F59E0B', '#10B981', '#EC4899', '#8B5CF6', '#F97316', '#FDE047'],
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const ticketCode = `DULCE-${player.id.slice(-6).toUpperCase()}`;

  return (
    <div 
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto overscroll-contain animate-fadeIn"
    >
      {/* Radiant rotating sunburst background rays (Page 5: resplandor.png & Page 8) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-30">
        <div className="w-[800px] h-[800px] rounded-full border-dashed border-4 border-amber-300 animate-spin" style={{ animationDuration: '40s' }} />
        <div className="absolute w-[600px] h-[600px] bg-gradient-radial from-amber-500/30 via-purple-600/20 to-transparent blur-3xl animate-pulse" />
      </div>

      {/* Main Victory Card matching PDF Page 8 */}
      <div 
        role="dialog"
        aria-modal="true"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
        className="modal-container relative z-10 w-full max-w-lg bg-gradient-to-b from-[#20083b] via-[#120429] to-[#070114] border-3 sm:border-4 border-amber-400 rounded-3xl p-4 sm:p-7 text-center text-white shadow-[0_0_60px_rgba(245,158,11,0.5)] my-auto max-h-[96vh] overflow-y-auto overscroll-contain animate-scaleUp"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Golden Trophy / Pumpkin Emblem matching Page 8 */}
        <div className="relative mx-auto w-24 h-24 sm:w-36 sm:h-36 flex items-center justify-center mb-2 sm:mb-3">
          <img
            src="/src/assets/images/halloween_victory_badge_1790615248271.jpg"
            alt="Trofeo Mapa Completado"
            className="w-full h-full object-contain filter drop-shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-bounce"
            style={{ animationDuration: '3s' }}
            referrerPolicy="no-referrer"
          />
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300 absolute -top-1 sm:-top-2 -left-1 sm:-left-2 animate-ping" style={{ animationDuration: '2s' }} />
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-200 absolute -bottom-1 -right-1 animate-pulse" />
        </div>

        {/* Purple Banner Ribbon "mapa completado" matching Page 8 */}
        <div className="relative inline-block mb-2 sm:mb-3">
          <div className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 border-2 border-amber-300 shadow-[0_4px_20px_rgba(147,51,234,0.6)]">
            <h2 className="text-xl sm:text-3xl font-black text-amber-300 font-['Lilita_One'] tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              mapa completado
            </h2>
          </div>
        </div>

        {/* Big Subtitle matching Page 8 */}
        <div className="mb-3 sm:mb-5">
          <h3 className="text-lg sm:text-2xl font-black text-white font-['Lilita_One'] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-orange-400">
            ¡Ya puedes retirar tus dulces!
          </h3>
          <p className="text-[11px] sm:text-sm text-purple-200/90 font-['Fredoka'] mt-0.5 max-w-sm mx-auto">
            ¡Felicitaciones <span className="text-amber-300 font-bold">{player.playerName}</span>! Desbloqueaste las 10 casas embrujadas y el castillo central de Unicentro Maracay.
          </p>
        </div>

        {/* Candy Redemption Voucher Ticket */}
        <div className="p-3 sm:p-4 rounded-2xl bg-purple-950/70 border-2 border-dashed border-amber-400/80 mb-4 sm:mb-5 relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-purple-800/80 pb-1.5 sm:pb-2 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-2 text-left">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 shrink-0" />
              <div>
                <div className="text-[10px] sm:text-[11px] text-amber-300 uppercase font-bold font-mono">
                  Vale de Retiro de Dulces
                </div>
                <div className="text-[11px] sm:text-xs font-semibold text-white font-['Fredoka']">
                  Punto de Canje: Información Principal
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[9px] sm:text-[10px] font-bold uppercase">
              VÁLIDO
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left text-xs font-['Fredoka']">
            <div>
              <span className="text-purple-300 text-[10px] block">Niño/a:</span>
              <span className="font-bold text-white truncate block">{player.playerName}</span>
            </div>
            <div>
              <span className="text-purple-300 text-[10px] block">Representante:</span>
              <span className="font-bold text-white truncate block">{player.parentName}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-purple-900/60 flex items-center justify-between">
              <span className="text-purple-300 text-[10px]">Código de Canje:</span>
              <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm tracking-widest bg-black/40 px-2 py-0.5 rounded border border-amber-400/40">
                {ticketCode}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-black text-xs sm:text-sm font-['Lilita_One'] tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Volver al Mapa</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-200 text-xs font-bold font-['Fredoka'] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Nuevo Jugador</span>
          </button>
        </div>
      </div>
    </div>
  );
};
