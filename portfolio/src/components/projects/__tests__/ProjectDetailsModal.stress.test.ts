import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import gsap from 'gsap';
import { ProjectDetailsModal } from '../ProjectDetailsModal';
import { PROJECTS } from '@/data/projects';

describe('ProjectDetailsModal Stress & Zero-Leak Suite', () => {
  let container: HTMLElement;
  let modal: ProjectDetailsModal;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'stress-modal-root';
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

  describe('1. Rapid Sequential Open/Close Stress (50 Cycles)', () => {
    it('executes 50 rapid sequential open/close cycles without state corruption or DOM accumulation', () => {
      modal.mount(container);
      const initialBodyOverflow = document.body.style.overflow;

      for (let i = 0; i < 50; i++) {
        const project = PROJECTS[i % PROJECTS.length];
        modal.open(project);
        expect(modal.isOpen()).toBe(true);
        expect(document.body.style.overflow).toBe('hidden');

        modal.close();
        expect(modal.isOpen()).toBe(false);
        expect(document.body.style.overflow).toBe(initialBodyOverflow);
      }

      // Check DOM node stability inside container
      const shells = container.querySelectorAll('[data-project-details-modal]');
      expect(shells).toHaveLength(1);

      // Verify that after final close, opening again renders only 1 set of subcomponents
      modal.open(PROJECTS[0]);
      const headers = container.querySelectorAll('[data-project-header]');
      const footers = container.querySelectorAll('[data-project-footer]');
      expect(headers).toHaveLength(1);
      expect(footers).toHaveLength(1);
    });
  });

  describe('2. Window Event Listener Strict 1:1 Parity', () => {
    it('maintains strict 1:1 parity between window.addEventListener and window.removeEventListener across 50 cycles', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      modal.mount(container);

      // Record any listeners added during mount (if any)
      const mountAdds = addEventListenerSpy.mock.calls.length;
      const mountRemoves = removeEventListenerSpy.mock.calls.length;

      for (let i = 0; i < 50; i++) {
        modal.open(PROJECTS[i % PROJECTS.length]);
        modal.close();
      }

      const totalAdds = addEventListenerSpy.mock.calls.length - mountAdds;
      const totalRemoves = removeEventListenerSpy.mock.calls.length - mountRemoves;

      expect(totalAdds).toBe(totalRemoves);
      expect(totalAdds).toBe(50); // exactly 1 window keydown listener added and removed per cycle
    });

    it('cleans up all active window listeners when destroy() is invoked on an open modal', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      modal.mount(container);
      modal.open(PROJECTS[0]);

      // At this point, modal is open and has added window listeners
      expect(modal.isOpen()).toBe(true);

      // Destroy while open
      modal.destroy();

      const totalAdds = addEventListenerSpy.mock.calls.length;
      const totalRemoves = removeEventListenerSpy.mock.calls.length;

      expect(totalAdds).toBe(totalRemoves);
      expect(modal.isOpen()).toBe(false);
    });
  });

  describe('3. Multi-Project Rapid Switching Stress', () => {
    it('switches between all 6 projects rapidly without residual DOM bleeding or subcomponent leaks', () => {
      modal.mount(container);

      // Rapidly open each project without explicit close in between
      for (let i = 0; i < 30; i++) {
        const project = PROJECTS[i % PROJECTS.length];
        modal.open(project);

        expect(modal.isOpen()).toBe(true);
        const headerTitle = container.querySelector('[data-project-title]');
        expect(headerTitle?.textContent?.trim()).toBe(project.title);

        // Verify exactly one of each subcomponent is present
        expect(container.querySelectorAll('[data-project-header]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-project-footer]')).toHaveLength(1);
        expect(container.querySelectorAll('[data-project-metrics]')).toHaveLength(1);
      }

      modal.close();
      expect(modal.isOpen()).toBe(false);
    });
  });

  describe('4. GSAP Tween Cancellation on Teardown', () => {
    it('cancels active GSAP animations on teardown via gsap.killTweensOf', () => {
      const killTweensSpy = vi.spyOn(gsap, 'killTweensOf');

      modal.mount(container);
      modal.open(PROJECTS[0]);

      modal.destroy();

      expect(killTweensSpy).toHaveBeenCalled();
    });
  });
});
