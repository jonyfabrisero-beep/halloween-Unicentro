import React, { useState } from 'react';
import { PlayerData } from '../types/game';
import { STORES_DATA } from '../data/stores';
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
  Gift,
  QrCode,
  Printer
} from 'lucide-react';

const ADMIN_PASSCODE = 'Uni2026mcy';
const ADMIN_STORAGE_KEY = 'unicentro_admin_authenticated';

interface AdminModalProps {
  onClose: () => void;
  onRefreshCurrentPlayer: () => void;
  initialTab?: 'participants' | 'qr_vault';
}

export const AdminModal: React.FC<AdminModalProps> = ({
  onClose,
  onRefreshCurrentPlayer,
  initialTab = 'participants',
}) => {
  // Check if authenticated in current session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  });
  const [activeTab, setActiveTab] = useState<'participants' | 'qr_vault'>(initialTab);
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

  const handleTogglePrize = (playerId: string) => {
    const updated = storageService.togglePrizeDelivered(playerId);
    if (updated) {
      soundEffects.playStarChime(3);
      setPlayers(storageService.getAllPlayers());
      onRefreshCurrentPlayer();
    }
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

  const handlePrintQRs = () => {
    window.print();
  };

  const completedCount = players.filter((p) => (p.unlockedStores?.length || 0) >= 10).length;
  const prizesDeliveredCount = players.filter((p) => !!p.prizeDelivered).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 text-white select-none overflow-y-auto">
      {/* 1. ADMIN CODE GATE (If not authenticated) */}
      {!isAuthenticated ? (
        <div 
          className={`relative w-full max-w-md bg-gradient-to-b from-slate-950 via-[#19092B] to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.35)] my-auto text-center transition-transform ${
            isShaking ? 'animate-wiggle' : ''
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
            Panel de Supervisión y QRs
          </h2>
          <p className="text-xs text-slate-300 font-['Fredoka'] mt-1.5 mb-6 leading-relaxed">
            Ingresa la contraseña de seguridad administrativa para ver participantes, marcar la entrega de premios y consultar los códigos QR.
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
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Introduce la contraseña"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-purple-500/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white font-mono placeholder:text-slate-500 text-sm outline-none transition-all"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-['Fredoka']">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm font-['Lilita_One'] tracking-wider shadow-lg hover:shadow-amber-500/25 active:scale-98 transition-all cursor-pointer"
            >
              VERIFICAR Y ACCEDER
            </button>
          </form>
        </div>
      ) : (
        /* 2. AUTHENTICATED ADMIN DASHBOARD */
        <div className="relative w-full max-w-5xl bg-gradient-to-b from-slate-950 via-[#100624] to-slate-950 border-2 border-emerald-500/60 rounded-3xl p-4 sm:p-7 shadow-[0_0_50px_rgba(16,185,129,0.3)] my-auto max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/60 pb-3 mb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sesión Admin Activa · Luma CSV Sync</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Lilita_One']">
                Seguimiento y Entrega de Premios · Halloween Unicentro
              </h2>
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-3 bg-purple-950/40 p-1 rounded-2xl border border-purple-900/60">
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-['Fredoka'] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'participants'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Lista de Participantes ({players.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('qr_vault')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-['Fredoka'] flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'qr_vault'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black'
                  : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Bóveda de Códigos QR (10 Tiendas)</span>
            </button>
          </div>

          {activeTab === 'participants' ? (
            <>
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
                <div className="p-2.5 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-white font-mono">{players.length}</div>
                    <div className="text-[10px] text-purple-300 font-['Fredoka']">Registrados</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-300">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-emerald-300 font-mono">{completedCount}</div>
                    <div className="text-[10px] text-emerald-300/80 font-['Fredoka']">10/10 Casas</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-pink-950/40 border border-pink-800/60 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-pink-900/60 text-pink-300">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-pink-300 font-mono">{prizesDeliveredCount}</div>
                    <div className="text-[10px] text-pink-300/80 font-['Fredoka']">Premios Entregados</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-900/60 text-amber-300">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-amber-300 font-mono">
                      {players.reduce((acc, p) => acc + (p.unlockedStores?.length || 0), 0)}
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-['Fredoka']">QRs Escaneados</div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs font-['Lilita_One'] tracking-wide shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
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
                      className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 text-xs font-['Fredoka'] flex items-center gap-1.5 transition-colors cursor-pointer"
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
                      className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs font-['Fredoka'] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Nuevo Jugador</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Participants Table with "Premio Entregado" Checking Column */}
              <div className="flex-1 overflow-auto rounded-2xl border border-purple-900/60 bg-black/40">
                <table className="w-full text-left text-xs font-['Fredoka']">
                  <thead className="bg-purple-950/80 text-purple-200 uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="p-2.5">Niño / Avatar</th>
                      <th className="p-2.5">Representante</th>
                      <th className="p-2.5">Progreso</th>
                      <th className="p-2.5">Estado</th>
                      <th className="p-2.5 text-center">Premio Entregado</th>
                      <th className="p-2.5">Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-950/60">
                    {players.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-purple-300/60 font-['Fredoka']">
                          No hay participantes registrados todavía.
                        </td>
                      </tr>
                    ) : (
                      players.map((p) => {
                        const storesDone = p.unlockedStores?.length || 0;
                        const isComplete = storesDone >= 10;
                        return (
                          <tr key={p.id} className="hover:bg-purple-900/20 transition-colors">
                            <td className="p-2.5 font-semibold text-white flex items-center gap-2">
                              <span>{p.gender === 'girl' ? '🧙‍♀️' : '🧟‍♂️'}</span>
                              <span className="truncate max-w-[120px]">{p.playerName}</span>
                            </td>
                            <td className="p-2.5 text-slate-300 truncate max-w-[130px]">{p.parentName}</td>
                            <td className="p-2.5 font-mono">
                              <span className="text-amber-400 font-bold">{storesDone}/10</span>
                              <span className="text-slate-400 text-[10px] ml-1">casas</span>
                            </td>
                            <td className="p-2.5">
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
                            {/* Interactive Prize Delivered Checking Column */}
                            <td className="p-2.5 text-center">
                              <button
                                onClick={() => handleTogglePrize(p.id)}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                                  p.prizeDelivered
                                    ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)] hover:bg-emerald-500/35'
                                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:border-amber-400/60 hover:text-amber-300'
                                }`}
                                title={
                                  p.prizeDelivered
                                    ? 'Premio entregado. Clic para desmarcar.'
                                    : 'Clic para marcar premio como entregado.'
                                }
                              >
                                <Gift
                                  className={`w-3.5 h-3.5 ${
                                    p.prizeDelivered ? 'text-emerald-400 animate-bounce' : 'text-slate-500'
                                  }`}
                                />
                                <span>{p.prizeDelivered ? 'Entregado ✓' : 'Pendiente'}</span>
                              </button>
                            </td>
                            <td className="p-2.5 text-slate-400 text-[11px] font-mono">
                              {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* QR Vault Grid */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2">
                <p className="text-xs text-purple-200/80 font-['Fredoka']">
                  QRs oficiales para imprimir o respaldar en caso de contingencia.
                </p>
                <button
                  onClick={handlePrintQRs}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir QRs</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1">
                {STORES_DATA.map((store, idx) => {
                  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                    store.code
                  )}&color=000000&bgcolor=FFFFFF`;

                  return (
                    <div
                      key={store.id}
                      className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex flex-col items-center text-center relative"
                    >
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900 border border-purple-600/40 text-[10px] font-mono font-bold text-amber-400">
                        Casa #{store.slotNumber ?? (idx + 1)}
                      </div>

                      <div className="w-10 h-10 mb-1 flex items-center justify-center">
                        <img src={store.imagePath} alt="" className="w-full h-full object-contain" />
                      </div>

                      <div className="text-xs font-bold text-white font-['Fredoka'] truncate max-w-full">
                        {store.name}
                      </div>
                      <div className="text-[10px] text-purple-300/80 mb-2">
                        {store.location}
                      </div>

                      <div className="p-2 bg-white rounded-xl shadow-md mb-2">
                        <img src={qrUrl} alt={`QR ${store.name}`} className="w-24 h-24 object-contain" />
                      </div>

                      <div className="text-[10px] font-mono text-amber-300 font-bold bg-black/40 px-2 py-0.5 rounded-md">
                        {store.code}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
