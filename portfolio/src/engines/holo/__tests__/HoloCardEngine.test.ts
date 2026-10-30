import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoloCardEngine } from '../HoloCardEngine';

function createMockGl() {
  return {
    createShader: vi.fn().mockReturnValue({}),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn().mockReturnValue(true),
    createProgram: vi.fn().mockReturnValue({}),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn().mockReturnValue(true),
    useProgram: vi.fn(),
    createBuffer: vi.fn().mockReturnValue({}),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    getAttribLocation: vi.fn().mockReturnValue(0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    getUniformLocation: vi.fn((_p: any, name: string) => ({ name })),
    uniform1i: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    createTexture: vi.fn().mockReturnValue({}),
    bindTexture: vi.fn(),
    texParameteri: vi.fn(),
    texImage2D: vi.fn(),
    generateMipmap: vi.fn(),
    viewport: vi.fn(),
    drawArrays: vi.fn(),
    deleteProgram: vi.fn(),
    deleteShader: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteTexture: vi.fn(),
    getExtension: vi.fn().mockReturnValue({ loseContext: vi.fn() }),
  };
}

describe('HoloCardEngine', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('removes canvas and gracefully reports unsupported when WebGL2 context is unavailable in JSDOM', () => {
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    expect(engine.isSupported()).toBe(false);
    expect(container.querySelector('canvas')).toBeNull();

    engine.destroy();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('instantiates and mounts a canvas element when WebGL2 is supported', () => {
    const mockGl = createMockGl();
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === 'webgl2') return mockGl as unknown as WebGL2RenderingContext;
      return null;
    }) as any;

    try {
      const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
      engine.mount(container);

      expect(engine.isSupported()).toBe(true);
      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-holo-canvas]');
      expect(canvas).toBeTruthy();
      expect(canvas?.className).toContain('absolute inset-0');

      engine.destroy();
      expect(container.querySelector('canvas')).toBeNull();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it('initializes mock WebGL2 context, compiles shaders, and queries UV transform uniforms', () => {
    const mockGl = createMockGl();
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === 'webgl2') return mockGl as unknown as WebGL2RenderingContext;
      return null;
    }) as any;

    try {
      const targetCard = document.createElement('div');
      container.appendChild(targetCard);

      const engine = new HoloCardEngine({
        imageSrc: '/profile.jpg',
        targetEl: targetCard,
      });
      engine.mount(container);

      expect(engine.isSupported()).toBe(true);
      expect(mockGl.createShader).toHaveBeenCalledTimes(2);
      expect(mockGl.createProgram).toHaveBeenCalledTimes(1);

      // Verify uniform location queries including UV scale, offset, and resolution
      expect(mockGl.getUniformLocation).toHaveBeenCalledWith(expect.anything(), 'u_uvScale');
      expect(mockGl.getUniformLocation).toHaveBeenCalledWith(expect.anything(), 'u_uvOffset');
      expect(mockGl.getUniformLocation).toHaveBeenCalledWith(expect.anything(), 'u_resolution');

      engine.destroy();
      expect(mockGl.deleteProgram).toHaveBeenCalled();
      expect(mockGl.deleteTexture).toHaveBeenCalled();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it('sets default u_holoIntensity uniform to 0.2 (10% light hint) and respects custom values', () => {
    const mockGl = createMockGl();
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === 'webgl2') return mockGl as unknown as WebGL2RenderingContext;
      return null;
    }) as any;

    try {
      // Default engine should upload 0.2
      const defaultEngine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
      defaultEngine.mount(container);
      expect(mockGl.uniform1f).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'u_holoIntensity' }),
        0.2
      );
      defaultEngine.destroy();

      // Custom intensity engine
      mockGl.uniform1f.mockClear();
      const customEngine = new HoloCardEngine({ imageSrc: '/profile.jpg', holoIntensity: 0.5 });
      customEngine.mount(container);
      expect(mockGl.uniform1f).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'u_holoIntensity' }),
        0.5
      );
      customEngine.destroy();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it('updates canvas dimensions, viewport, and UV transform on resize', () => {
    const mockGl = createMockGl();
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === 'webgl2') return mockGl as unknown as WebGL2RenderingContext;
      return null;
    }) as any;

    try {
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        width: 320,
        height: 480,
        top: 0,
        left: 0,
        bottom: 480,
        right: 320,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
      engine.mount(container);

      // Mock image natural dimensions (e.g. 1000x1000 square image on 320x480 canvas)
      (engine as any).imgElement = { naturalWidth: 1000, naturalHeight: 1000 };

      engine.resize();

      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-holo-canvas]');
      expect(canvas).toBeTruthy();
      expect(mockGl.viewport).toHaveBeenCalled();

      // Canvas aspect: 320/480 = 0.6667. Img aspect: 1000/1000 = 1.0.
      // Canvas is narrower than image: scaleX = 320/480 = 2/3, offsetX = (1 - 2/3) * 0.5
      expect(mockGl.uniform2f).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'u_uvScale' }),
        expect.closeTo(0.6667, 3),
        1.0
      );
      expect(mockGl.uniform2f).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'u_uvOffset' }),
        expect.closeTo(0.1667, 3),
        0.0
      );

      engine.destroy();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it('suspends animation loop when at rest and resumes on pointer movement', () => {
    const mockGl = createMockGl();
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === 'webgl2') return mockGl as unknown as WebGL2RenderingContext;
      return null;
    }) as any;

    try {
      const targetCard = document.createElement('div');
      container.appendChild(targetCard);

      const engine = new HoloCardEngine({
        imageSrc: '/profile.jpg',
        targetEl: targetCard,
      });
      engine.mount(container);

      // Initially at rest: tick renders 1 frame and suspends (rafId becomes null)
      (engine as any).tick();
      expect((engine as any).rafId).toBeNull();

      // Pointer movement restarts the animation loop
      targetCard.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true })
      );
      expect((engine as any).rafId).not.toBeNull();

      // Trigger mouse leave and advance loop until it settles to rest (< 0.0005)
      targetCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      for (let i = 0; i < 90; i++) {
        (engine as any).tick();
      }

      // Loop should now be suspended again
      expect((engine as any).rafId).toBeNull();
      expect(targetCard.style.transform).toBe('');

      engine.destroy();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it('updates target element CSS 3D tilt on pointer interaction and resets on leave', () => {
    const targetCard = document.createElement('div');
    container.appendChild(targetCard);

    vi.spyOn(targetCard, 'getBoundingClientRect').mockReturnValue({
      width: 200,
      height: 300,
      top: 100,
      left: 100,
      bottom: 400,
      right: 300,
      x: 100,
      y: 100,
      toJSON: () => {},
    });

    const engine = new HoloCardEngine({
      imageSrc: '/profile.jpg',
      targetEl: targetCard,
      maxTiltDeg: 10,
    });
    engine.mount(container);

    // Trigger mouse move to bottom-right corner (clientX=300, clientY=400 -> x=1, y=1)
    targetCard.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 300, clientY: 400, bubbles: true })
    );

    // Call tick manually to advance damped lerp physics
    for (let i = 0; i < 20; i++) {
      (engine as any).tick();
    }

    expect(targetCard.style.transform).toContain('perspective(900px)');
    expect(targetCard.style.transform).toContain('rotateX(');
    expect(targetCard.style.transform).toContain('rotateY(');
    expect(targetCard.style.transform).toContain('scale3d(1.03, 1.03, 1.03)');

    // Trigger mouse leave and advance lerp to reset threshold
    targetCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

    for (let i = 0; i < 90; i++) {
      (engine as any).tick();
    }

    expect(targetCard.style.transform).toBe('');

    engine.destroy();
    expect(targetCard.style.transform).toBe('');
  });

  it('disposes animation frame and removes event listeners on destroy', () => {
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    engine.destroy();
    expect(cancelRafSpy).toHaveBeenCalled();
  });

  it('is idempotent when mount is called multiple times', () => {
    const mockGl = createMockGl();
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === 'webgl2') return mockGl as unknown as WebGL2RenderingContext;
      return null;
    }) as any;

    try {
      const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
      engine.mount(container);
      engine.mount(container);

      const canvases = container.querySelectorAll('canvas[data-holo-canvas]');
      expect(canvases.length).toBe(1);

      engine.destroy();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });
});
