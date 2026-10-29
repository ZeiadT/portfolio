import { gsap } from 'gsap';
import { NAV_DIMENSIONS, TRANSITION_TIMINGS } from './constants';

export type BarMode = 'landing' | 'nav';

export interface NavBarOptions {
  container: HTMLElement;
  initialTab?: string;
  onHomeClick?: () => void;
  onNavClick?: (tab: string) => void;
}

/**
 * NavBarController
 * Manages the dual-mode header bar structure (landing marquee vs docked top navigation).
 * Guarantees zero-jump continuity by housing both the landing and nav elements inside #brand-bar.
 */
export class NavBarController {
  private container: HTMLElement;
  private mode: BarMode = 'landing';
  private selectedTab: string = 'home';
  private anchorEl: HTMLElement | null = null;
  private clusterEl: HTMLElement | null = null;
  private homeLink: HTMLElement | null = null;
  private onHomeClick?: () => void;
  private onNavClick?: (tab: string) => void;

  constructor(options: NavBarOptions) {
    this.container = options.container;
    this.selectedTab = options.initialTab || 'home';
    this.onHomeClick = options.onHomeClick;
    this.onNavClick = options.onNavClick;

    this.mountElements();
    this.setMode('landing');
  }

  private mountElements(): void {
    // 1. Create or query nav-anchor
    let anchor = this.container.querySelector<HTMLElement>('[data-nav-anchor]');
    if (!anchor) {
      anchor = document.createElement('div');
      anchor.setAttribute('data-nav-anchor', 'true');
      anchor.className = 'nav-anchor flex items-center select-none z-50';
      anchor.innerHTML = `
        <a href="/" data-nav-home="true" class="flex items-center text-white font-bold tracking-wider text-xs sm:text-sm uppercase transition-opacity duration-200 hover:opacity-80">
          ZEIAD MOHAMMED <span class="text-[0.7em] ml-1 align-super">®</span>
        </a>
      `;
      this.container.appendChild(anchor);
    }
    this.anchorEl = anchor;
    this.homeLink = anchor.querySelector('[data-nav-home]');
    if (this.homeLink) {
      this.homeLink.addEventListener('click', (e) => {
        if (this.onHomeClick) {
          e.preventDefault();
          this.onHomeClick();
        }
      });
    }

    // 2. Create or query nav-cluster
    let cluster = this.container.querySelector<HTMLElement>('[data-nav-cluster]');
    if (!cluster) {
      cluster = document.createElement('div');
      cluster.setAttribute('data-nav-cluster', 'true');
      cluster.className = 'nav-cluster items-center gap-4 sm:gap-6 text-xs font-semibold tracking-[0.15em] uppercase select-none z-50';
      cluster.innerHTML = `
        <a href="#home" data-nav-link="home" class="nav-tab transition-colors duration-200 hover:text-white">Home</a>
        <a href="#about" data-nav-link="about" class="nav-tab transition-colors duration-200 hover:text-white">About</a>
        <a href="#contact" data-nav-link="contact" class="nav-tab transition-colors duration-200 hover:text-white">Contact</a>
      `;
      this.container.appendChild(cluster);
    }
    this.clusterEl = cluster;

    // Bind link clicks
    cluster.querySelectorAll<HTMLElement>('[data-nav-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const tab = link.getAttribute('data-nav-link') || '';
        this.setSelectedTab(tab);
        if (this.onNavClick) {
          e.preventDefault();
          this.onNavClick(tab);
        }
      });
    });

    this.setSelectedTab(this.selectedTab);
  }

  public getSelectedTab(): string {
    return this.selectedTab;
  }

  public setSelectedTab(tab: string): void {
    this.selectedTab = tab;
    if (!this.clusterEl) return;

    this.clusterEl.querySelectorAll<HTMLElement>('[data-nav-link]').forEach((link) => {
      const linkTab = link.getAttribute('data-nav-link');
      const isSelected = linkTab === tab;
      link.setAttribute('data-selected', isSelected ? 'true' : 'false');
      if (isSelected) {
        link.classList.add('text-white');
        link.classList.remove('text-[#0d0d0d]');
      } else {
        link.classList.remove('text-white');
        link.classList.add('text-[#0d0d0d]');
      }
    });
  }

  public getMode(): BarMode {
    return this.mode;
  }

  public getNavHeight(windowWidth?: number): number {
    const width = windowWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1200);
    return width >= NAV_DIMENSIONS.breakpointDesktop
      ? NAV_DIMENSIONS.desktopHeight
      : NAV_DIMENSIONS.mobileHeight;
  }

  public getNavLogoRect(): DOMRect {
    if (this.anchorEl) {
      return this.anchorEl.getBoundingClientRect();
    }
    return this.container.getBoundingClientRect();
  }

  public setMode(mode: BarMode): void {
    this.mode = mode;
    this.container.setAttribute('data-bar-mode', mode);

    if (mode === 'landing') {
      if (this.anchorEl) {
        this.anchorEl.classList.add('invisible', 'pointer-events-none', 'absolute', 'opacity-0');
        this.anchorEl.classList.remove('visible', 'opacity-100', 'relative');
      }
      if (this.clusterEl) {
        this.clusterEl.classList.add('hidden', 'opacity-0', 'pointer-events-none');
        this.clusterEl.classList.remove('flex', 'opacity-100');
      }
    } else {
      // 'nav' mode
      if (this.anchorEl) {
        this.anchorEl.classList.remove('invisible', 'pointer-events-none', 'absolute', 'opacity-0');
        this.anchorEl.classList.add('visible', 'opacity-100', 'relative');
      }
      if (this.clusterEl) {
        this.clusterEl.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
        this.clusterEl.classList.add('flex', 'opacity-100');
      }
    }
  }

  public revealNavCluster(): gsap.core.Timeline {
    const tl = gsap.timeline();
    if (!this.clusterEl) return tl;

    this.clusterEl.classList.remove('hidden', 'pointer-events-none');
    this.clusterEl.classList.add('flex');

    const children = Array.from(this.clusterEl.children) as HTMLElement[];
    tl.fromTo(
      children,
      { opacity: 0, y: 6 },
      {
        opacity: 1,
        y: 0,
        stagger: TRANSITION_TIMINGS.navTabsStagger,
        duration: TRANSITION_TIMINGS.navTabsDuration,
        ease: 'power2.out',
      }
    );
    return tl;
  }

  public destroy(): void {
    if (this.anchorEl) {
      this.anchorEl.remove();
      this.anchorEl = null;
    }
    if (this.clusterEl) {
      this.clusterEl.remove();
      this.clusterEl = null;
    }
    this.homeLink = null;
  }
}
