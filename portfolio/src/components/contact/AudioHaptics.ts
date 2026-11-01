/**
 * AudioHaptics
 * Synthesizes tactile mechanical switch clicks, keyboard clacks, and takeoff swoosh
 * natively via Web Audio API. Zero external audio file assets required.
 */
export class AudioHaptics {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized lazily upon first interaction to obey browser autoplay policies
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch {
        this.ctx = null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Tactile mechanical switch click (12ms pitch drop transient)
   */
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.012);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.012);
    } catch {
      // Audio playback should never throw or disrupt UI flow
    }
  }

  /**
   * Subtle keyboard keystroke clack (8ms acoustic transient)
   */
  public playKeypress(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.008);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.008);
    } catch {
      // Ignore
    }
  }

  /**
   * Airplane launch swoosh: filtered noise upward sweep
   */
  public playSwoosh(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const duration = 0.28;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate soft white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + duration);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(ctx.currentTime);
    } catch {
      // Fallback
    }
  }

  /**
   * Melodic ascending chime upon transmission success (C5 -> E5)
   */
  public playSuccess(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: now, dur: 0.14 },       // C5
        { freq: 659.25, time: now + 0.1, dur: 0.28 }, // E5
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, note.time);

        gain.gain.setValueAtTime(0.22, note.time);
        gain.gain.exponentialRampToValueAtTime(0.001, note.time + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(note.time);
        osc.stop(note.time + note.dur);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Cleanly disposes AudioContext
   */
  public destroy(): void {
    if (this.ctx) {
      try {
        this.ctx.close().catch(() => {});
      } catch {
        // Ignore
      }
      this.ctx = null;
    }
  }
}
