import React, { useState } from 'react';
import { PlayerData } from '../types/game';
import { storageService } from '../services/storage';
import { soundEffects } from '../services/soundEffects';
import { 
  X, 
  Download, 
  Users, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  LogOut,
  Sparkles
} from 'lucide-react';

const ADMIN_PASSCODE = 'Uni2026mcy';
const ADMIN_STORAGE_KEY = 'unicentro_admin_authenticated';

interface AdminModalProps {
  onClose: () => void;
  onRefreshCurrentPlayer: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  onClose,
  onRefreshCurrentPlayer,
}) => {
  // Check if authenticated in current session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const [players, setPlayers] = useState<PlayerData[]>(() => storageService.getAllPlayers());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      setErrorMessage('');
      soundEffects.playVictoryFanfare();
      setPlayers(storageService.getAllPlayers());
    } else {
      setIsShaking(true);
      setErrorMessage('Código de administrador incorrecto. Acceso denegado.');
      soundEffects.playPumpkinSquish();
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    setPasscode('');
    setErrorMessage('');
  };

  const handleExportCSV = () => {
    storageService.exportToCSV();
  };

  const handleResetCurrent = () => {
    storageService.clearCurrentPlayer();
    onRefreshCurrentPlayer();
    setShowResetConfirm(false);
    onClose();
  };

  const handleClearAllPlayers = () => {
    storageService.clearAllPlayers();
    setPlayers([]);
    onRefreshCurrentPlayer();
    setShowClearConfirm(false);
  };

  const completedCount = players.filter((p) => (p.unlockedStores?.length || 0) >= 10).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 text-white select-none overflow-y-auto">
      {/* 1. ADMIN CODE GATE (If not authenticated) */}
      {!isAuthenticated ? (
        <div 
          className={`relative w-full max-w-md bg-gradient-to-b from-slate-950 via-[#19092B] to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] my-auto text-center transition-transform ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Lock Icon Emblem */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center mb-4">
            <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Área Restringida · Solo Administradores</span>
          </div>

          <h2 className="text-2xl font-black text-white font-['Lilita_One'] tracking-wide">
            Panel de Supervisión y CSV
          </h2>
          <p className="text-xs text-purple-200/80 font-['Fredoka'] mt-1.5 mb-5 leading-relaxed">
            Ingresa el código de administrador autorizado para acceder a los datos de los participantes, métricas y descarga de reportes.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-1.5 font-['Fredoka']">
                Código de Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Introduce el código..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-purple-950/60 border-2 border-purple-500/50 text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all font-mono text-sm tracking-wider pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-purple-400 hover:text-amber-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-['Fredoka'] animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm font-['Lilita_One'] uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              <span>Desbloquear Panel</span>
            </button>
          </form>
        </div>
      ) : (
        /* 2. AUTHENTICATED ADMIN DASHBOARD */
        <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-950 via-[#100624] to-slate-950 border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.3)] my-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-purple-900/60 pb-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sesión Admin Activa · Luma CSV Sync</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Lilita_One']">
                Seguimiento de Participantes · Halloween Unicentro
              </h2>
              <p className="text-xs text-purple-200/80 font-['Fredoka'] mt-0.5">
                Descarga la data en formato CSV para cruzar y comparar con los registros previos de Luma y entrega de dulces.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                title="Cerrar Sesión de Administrador"
                className="p-2 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 hover:text-red-300 hover:border-red-500/50 transition-colors flex items-center gap-1 text-xs font-['Fredoka']"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-900/60 text-purple-300">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-white font-mono">{players.length}</div>
                <div className="text-[11px] text-purple-300 font-['Fredoka']">Niños Registrados</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-900/60 text-emerald-300">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-emerald-300 font-mono">{completedCount}</div>
                <div className="text-[11px] text-emerald-300/80 font-['Fredoka']">Mapas Completados</div>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-900/60 text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  {players.reduce((acc, p) => acc + (p.unlockedStores?.length || 0), 0)}
                </div>
                <div className="text-[11px] text-amber-300/80 font-['Fredoka']">Escaneos QR Totales</div>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs font-['Lilita_One'] tracking-wide shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>DESCARGAR CSV DE PARTICIPANTES</span>
            </button>

            <div className="flex items-center gap-2">
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-red-950/90 border border-red-500 text-xs font-['Fredoka']">
                  <span className="text-red-200 px-2 text-[11px]">¿Borrar lista a cero?</span>
                  <button
                    onClick={handleClearAllPlayers}
                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px]"
                  >
                    Sí, vaciar
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 text-xs font-['Fredoka'] flex items-center gap-1.5 transition-colors"
                  title="Eliminar todos los registros para empezar en limpio"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Empezar Lista de Cero</span>
                </button>
              )}

              {showResetConfirm ? (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-amber-950/90 border border-amber-500 text-xs font-['Fredoka']">
                  <span className="text-amber-200 px-2 text-[11px]">¿Reiniciar partida actual?</span>
                  <button
                    onClick={handleResetCurrent}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px]"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs font-['Fredoka'] flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Nuevo Jugador</span>
                </button>
              )}
            </div>
          </div>

          {/* Participants Table */}
          <div className="flex-1 overflow-auto rounded-2xl border border-purple-900/60 bg-black/40">
            <table className="w-full text-left text-xs font-['Fredoka']">
              <thead className="bg-purple-950/80 text-purple-200 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">Niño / Avatar</th>
                  <th className="p-3">Representante</th>
                  <th className="p-3">Progreso</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950/60">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-purple-300/60 font-['Fredoka']">
                      No hay participantes registrados todavía.
                    </td>
                  </tr>
                ) : (
                  players.map((p) => {
                    const storesDone = p.unlockedStores?.length || 0;
                    const isComplete = storesDone >= 10;
                    return (
                      <tr key={p.id} className="hover:bg-purple-900/20 transition-colors">
                        <td className="p-3 font-semibold text-white flex items-center gap-2">
                          <span>{p.gender === 'girl' ? '🧙‍♀️' : '🧟‍♂️'}</span>
                          <span className="truncate max-w-[120px]">{p.playerName}</span>
                        </td>
                        <td className="p-3 text-slate-300 truncate max-w-[130px]">{p.parentName}</td>
                        <td className="p-3 font-mono">
                          <span className="text-amber-400 font-bold">{storesDone}/10</span>
                          <span className="text-slate-400 text-[10px] ml-1">casas</span>
                        </td>
                        <td className="p-3">
                          {isComplete ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold">
                              ✓ Completado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold">
                              En Progreso
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px] font-mono">
                          {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
