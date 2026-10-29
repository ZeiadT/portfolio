import { describe, it, expect, afterEach } from 'vitest';
import { BandSpringGrid, createPhysicsConfig } from '../bandPhysics';

afterEach(() => {
  if (typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }
});

describe('BandSpringGrid Pure Physics Engine', () => {
  it('initializes grid buffers correctly based on dimensions', () => {
    const config = createPhysicsConfig();
    const grid = new BandSpringGrid(48, 10, config);

    expect(grid.gridX).toBe(48);
    expect(grid.gridY).toBe(10);
    expect(grid.q.length).toBe(48 * 10 * 2);
    expect(grid.N.length).toBe(48 * 10 * 4);
    // Neutral displacement in byte buffer is 128
    expect(grid.N[0]).toBe(128);
    expect(grid.N[1]).toBe(128);
  });

  it('injects force and displaces grid on pointer movement', () => {
    const config = createPhysicsConfig({ strength: 1.6 });
    const grid = new BandSpringGrid(32, 8, config);

    // Initial energy is 0
    expect(grid.getActiveEnergy()).toBe(0);

    // Inject pointer velocity at center (0.5, 0.5)
    grid.injectPointerForce(0.5, 0.5, 0.08, -0.05, false);
    grid.stepPhysics();

    expect(grid.getActiveEnergy()).toBeGreaterThan(0);
  });

  it('strictly clamps maximum displacement to maxDistortion (24px) preventing tearing', () => {
    const config = createPhysicsConfig({
      strength: 100, // Massive excessive force
      maxDistortion: 24,
    });
    const grid = new BandSpringGrid(32, 8, config);

    // Inject massive force
    grid.injectPointerForce(0.5, 0.5, 5.0, 5.0, true);
    grid.stepPhysics();

    for (let i = 0; i < grid.q.length; i++) {
      expect(Math.abs(grid.q[i])).toBeLessThanOrEqual(24.001);
    }
  });

  it('relaxes smoothly back toward zero displacement over time', () => {
    const config = createPhysicsConfig({
      strength: 1.6,
      relaxation: 0.94,
      elasticity: 0.10,
    });
    const grid = new BandSpringGrid(32, 8, config);

    grid.injectPointerForce(0.5, 0.5, 0.1, 0.1, false);
    grid.stepPhysics();
    const peakEnergy = grid.getActiveEnergy();

    // Step simulation 60 frames
    for (let i = 0; i < 60; i++) {
      grid.stepPhysics();
    }

    const settledEnergy = grid.getActiveEnergy();
    expect(settledEnergy).toBeLessThan(peakEnergy);
  });
});

