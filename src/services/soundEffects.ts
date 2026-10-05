// Web Audio API Synthesizer for rich, responsive, zero-latency Halloween audio
import { ambientSound } from './ambientAudio';

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private isMuted = false;
  private musicVolume = 0.75;

  constructor() {
    try {
      const saved = localStorage.getItem('halloween_music_volume');
      if (saved !== null) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.musicVolume = parsed;
        }
      }
    } catch {}
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.isMuted ? 0 : this.musicVolume;
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.4;
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    try {
      localStorage.setItem('halloween_music_volume', this.musicVolume.toString());
    } catch {}

    if (this.musicGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, now);
    }

    ambientSound.setVolume(this.musicVolume);

    if (this.musicVolume === 0) {
      if (!this.isMuted) {
        this.setMuted(true);
      }
    } else if (this.isMuted) {
      this.setMuted(false);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    ambientSound.setMuted(muted);
    if (this.musicGain && this.sfxGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(muted ? 0 : this.musicVolume, now);
      this.sfxGain.gain.cancelScheduledValues(now);
      this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.4, now);
    }
    ambientSound.setMuted(muted);
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play a short synth note
  private playNote(freq: number, type: OscillatorType, duration: number, gainValue = 0.3, detune = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (detune) osc.detune.setValueAtTime(detune, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }

  // Play playful bouncy click
  public playBounce() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  // Play star reveal chime (ascending note for each star: 1, 2, or 3)
  public playStarChime(starNumber: 1 | 2 | 3) {
    if (this.isMuted) return;
    const baseFreqs = {
      1: [523.25, 659.25], // C5, E5
      2: [659.25, 783.99, 987.77], // E5, G5, B5
      3: [783.99, 1046.50, 1318.51, 1567.98], // G5, C6, E6, G6
    }[starNumber];

    baseFreqs.forEach((freq, idx) => {
      setTimeout(() => {
        this.playNote(freq, 'triangle', 0.45, 0.25);
      }, idx * 90);
    });
  }

  // Ghost pop sound (high whimsical slide down)
  public playGhostPop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Pumpkin wobble / squash
  public playPumpkinSquish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Padlock open clink
  public playUnlock() {
    if (this.isMuted) return;
    this.playNote(1200, 'sine', 0.1, 0.3);
    setTimeout(() => {
      this.playNote(1800, 'triangle', 0.25, 0.4);
    }, 60);
  }

  // Grand victory fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    const chords = [
      { f: 523.25, d: 0.15, t: 0 },   // C5
      { f: 659.25, d: 0.15, t: 150 }, // E5
      { f: 783.99, d: 0.15, t: 300 }, // G5
      { f: 1046.50, d: 0.5, t: 450 }, // C6
      { f: 987.77, d: 0.15, t: 700 }, // B5
      { f: 1046.50, d: 0.7, t: 850 }, // C6
    ];

    chords.forEach(({ f, d, t }) => {
      setTimeout(() => {
        this.playNote(f, 'sine', d, 0.35);
        this.playNote(f * 1.5, 'triangle', d * 0.8, 0.15);
      }, t);
    });
  }

  // Soft atmospheric rustle of leaves when touching trees
  public playLeafRustle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      [540, 680, 820, 950].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 60, now + idx * 0.035);
        gain.gain.setValueAtTime(0.06, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.16);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.18);
      });
    } catch {}
  }

  // Delegate background music to the high-quality musica_fondo.mp3 soundtrack
  public startMusic() {
    ambientSound.start();
  }

  public stopMusic() {
    ambientSound.stop();
  }
}

export const soundEffects = new SoundEffectsService();
