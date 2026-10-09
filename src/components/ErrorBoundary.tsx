import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-['Fredoka']">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 text-3xl shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-bounce">
            🎃
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-300 font-['Lilita_One'] mb-2">
            ¡Truco o Trato!
          </h2>
          <p className="text-sm sm:text-base text-purple-200/90 max-w-sm mb-6 leading-relaxed">
            Un fantasma travieso desvió la pantalla. Tu progreso de tiendas y estrellas está 100% guardado.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-slate-950 font-black font-['Lilita_One'] tracking-wide text-base shadow-[0_0_25px_rgba(52,211,153,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Continuar el Juego</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
