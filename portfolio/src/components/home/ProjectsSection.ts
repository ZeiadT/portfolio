import type { Project } from '@/domain/types';
import { CarouselGLEngine } from '@/engines/carousel';

export interface ProjectsSectionOptions {
  onProjectSelect?: (project: Project, index: number) => void;
  engine?: CarouselGLEngine;
}

/**
 * ProjectsSection Component
 *
 * Encapsulates the Selected Works editorial projects section and manages
 * the curved 3D WebGL Carousel engine (CarouselGLEngine) lifecycle.
 *
 * Implements:
 * - Editorial section header with "SELECTED WORKS" pulse badge
 * - Active project title and category badge
 * - Padded 2-digit project counter ("01 / 06")
 * - Accessible Prev and Next navigation buttons
 * - Two-way reactive synchronization between DOM UI and 3D WebGL engine
 * - Fully isolated lifecycle (mount, destroy, resize) with zero memory leaks
 */
export class ProjectsSection {
  private projects: Project[];
  private options: ProjectsSectionOptions;

  private container: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private viewportEl: HTMLElement | null = null;
  private counterEl: HTMLElement | null = null;
  private titleEl: HTMLElement | null = null;
  private categoryEl: HTMLElement | null = null;
  private prevBtn: HTMLButtonElement | null = null;
  private nextBtn: HTMLButtonElement | null = null;

  private carouselEngine: CarouselGLEngine | null = null;
  private currentIndex = 0;
  private isDestroyed = false;

  constructor(projects: Project[], options?: ProjectsSectionOptions) {
    this.projects = projects;
    this.options = options ?? {};
    if (this.options.engine) {
      this.carouselEngine = this.options.engine;
    }
  }

  /**
   * Mounts the ProjectsSection into the specified container element.
   */
  public mount(container: HTMLElement): void {
    if (this.isDestroyed || this.container) return;
    this.container = container;

    // 1. Build Section Root DOM
    const root = document.createElement('section');
    root.className =
      'projects-section relative w-full flex-1 flex flex-col justify-between select-none py-4 sm:py-6 lg:py-8';
    root.setAttribute('data-testid', 'projects-section');
    this.rootEl = root;

    // 2. Build Header
    const header = document.createElement('div');
    header.className =
      'w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]';

    // Left info block (Badge + Project Title + Category)
    const leftBlock = document.createElement('div');
    leftBlock.className = 'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4';

    const badge = document.createElement('div');
    badge.setAttribute('data-testid', 'projects-badge');
    badge.className =
      'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4421]/10 border border-[#ff4421]/20 text-[#ff4421] text-xs font-mono font-semibold tracking-widest uppercase';
    badge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-[#ff4421] animate-pulse"></span>SELECTED WORKS';
    leftBlock.appendChild(badge);

    const titleCategoryBlock = document.createElement('div');
    titleCategoryBlock.className = 'flex items-baseline gap-3';

    const titleEl = document.createElement('h2');
    titleEl.setAttribute('data-testid', 'active-project-title');
    titleEl.className = 'text-xl sm:text-2xl font-light tracking-tight text-neutral-100';
    titleEl.textContent = this.projects[0]?.title ?? '';
    this.titleEl = titleEl;
    titleCategoryBlock.appendChild(titleEl);

    const categoryEl = document.createElement('span');
    categoryEl.setAttribute('data-testid', 'active-project-category');
    categoryEl.className =
      'px-2.5 py-0.5 text-xs font-mono rounded-full bg-white/5 border border-white/10 text-neutral-400';
    categoryEl.textContent = this.projects[0]?.category ?? '';
    this.categoryEl = categoryEl;
    titleCategoryBlock.appendChild(categoryEl);

    leftBlock.appendChild(titleCategoryBlock);
    header.appendChild(leftBlock);

    // Right navigation controls block (Counter + Prev / Next buttons)
    const rightBlock = document.createElement('div');
    rightBlock.className = 'flex items-center gap-4 self-end sm:self-auto';

    const counterEl = document.createElement('span');
    counterEl.setAttribute('data-testid', 'projects-counter');
    counterEl.className = 'font-mono text-sm tracking-widest text-neutral-400 tabular-nums';
    counterEl.textContent = this.formatCounter(0);
    this.counterEl = counterEl;
    rightBlock.appendChild(counterEl);

    const navButtons = document.createElement('div');
    navButtons.className = 'flex items-center gap-2';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.setAttribute('data-testid', 'projects-prev-btn');
    prevBtn.setAttribute('aria-label', 'Previous project');
    prevBtn.className =
      'group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:border-[#ff4421]/50 hover:bg-[#ff4421]/10 transition-all duration-200 cursor-pointer active:scale-95';
    prevBtn.innerHTML =
      '<svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>';
    this.prevBtn = prevBtn;
    navButtons.appendChild(prevBtn);

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-testid', 'projects-next-btn');
    nextBtn.setAttribute('aria-label', 'Next project');
    nextBtn.className =
      'group relative flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:border-[#ff4421]/50 hover:bg-[#ff4421]/10 transition-all duration-200 cursor-pointer active:scale-95';
    nextBtn.innerHTML =
      '<svg class="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>';
    this.nextBtn = nextBtn;
    navButtons.appendChild(nextBtn);

    rightBlock.appendChild(navButtons);
    header.appendChild(rightBlock);
    root.appendChild(header);

    // 3. Carousel Viewport (Where 3D WebGL Canvas is injected)
    const viewport = document.createElement('div');
    viewport.setAttribute('data-testid', 'carousel-viewport');
    viewport.className =
      'carousel-viewport relative w-full flex-1 min-h-[380px] sm:min-h-[440px] md:min-h-[500px] overflow-hidden mt-4';
    this.viewportEl = viewport;
    root.appendChild(viewport);

    // 4. Attach Root to Container
    container.appendChild(root);

    // 5. Initialize & Mount CarouselGLEngine
    if (!this.carouselEngine) {
      this.carouselEngine = new CarouselGLEngine(this.projects, {
        onIndexChange: this.handleEngineIndexChange,
        onProjectSelect: this.handleEngineProjectSelect,
      });
    } else {
      this.carouselEngine.setOnIndexChange(this.handleEngineIndexChange);
      this.carouselEngine.setOnProjectSelect(this.handleEngineProjectSelect);
    }

    this.carouselEngine.mount(viewport);

    // 6. Bind DOM Event Listeners
    prevBtn.addEventListener('click', this.handlePrevClick);
    nextBtn.addEventListener('click', this.handleNextClick);

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
    }

    this.updateUI();
  }

