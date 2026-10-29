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
});
