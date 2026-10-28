import './style.css';
import { PROJECTS } from '@/data/projects';
import { CarouselGLEngine } from '@/engines/carousel';
import { ElasticBandEngine } from '@/engines/band';
import { GlareNavEngine } from '@/engines/glare';

class App {
  private carouselEngine: CarouselGLEngine;
  private bandEngine: ElasticBandEngine;
  private glareEngine: GlareNavEngine;

  constructor() {
    this.carouselEngine = new CarouselGLEngine(PROJECTS);
    this.bandEngine = new ElasticBandEngine();
    this.glareEngine = new GlareNavEngine();
  }

  public init(): void {
    // 1. Mount Carousel Engine
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
      this.carouselEngine.mount(carouselContainer);
    }

    // 2. Mount Elastic Band Engine
    const bandContainer = document.getElementById('band-container');
    if (bandContainer) {
      this.bandEngine.mount(bandContainer);
    }

    // 3. Mount Glare Navigation Engine
    const glareContainer = document.body;
    this.glareEngine.mount(glareContainer);

    // 4. Update UI with project stats
    const counterEl = document.getElementById('project-counter');
    if (counterEl) {
      counterEl.textContent = `${PROJECTS.length} Featured Systems · Ready for Deployment`;
    }

    console.log(`[Portfolio] Bootstrapped with ${PROJECTS.length} domain projects.`);
  }
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
