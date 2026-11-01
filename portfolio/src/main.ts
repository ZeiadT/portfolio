import './style.css';
import { PROJECTS } from '@/data/projects';
import { PROFILE_DATA } from '@/data/profile';
import { ElasticBandEngine } from '@/engines/band';
import { BackgroundCanvasEngine } from '@/engines/background';
import { GlareNavEngine } from '@/engines/glare';
import { ProfileHeader } from '@/components/home/ProfileHeader';
import { ProjectsSection } from '@/components/home/ProjectsSection';

class App {
  private projectsSection: ProjectsSection;
  private bandEngine: ElasticBandEngine;
  private backgroundEngine: BackgroundCanvasEngine;
  private glareEngine: GlareNavEngine;
  private profileHeader: ProfileHeader;

  constructor() {
    this.projectsSection = new ProjectsSection(PROJECTS);
    this.backgroundEngine = new BackgroundCanvasEngine();
    this.profileHeader = new ProfileHeader(PROFILE_DATA);
    this.bandEngine = new ElasticBandEngine({
      bentoController: () => this.profileHeader.getRevealController(),
      onCollapseStart: () => {
        this.backgroundEngine.triggerShockwave();
      },
      onTransitionComplete: () => {
        const appEl = document.getElementById('app');
        if (appEl) {
          appEl.classList.remove('pointer-events-none');
        }
        document.body.classList.remove('overflow-hidden');
        document.body.classList.add('overflow-y-auto');

        // Unmount background canvas engine to conserve GPU memory after transition
        const bgContainer = document.getElementById('shader-background');
        if (bgContainer) {
          bgContainer.style.display = 'none';
        }
        this.backgroundEngine.destroy();
        console.log('[Portfolio] Transitioned to main screen with active Home Profile.');
      },
    });
    this.glareEngine = new GlareNavEngine();
  }

  public init(): void {
    // 1. Mount Background Canvas Shader/ASCII Engine
    const bgContainer = document.getElementById('shader-background');
    if (bgContainer) {
      this.backgroundEngine.mount(bgContainer);
    }

    // 2. Mount Home Profile Header
    const profileContainer = document.getElementById('home-profile-section');
    if (profileContainer) {
      this.profileHeader.mount(profileContainer);
    }

    // 3. Mount Elastic Band / Splash Engine
    const bandContainer = document.getElementById('band-container');
    if (bandContainer) {
      this.bandEngine.mount(bandContainer, {
        bentoController: this.profileHeader.getRevealController(),
      });
    }

    // 4. Mount Projects Section & 3D Carousel Engine
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
      this.projectsSection.mount(carouselContainer);
    }

    // 5. Mount Glare Navigation Engine
    const glareContainer = document.body;
    this.glareEngine.mount(glareContainer);

    // 6. Global resize dispatch
    window.addEventListener('resize', this.handleResize);

    console.log(`[Portfolio] Bootstrapped with ${PROJECTS.length} domain projects.`);
  }

  private handleResize = (): void => {
    this.projectsSection.resize();
  };

  public destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    this.projectsSection.destroy();
    this.profileHeader.destroy();
    this.backgroundEngine.destroy();
    this.bandEngine.destroy();
    this.glareEngine.destroy();
  }
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
