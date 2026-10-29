import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoloCardEngine } from '../HoloCardEngine';

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

  it('instantiates and mounts a canvas element into the container', () => {
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-holo-canvas]');
    expect(canvas).toBeTruthy();
    expect(canvas?.className).toContain('absolute inset-0');

    engine.destroy();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('gracefully reports unsupported when WebGL2 context is unavailable in JSDOM', () => {
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    expect(engine.isSupported()).toBe(false);
    engine.destroy();
  });

  it('initializes mock WebGL2 context and compiles shaders without throwing', () => {
    const mockGl = {
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
      getUniformLocation: vi.fn().mockReturnValue({}),
      uniform1i: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      createTexture: vi.fn().mockReturnValue({}),
      bindTexture: vi.fn(),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      viewport: vi.fn(),
      drawArrays: vi.fn(),
      deleteProgram: vi.fn(),
      deleteShader: vi.fn(),
      deleteBuffer: vi.fn(),
      deleteTexture: vi.fn(),
      getExtension: vi.fn().mockReturnValue({ loseContext: vi.fn() }),
    };

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

      engine.destroy();
      expect(mockGl.deleteProgram).toHaveBeenCalled();
      expect(mockGl.deleteTexture).toHaveBeenCalled();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it('disposes animation frame and removes event listeners on destroy', () => {
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    engine.destroy();
    expect(cancelRafSpy).toHaveBeenCalled();
  });

  it('updates canvas dimensions and viewport on resize', () => {
    const mockGl = {
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
      getUniformLocation: vi.fn().mockReturnValue({}),
      uniform1i: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      createTexture: vi.fn().mockReturnValue({}),
      bindTexture: vi.fn(),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      viewport: vi.fn(),
      drawArrays: vi.fn(),
      deleteProgram: vi.fn(),
      deleteShader: vi.fn(),
      deleteBuffer: vi.fn(),
      deleteTexture: vi.fn(),
      getExtension: vi.fn().mockReturnValue({ loseContext: vi.fn() }),
    };

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
      engine.resize();

      const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-holo-canvas]');
      expect(canvas).toBeTruthy();
      expect(mockGl.viewport).toHaveBeenCalled();

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

    for (let i = 0; i < 80; i++) {
      (engine as any).tick();
    }

    expect(targetCard.style.transform).toBe('');

    engine.destroy();
    expect(targetCard.style.transform).toBe('');
  });

  it('is idempotent when mount is called multiple times', () => {
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);
    engine.mount(container);

    const canvases = container.querySelectorAll('canvas[data-holo-canvas]');
    expect(canvases.length).toBe(1);

    engine.destroy();
  });
});
