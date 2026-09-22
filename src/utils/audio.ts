/**
 * Audio synthesis helper using Web Audio API
 * Generates soft, pleasant chimes, educational fanfare, and ambient background music
 * Offline-capable, zero external asset dependencies, respectful of user settings.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientTimer: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Subtle pleasant chime on successful action (e.g., recorded attendance, added point)
   */
  public playSuccess(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // High-pitched pleasant dual harmonic chime (C6 - G6)
      const notes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6 major triad
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.45);
      });
    } catch {
      // Ignore audio context block
    }
  }

  /**
   * Warm celebration fanfare for honor certificates or top group in class meeting
   */
  public playCelebration(enabled: boolean = true) {
    if (!enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const melody = [
        { f: 523.25, d: 0.12, t: 0.0 },   // C5
        { f: 659.25, d: 0.12, t: 0.12 },  // E5
        { f: 783.99, d: 0.15, t: 0.24 },  // G5
        { f: 1046.5, d: 0.4,  t: 0.40 },  // C6
      ];

      melody.forEach(item => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + item.t);

        gain.gain.setValueAtTime(0.001, now + item.t);
        gain.gain.exponentialRampToValueAtTime(0.12, now + item.t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + item.t + item.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + item.t);
        osc.stop(now + item.t + item.d + 0.05);
      });
    } catch {
      // audio error safeguard
    }
  }

  /**
   * Soft ambient meditative pentatonic bell sequence for school study / homeroom focus
   */
  public startAmbient() {
    if (this.isAmbientPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isAmbientPlaying = true;
    const pentatonicScale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]; // C major pentatonic

    const playRandomBell = () => {
      if (!this.isAmbientPlaying) return;
      const currentCtx = this.getContext();
      if (!currentCtx) return;

      const now = currentCtx.currentTime;
      const freq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];

      const osc = currentCtx.createOscillator();
      const gain = currentCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Very soft background tone (0.02 gain)
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.025, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(currentCtx.destination);

      osc.start(now);
      osc.stop(now + 3.5);

      // Schedule next bell in 2.5 - 4.5 seconds
      const nextDelay = 2500 + Math.random() * 2000;
      this.ambientTimer = window.setTimeout(playRandomBell, nextDelay);
    };

    playRandomBell();
  }

  public stopAmbient() {
    this.isAmbientPlaying = false;
    if (this.ambientTimer !== null) {
      window.clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  public toggleAmbient(shouldPlay: boolean) {
    if (shouldPlay) {
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
  }
}

export const soundEngine = new SoundEngine();
