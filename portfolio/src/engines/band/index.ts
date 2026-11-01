import type { Engine } from '@/domain/types';
import { gsap } from 'gsap';
import { calculateHeroScale, createWordmarkHtml } from './wordmark';
import { generateMarqueeTrackHtml, calculateTrackCenterOffset } from './marqueeTrack';
import { buildIntroTimeline } from './introTimeline';
import { BandPhysicsEngine } from './bandPhysics';
import { MarqueeMotionController } from './marqueeMotion';
import { EnterPillController } from './enterPill';
import { NavBarController } from './navBar';
import { buildBandToNavTimeline } from './transitionTimeline';
import type { BentoRevealController } from '@/components/home/BentoRevealController';

export interface ElasticBandEngineOptions {
  curtainEl?: HTMLElement | null;
  backgroundEl?: HTMLElement | null;
  bentoController?: BentoRevealController | (() => BentoRevealController | null) | null;
  onCollapseStart?: () => void;
  onMarqueeReady?: () => void;
  onTransitionComplete?: () => void;
}

/**
 * BOC Elastic Splash Band Engine Adapter
 * Handles the opening intro curtain choreography, pre-aligned zero-jump handoff,
 * calibrated WebGL rubber band physics, and continuous marquee activation.
 */
export class ElasticBandEngine implements Engine {
  public readonly id = 'elastic-band';
  private container: HTMLElement | null = null;
  private curtainEl: HTMLElement | null = null;
  private backgroundEl: HTMLElement | null = null;
  private options: ElasticBandEngineOptions = {};
  private timeline: gsap.core.Timeline | null = null;
  private transitionTimeline: gsap.core.Timeline | null = null;
  private physicsEngine: BandPhysicsEngine | null = null;
  private marqueeMotion: MarqueeMotionController | null = null;
  private enterPill: EnterPillController | null = null;
  private navBar: NavBarController | null = null;
  private resizeListener: (() => void) | null = null;


  constructor(options: ElasticBandEngineOptions = {}) {
    this.options = options;
  }

  public mount(container: HTMLElement, options?: ElasticBandEngineOptions): void {
    this.container = container;
    if (options) {
      this.options = { ...this.options, ...options };
    }

    this.curtainEl = this.options.curtainEl || document.getElementById('intro-curtain') || container;
    this.backgroundEl = this.options.backgroundEl || document.getElementById('shader-background');

    // 1. Populate marquee track if available, or fallback to direct wordmark injection
    const track = container.querySelector<HTMLElement>('#brand-track');
    if (track) {
      track.innerHTML = generateMarqueeTrackHtml({ totalUnits: 6, heroIndex: 2 });
    } else {
      const wordmarkEl = container.querySelector<HTMLElement>('#hero-wordmark') || container;
      wordmarkEl.innerHTML = createWordmarkHtml(true);
    }

    // 2. Initialize WebGL rubber band physics & NavBar if brandBar exists
    const canvas = container.querySelector<HTMLCanvasElement>('#marquee-canvas');
    const brandBar = container.querySelector<HTMLElement>('#brand-bar');
    if (brandBar) {
      this.navBar = new NavBarController({ container: brandBar });
    }
    if (canvas && brandBar) {
      this.physicsEngine = new BandPhysicsEngine(canvas, brandBar);
    }

    // 3. Setup and run intro timeline
    this.startIntro();

    // 4. Bind resize listener
    this.resizeListener = () => this.resize();
    window.addEventListener('resize', this.resizeListener);
  }

  private startIntro(): void {
    if (!this.container) return;

    const track = this.container.querySelector<HTMLElement>('#brand-track');
    const wrapper = this.container.querySelector<HTMLElement>('#hero-wordmark-wrapper') || this.container;
    const wordmarkEl = this.container.querySelector<HTMLElement>('#hero-wordmark') || wrapper;
    const curtain = this.curtainEl || this.container;

    // Reset marquee state
    if (track) {
      track.classList.remove('is-scrolling');
      track.style.transform = 'translate3d(0, 0, 0)';

      // Calculate zero-jump center offset
      const wordmarkRect = wordmarkEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth || 1024;
      const centerOffset = calculateTrackCenterOffset(viewportWidth, wordmarkRect);

      if (this.marqueeMotion) {
        this.marqueeMotion.stop();
        this.marqueeMotion.setCenterOffset(centerOffset);
      } else {
        this.marqueeMotion = new MarqueeMotionController({
          track,
          centerOffset,
          duration: 32,
          accelDuration: 1.72,
          easeIn: 'power2.in',
        });
        this.marqueeMotion.setCenterOffset(centerOffset);
      }
    }

    const chars = this.container.querySelectorAll<HTMLElement>('.hero-char');
    const satellites = this.container.querySelectorAll<HTMLElement>('.satellite-item');

    // Initialize enter pill controller if present in DOM
    const pillEl = typeof document !== 'undefined' ? document.getElementById('enter-pill') : null;
    const textEl = typeof document !== 'undefined' ? document.getElementById('enter-pill-text') : null;
    if (pillEl && textEl) {
      if (this.enterPill) {
        this.enterPill.destroy();
      }
      this.enterPill = new EnterPillController({
        pillElement: pillEl,
        textElement: textEl,
        onClick: () => {
          this.transitionToNav();
        },
      });
    }

    // Calculate natural base width with fallback for test environments
    const naturalWidth = wordmarkEl.offsetWidth || 280;
    const viewportWidth = window.innerWidth || 1024;
    const initialScale = calculateHeroScale(viewportWidth, naturalWidth);

    if (this.timeline) {
      this.timeline.kill();
    }

    this.timeline = buildIntroTimeline({
      curtain,
      wrapper,
      chars,
      satellites,
      background: this.backgroundEl,
      initialScale,
      onCollapseStart: () => {
        this.options.onCollapseStart?.();
      },
      onMarqueeReady: () => {
        // 1. Update dimensions to lock in settled DOM layout
        this.physicsEngine?.updateDimensions();

        // 2. Pre-render a frame on the WebGL canvas BEFORE modifying visibility
        this.physicsEngine?.renderFrame();

        // 3. Instantly activate motion & WebGL engine
        this.marqueeMotion?.start();
        this.physicsEngine?.start();
        track?.classList.add('is-scrolling');

        // 4. Assign data-mirrored="true" to brand-bar (CSS hides DOM track & sets transparent background)
        const brandBar = this.container?.querySelector<HTMLElement>('#brand-bar');
        brandBar?.setAttribute('data-mirrored', 'true');

        // 5. Reveal "Click to enter" pill
        this.enterPill?.animateIn();

        // 6. Fast animate fade-out of the opening curtain
        if (this.curtainEl) {
          gsap.to(this.curtainEl, {
            opacity: 0,
            duration: 0.18,
            ease: 'power1.out',
            onComplete: () => {
              if (this.curtainEl) {
                this.curtainEl.style.display = 'none';
              }
            },
          });
        }

        this.options.onMarqueeReady?.();
      },
    });
  }