  private handlePrevClick = (): void => {
    if (this.isDestroyed || !this.carouselEngine) return;
    this.prev();
  };

  private handleNextClick = (): void => {
    if (this.isDestroyed || !this.carouselEngine) return;
    this.next();
  };

  private handleResize = (): void => {
    this.resize();
  };

  private handleEngineIndexChange = (index: number): void => {
    if (this.isDestroyed) return;
    this.currentIndex = index;
    this.updateUI();
  };

  private handleEngineProjectSelect = (project: Project, index: number): void => {
    if (this.isDestroyed) return;
    this.options.onProjectSelect?.(project, index);
  };

  /**
   * Advances the carousel to the next project.
   */
  public next(): void {
    if (!this.carouselEngine || this.projects.length === 0) return;
    const target = Math.min(this.projects.length - 1, this.currentIndex + 1);
    this.setSelectedIndex(target);
  }

  /**
   * Rewinds the carousel to the previous project.
   */
  public prev(): void {
    if (!this.carouselEngine || this.projects.length === 0) return;
    const target = Math.max(0, this.currentIndex - 1);
    this.setSelectedIndex(target);
  }

  /**
   * Navigates carousel to a specific project index.
   */
  public setSelectedIndex(index: number, immediate: boolean = false): void {
    if (!this.carouselEngine || this.projects.length === 0) return;
    const clamped = Math.max(0, Math.min(this.projects.length - 1, Math.floor(index)));
    this.currentIndex = clamped;
    this.carouselEngine.setSelectedIndex(clamped, immediate);
    this.updateUI();
  }

  /**
   * Programmatically selects a project and invokes onProjectSelect.
   */
  public selectProject(index: number): void {
    if (this.isDestroyed || index < 0 || index >= this.projects.length) return;
    this.setSelectedIndex(index);
    this.options.onProjectSelect?.(this.projects[index], index);
  }

  /**
   * Updates all DOM text content and reactive counter displays.
   */
  private updateUI(): void {
    if (this.counterEl) {
      this.counterEl.textContent = this.formatCounter(this.currentIndex);
    }
    const project = this.projects[this.currentIndex];
    if (this.titleEl) {
      this.titleEl.textContent = project?.title ?? '';
    }
    if (this.categoryEl) {
      this.categoryEl.textContent = project?.category ?? '';
    }
  }

  private formatCounter(index: number): string {
    const total = this.projects.length;
    if (total === 0) return '00 / 00';
    const currentStr = String(index + 1).padStart(2, '0');
    const totalStr = String(total).padStart(2, '0');
    return `${currentStr} / ${totalStr}`;
  }

  /**
   * Forwards resize event to the carousel engine.
   */
  public resize(): void {
    if (this.isDestroyed || !this.carouselEngine) return;
    this.carouselEngine.resize();
  }

  /**
   * Returns the underlying 3D WebGL Carousel engine instance.
   */
  public getEngine(): CarouselGLEngine | null {
    return this.carouselEngine;
  }

  /**
   * Returns the current active project index.
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Returns the carousel viewport DOM element.
   */
  public getViewport(): HTMLElement | null {
    return this.viewportEl;
  }

  /**
   * Returns the section root DOM element.
   */
  public getRootElement(): HTMLElement | null {
    return this.rootEl;
  }

  /**
   * Cleanly disposes the carousel engine, removes all DOM listeners,
   * and detaches from the parent container.
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }

    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.handlePrevClick);
      this.prevBtn = null;
    }

    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.handleNextClick);
      this.nextBtn = null;
    }

    if (this.carouselEngine) {
      this.carouselEngine.destroy();
      this.carouselEngine = null;
    }

    if (this.rootEl && this.container && this.container.contains(this.rootEl)) {
      this.container.removeChild(this.rootEl);
    }

    this.rootEl = null;
    this.container = null;
    this.viewportEl = null;
    this.counterEl = null;
    this.titleEl = null;
    this.categoryEl = null;
  }
}
