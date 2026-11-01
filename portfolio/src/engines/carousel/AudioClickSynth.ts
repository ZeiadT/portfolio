/**
 * Mechanical Audio Click Synthesizer for 3D Carousel Engine
 *
 * Implements a zero-external-asset Web Audio API synthesizer that produces
 * high-frequency mechanical tactile ticks when navigating carousel items.
 *
 * Fully resilient to SSR, headless tests, and browsers lacking Web Audio support.
 */

export interface AudioClickSynthOptions {
  enabled?: boolean;
}

export class AudioClickSynth {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private _lastIndex: number = -1;
  private isDestroyed: boolean = false;

  constructor(options?: AudioClickSynthOptions) {
    this.enabled = options?.enabled ?? true;
    this.initContext();
  }

  /**
   * Initializes the AudioContext if available in the global/window scope.
   * Catches any permissions or security errors silently.
   */
  private initContext(): void {
    if (this.isDestroyed) return;
    try {
      const AudioContextClass =
        typeof window !== 'undefined'
          ? window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          : typeof AudioContext !== 'undefined'
            ? AudioContext
            : null;

      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    } catch {
      this.ctx = null;
    }
  }

  /**
   * Safely retrieves the AudioContext or attempts lazy instantiation.
   */
  private getContext(): AudioContext | null {
    if (this.isDestroyed) return null;
    if (!this.ctx) {
      this.initContext();
    }
    return this.ctx;
  }

  /**
   * Current tracking index. Initialized to -1 on mount.
   */
  public get lastIndex(): number {
    return this._lastIndex;
  }

  /**
   * Returns whether audio playback is currently enabled and active.
   */
  public get isEnabled(): boolean {
    return this.enabled && !this.isDestroyed;
  }

  /**
   * Enables or disables synthesized audio output.
   */
  public setEnabled(enabled: boolean): void {
    if (this.isDestroyed) return;
    this.enabled = enabled;
  }

  /**
   * Synthesizes an instantaneous micro-tick impulse with exponential decay.
   *
   * @param pitch Frequency in Hz (default: 1200Hz)
   * @param gain Peak gain amplitude (default: 0.08)
   */
  public playClick(pitch: number = 1200, gain: number = 0.08): void {
    if (!this.enabled || this.isDestroyed) return;

    const ctx = this.getContext();
    if (!ctx) return;

    // Browser autoplay policy: safely resume suspended context on user interaction
    if (ctx.state === 'suspended') {
      try {
        ctx.resume().catch(() => {});
      } catch {
        // Ignore unhandled resume errors
      }
    }

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, now);

      const peakGain = Math.max(0.001, gain);
      const decayDuration = 0.015; // 15ms exponential decay
      const stopTime = now + decayDuration + 0.005;

      gainNode.gain.setValueAtTime(peakGain, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + decayDuration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(stopTime);

      // Clean up Web Audio node references on completion
      osc.onended = () => {
        try {
          osc.disconnect();
          gainNode.disconnect();
        } catch {
          // Ignore disconnection errors on closed contexts
        }
      };
    } catch {
      // Gracefully ignore audio synthesis errors
    }
  }

  /**
   * Monitors index changes and triggers a mechanical click on boundary crossing.
   * Suppresses sound on the initial mount when lastIndex === -1.
   *
   * @param newIndex The currently focused project or item index
   */
  public triggerIndexCrossing(newIndex: number): void {
    if (this.isDestroyed) return;

    if (this._lastIndex === -1) {
      this._lastIndex = newIndex;
      return;
    }

    if (newIndex !== this._lastIndex) {
      this._lastIndex = newIndex;
      this.playClick();
    }
  }

  /**
   * Disposes of the synthesizer, closes the AudioContext, and releases resources.
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.enabled = false;

    if (this.ctx) {
      if (this.ctx.state !== 'closed' && typeof this.ctx.close === 'function') {
        try {
          this.ctx.close().catch(() => {});
        } catch {
          // Ignore close errors
        }
      }
      this.ctx = null;
    }
  }
}
