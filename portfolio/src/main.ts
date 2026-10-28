import './style.css';
import { PROJECTS } from '@/data/projects';
import { CarouselGLEngine } from '@/engines/carousel';
import { ElasticBandEngine } from '@/engines/band';
import { GlareNavEngine } from '@/engines/glare';
import { CursorTip } from '@/components/cursor/CursorTip';
import { buildSplashToBandTimeline } from '@/engines/band/splashTimeline';

class App {
  private carouselEngine: CarouselGLEngine;
  private bandEngine: ElasticBandEngine;
  private glareEngine: GlareNavEngine;
  private cursorTip: CursorTip;
  private isEntered = false;

  constructor() {
    this.carouselEngine = new CarouselGLEngine(PROJECTS);
    this.bandEngine = new ElasticBandEngine();
    this.glareEngine = new GlareNavEngine();
    this.cursorTip = new CursorTip({ label: 'Click to enter' });
  }

  public init(): void {
    // 1. Mount Carousel Engine
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
      this.carouselEngine.mount(carouselContainer);
    }

    // 2. Mount Glare Navigation Engine
    const glareContainer = document.body;
    this.glareEngine.mount(glareContainer);

    // 3. Mount Frosted Glass Cursor Tip
    this.cursorTip.mount(document.body);

    // 4. Update UI with project stats
    const counterEl = document.getElementById('project-counter');
    if (counterEl) {
      counterEl.textContent = `${PROJECTS.length} Featured Systems · Ready for Deployment`;
    }

    // 5. Setup Splash Curtain Interaction
    const splashCurtain = document.getElementById('splash-curtain');
    const splashLogo = document.getElementById('splash-logo');
    const navLogo = document.getElementById('nav-logo');
    const navTabs = document.getElementById('nav-tabs');
    const bandContainer = document.getElementById('band-container');

    if (splashCurtain && splashLogo && navLogo && navTabs && bandContainer) {
      const onEnter = () => {
        if (this.isEntered) return;
        this.isEntered = true;

        // Rapidly dismiss cursor guidance pill
        this.cursorTip.hide();

        // Build and execute seamless transition timeline
        buildSplashToBandTimeline(
          {
            curtain: splashCurtain,
            splashLogo,
            navLogo,
            navTabs,
            bandContainer,
          },
          {
            onCollapseComplete: () => {
              // Mount elastic band engine into the docked top header
              this.bandEngine.mount(bandContainer);
              splashCurtain.style.display = 'none';
            },
          }
        );
      };

      splashCurtain.addEventListener('click', onEnter, { once: true });
    }

    console.log(`[Portfolio] Bootstrapped with ${PROJECTS.length} domain projects.`);
  }
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
