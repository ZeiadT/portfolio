import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import createGlobe from 'cobe';
import { ProfileGlobeComponent, ProfileGlobe } from '../ProfileGlobe';

// Mock cobe createGlobe to isolate component unit testing and WebGL simulation
vi.mock('cobe', () => {
  return {
    default: vi.fn(() => ({
      update: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

describe('ProfileGlobeComponent', () => {
  let container: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Exports and Alias', () => {
    it('exports both ProfileGlobeComponent and ProfileGlobe alias', () => {
      expect(ProfileGlobeComponent).toBeDefined();
      expect(ProfileGlobe).toBe(ProfileGlobeComponent);
    });
  });

  describe('DOM Structure and Bento Card Styling', () => {
    it('renders root element with data-bento-globe attribute and bento card classes', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const root = container.querySelector<HTMLElement>('[data-bento-globe="true"]');
      expect(root).toBeTruthy();
      expect(root?.className).toContain('p-5');
      expect(root?.className).toContain('sm:p-6');
      expect(root?.className).toContain('rounded-2xl');
      expect(root?.className).toContain('bg-white/[0.02]');
      expect(root?.className).toContain('border');
      expect(root?.className).toContain('border-white/10');
      expect(root?.className).toContain('backdrop-blur-sm');
      expect(root?.className).toContain('shadow-[0_8px_32px_rgba(0,0,0,0.37)]');
      expect(root?.className).toContain('flex');
      expect(root?.className).toContain('flex-col');
      expect(root?.className).toContain('justify-between');
      expect(root?.className).toContain('h-full');
      expect(root?.className).toContain('select-text');
      expect(root?.className).toContain('group/globe');
      expect(root?.className).toContain('overflow-hidden');
      expect(root?.className).toContain('relative');
      expect(root?.className).toContain('transition-colors');
      expect(root?.className).toContain('duration-200');
      expect(root?.className).toContain('hover:border-white/20');

      globe.destroy();
    });

    it('renders subtitle with exact uppercase tracking and typography', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const subtitle = container.querySelector<HTMLElement>('[data-globe-subtitle]');
      expect(subtitle).toBeTruthy();
      expect(subtitle?.textContent?.trim()).toBe('FLEXIBLE WITH TIMEZONES');
      expect(subtitle?.className).toContain('text-[11px]');
      expect(subtitle?.className).toContain('uppercase');
      expect(subtitle?.className).toContain('tracking-[0.2em]');
      expect(subtitle?.className).toContain('font-semibold');
      expect(subtitle?.className).toContain('text-neutral-400');
      expect(subtitle?.className).toContain('mb-1.5');
      expect(subtitle?.className).toContain('block');

      globe.destroy();
    });

    it('renders dynamic title with default country Egypt when no location is passed', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const title = container.querySelector<HTMLElement>('[data-globe-title]');
      expect(title).toBeTruthy();
      expect(title?.className).toContain('text-base');
      expect(title?.className).toContain('sm:text-lg');
      expect(title?.className).toContain('font-bold');
      expect(title?.className).toContain('text-neutral-100');
      expect(title?.className).toContain('leading-snug');
      expect(title?.innerHTML).toContain(
        'Based in <span class="text-[#ff4421] font-bold">Egypt</span>'
      );
      expect(title?.innerHTML).toContain(
        '<span class="text-neutral-400 font-normal">available globally</span>'
      );

      globe.destroy();
    });

    it('parses location correctly from location strings', () => {
      const globeSF = new ProfileGlobeComponent('San Francisco, CA');
      globeSF.mount(container);

      const titleSF = container.querySelector<HTMLElement>('[data-globe-title]');
      expect(titleSF?.innerHTML).toContain(
        'Based in <span class="text-[#ff4421] font-bold">San Francisco</span>'
      );
      expect(titleSF?.innerHTML).toContain(
        '<span class="text-neutral-400 font-normal">available globally</span>'
      );
      globeSF.destroy();

      const globeTokyo = new ProfileGlobeComponent('Tokyo, Japan');
      globeTokyo.mount(container);

      const titleTokyo = container.querySelector<HTMLElement>('[data-globe-title]');
      expect(titleTokyo?.innerHTML).toContain(
        'Based in <span class="text-[#ff4421] font-bold">Tokyo</span>'
      );
      globeTokyo.destroy();
    });

    it('falls back to Egypt for empty or whitespace-only locations', () => {
      const globeEmpty = new ProfileGlobeComponent('   ');
      globeEmpty.mount(container);

      const title = container.querySelector<HTMLElement>('[data-globe-title]');
      expect(title?.innerHTML).toContain(
        'Based in <span class="text-[#ff4421] font-bold">Egypt</span>'
      );
      globeEmpty.destroy();
    });

    it('escapes unsafe HTML characters in location to prevent XSS', () => {
      const globeXSS = new ProfileGlobeComponent('<img src=x onerror=alert(1)>, Egypt');
      globeXSS.mount(container);

      const title = container.querySelector<HTMLElement>('[data-globe-title]');
      expect(title?.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
      expect(title?.querySelector('img')).toBeNull();
      globeXSS.destroy();
    });

    it('renders ambient glow wrapper behind the canvas', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const glow = container.querySelector<HTMLElement>('[data-globe-glow]');
      expect(glow).toBeTruthy();
      expect(glow?.getAttribute('aria-hidden')).toBe('true');
      expect(glow?.innerHTML).toContain('bg-[#ff4421]/15');

      globe.destroy();
    });

    it('renders canvas element with data-globe-canvas attribute and grab cursor classes', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-globe-canvas]');
      expect(canvas).toBeTruthy();
      expect(canvas?.className).toContain('cursor-grab');
      expect(canvas?.className).toContain('active:cursor-grabbing');
      expect(canvas?.className).toContain('touch-none');

      globe.destroy();
    });
  });

  describe('Cobe WebGL Initialization', () => {
    it('initializes createGlobe without markers and with required visual options including 20% scale boost', () => {
      const globe = new ProfileGlobeComponent('Egypt');
      globe.mount(container);

      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-globe-canvas]');
      expect(createGlobe).toHaveBeenCalledTimes(1);
      expect(createGlobe).toHaveBeenCalledWith(
        canvas,
        expect.objectContaining({
          dark: 1,
          diffuse: 1.2,
          scale: 1.2,
          mapSamples: 16000,
          mapBrightness: 6,
          baseColor: [0.3, 0.3, 0.3],
          markerColor: [1, 0.27, 0.13],
          glowColor: [0.15, 0.15, 0.15],
          markers: [],
          onRender: expect.any(Function),
        })
      );

      globe.destroy();
    });

    it('increments phi slowly during auto-rotation in onRender callback', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const calls = vi.mocked(createGlobe).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const options = calls[0][1] as any;
      expect(typeof options.onRender).toBe('function');

      const mockState: Record<string, any> = { phi: 0 };
      options.onRender(mockState);
      const initialPhi = mockState.phi;

      options.onRender(mockState);
      const diff = mockState.phi - initialPhi;
      expect(diff).toBeGreaterThan(0);
      expect(diff).toBeLessThanOrEqual(0.002);

      globe.destroy();
    });

    it('handles WebGL or createGlobe error gracefully without throwing in mount', () => {
      vi.mocked(createGlobe).mockImplementationOnce(() => {
        throw new Error('WebGL context lost or unsupported');
      });

      const globe = new ProfileGlobeComponent();
      expect(() => {
        globe.mount(container);
      }).not.toThrow();

      // Root element is still rendered even if WebGL fails
      const root = container.querySelector('[data-bento-globe="true"]');
      expect(root).toBeTruthy();

      expect(() => {
        globe.destroy();
      }).not.toThrow();
    });
  });

  describe('Drag Interaction', () => {
    it('binds pointer event listeners on canvas for drag rotation', () => {
      const addSpy = vi.spyOn(HTMLCanvasElement.prototype, 'addEventListener');

      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      expect(addSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));

      addSpy.mockRestore();
      globe.destroy();
    });

    it('switches cursor style on pointerdown and pointerup', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-globe-canvas]')!;

      // Dispatch pointerdown
      canvas.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: 100,
          pointerId: 1,
        })
      );
      expect(canvas.style.cursor).toBe('grabbing');

      // Dispatch pointerup
      canvas.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 150,
          pointerId: 1,
        })
      );
      expect(canvas.style.cursor).toBe('grab');

      globe.destroy();
    });

    it('updates rotation offset when pointer moves during drag', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-globe-canvas]')!;
      const calls = vi.mocked(createGlobe).mock.calls;
      const options = calls[0][1] as any;
      const mockState: Record<string, any> = { phi: 0 };

      // Pointer down at x=100
      canvas.dispatchEvent(
        new PointerEvent('pointerdown', {
          clientX: 100,
          pointerId: 1,
        })
      );

      // Pointer move to x=200 (delta = 100)
      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 200,
          pointerId: 1,
        })
      );

      options.onRender(mockState);
      const draggedPhi = mockState.phi;

      // Pointer move to x=250 (delta = 150)
      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          clientX: 250,
          pointerId: 1,
        })
      );

      options.onRender(mockState);
      expect(mockState.phi).toBeGreaterThan(draggedPhi);

      // Pointer up releases interaction
      canvas.dispatchEvent(
        new PointerEvent('pointerup', {
          clientX: 250,
          pointerId: 1,
        })
      );

      globe.destroy();
    });
  });

  describe('Lifecycle and Cleanup', () => {
    it('calls globe.destroy() on component destroy', () => {
      const mockDestroy = vi.fn();
      vi.mocked(createGlobe).mockReturnValueOnce({
        destroy: mockDestroy,
        update: vi.fn(),
      });

      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      globe.destroy();
      expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    it('removes pointer event listeners and window resize on destroy', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-globe-canvas]')!;
      const removeSpy = vi.spyOn(canvas, 'removeEventListener');
      const windowRemoveSpy = vi.spyOn(window, 'removeEventListener');

      globe.destroy();

      expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));
      expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('cancels requestAnimationFrame on destroy', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      globe.destroy();
      expect(cancelSpy).toHaveBeenCalled();
    });

    it('removes root element from DOM on destroy', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      expect(container.querySelector('[data-bento-globe="true"]')).toBeTruthy();

      globe.destroy();
      expect(container.querySelector('[data-bento-globe="true"]')).toBeNull();
    });

    it('is safe against multiple sequential destroy calls', () => {
      const globe = new ProfileGlobeComponent();
      globe.mount(container);

      expect(() => {
        globe.destroy();
        globe.destroy();
        globe.destroy();
      }).not.toThrow();
    });

    it('cleans up previous instance if mount is called repeatedly on same instance', () => {
      const mockDestroy = vi.fn();
      vi.mocked(createGlobe).mockReturnValue({
        destroy: mockDestroy,
        update: vi.fn(),
      });

      const globe = new ProfileGlobeComponent();
      globe.mount(container);
      expect(mockDestroy).not.toHaveBeenCalled();

      // Second mount cleans up previous instance
      globe.mount(container);
      expect(mockDestroy).toHaveBeenCalledTimes(1);

      globe.destroy();
      expect(mockDestroy).toHaveBeenCalledTimes(2);
    });
  });
});
