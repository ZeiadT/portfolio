import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { ProjectsSection } from '../ProjectsSection';
import { PROJECTS } from '@/data/projects';

// Polyfill Canvas 2D context for headless happy-dom environment
const originalGetContext =
  typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.getContext : undefined;

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextType: string,
    ...args: unknown[]
  ) {
    if (contextType === '2d') {
      const self = this as unknown as { _mockCtx2d?: Record<string, unknown> };
      if (!self._mockCtx2d) {
        self._mockCtx2d = {
          canvas: this,
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          font: '',
          textAlign: 'left',
          textBaseline: 'alphabetic',
          globalAlpha: 1,
          shadowColor: '',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          strokeRect: vi.fn(),
          rect: vi.fn(),
          fillText: vi.fn(),
          strokeText: vi.fn(),
          beginPath: vi.fn(),
          closePath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          arc: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          scale: vi.fn(),
          drawImage: vi.fn(),
          clip: vi.fn(),
          roundRect: vi.fn(),
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          measureText: vi.fn((text: string) => ({
            width: text.length * 10,
            actualBoundingBoxAscent: 12,
            actualBoundingBoxDescent: 4,
          })),
        };
      }
      return self._mockCtx2d as unknown as CanvasRenderingContext2D;
    }
    return originalGetContext ? (originalGetContext as Function).apply(this, [contextType, ...args]) : null;
  };
}

