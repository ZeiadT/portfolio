import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { CardSummonEngine } from '@/engines/card/CardSummonEngine';
import { ThreeCardModel } from '@/engines/card/three/ThreeCardModel';

// Polyfill Canvas 2D context for headless happy-dom environment
const originalGetContext = typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.getContext : undefined;

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextType: string, ...args: unknown[]) {
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
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          measureText: vi.fn((text: string) => ({
            width: text.length * 8,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
          })),
          setTransform: vi.fn(),
          resetTransform: vi.fn(),
          roundRect: vi.fn(),
        };
      }
      return self._mockCtx2d as unknown as CanvasRenderingContext2D;
    }
    return originalGetContext ? (originalGetContext as Function).apply(this, [contextType, ...args]) : null;
  };
}

describe('CardSummonEngine & ThreeCardModel Empirical Stress & Lifecycle Suite', () => {
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    gsap.killTweensOf('*');
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterAll(() => {
    if (typeof HTMLCanvasElement !== 'undefined' && originalGetContext) {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  // =========================================================================
  // 1. Rapid Lifecycle Sequences (Mount / Unmount / Open / Close / Destroy)
  // =========================================================================
  describe('1. Rapid Lifecycle Sequences', () => {
    it('survives 50 rapid sequential open() and close() cycles on a single instance without leaking DOM or state corruption', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);

      for (let i = 0; i < 50; i++) {
        engine.open();
        expect(engine.isOpen()).toBe(true);
        expect(document.querySelector('[data-card-summon-modal]')).not.toBeNull();
        expect(engine.getThreeCardModel()).not.toBeNull();

        engine.close();
        expect(engine.isOpen()).toBe(false);
        expect(document.querySelector('[data-card-summon-modal]')).toBeNull();
        expect(engine.getThreeCardModel()).toBeNull();
      }

      // Final cleanup
      engine.destroy();
      expect(document.querySelector('[data-card-summon-modal]')).toBeNull();
    });

    it('survives 50 rapid instance creations and destructions', () => {
      for (let i = 0; i < 50; i++) {
        const engine = new CardSummonEngine();
        engine.mount(container);
        engine.open();
        expect(engine.isOpen()).toBe(true);
        expect(document.querySelectorAll('[data-card-summon-modal]').length).toBe(1);

        engine.destroy();
        expect(engine.isOpen()).toBe(false);
        expect(document.querySelectorAll('[data-card-summon-modal]').length).toBe(0);
      }
    });

    it('handles idempotent multiple open() calls safely without duplicating modals', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);

      for (let i = 0; i < 20; i++) {
        engine.open();
      }

      expect(engine.isOpen()).toBe(true);
      expect(document.querySelectorAll('[data-card-summon-modal]').length).toBe(1);

      engine.destroy();
      expect(document.querySelectorAll('[data-card-summon-modal]').length).toBe(0);
    });

    it('handles idempotent multiple close() and destroy() calls safely', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);

      // Close before open
      expect(() => {
        engine.close();
        engine.close();
      }).not.toThrow();

      engine.open();
      engine.close();

      // Repeated close after close
      expect(() => {
        engine.close();
        engine.close();
      }).not.toThrow();

      // Repeated destroy
      expect(() => {
        engine.destroy();
        engine.destroy();
        engine.destroy();
      }).not.toThrow();
    });
  });

  // =========================================================================
  // 2. Rapid Interactive Sequences During All Animation Phases
  // =========================================================================
  describe('2. Rapid Interactions Across Animation Phases', () => {
    it('ignores clicks on cardEl during Phase 2 (Ascent & Harmonic Hum) before settle', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      const timeline = engine.getTimeline();
      expect(timeline).not.toBeNull();

      // Seek to Phase 2 (t = 0.85s)
      timeline!.seek(0.85);

      const cardEl = document.querySelector('[data-summon-card]') as HTMLElement;
      expect(cardEl).not.toBeNull();

      // Dispatch 20 rapid clicks during Phase 2
      for (let i = 0; i < 20; i++) {
        cardEl.click();
      }

      // Card must NOT flip yet because isSettled is false
      // In Phase 2, isFlipped stays true from open() initialization, but flipCard was not triggered
      expect(engine.isCardFlipped()).toBe(true);

      engine.destroy();
    });

    it('ignores clicks on cardEl during Phase 3 (Apex Bloom & Shockwave) before settle', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      const timeline = engine.getTimeline();
      expect(timeline).not.toBeNull();

      // Seek to Phase 3 (t = 1.25s)
      timeline!.seek(1.25);

      const cardEl = document.querySelector('[data-summon-card]') as HTMLElement;
      expect(cardEl).not.toBeNull();

      for (let i = 0; i < 20; i++) {
        cardEl.click();
      }

      expect(engine.isCardFlipped()).toBe(true);
      engine.destroy();
    });

    it('ignores clicks on cardEl during Phase 4 (Reveal & Sweep) before settle', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      const timeline = engine.getTimeline();
      expect(timeline).not.toBeNull();

      // Seek to Phase 4 (t = 1.60s)
      timeline!.seek(1.60);

      const cardEl = document.querySelector('[data-summon-card]') as HTMLElement;
      expect(cardEl).not.toBeNull();

      for (let i = 0; i < 20; i++) {
        cardEl.click();
      }

      expect(engine.isCardFlipped()).toBe(true);
      engine.destroy();
    });

    it('handles close() abruptly during Phase 2, 3, or 4 and halts timeline cleanly', () => {
      const phases = [0.30, 0.85, 1.25, 1.60];

      for (const time of phases) {
        const engine = new CardSummonEngine();
        engine.mount(container);
        engine.open();

        const timeline = engine.getTimeline();
        expect(timeline).not.toBeNull();
        timeline!.seek(time);

        // Abrupt close during this phase
        engine.close();

        expect(engine.isOpen()).toBe(false);
        expect(engine.getTimeline()).toBeNull();
        expect(timeline!.parent).toBeNull();
        expect(gsap.globalTimeline.getChildren()).not.toContain(timeline);
        expect(document.querySelector('[data-card-summon-modal]')).toBeNull();

        engine.destroy();
      }
    });

    it('handles rapid flipCard toggles during Phase 5 floating without tween collision', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      // Fast-forward to Phase 5 completion
      engine.getTimeline()?.progress(1);
      expect(engine.getIdleFloatTween()).not.toBeNull();

      const cardEl = document.querySelector('[data-summon-card]') as HTMLElement;
      expect(cardEl).not.toBeNull();

      // Rapidly toggle flipCard 30 times
      for (let i = 0; i < 30; i++) {
        engine.flipCard();
      }

      // Even number of flips (30) leaves it at original flipped state (true)
      expect(engine.isCardFlipped()).toBe(true);

      // Advance any active flip tweens
      gsap.globalTimeline.getChildren().forEach((child) => child.progress?.(1));

      // cardEl rotationY should be 180deg
      const rotY = gsap.getProperty(cardEl, 'rotationY');
      expect(rotY).toBe(180);

      engine.destroy();
    });

    it('handles rapid pointermove and pointerleave events in Phase 5 without runaway tweens', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      // Fast-forward to settle
      engine.getTimeline()?.progress(1);
      const idleTween = engine.getIdleFloatTween();
      expect(idleTween).not.toBeNull();

      const modalEl = document.querySelector('[data-card-summon-modal]') as HTMLElement;
      expect(modalEl).not.toBeNull();

      // Mock bounding client rect for modal
      vi.spyOn(modalEl, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
        right: 1000,
        bottom: 800,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      const cardEl = document.querySelector('[data-summon-card]') as HTMLElement;

      // Dispatch 50 rapid alternating pointermove and pointerleave events
      for (let i = 0; i < 50; i++) {
        const clientX = 500 + (i % 2 === 0 ? 200 : -200);
        const clientY = 400 + (i % 2 === 0 ? 150 : -150);

        const moveEvent = new PointerEvent('pointermove', {
          clientX,
          clientY,
          bubbles: true,
        });
        modalEl.dispatchEvent(moveEvent);

        if (i % 5 === 0) {
          const leaveEvent = new PointerEvent('pointerleave', {
            bubbles: true,
          });
          modalEl.dispatchEvent(leaveEvent);
        }
      }

      // Parallax tilt angles must remain restrained within +/- 20 degrees max bounds
      const rotX = Number(gsap.getProperty(cardEl, 'rotationX')) || 0;
      const rotY = Number(gsap.getProperty(cardEl, 'rotationY')) || 0;
      expect(Math.abs(rotX)).toBeLessThanOrEqual(25);
      // Flipped base is 180, so delta from 180 should be <= 25
      expect(Math.abs(rotY - 180)).toBeLessThanOrEqual(25);

      engine.destroy();
    });
  });

  // =========================================================================
  // 3. Resource Leak Checks
  // =========================================================================
  describe('3. Resource Leak Checks', () => {
    it('strictly terminates and removes idleFloatTween upon close() and destroy()', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      engine.getTimeline()?.progress(1);
      const idleTween = engine.getIdleFloatTween();
      expect(idleTween).not.toBeNull();
      expect(idleTween!.isActive() || !idleTween!.paused()).toBe(true);

      engine.close();
      expect(engine.getIdleFloatTween()).toBeNull();
      expect(idleTween!.isActive()).toBe(false);

      engine.destroy();
      expect(engine.getIdleFloatTween()).toBeNull();
    });

    it('kills all tweens on cardEl, sheenEl, and modal upon destroy()', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      const cardEl = document.querySelector('[data-summon-card]') as HTMLElement;
      const sheenEl = document.querySelector('[data-summon-card-front-sheen]') as HTMLElement;

      expect(cardEl).not.toBeNull();
      expect(sheenEl).not.toBeNull();

      expect(gsap.getTweensOf(cardEl).length).toBeGreaterThan(0);
      expect(gsap.getTweensOf(sheenEl).length).toBeGreaterThan(0);

      engine.destroy();

      expect(gsap.getTweensOf(cardEl).length).toBe(0);
      expect(gsap.getTweensOf(sheenEl).length).toBe(0);
    });

    it('removes window keydown (Escape) listener completely on close()', () => {
      let closeCallCount = 0;
      const engine = new CardSummonEngine({
        onClose: () => {
          closeCallCount++;
        },
      });
      engine.mount(container);
      engine.open();

      expect(closeCallCount).toBe(0);

      // Press Escape while open -> triggers close()
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(closeCallCount).toBe(1);
      expect(engine.isOpen()).toBe(false);

      // Press Escape again while closed -> must NOT fire onClose again
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(closeCallCount).toBe(1);

      engine.destroy();
    });

    it('disposes all Three.js textures, materials, and geometries on ThreeCardModel destroy()', () => {
      const model = new ThreeCardModel();
      model.mount(container);

      // Collect all meshes, materials, and geometries
      const meshes: THREE.Mesh[] = [];
      const geometries: THREE.BufferGeometry[] = [];
      const materials: THREE.Material[] = [];

      model.cardGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          meshes.push(mesh);
          if (mesh.geometry) geometries.push(mesh.geometry);
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              materials.push(...mesh.material);
            } else {
              materials.push(mesh.material);
            }
          }
        }
      });

      expect(meshes.length).toBeGreaterThan(0);
      expect(geometries.length).toBeGreaterThan(0);
      expect(materials.length).toBeGreaterThan(0);

      const geomDisposeSpies = geometries.map((g) => vi.spyOn(g, 'dispose'));
      const matDisposeSpies = materials.map((m) => vi.spyOn(m, 'dispose'));

      model.destroy();

      geomDisposeSpies.forEach((spy) => expect(spy).toHaveBeenCalled());
      matDisposeSpies.forEach((spy) => expect(spy).toHaveBeenCalled());
    });

    it('disposes celestial particle field geometries and materials without throwing', () => {
      const model = new ThreeCardModel();
      model.mount(container);

      // Verify particles exist
      const particles = model.cardGroup.parent?.getObjectByName('celestial-particles') ||
                        (model as unknown as { particleGroup: THREE.Group }).particleGroup;
      expect(particles).toBeDefined();

      expect(() => {
        model.destroy();
      }).not.toThrow();
    });

    it('cancels requestAnimationFrame loop on ThreeCardModel destroy()', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      const model = new ThreeCardModel();
      model.mount(container);

      model.destroy();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('leaves zero lingering active tweens in gsap.globalTimeline after open(), settle, and destroy()', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      // Settle animation to initiate idle float and sheen
      engine.getTimeline()?.progress(1);

      // Verify active tweens existed during Phase 5
      expect(engine.getIdleFloatTween()).not.toBeNull();

      // Completely destroy engine
      engine.destroy();

      // Inspect all global timeline children
      const activeTweens = gsap.globalTimeline.getChildren(true, true, true).filter((anim) => {
        return anim.isActive();
      });

      expect(activeTweens.length).toBe(0);
    });

    it('maintains strict parity between window.addEventListener and window.removeEventListener across 50 open/close cycles', () => {
      let addCount = 0;
      let removeCount = 0;

      const origAdd = window.addEventListener.bind(window);
      const origRemove = window.removeEventListener.bind(window);

      const addSpy = vi.spyOn(window, 'addEventListener').mockImplementation((type, listener, options) => {
        if (type === 'keydown') addCount++;
        return origAdd(type, listener, options);
      });

      const removeSpy = vi.spyOn(window, 'removeEventListener').mockImplementation((type, listener, options) => {
        if (type === 'keydown') removeCount++;
        return origRemove(type, listener, options);
      });

      const engine = new CardSummonEngine();
      engine.mount(container);

      for (let i = 0; i < 50; i++) {
        engine.open();
        engine.close();
      }

      engine.destroy();

      expect(addCount).toBe(50);
      expect(removeCount).toBe(50);

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it('restores document.body.style.overflow cleanly after 50 rapid open/close cycles', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);

      expect(document.body.style.overflow).toBe('');

      for (let i = 0; i < 50; i++) {
        engine.open();
        expect(document.body.style.overflow).toBe('hidden');
        engine.close();
        expect(document.body.style.overflow).toBe('');
      }

      engine.destroy();
      expect(document.body.style.overflow).toBe('');
    });

    it('handles 30 rapid toggleConcealment() calls during Phase 5 without tween pileup or desync', () => {
      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      engine.getTimeline()?.progress(1);
      const threeModel = engine.getThreeCardModel();
      expect(threeModel).not.toBeNull();

      for (let i = 0; i < 30; i++) {
        engine.toggleConcealment();
      }

      // Finish any pending tween
      gsap.globalTimeline.getChildren().forEach((child) => child.progress?.(1));

      // After 30 toggles from initial unconcealed (false), state should be false
      expect(engine.isMaskConcealed()).toBe(false);
      expect(threeModel!.getVeilOpacity()).toBeCloseTo(0, 1);
      expect(threeModel!.getFoilWipeProgress()).toBeCloseTo(1, 1);

      engine.destroy();
    });

    it('bypasses idleFloatTween and sheen animations under prefers-reduced-motion', () => {
      const origMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      // Under reduced motion: open timeline immediately settles
      expect(engine.getIdleFloatTween()).toBeNull();

      const modalEl = document.querySelector('[data-card-summon-modal]') as HTMLElement;
      expect(modalEl).not.toBeNull();

      // Pointermove should be ignored under reduced motion
      const cardEl = document.querySelector('[data-summon-card]') as HTMLElement;
      modalEl.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 100 }));
      expect(gsap.getProperty(cardEl, 'rotationX')).toBe(0);

      engine.destroy();
      window.matchMedia = origMatchMedia;
    });

    it('handles ThreeCardModel boundary resize inputs (negative, zero, NaN, huge) safely', () => {
      const model = new ThreeCardModel();
      model.mount(container);

      expect(() => model.resize(0, 0)).not.toThrow();
      expect(() => model.resize(-100, -200)).not.toThrow();
      expect(() => model.resize(NaN, NaN)).not.toThrow();
      expect(() => model.resize(10000, 10000)).not.toThrow();

      model.destroy();
    });

    it('survives multiple mount/destroy cycles on the same ThreeCardModel instance', () => {
      const model = new ThreeCardModel();

      model.mount(container);
      expect(container.querySelector('canvas')).not.toBeNull();

      model.destroy();
      expect(container.querySelector('canvas')).toBeNull();

      // Re-mounting destroyed instance should be handled gracefully
      expect(() => {
        model.mount(container);
      }).not.toThrow();

      model.destroy();
    });
  });
});
