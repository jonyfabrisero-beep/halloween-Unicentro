// Web Audio API Synthesizer & MP3 Soundtrack Player for Immersive Halloween Ambience
// Plays high-fidelity background music (/musica_fondo.mp3) with procedural wind and owls

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private isRunning = false;
  private isMuted = false;
  private baseVolume = 0.75;
  private owlTimer: number | null = null;
  private woodTimer: number | null = null;
  private bgMusic: HTMLAudioElement | null = null;

  private initMusic() {
    if (!this.bgMusic && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/musica_fondo.mp3');
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = this.isMuted ? 0 : this.baseVolume * 0.65;
        this.bgMusic = audio;
      } catch (err) {
        console.warn('Audio element initialization notice:', err);
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.value = this.isMuted ? 0 : 0.12 * this.baseVolume;
        this.ambientGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public start() {
    this.initContext();
    this.initMusic();

    this.isRunning = true;

    // Play background soundtrack
    if (this.bgMusic) {
      this.bgMusic.volume = this.isMuted ? 0 : this.baseVolume * 0.65;
      this.bgMusic.play().catch(() => {
        // Browser autoplay policy will resume on first user interaction
      });
    }

    // Layer subtle procedural breeze & night sounds underneath
    this.startWindLoop();
    this.scheduleNextOwl();
    this.scheduleNextWood();
  }

  public stop() {
    this.isRunning = false;
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
    this.stopWindLoop();

    if (this.owlTimer !== null) {
      window.clearTimeout(this.owlTimer);
      this.owlTimer = null;
    }
    if (this.woodTimer !== null) {
      window.clearTimeout(this.woodTimer);
      this.woodTimer = null;
    }
  }

  public setVolume(volume: number) {
    this.baseVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic && !this.isMuted) {
      this.bgMusic.volume = this.baseVolume * 0.65;
    }
    if (this.ambientGain && this.ctx && !this.isMuted) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0.12 * this.baseVolume, now + 0.15);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgMusic) {
      this.bgMusic.volume = muted ? 0 : this.baseVolume * 0.65;
      if (!muted && this.isRunning && this.bgMusic.paused) {
        this.bgMusic.play().catch(() => {});
      }
    }
    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.linearRampToValueAtTime(muted ? 0 : 0.12 * this.baseVolume, now + 0.3);
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Continuous gentle autumn wind using Brown noise and dynamic LFO filter
   */
  private startWindLoop() {
    if (!this.ctx || !this.ambientGain) return;
    try {
      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 5; // 5-second seamless brown noise loop
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise integration
        lastOut = (lastOut + 0.025 * white) / 1.025;
        data[i] = lastOut * 3.2;
      }

      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = buffer;
      this.windSource.loop = true;

      // Filter: warm bandpass simulating valley breeze
      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 240;
      windFilter.Q.value = 1.6;

      // LFO for slow undulating wind gusts
      this.windLfo = this.ctx.createOscillator();
      this.windLfo.frequency.value = 0.11; // 9-second slow breath

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 120; // sweeps frequency between 120Hz and 360Hz

      this.windLfo.connect(lfoGain);
      lfoGain.connect(windFilter.frequency);

      const windGain = this.ctx.createGain();
      windGain.gain.value = 0.055; // gentle, non-fatiguing level

      this.windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ambientGain);

      this.windLfo.start();
      this.windSource.start();
    } catch {}
  }

  private stopWindLoop() {
    try {
      if (this.windSource) {
        this.windSource.stop();
        this.windSource.disconnect();
        this.windSource = null;
      }
      if (this.windLfo) {
        this.windLfo.stop();
        this.windLfo.disconnect();
        this.windLfo = null;
      }
    } catch {}
  }

  /**
   * Distant Owl Call ("Hooo... Hoo-Hooo")
   */
  public playOwlCall() {
    if (this.isMuted || !this.ctx || !this.ambientGain) return;
    try {
      const now = this.ctx.currentTime;

      // Distance filter to make it sound far in the misty woods
      const distantFilter = this.ctx.createBiquadFilter();
      distantFilter.type = 'lowpass';
      distantFilter.frequency.value = 650;
      distantFilter.connect(this.ambientGain);

      const owlMasterGain = this.ctx.createGain();
      owlMasterGain.gain.value = 0.085;
      owlMasterGain.connect(distantFilter);

      // 1st Hoot: soft introductory call
      this.synthesizeOwlHoot(now + 0.1, 0.55, 345, 305, owlMasterGain);

      // 2nd Hoot: shorter preparatory chirp
      this.synthesizeOwlHoot(now + 0.85, 0.3, 335, 310, owlMasterGain);

      // 3rd Hoot: long resonant finishing call
      this.synthesizeOwlHoot(now + 1.3, 0.7, 355, 290, owlMasterGain);
    } catch {}
  }

  private synthesizeOwlHoot(
    startTime: number,
    duration: number,
    startFreq: number,
    endFreq: number,
    destination: AudioNode
  ) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

      // Subtle vibrato
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.value = 5.2; // 5Hz gentle warble
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.value = 4.5;
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);

      // Volume envelope: smooth swelling bell curve
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(1, startTime + duration * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(destination);

      vibrato.start(startTime);
      vibrato.stop(startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {}
  }

  /**
   * Snapping twigs and creaking wood branches
   */
  public playTwigCrack() {
    if (this.isMuted || !this.ctx || !this.ambientGain) return;
    try {
      const now = this.ctx.currentTime;
      // 2 to 4 rapid dry micro-snaps
      const clicks = 2 + Math.floor(Math.random() * 3);
      let offset = 0;

      for (let i = 0; i < clicks; i++) {
        offset += 0.035 + Math.random() * 0.045;
        const snapTime = now + offset;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 900 + Math.random() * 1100;
        filter.Q.value = 5.0 + Math.random() * 3.5;
        filter.connect(this.ambientGain);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.09 + Math.random() * 0.05, snapTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, snapTime + 0.04);
        gain.connect(filter);

        const bufferSize = Math.floor(this.ctx.sampleRate * 0.045);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          output[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.22));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.connect(gain);
        noise.start(snapTime);
      }
    } catch {}
  }

  /**
   * Deep slow wood creak
   */
  public playBranchCreak() {
    if (this.isMuted || !this.ctx || !this.ambientGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      filter.type = 'bandpass';
      filter.frequency.value = 340;
      filter.Q.value = 6;

      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.5);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }

  // Periodic stochastic scheduler for owls
  private scheduleNextOwl() {
    if (!this.isRunning) return;
    // Next owl in 14 to 28 seconds
    const delay = 14000 + Math.random() * 14000;
    this.owlTimer = window.setTimeout(() => {
      if (this.isRunning && !this.isMuted) {
        this.playOwlCall();
      }
      this.scheduleNextOwl();
    }, delay);
  }

  // Periodic stochastic scheduler for twigs and branch creaks
  private scheduleNextWood() {
    if (!this.isRunning) return;
    // Next twig/branch crack in 8 to 17 seconds
    const delay = 8000 + Math.random() * 9000;
    this.woodTimer = window.setTimeout(() => {
      if (this.isRunning && !this.isMuted) {
        if (Math.random() > 0.4) {
          this.playTwigCrack();
        } else {
          this.playBranchCreak();
        }
      }
      this.scheduleNextWood();
    }, delay);
  }
}

export const ambientSound = new AmbientSoundEngine();