  public transitionToNav(callbacks?: { onComplete?: () => void }): gsap.core.Timeline | null {
    if (!this.container) return null;

    const brandBar = this.container.querySelector<HTMLElement>('#brand-bar');
    const brandTrack = this.container.querySelector<HTMLElement>('#brand-track');
    const navLogoAnchor = brandBar?.querySelector<HTMLElement>('[data-nav-anchor]');

    if (!brandBar || !brandTrack || !navLogoAnchor) {
      callbacks?.onComplete?.();
      return null;
    }

    // Stop continuous marquee motion and physics
    this.marqueeMotion?.stop();
    this.physicsEngine?.stop();

    if (this.transitionTimeline) {
      this.transitionTimeline.kill();
    }

    const heroHeader = document.getElementById('hero-header');
    const appContainer = document.getElementById('app');
    const marqueeCanvas = this.container.querySelector<HTMLCanvasElement>('#marquee-canvas');

    const bentoController =
      typeof this.options.bentoController === 'function'
        ? this.options.bentoController()
        : this.options.bentoController;

    this.transitionTimeline = buildBandToNavTimeline({
      brandBar,
      brandTrack,
      navLogoAnchor,
      heroHeader,
      background: this.backgroundEl,
      appContainer,
      marqueeCanvas,
      bentoController,
      onComplete: () => {
        this.navBar?.setMode('nav');
        this.navBar?.revealNavCluster();
        this.options.onTransitionComplete?.();
        callbacks?.onComplete?.();
      },
    });

    return this.transitionTimeline;
  }

  public replay(): void {
    this.marqueeMotion?.stop();
    this.physicsEngine?.stop();
    this.physicsEngine?.updateDimensions();
    const brandBar = this.container?.querySelector<HTMLElement>('#brand-bar');
    brandBar?.removeAttribute('data-mirrored');
    if (this.curtainEl) {
      gsap.killTweensOf(this.curtainEl);
      this.curtainEl.style.display = 'block';
      this.curtainEl.style.opacity = '1';
    }
    const header = document.getElementById('hero-header');
    if (header) {
      gsap.killTweensOf(header);
      header.style.opacity = '0';
    }
    const track = this.container?.querySelector<HTMLElement>('#brand-track');
    if (track) {
      gsap.killTweensOf(track);
      track.style.opacity = '1';
      track.classList.remove('is-scrolling');
    }
    this.startIntro();
  }

  public resize(): void {
    this.physicsEngine?.updateDimensions();

    // Re-adjust track offset if resized before marquee starts
    const track = this.container?.querySelector<HTMLElement>('#brand-track');
    const wordmarkEl = this.container?.querySelector<HTMLElement>('#hero-wordmark');
    if (track && wordmarkEl && !this.marqueeMotion?.isActive()) {
      const wordmarkRect = wordmarkEl.getBoundingClientRect();
      const viewportWidth = window.innerWidth || 1024;
      const centerOffset = calculateTrackCenterOffset(viewportWidth, wordmarkRect);
      this.marqueeMotion?.setCenterOffset(centerOffset);
    }
  }

  public destroy(): void {
    if (this.transitionTimeline) {
      this.transitionTimeline.kill();
      this.transitionTimeline = null;
    }
    if (this.marqueeMotion) {
      this.marqueeMotion.destroy();
      this.marqueeMotion = null;
    }
    if (this.enterPill) {
      this.enterPill.destroy();
      this.enterPill = null;
    }
    if (this.navBar) {
      this.navBar.destroy();
      this.navBar = null;
    }
    if (this.physicsEngine) {
      this.physicsEngine.destroy();
      this.physicsEngine = null;
    }
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    if (this.curtainEl) {
      gsap.killTweensOf(this.curtainEl);
    }
    const track = this.container?.querySelector<HTMLElement>('#brand-track');
    if (track) {
      gsap.killTweensOf(track);
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.flying-wordmark-clone').forEach((el) => el.remove());
    }
    const brandBar = this.container?.querySelector<HTMLElement>('#brand-bar');
    brandBar?.removeAttribute('data-mirrored');
    this.container = null;
    this.curtainEl = null;
    this.backgroundEl = null;
  }
}

