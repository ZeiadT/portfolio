import gsap from 'gsap';

export interface MarqueeMotionConfig {
  track: HTMLElement;
  centerOffset: number;
  duration?: number;
  accelDuration?: number;
  easeIn?: string;
}

/**
 * MarqueeMotionController
 * Orchestrates continuous kinetic marquee movement:
 * - Starts from absolute standstill (timeScale: 0)
 * - Accelerates smoothly with an ease-in curve (e.g. power2.in) up to cruising speed
 * - Continuously loops linearly at cruising speed (ease: 'none', repeat: -1)
 */
export class MarqueeMotionController {
  private track: HTMLElement;
  private centerOffset: number;
  private duration: number;
  private accelDuration: number;
  private easeIn: string;

  private loopTween: gsap.core.Tween | null = null;
  private accelTween: gsap.core.Tween | null = null;
  private active = false;

  constructor(config: MarqueeMotionConfig) {
    this.track = config.track;
    this.centerOffset = config.centerOffset;
    this.duration = config.duration ?? 32;
    // Default 1.92s: 20% faster acceleration start (reduced from 2.4s)
    this.accelDuration = config.accelDuration ?? 1.92;
    this.easeIn = config.easeIn ?? 'power2.in';
  }

  public isActive(): boolean {
    return this.active;
  }

  public getLoopTween(): gsap.core.Tween | null {
    return this.loopTween;
  }

  public getAccelTween(): gsap.core.Tween | null {
    return this.accelTween;
  }

  public start(): void {
    this.stop();

    const scrollWidth = this.track.scrollWidth;
    // Provide safe fallback distance for headless/unmeasured DOM test environments
    const halfWidth = scrollWidth > 0 ? scrollWidth / 2 : 2000;
    const endX = this.centerOffset - halfWidth;

    gsap.set(this.track, { x: this.centerOffset });

    // 1. Create infinite linear looping tween
    this.loopTween = gsap.fromTo(
      this.track,
      { x: this.centerOffset },
      {
        x: endX,
        duration: this.duration,
        ease: 'none',
        repeat: -1,
      }
    );

    // Start from zero velocity
    this.loopTween.timeScale(0);

    // 2. Animate timeScale with ease-in curve up to cruising speed 1.0
    this.accelTween = gsap.to(this.loopTween, {
      timeScale: 1.0,
      duration: this.accelDuration,
      ease: this.easeIn,
    });

    this.active = true;
  }

  public stop(): void {
    if (this.accelTween) {
      this.accelTween.kill();
      this.accelTween = null;
    }
    if (this.loopTween) {
      this.loopTween.kill();
      this.loopTween = null;
    }
    this.active = false;
  }

  public setCenterOffset(offset: number): void {
    this.centerOffset = offset;
    if (!this.active) {
      gsap.set(this.track, { x: offset });
    }
  }

  public destroy(): void {
    this.stop();
  }
}
