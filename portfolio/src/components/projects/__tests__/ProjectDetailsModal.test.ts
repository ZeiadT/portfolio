import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import gsap from 'gsap';
import { ProjectDetailsModal } from '../ProjectDetailsModal';
import { PROJECTS } from '@/data/projects';
import type { ProjectDetails } from '@/domain/types';

describe('ProjectDetailsModal Component', () => {
  let container: HTMLElement;
  let modal: ProjectDetailsModal;
  const sampleProject: ProjectDetails = PROJECTS[0]; // Dusk

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'modal-root';
    document.body.appendChild(container);
    document.body.style.overflow = '';
    modal = new ProjectDetailsModal();
  });

  afterEach(() => {
    modal.destroy();
    container.remove();
    document.body.style.overflow = '';
    vi.restoreAllMocks();
  });

  describe('1. Mount & DOM Shell Architecture', () => {
    it('mounts dialog shell into container with role="dialog" and aria-modal="true"', () => {
      modal.mount(container);
      const shell = container.querySelector('[role="dialog"]');

      expect(shell).toBeTruthy();
      expect(shell?.getAttribute('aria-modal')).toBe('true');
      expect(shell?.getAttribute('data-project-details-modal')).toBe('true');
    });

    it('renders outer backdrop with bg-black/85 and backdrop-blur-2xl classes', () => {
      modal.mount(container);
      const backdrop = container.querySelector('[data-modal-backdrop]') as HTMLElement;

      expect(backdrop).toBeTruthy();
      expect(backdrop.className).toContain('bg-black/85');
      expect(backdrop.className).toContain('backdrop-blur-2xl');
    });

    it('renders centered floating sheet container with max-w-5xl, rounded-3xl borders and scrollable area', () => {
      modal.mount(container);
      const sheet = container.querySelector('[data-modal-sheet]') as HTMLElement;
      const content = container.querySelector('[data-modal-content]') as HTMLElement;

      expect(sheet).toBeTruthy();
      expect(sheet.className).toContain('max-w-5xl');
      expect(sheet.className).toContain('rounded-3xl');

      expect(content).toBeTruthy();
      expect(content.className).toContain('overflow-y-auto');
    });

    it('initializes in closed state with isOpen() returning false', () => {
      modal.mount(container);
      expect(modal.isOpen()).toBe(false);
    });

    it('handles idempotent mount calls cleanly without duplicate shells', () => {
      modal.mount(container);
      modal.mount(container);

      const shells = container.querySelectorAll('[data-project-details-modal]');
      expect(shells).toHaveLength(1);
    });
  });

  describe('2. Open Lifecycle & Sub-Component Orchestration', () => {
    it('sets isOpen() to true and updates aria-label with project title', () => {
      modal.mount(container);
      modal.open(sampleProject);

      expect(modal.isOpen()).toBe(true);
      const shell = container.querySelector('[role="dialog"]');
      expect(shell?.getAttribute('aria-label')).toBe(`Project details for ${sampleProject.title}`);
    });

    it('locks body scroll to hidden on open while saving previous style', () => {
      document.body.style.overflow = 'scroll';
      modal.mount(container);
      modal.open(sampleProject);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('orchestrates and renders all sub-components', () => {
      modal.mount(container);
      modal.open(sampleProject);

      // 1. ProjectHeader
      const header = container.querySelector('[data-project-header]');
      expect(header).toBeTruthy();
      expect(header?.textContent).toContain(sampleProject.title);
      expect(header?.textContent).toContain(sampleProject.subtitle);

      // 2. ProjectMetrics
      const metrics = container.querySelector('[data-project-metrics]');
      expect(metrics).toBeTruthy();

      // 3. ProjectOverview
      const overview = container.querySelector('[data-project-overview]');
      expect(overview).toBeTruthy();
      expect(overview?.textContent).toContain(sampleProject.longDescription!);

      // 4. ProjectArchitecture
      const arch = container.querySelector('[data-project-architecture]');
      expect(arch).toBeTruthy();

      // 5. ProjectCodeScratchpad (if code snippet present)
      if (sampleProject.codeSnippet) {
        const scratchpad = container.querySelector('[data-project-code-scratchpad]');
        expect(scratchpad).toBeTruthy();
      }

      // 6. ProjectGallery (if screenshots present)
      const gallery = container.querySelector('[data-project-gallery]');
      expect(gallery).toBeTruthy();

      // 7. ProjectFooter
      const footer = container.querySelector('[data-project-footer]');
      expect(footer).toBeTruthy();
    });

    it('replaces content cleanly when opening a second project without residual DOM leaks', () => {
      modal.mount(container);
      modal.open(sampleProject);
      const project2 = PROJECTS[1]; // Cargo
      modal.open(project2);

      const headers = container.querySelectorAll('[data-project-header]');
      expect(headers).toHaveLength(1);
      expect(headers[0].textContent).toContain(project2.title);

      const footers = container.querySelectorAll('[data-project-footer]');
      expect(footers).toHaveLength(1);
    });
  });

  describe('3. FLIP Kinematics with GSAP', () => {
    it('executes GSAP zoom animation when opening with default params', () => {
      const fromToSpy = vi.spyOn(gsap, 'fromTo');
      modal.mount(container);
      modal.open(sampleProject);

      expect(fromToSpy).toHaveBeenCalled();
    });

    it('calculates origin and offset transition when sourceRect is provided', () => {
      const fromToSpy = vi.spyOn(gsap, 'fromTo');
      modal.mount(container);

      const mockRect = {
        left: 100,
        top: 200,
        width: 300,
        height: 200,
        right: 400,
        bottom: 400,
        x: 100,
        y: 200,
        toJSON: () => {},
      } as DOMRect;

      modal.open(sampleProject, mockRect);

      expect(fromToSpy).toHaveBeenCalled();
      const calls = fromToSpy.mock.calls;
      // At least one call should have target matching sheetEl or backdropEl
      expect(calls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Dismissals', () => {
    it('closes modal and restores body scroll on close() method call', () => {
      document.body.style.overflow = 'visible';
      modal.mount(container);
      modal.open(sampleProject);
      expect(modal.isOpen()).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');

      const onCloseSpy = vi.fn();
      modal.setOnClose(onCloseSpy);

      modal.close();

      expect(modal.isOpen()).toBe(false);
      expect(document.body.style.overflow).toBe('visible');
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('closes modal when Escape key is pressed', () => {
      modal.mount(container);
      const onCloseSpy = vi.fn();
      modal.setOnClose(onCloseSpy);
      modal.open(sampleProject);

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      window.dispatchEvent(escEvent);

      expect(modal.isOpen()).toBe(false);
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('closes modal when backdrop outside sheet is clicked', () => {
      modal.mount(container);
      const onCloseSpy = vi.fn();
      modal.setOnClose(onCloseSpy);
      modal.open(sampleProject);

      const backdrop = container.querySelector('[data-modal-backdrop]') as HTMLElement;
      backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(modal.isOpen()).toBe(false);
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('does not close modal when sheet inside backdrop is clicked', () => {
      modal.mount(container);
      const onCloseSpy = vi.fn();
      modal.setOnClose(onCloseSpy);
      modal.open(sampleProject);

      const sheet = container.querySelector('[data-modal-sheet]') as HTMLElement;
      sheet.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(modal.isOpen()).toBe(true);
      expect(onCloseSpy).not.toHaveBeenCalled();
    });

    it('closes modal when header close button is clicked', () => {
      modal.mount(container);
      const onCloseSpy = vi.fn();
      modal.setOnClose(onCloseSpy);
      modal.open(sampleProject);

      const closeBtn = container.querySelector('[data-close-button]') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();

      expect(modal.isOpen()).toBe(false);
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('closes modal on mobile downward swipe gesture (dy > 100px)', () => {
      modal.mount(container);
      const onCloseSpy = vi.fn();
      modal.setOnClose(onCloseSpy);
      modal.open(sampleProject);

      const sheet = container.querySelector('[data-modal-sheet]') as HTMLElement;

      const touchStartEvent = new Event('touchstart', { bubbles: true }) as any;
      touchStartEvent.touches = [{ clientX: 150, clientY: 50 }];
      sheet.dispatchEvent(touchStartEvent);

      const touchEndEvent = new Event('touchend', { bubbles: true }) as any;
      touchEndEvent.changedTouches = [{ clientX: 150, clientY: 200 }]; // dy = 150 > 100
      sheet.dispatchEvent(touchEndEvent);

      expect(modal.isOpen()).toBe(false);
      expect(onCloseSpy).toHaveBeenCalledTimes(1);
    });

    it('does not close modal on small swipe gesture (dy <= 100px) or upward swipe', () => {
      modal.mount(container);
      modal.open(sampleProject);

      const sheet = container.querySelector('[data-modal-sheet]') as HTMLElement;

      // Small swipe
      const touchStartEvent = new Event('touchstart', { bubbles: true }) as any;
      touchStartEvent.touches = [{ clientX: 150, clientY: 50 }];
      sheet.dispatchEvent(touchStartEvent);

      const touchEndEvent = new Event('touchend', { bubbles: true }) as any;
      touchEndEvent.changedTouches = [{ clientX: 150, clientY: 100 }]; // dy = 50 <= 100
      sheet.dispatchEvent(touchEndEvent);

      expect(modal.isOpen()).toBe(true);

      // Upward swipe
      touchStartEvent.touches = [{ clientX: 150, clientY: 200 }];
      sheet.dispatchEvent(touchStartEvent);

      touchEndEvent.changedTouches = [{ clientX: 150, clientY: 50 }]; // dy = -150
      sheet.dispatchEvent(touchEndEvent);

      expect(modal.isOpen()).toBe(true);
    });
  });

  describe('5. Focus Management', () => {
    it('restores focus to previous active element on close', () => {
      const triggerBtn = document.createElement('button');
      triggerBtn.id = 'trigger-btn';
      document.body.appendChild(triggerBtn);
      triggerBtn.focus();

      modal.mount(container);
      modal.open(sampleProject);

      modal.close();

      expect(document.activeElement).toBe(triggerBtn);
      triggerBtn.remove();
    });
  });

  describe('6. Teardown Lifecycle', () => {
    it('destroy() unmounts all sub-components, removes DOM nodes, and restores scroll lock', () => {
      document.body.style.overflow = 'auto';
      modal.mount(container);
      modal.open(sampleProject);

      modal.destroy();

      expect(modal.isOpen()).toBe(false);
      expect(document.body.style.overflow).toBe('auto');
      expect(container.children.length).toBe(0);
    });

    it('safely handles open() and close() calls after destroy()', () => {
      modal.mount(container);
      modal.destroy();

      expect(() => modal.open(sampleProject)).not.toThrow();
      expect(() => modal.close()).not.toThrow();
      expect(modal.isOpen()).toBe(false);
    });
  });
});
