import './style.css';
import { PROJECTS } from '@/data/projects';
import { CarouselGLEngine } from '@/engines/carousel';
import { ElasticBandEngine, setupMarqueeTrack } from '@/engines/band';
import { GlareNavEngine } from '@/engines/glare';
import { CursorTip } from '@/components/cursor/CursorTip';
import { buildSplashTimeline } from '@/engines/band/splashTimeline';

class App {
  private carouselEngine: CarouselGLEngine;
  private bandEngine: ElasticBandEngine;
  private glareEngine: GlareNavEngine;
  private cursorTip: CursorTip;
  private currentTimeline: gsap.core.Timeline | null = null;

  constructor() {
    this.carouselEngine = new CarouselGLEngine(PROJECTS);
    this.bandEngine = new ElasticBandEngine();
    this.glareEngine = new GlareNavEngine();
    this.cursorTip = new CursorTip({ label: 'Drag to stretch' });
  }

  public init(): void {
    // 1. Mount Background Carousel & Glare Engines
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
      this.carouselEngine.mount(carouselContainer);
    }

    const glareContainer = document.body;
    this.glareEngine.mount(glareContainer);

    // 2. Mount Cursor Guidance Tip (starts hidden in circle state)
    this.cursorTip.mount(document.body);

    // 3. Update project stats counter
    const counterEl = document.getElementById('project-counter');
    if (counterEl) {
      counterEl.textContent = `${PROJECTS.length} Featured Systems · Ready for Deployment`;
    }

    // 4. Setup Marquee Track and Run Authentic Splash Sequence
    this.runSplashSequence();

    // 5. Connect Replay Action
    const replayBtn = document.getElementById('replay-btn');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        this.replay();
      });
    }

    console.log(`[Portfolio] Bootstrapped with ${PROJECTS.length} domain projects.`);
  }

  private runSplashSequence(): void {
    setupMarqueeTrack();

    const brandBar = document.getElementById('brand-bar');
    const curtain = document.getElementById('curtain');
    const heroWrapper = document.getElementById('hero-wordmark-wrapper');
    const heroWordmark = document.getElementById('hero-wordmark');
    const heroChars = document.querySelectorAll<HTMLElement>('.hero-char');
    const satellites = document.querySelectorAll<HTMLElement>('.satellite-item');
    const brandTrack = document.getElementById('brand-track');
    const backgroundShader = document.getElementById('shader-background');

    if (!curtain || !heroWrapper || !heroWordmark || !brandTrack) {
      console.warn('[Splash] Missing required splash elements');
      return;
    }

    if (brandBar) {
      this.bandEngine.mount(brandBar);
    }

    this.currentTimeline = buildSplashTimeline(
      {
        curtain,
        heroWrapper,
        heroWordmark,
        heroChars,
        satellites,
        brandTrack,
        backgroundShader,
      },
      {
        onMarqueeReady: () => {
          // Band is active and shader is visible -> Reveal circle-to-pill guidance
          this.cursorTip.reveal();
        },
      }
    );
  }

  public replay(): void {
    if (this.currentTimeline) {
      this.currentTimeline.kill();
    }
    this.cursorTip.hide();
    this.runSplashSequence();
  }
}

// Bootstrap on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
  });
} else {
  const app = new App();
  app.init();
}