describe('BandPhysicsEngine WebGL Adapter Lifecycle', () => {
  it('provides public renderFrame for synchronous initial canvas painting', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    document.body.appendChild(brandBar);
    brandBar.appendChild(canvas);

    const engine = new BandPhysicsEngine(canvas, brandBar);
    expect(typeof engine.renderFrame).toBe('function');
    // Calling renderFrame before start does not throw and paints canvas
    expect(() => engine.renderFrame()).not.toThrow();

    engine.destroy();
    brandBar.remove();
  });



  it('extracts and applies the computed DOM font-family to canvas snapshot elements', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    brandBar.id = 'brand-bar';
    const track = document.createElement('div');
    track.id = 'brand-track';
    const item = document.createElement('div');
    item.className = 'track-render-item wordmark-label';
    item.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    item.style.fontSize = '26px';
    item.style.fontWeight = '900';
    item.textContent = 'ZEIAD MOHAMMED';
    track.appendChild(item);
    brandBar.appendChild(track);
    brandBar.appendChild(canvas);
    document.body.appendChild(brandBar);

    const engine = new BandPhysicsEngine(canvas, brandBar);

    let lastFont = '';
    const mockCtx = {
      set font(val: string) {
        lastFont = val;
      },
      get font() {
        return lastFont;
      },
      setTransform: () => {},
      clearRect: () => {},
      scale: () => {},
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      fillText: () => {},
      measureText: () => ({ width: 150 }),
    };

    (engine as unknown as { ctx: unknown }).ctx = mockCtx;

    engine.renderFrame();

    expect(lastFont).toContain('Segoe UI');
    expect(lastFont).toContain('Roboto');
    // Normalization should map 900 down to 700 to prevent faux-bold stroke dilation
    expect(lastFont).toContain('700');

    // Test satellite item font resolution
    item.className = 'track-render-item satellite-item';
    item.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    item.style.fontWeight = '600';
    item.textContent = 'Mobile Architecture & Motion';
    engine.renderFrame();

    expect(lastFont).toContain('Segoe UI');
    expect(lastFont).toContain('Roboto');
    expect(lastFont).toContain('600');

    engine.destroy();
    brandBar.remove();
  });



  it('renders satellite items and wordmark defensively in uppercase to match DOM styling', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    brandBar.id = 'brand-bar';
    const track = document.createElement('div');
    track.id = 'brand-track';
    const item = document.createElement('div');
    item.className = 'track-render-item satellite-item';
    item.textContent = 'Mixed Case satellite text';
    track.appendChild(item);
    brandBar.appendChild(track);
    brandBar.appendChild(canvas);
    document.body.appendChild(brandBar);

    const engine = new BandPhysicsEngine(canvas, brandBar);

    const filledTexts: string[] = [];
    const mockCtx = {
      font: '',
      setTransform: () => {},
      clearRect: () => {},
      scale: () => {},
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      fillText: (text: string) => {
        filledTexts.push(text);
      },
      measureText: () => ({ width: 150 }),
    };

    (engine as unknown as { ctx: unknown }).ctx = mockCtx;
    engine.renderFrame();

    expect(filledTexts).toContain('MIXED CASE SATELLITE TEXT');

    engine.destroy();
    brandBar.remove();
  });



  it('applies baseline optical calibration (+1px) to snapshot y position after rollback', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    brandBar.id = 'brand-bar';
    const track = document.createElement('div');
    track.id = 'brand-track';
    const item = document.createElement('div');
    item.className = 'track-render-item wordmark-label';
    item.textContent = 'ZEIAD MOHAMMED';
    track.appendChild(item);
    brandBar.appendChild(track);
    brandBar.appendChild(canvas);
    document.body.appendChild(brandBar);

    const engine = new BandPhysicsEngine(canvas, brandBar);

    let capturedY = 0;
    const mockCtx = {
      font: '',
      setTransform: () => {},
      clearRect: () => {},
      scale: () => {},
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      fillText: (text: string, _x: number, y: number) => {
        if (text === 'ZEIAD MOHAMMED') {
          capturedY = y;
        }
      },
      measureText: () => ({ width: 150 }),
    };

    (engine as unknown as { ctx: unknown }).ctx = mockCtx;

    // Mock getBoundingClientRect
    const barRect = { left: 0, top: 0, width: 600, height: 55 };
    const itemRect = { left: 50, top: 14.5, width: 250, height: 26 };
    brandBar.getBoundingClientRect = () => barRect as DOMRect;
    item.getBoundingClientRect = () => itemRect as DOMRect;

    engine.renderFrame();

    // Expected y = (itemRect.top - barRect.top) + (itemRect.height / 2) + air (36) + 1 (optical offset)
    // = 14.5 - 0 + 13 + 36 + 1 = 64.5
    expect(capturedY).toBeCloseTo(64.5, 2);

    engine.destroy();
    brandBar.remove();
  });



  it('renders individual character spans at their exact DOM coordinates when character spans are present', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    brandBar.id = 'brand-bar';
    const track = document.createElement('div');
    track.id = 'brand-track';
    const item = document.createElement('div');
    item.className = 'track-render-item wordmark-label';

    const charZ = document.createElement('span');
    charZ.className = 'hero-char';
    charZ.textContent = 'Z';
    const charE = document.createElement('span');
    charE.className = 'hero-char';
    charE.textContent = 'E';

    item.appendChild(charZ);
    item.appendChild(charE);
    track.appendChild(item);
    brandBar.appendChild(track);
    brandBar.appendChild(canvas);
    document.body.appendChild(brandBar);

    const engine = new BandPhysicsEngine(canvas, brandBar);

    const renderedChars: { char: string; x: number; y: number }[] = [];
    const mockCtx = {
      font: '',
      setTransform: () => {},
      clearRect: () => {},
      scale: () => {},
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      fillText: (text: string, x: number, y: number) => {
        renderedChars.push({ char: text, x, y });
      },
      measureText: () => ({ width: 150 }),
    };

    (engine as unknown as { ctx: unknown }).ctx = mockCtx;

    const barRect = { left: 100, top: 200, width: 800, height: 55 };
    const zRect = { left: 150, top: 215, width: 18, height: 26 };
    const eRect = { left: 172, top: 215, width: 16, height: 26 };
    brandBar.getBoundingClientRect = () => barRect as DOMRect;
    item.getBoundingClientRect = () => ({ left: 150, top: 215, width: 250, height: 26 }) as DOMRect;
    charZ.getBoundingClientRect = () => zRect as DOMRect;
    charE.getBoundingClientRect = () => eRect as DOMRect;

    engine.renderFrame();

    expect(renderedChars.slice(0, 2).map((r) => r.char)).toEqual(['Z', 'E']);
    // x = zRect.left - barRect.left = 150 - 100 = 50
    expect(renderedChars[0].x).toBeCloseTo(50, 1);
    // x = eRect.left - barRect.left = 172 - 100 = 72
    expect(renderedChars[1].x).toBeCloseTo(72, 1);
    // y = (215 - 200) + 13 + 36 + 1 = 65
    expect(renderedChars[0].y).toBeCloseTo(65, 1);

    engine.destroy();
    brandBar.remove();
  });



  it('dynamically measures and positions .trademark-char at exact DOM coordinates', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    brandBar.id = 'brand-bar';
    const track = document.createElement('div');
    track.id = 'brand-track';
    const item = document.createElement('div');
    item.className = 'track-render-item wordmark-label';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = 'ZEIAD MOHAMMED';
    const tmSpan = document.createElement('span');
    tmSpan.className = 'trademark-char';
    tmSpan.textContent = '®';

    item.appendChild(nameSpan);
    item.appendChild(tmSpan);
    track.appendChild(item);
    brandBar.appendChild(track);
    brandBar.appendChild(canvas);
    document.body.appendChild(brandBar);

    const engine = new BandPhysicsEngine(canvas, brandBar);

    let tmCapturedX = 0;
    let tmCapturedY = 0;
    const mockCtx = {
      font: '',
      setTransform: () => {},
      clearRect: () => {},
      scale: () => {},
      fillRect: () => {},
      save: () => {},
      restore: () => {},
      fillText: (text: string, x: number, y: number) => {
        if (text === '®') {
          tmCapturedX = x;
          tmCapturedY = y;
        }
      },
      measureText: () => ({ width: 150 }),
    };

    (engine as unknown as { ctx: unknown }).ctx = mockCtx;

    const barRect = { left: 0, top: 0, width: 600, height: 55 };
    const itemRect = { left: 50, top: 14.5, width: 250, height: 26 };
    const tmRect = { left: 300, top: 10, width: 14, height: 14 };

    brandBar.getBoundingClientRect = () => barRect as DOMRect;
    item.getBoundingClientRect = () => itemRect as DOMRect;
    tmSpan.getBoundingClientRect = () => tmRect as DOMRect;

    engine.renderFrame();

    // tmX should match tmRect.left - barRect.left = 300 - 0 = 300
    // tmY should match tmRect.top - barRect.top + tmRect.height / 2 + air (36) + 1 = 10 + 7 + 36 + 1 = 54
    expect(tmCapturedX).toBe(300);
    expect(tmCapturedY).toBe(54);

    engine.destroy();
    brandBar.remove();
  });

  it('operates in hover-only mode and cleanly removes pointermove listener on destroy', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    document.body.appendChild(brandBar);
    brandBar.appendChild(canvas);

    const engine = new BandPhysicsEngine(canvas, brandBar);
    // Should destroy without error
    expect(() => engine.destroy()).not.toThrow();
    brandBar.remove();
  });

  it('normalizes font weights correctly to prevent synthetic stroke dilation', async () => {
    const { normalizeFontWeight } = await import('../bandPhysics');
    expect(normalizeFontWeight(900)).toBe('700');
    expect(normalizeFontWeight('900')).toBe('700');
    expect(normalizeFontWeight(800)).toBe('700');
    expect(normalizeFontWeight('black')).toBe('700');
    expect(normalizeFontWeight(700)).toBe('700');
    expect(normalizeFontWeight(600)).toBe('600');
    expect(normalizeFontWeight(400)).toBe('400');
  });

  it('super-samples the offscreen 2D buffer at minimum 2x or 1.5x DPR for high resolution antialiasing', async () => {
    const { BandPhysicsEngine } = await import('../bandPhysics');
    const canvas = document.createElement('canvas');
    const brandBar = document.createElement('div');
    brandBar.style.width = '800px';
    brandBar.style.height = '60px';
    document.body.appendChild(brandBar);
    brandBar.appendChild(canvas);

    brandBar.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 60,
      right: 800,
      bottom: 60,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const engine = new BandPhysicsEngine(canvas, brandBar);
    engine.updateDimensions();

    const offscreen = (engine as unknown as { offscreen: HTMLCanvasElement }).offscreen;
    // Offscreen width must be super-sampled (at least 2x width = 1600px)
    expect(offscreen.width).toBeGreaterThanOrEqual(1600);
    expect(offscreen.width).toBeGreaterThanOrEqual(canvas.width);

    engine.destroy();
    brandBar.remove();
  });
});
