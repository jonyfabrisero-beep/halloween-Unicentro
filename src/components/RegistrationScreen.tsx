import React, { useState } from 'react';
import { Gender, PlayerData } from '../types/game';
import { GirlAvatar, BoyAvatar } from './GameIcons';
import { soundEffects } from '../services/soundEffects';
import { storageService } from '../services/storage';
import { ShieldCheck, HelpCircle, Ghost, User, Sparkles } from 'lucide-react';

interface RegistrationScreenProps {
  onRegistered: (player: PlayerData) => void;
  onOpenAdmin: () => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({
  onRegistered,
  onOpenAdmin,
}) => {
  const [selectedGender, setSelectedGender] = useState<Gender>('girl');
  const [playerName, setPlayerName] = useState('');
  const [parentName, setParentName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    soundEffects.playBounce();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim()) {
      setErrorMsg('Por favor escribe el nombre del niño/a.');
      soundEffects.playPumpkinSquish();
      return;
    }

    if (!parentName.trim()) {
      setErrorMsg('Por favor escribe el nombre del representante.');
      soundEffects.playPumpkinSquish();
      return;
    }

    setErrorMsg('');
    soundEffects.playUnlock();

    const newPlayer: PlayerData = {
      id: `unicentro-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      playerName: playerName.trim(),
      parentName: parentName.trim(),
      gender: selectedGender,
      createdAt: new Date().toISOString(),
      unlockedStores: [],
      storeStars: {},
      scanHistory: [],
    };

    storageService.saveCurrentPlayer(newPlayer);
    onRegistered(newPlayer);
  };

  return (
    <div
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
      className="relative w-full min-h-[100dvh] flex items-center justify-center p-3 sm:p-5 bg-gradient-to-br from-[#1d0533] via-[#0f0426] to-[#050114] text-white overflow-y-auto overflow-x-hidden touch-pan-y"
    >
      {/* Background ambience elements */}
      <div className="absolute top-4 left-4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-72 h-72 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

      {/* Top Admin / Staff icon */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-colors shadow-sm"
          title="Panel de Control y Descarga CSV"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline font-mono">Panel / CSV</span>
        </button>
      </div>

      {/* Main Registration Card matching PDF Page 6 */}
      <div className="relative z-10 w-full max-w-lg bg-slate-950/85 border-2 border-purple-500/40 rounded-3xl p-4 sm:p-7 shadow-[0_0_40px_rgba(147,51,234,0.25)] backdrop-blur-md my-auto max-h-[96vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="flex justify-center mb-1">
            <img
              src="/LOGO03B.png"
              alt="Unicentro Maracay"
              className="w-20 h-20 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)] select-none pointer-events-none"
              loading="eager"
            />
          </div>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-900/60 border border-purple-400/30 text-amber-300 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            <span>🎃</span>
            <span>Registro de Jugador</span>
            <span>🎃</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white font-['Lilita_One'] tracking-wide">
            ¡Prepárate para la Aventura!
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 font-['Fredoka'] mt-0.5">
            Ingresa tus datos para registrar tus tiendas y reclamar tus dulces
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Avatar / Gender Selector matching PDF Page 6 */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5 text-center font-['Fredoka']">
              Elige tu Avatar:
            </label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div onClick={() => handleGenderSelect('girl')}>
                <GirlAvatar isSelected={selectedGender === 'girl'} />
              </div>
              <div onClick={() => handleGenderSelect('boy')}>
                <BoyAvatar isSelected={selectedGender === 'boy'} />
              </div>
            </div>
          </div>

          {/* Player Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-purple-200 font-['Fredoka']">
              Nombre del jugador (niño/a):
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ej. Sofía / Daniel"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-purple-950/50 border-2 border-purple-400/50 text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all font-['Fredoka'] font-medium text-xs sm:text-sm"
              />
              <Ghost className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 absolute right-3 top-2.5 sm:top-3 pointer-events-none" />
            </div>
          </div>

          {/* Parent / Guardian Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-purple-200 font-['Fredoka']">
              Nombre del representante (padre/tutor):
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Ej. María Pérez"
                className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl bg-purple-950/50 border-2 border-purple-400/50 text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all font-['Fredoka'] font-medium text-xs sm:text-sm"
              />
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 absolute right-3 top-2.5 sm:top-3 pointer-events-none" />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2 rounded-lg bg-red-950/70 border border-red-500/50 text-red-200 text-xs text-center font-['Fredoka'] animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Big Green PLAY Button matching PDF Page 4 & 6 */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xl sm:text-2xl font-['Lilita_One'] tracking-wider shadow-[0_0_25px_rgba(52,211,153,0.6)] hover:scale-102 active:scale-98 transition-all duration-200 border-2 border-emerald-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>PLAY</span>
              <span className="text-xl">▶</span>
            </button>
          </div>

          {/* Note on data sync */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-purple-300/70 font-['Fredoka'] text-center pt-0.5">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Tus escaneos se guardarán automáticamente para retirar tus dulces</span>
          </div>
        </form>
      </div>
    </div>
  );
};