describe('Task 7: ProjectsSection DOM Component', () => {
  let container: HTMLElement;
  let section: ProjectsSection | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'carousel-container';
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 1200 });
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 800 });
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (section) {
      section.destroy();
      section = null;
    }
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  afterAll(() => {
    if (typeof HTMLCanvasElement !== 'undefined' && originalGetContext) {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  describe('1. Component Structure & DOM Rendering', () => {
    it('mounts into container and renders section root', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const sectionEl = container.querySelector('[data-testid="projects-section"]');
      expect(sectionEl).toBeTruthy();
      expect(sectionEl?.classList.contains('projects-section')).toBe(true);
    });

    it('renders "SELECTED WORKS" section badge', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const badgeEl = container.querySelector('[data-testid="projects-badge"]');
      expect(badgeEl).toBeTruthy();
      expect(badgeEl?.textContent).toContain('SELECTED WORKS');
    });

    it('renders initial active project counter "01 / 06"', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      expect(counterEl).toBeTruthy();
      expect(counterEl?.textContent?.trim()).toBe('01 / 06');
    });

    it('renders active project title and category badge for project 0', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const titleEl = container.querySelector('[data-testid="active-project-title"]');
      const categoryEl = container.querySelector('[data-testid="active-project-category"]');

      expect(titleEl).toBeTruthy();
      expect(titleEl?.textContent?.trim()).toBe(PROJECTS[0].title);
      expect(categoryEl).toBeTruthy();
      expect(categoryEl?.textContent?.trim()).toBe(PROJECTS[0].category);
    });

    it('renders accessible Prev and Next navigation buttons', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const prevBtn = container.querySelector('[data-testid="projects-prev-btn"]') as HTMLButtonElement;
      const nextBtn = container.querySelector('[data-testid="projects-next-btn"]') as HTMLButtonElement;

      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
      expect(prevBtn.getAttribute('aria-label')).toBe('Previous project');
      expect(nextBtn.getAttribute('aria-label')).toBe('Next project');
    });

    it('mounts CarouselGLEngine into the carousel viewport inside the section', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const engine = section.getEngine();
      expect(engine).toBeTruthy();
      expect(engine?.id).toBe('carousel-gl');

      const viewportEl = container.querySelector('[data-testid="carousel-viewport"]');
      expect(viewportEl).toBeTruthy();
      // WebGL canvas mounted inside viewport
      const canvas = viewportEl?.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });

    it('handles empty projects list gracefully without crashing', () => {
      section = new ProjectsSection([]);
      section.mount(container);

      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      expect(counterEl?.textContent?.trim()).toBe('00 / 00');
    });
  });

  describe('2. Navigation & Reactive State Synchronization', () => {
    it('advances project index and updates counter when Next button is clicked', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const nextBtn = container.querySelector('[data-testid="projects-next-btn"]') as HTMLButtonElement;
      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      const titleEl = container.querySelector('[data-testid="active-project-title"]');

      expect(counterEl?.textContent?.trim()).toBe('01 / 06');
      expect(titleEl?.textContent?.trim()).toBe(PROJECTS[0].title);

      nextBtn.click();

      expect(section.getCurrentIndex()).toBe(1);
      expect(counterEl?.textContent?.trim()).toBe('02 / 06');
      expect(titleEl?.textContent?.trim()).toBe(PROJECTS[1].title);
    });

    it('rewinds project index and updates counter when Prev button is clicked', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      section.setSelectedIndex(3, true);

      const prevBtn = container.querySelector('[data-testid="projects-prev-btn"]') as HTMLButtonElement;
      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      const titleEl = container.querySelector('[data-testid="active-project-title"]');

      expect(counterEl?.textContent?.trim()).toBe('04 / 06');
      expect(titleEl?.textContent?.trim()).toBe(PROJECTS[3].title);

      prevBtn.click();

      expect(section.getCurrentIndex()).toBe(2);
      expect(counterEl?.textContent?.trim()).toBe('03 / 06');
      expect(titleEl?.textContent?.trim()).toBe(PROJECTS[2].title);
    });

    it('clamps Prev button navigation when at index 0', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const prevBtn = container.querySelector('[data-testid="projects-prev-btn"]') as HTMLButtonElement;
      prevBtn.click();

      expect(section.getCurrentIndex()).toBe(0);
      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      expect(counterEl?.textContent?.trim()).toBe('01 / 06');
    });

    it('clamps Next button navigation when at last project', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      section.setSelectedIndex(PROJECTS.length - 1, true);

      const nextBtn = container.querySelector('[data-testid="projects-next-btn"]') as HTMLButtonElement;
      nextBtn.click();

      expect(section.getCurrentIndex()).toBe(PROJECTS.length - 1);
      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      expect(counterEl?.textContent?.trim()).toBe(`0${PROJECTS.length} / 0${PROJECTS.length}`);
    });

    it('updates DOM counter and titles when engine triggers onIndexChange', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const engine = section.getEngine();
      expect(engine).toBeTruthy();

      // Trigger index transition from engine
      engine?.setSelectedIndex(4, true);

      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      const titleEl = container.querySelector('[data-testid="active-project-title"]');
      const categoryEl = container.querySelector('[data-testid="active-project-category"]');

      expect(section.getCurrentIndex()).toBe(4);
      expect(counterEl?.textContent?.trim()).toBe('05 / 06');
      expect(titleEl?.textContent?.trim()).toBe(PROJECTS[4].title);
      expect(categoryEl?.textContent?.trim()).toBe(PROJECTS[4].category);
    });

    it('responds to keyboard arrow navigation events', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      // CarouselGestureController listens on window keydown
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

      expect(section.getCurrentIndex()).toBe(1);
      const counterEl = container.querySelector('[data-testid="projects-counter"]');
      expect(counterEl?.textContent?.trim()).toBe('02 / 06');

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));

      expect(section.getCurrentIndex()).toBe(0);
      expect(counterEl?.textContent?.trim()).toBe('01 / 06');
    });

    it('relays onProjectSelect callback when a project is chosen', () => {
      const onSelect = vi.fn();
      section = new ProjectsSection(PROJECTS, { onProjectSelect: onSelect });
      section.mount(container);

      const engine = section.getEngine();
      engine?.setSelectedIndex(2, true);

      // If user clicks or triggers selection
      section.selectProject(2);
      expect(onSelect).toHaveBeenCalledWith(PROJECTS[2], 2);
    });
  });

  describe('3. Lifecycle & Memory Leak Management', () => {
    it('is idempotent on multiple mount() calls', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);
      section.mount(container);

      const sectionElements = container.querySelectorAll('[data-testid="projects-section"]');
      expect(sectionElements.length).toBe(1);
    });

    it('disposes engine, unbinds button listeners, and removes DOM on destroy()', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const engine = section.getEngine();
      const destroySpy = vi.spyOn(engine!, 'destroy');

      const nextBtn = container.querySelector('[data-testid="projects-next-btn"]') as HTMLButtonElement;

      section.destroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(container.querySelector('[data-testid="projects-section"]')).toBeNull();

      // Clicking after destroy should not throw or change state
      expect(() => nextBtn.click()).not.toThrow();
    });

    it('is safe against multiple destroy() calls', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      expect(() => {
        section?.destroy();
        section?.destroy();
      }).not.toThrow();
    });

    it('forwards resize() call to carouselEngine without throwing', () => {
      section = new ProjectsSection(PROJECTS);
      section.mount(container);

      const engine = section.getEngine();
      const resizeSpy = vi.spyOn(engine!, 'resize');

      section.resize();
      expect(resizeSpy).toHaveBeenCalled();
    });
  });
});
