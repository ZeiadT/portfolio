import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import * as THREE from 'three';
import { CarouselGLEngine } from '../index';
import { PROJECTS } from '@/data/projects';

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

describe('Task 6: Complete 3D WebGL Carousel Engine (CarouselGLEngine)', () => {
  let container: HTMLElement;
  let engine: CarouselGLEngine | null = null;

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
    if (engine) {
      engine.destroy();
      engine = null;
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

  describe('1. Engine Contract & Initialization', () => {
    it('implements Engine contract with id="carousel-gl", mount, destroy, resize', () => {
      engine = new CarouselGLEngine(PROJECTS);
      expect(engine.id).toBe('carousel-gl');
      expect(typeof engine.mount).toBe('function');
      expect(typeof engine.destroy).toBe('function');
      expect(typeof engine.resize).toBe('function');
      expect(engine.getProjects()).toEqual(PROJECTS);
    });

    it('attaches renderer canvas to container upon mount', () => {
      engine = new CarouselGLEngine(PROJECTS);
      expect(container.querySelector('canvas')).toBeNull();

      engine.mount(container);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
      expect(container.contains(canvas)).toBe(true);
    });

    it('initializes Three.js scene, camera, and track group', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const scene = engine.getScene();
      const camera = engine.getCamera();
      const track = engine.getTrack();

      expect(scene).toBeInstanceOf(THREE.Scene);
      expect(camera).toBeInstanceOf(THREE.PerspectiveCamera);
      expect(camera?.position.z).toBeCloseTo(8.0, 1);
      expect(camera?.fov).toBe(50);
      expect(track).toBeInstanceOf(THREE.Group);
      expect(scene?.children).toContain(track);
    });

    it('creates 18 mesh tiles representing 6 projects across 3 replicas (-1, 0, 1)', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const tiles = engine.getTiles();
      expect(tiles).toHaveLength(18); // 6 projects * 3 replicas

      // Check center replica (rep = 0)
      const centerTiles = tiles.filter((t) => t.rep === 0);
      expect(centerTiles).toHaveLength(6);
      expect(centerTiles[0].index).toBe(0);
      expect(centerTiles[0].project.id).toBe('dusk');

      // Check replica positions
      centerTiles.forEach((t) => {
        expect(t.mesh.userData.rep).toBe(0);
        expect(t.mesh.userData.logicalIndex).toBe(t.index);
      });
    });

    it('initializes AudioClickSynth, VermilionParticleBurst, and CarouselGestureController', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      expect(engine.getAudioSynth()).not.toBeNull();
      expect(engine.getParticleBurst()).not.toBeNull();
      expect(engine.getGestureController()).not.toBeNull();
    });
  });

  describe('2. Kinematics, Navigation & Active Focus (uGray)', () => {
    it('initializes selectedIndex to 0 with center tile at uGray = 0 and outer tiles at uGray = 1', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      expect(engine.getSelectedIndex()).toBe(0);

      const tiles = engine.getTiles();
      const centerActiveTile = tiles.find((t) => t.rep === 0 && t.index === 0);
      const centerInactiveTile = tiles.find((t) => t.rep === 0 && t.index === 1);

      expect(centerActiveTile?.material.uniforms.uGray.value).toBe(0);
      expect(centerInactiveTile?.material.uniforms.uGray.value).toBe(1);
    });

    it('navigates to specified index immediately with setSelectedIndex(index, true)', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      engine.setSelectedIndex(2, true);
      expect(engine.getSelectedIndex()).toBe(2);

      const track = engine.getTrack();
      // Scroll coordinate for index 2: (-2 + (6 - 1) / 2) * 4.1 = (-2 + 2.5) * 4.1 = 0.5 * 4.1 = 2.05
      expect(track?.position.x).toBeCloseTo(2.05, 2);
    });

    it('clamps out-of-bound indices within [0, totalProjects - 1]', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      engine.setSelectedIndex(-3, true);
      expect(engine.getSelectedIndex()).toBe(0);

      engine.setSelectedIndex(99, true);
      expect(engine.getSelectedIndex()).toBe(PROJECTS.length - 1);
    });

    it('advances with next() and rewinds with prev()', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      expect(engine.getSelectedIndex()).toBe(0);
      engine.next();
      expect(engine.getSelectedIndex()).toBe(1);
      engine.next();
      expect(engine.getSelectedIndex()).toBe(2);
      engine.prev();
      expect(engine.getSelectedIndex()).toBe(1);
    });

    it('triggers AudioClickSynth on index transition', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const audioSynth = engine.getAudioSynth();
      const triggerSpy = vi.spyOn(audioSynth!, 'triggerIndexCrossing');

      engine.setSelectedIndex(3, true);
      expect(triggerSpy).toHaveBeenCalledWith(3);
    });

    it('smoothly interpolates track position and desaturation uniforms during animation frames', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      // Smooth navigation
      engine.setSelectedIndex(1, false);

      // Trigger frame updates
      engine.renderFrame(0.016);
      engine.renderFrame(0.016);
      engine.renderFrame(0.016);

      const tiles = engine.getTiles();
      const targetActiveTile = tiles.find((t) => t.rep === 0 && t.index === 1);
      // As it centers, uGray should be lerping towards 0
      expect(targetActiveTile?.material.uniforms.uGray.value).toBeLessThan(1.0);
    });
  });

  describe('3. Easter Egg: Vermilion Particle Burst', () => {
    it('triggers particle burst on triggerShockwave() at active card position', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const burst = engine.getParticleBurst();
      expect(burst?.isActive).toBe(false);

      engine.triggerShockwave();
      expect(burst?.isActive).toBe(true);
    });

    it('triggers particle burst on card double click from gesture controller', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const burst = engine.getParticleBurst();
      const triggerSpy = vi.spyOn(burst!, 'trigger');

      // Double-click pointer events on container (with 150ms delay < 300ms)
      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 600, clientY: 400 }));
      container.dispatchEvent(new PointerEvent('pointerup', { clientX: 600, clientY: 400 }));

      vi.advanceTimersByTime(150);

      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 600, clientY: 400 }));
      container.dispatchEvent(new PointerEvent('pointerup', { clientX: 600, clientY: 400 }));

      expect(triggerSpy).toHaveBeenCalled();
    });

    it('updates particle burst during render frames', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const burst = engine.getParticleBurst();
      const updateSpy = vi.spyOn(burst!, 'update');

      engine.renderFrame(0.016);
      expect(updateSpy).toHaveBeenCalledWith(0.016);
    });
  });

  describe('4. Raycast & Project Selection Callback', () => {
    it('invokes onProjectSelect callback and navigates to clicked project', () => {
      const onSelect = vi.fn();
      engine = new CarouselGLEngine(PROJECTS, { onProjectSelect: onSelect });
      engine.mount(container);

      // Simulate click event on center active card
      const rect = container.getBoundingClientRect();
      const clientX = rect.left + container.clientWidth / 2;
      const clientY = rect.top + container.clientHeight / 2;

      const clickEvent = new MouseEvent('click', {
        clientX,
        clientY,
        bubbles: true,
      });

      container.dispatchEvent(clickEvent);

      // Should have triggered onProjectSelect for project 0 (Dusk)
      expect(onSelect).toHaveBeenCalledWith(PROJECTS[0], 0);
    });

    it('updates callback if setOnProjectSelect is called dynamically', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const newSelect = vi.fn();
      engine.setOnProjectSelect(newSelect);

      const rect = container.getBoundingClientRect();
      const clickEvent = new MouseEvent('click', {
        clientX: rect.left + container.clientWidth / 2,
        clientY: rect.top + container.clientHeight / 2,
        bubbles: true,
      });

      container.dispatchEvent(clickEvent);
      expect(newSelect).toHaveBeenCalledWith(PROJECTS[0], 0);
    });
  });

  describe('5. Responsive Resize & Shader Uniforms', () => {
    it('updates camera aspect ratio and renderer size on resize', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 800 });
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 600 });

      engine.resize();

      const camera = engine.getCamera();
      expect(camera?.aspect).toBeCloseTo(800 / 600, 2);
    });

    it('updates uViewportWidth uniform across all tile materials on resize', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 1600 });
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 900 });

      engine.resize();

      const tiles = engine.getTiles();
      const expectedVpWidth = engine.getViewportWidth();
      expect(expectedVpWidth).toBeGreaterThan(0);

      tiles.forEach((t) => {
        expect(t.material.uniforms.uViewportWidth.value).toBeCloseTo(expectedVpWidth, 2);
      });
    });
  });

  describe('6. Resource Disposal & Memory Leaks (destroy)', () => {
    it('cancels animation frame on destroy', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      engine.destroy();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('removes canvas element from container on destroy', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      expect(container.querySelector('canvas')).not.toBeNull();
      engine.destroy();
      expect(container.querySelector('canvas')).toBeNull();
    });

    it('disposes all Three.js geometries, materials, and card textures', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const tiles = engine.getTiles();
      const geomDisposeSpy = vi.spyOn(tiles[0].mesh.geometry, 'dispose');
      const matDisposeSpy = vi.spyOn(tiles[0].material, 'dispose');
      const cardTextureDisposeSpy = vi.spyOn(tiles[0].cardTexture, 'dispose');

      engine.destroy();

      expect(geomDisposeSpy).toHaveBeenCalled();
      expect(matDisposeSpy).toHaveBeenCalled();
      expect(cardTextureDisposeSpy).toHaveBeenCalled();
    });

    it('destroys gesture controller, audio synth, and particle burst on destroy', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      const gesture = engine.getGestureController();
      const audio = engine.getAudioSynth();
      const burst = engine.getParticleBurst();

      const gestureSpy = vi.spyOn(gesture!, 'destroy');
      const audioSpy = vi.spyOn(audio!, 'destroy');
      const burstSpy = vi.spyOn(burst!, 'destroy');

      engine.destroy();

      expect(gestureSpy).toHaveBeenCalled();
      expect(audioSpy).toHaveBeenCalled();
      expect(burstSpy).toHaveBeenCalled();
      expect(engine.getScene()).toBeNull();
      expect(engine.getTrack()).toBeNull();
      expect(engine.getTiles()).toHaveLength(0);
    });

    it('is safe against multiple sequential destroy calls', () => {
      engine = new CarouselGLEngine(PROJECTS);
      engine.mount(container);

      expect(() => {
        engine?.destroy();
        engine?.destroy();
      }).not.toThrow();
    });
  });
});
