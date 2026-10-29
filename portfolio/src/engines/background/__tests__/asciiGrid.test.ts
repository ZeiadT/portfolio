import { describe, it, expect } from 'vitest';
import { AsciiGrid, createAsciiGridConfig } from '../asciiGrid';

describe('AsciiGrid Pure Engine Math', () => {
  it('initializes grid columns and rows based on width, height, and cell size', () => {
    const config = createAsciiGridConfig({
      cellWidth: 30,
      cellHeight: 30,
    });
    const grid = new AsciiGrid(300, 300, config);

    expect(grid.cols).toBe(10);
    expect(grid.rows).toBe(10);
    expect(grid.cells.length).toBe(100);
  });

  it('handles zero or negative dimensions safely without throwing or NaN', () => {
    const config = createAsciiGridConfig();
    const grid = new AsciiGrid(0, 0, config);

    expect(grid.cols).toBeGreaterThanOrEqual(1);
    expect(grid.rows).toBeGreaterThanOrEqual(1);
  });

  it('triggers an elastic shockwave from the center and displaces cells', () => {
    const config = createAsciiGridConfig({ cellWidth: 20, cellHeight: 20 });
    const grid = new AsciiGrid(400, 400, config);

    // Initial state: all displacements should be near 0
    let totalInitialDisplacement = 0;
    for (const cell of grid.cells) {
      totalInitialDisplacement += Math.abs(cell.dispX) + Math.abs(cell.dispY);
    }
    expect(totalInitialDisplacement).toBe(0);

    // Trigger shockwave at center (200, 200)
    grid.triggerShockwave(200, 200, 40);

    // Step the physics simulation
    grid.update(0.016);

    let totalDisplacementAfterShock = 0;
    for (const cell of grid.cells) {
      totalDisplacementAfterShock += Math.abs(cell.dispX) + Math.abs(cell.dispY);
    }
    expect(totalDisplacementAfterShock).toBeGreaterThan(0);
  });

  it('relaxes cells back toward equilibrium over time (spring damping)', () => {
    const config = createAsciiGridConfig({
      cellWidth: 20,
      cellHeight: 20,
      damping: 0.85,
      spring: 0.15,
    });
    const grid = new AsciiGrid(200, 200, config);
    grid.triggerShockwave(100, 100, 20);

    grid.update(0.016);
    const peakDisplacement = grid.cells.reduce(
      (sum, c) => sum + Math.abs(c.dispX) + Math.abs(c.dispY),
      0
    );

    // Step physics multiple times to allow damping to settle
    for (let i = 0; i < 60; i++) {
      grid.update(0.016);
    }

    const settledDisplacement = grid.cells.reduce(
      (sum, c) => sum + Math.abs(c.dispX) + Math.abs(c.dispY),
      0
    );

    expect(settledDisplacement).toBeLessThan(peakDisplacement);
  });

  it('runs autonomous ambient waves that update ambientEnergy without displacing cell coordinates', () => {
    const config = createAsciiGridConfig({ cellWidth: 25, cellHeight: 25 });
    const grid = new AsciiGrid(300, 300, config);

    // Step the simulation without any mouse or shockwave triggers
    for (let i = 0; i < 30; i++) {
      grid.update(0.033);
    }

    // Cells should have ambient energy
    const activeEnergies = grid.cells.filter((c) => c.ambientEnergy > 0);
    expect(activeEnergies.length).toBeGreaterThan(0);

    // But physical coordinates must remain strictly undisplaced (0)
    for (const cell of grid.cells) {
      expect(cell.dispX).toBe(0);
      expect(cell.dispY).toBe(0);
    }
  });

  it('mutates glyph text during high ambient wave peaks over time', () => {
    const config = createAsciiGridConfig({ cellWidth: 25, cellHeight: 25 });
    const grid = new AsciiGrid(300, 300, config);
    const initialChars = grid.cells.map((c) => c.char);

    // Advance time sufficiently for wave peaks to mutate some characters
    for (let i = 0; i < 200; i++) {
      grid.update(0.05);
    }

    const currentChars = grid.cells.map((c) => c.char);
    let mutatedCount = 0;
    for (let i = 0; i < grid.cells.length; i++) {
      if (initialChars[i] !== currentChars[i]) {
        mutatedCount++;
      }
    }

    expect(mutatedCount).toBeGreaterThan(0);
  });

  it('strictly clamps maxDisplacement to 24px (20% reduction) under extreme force', () => {
    const config = createAsciiGridConfig({
      cellWidth: 20,
      cellHeight: 20,
      maxDisplacement: 24,
    });
    const grid = new AsciiGrid(200, 200, config);

    // Trigger massive shockwave
    grid.triggerShockwave(100, 100, 1000);
    for (let i = 0; i < 10; i++) {
      grid.update(0.016);
    }

    for (const cell of grid.cells) {
      const mag = Math.hypot(cell.dispX, cell.dispY);
      expect(mag).toBeLessThanOrEqual(24.001);
    }
  });

  it('supports localized hover shockwaves with an additional 40% reduced maxRadius', () => {
    const config = createAsciiGridConfig({ cellWidth: 20, cellHeight: 20 });
    const grid = new AsciiGrid(400, 400, config);

    const baselineRadius = 300;
    const reducedRadius = Math.round((baselineRadius * 0.7) * 0.6); // 126 (additional 40% reduction)

    grid.triggerShockwave(200, 200, 4.8, reducedRadius);
    const activeWave = (grid as unknown as { shockwaves: Array<{ maxRadius: number }> }).shockwaves[0];
    expect(activeWave.maxRadius).toBe(126);
  });

  it('triggers mouse hover shockwaves with additional 40% reduced radius in BackgroundCanvasEngine', async () => {
    const { BackgroundCanvasEngine } = await import('../index');
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 1000 });
    Object.defineProperty(container, 'clientHeight', { value: 800 });
    document.body.appendChild(container);

    const engine = new BackgroundCanvasEngine();
    engine.mount(container);

    const canvas = container.querySelector('canvas')!;
    canvas.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 1000, height: 800, right: 1000, bottom: 800 } as DOMRect);

    const moveEvent = new PointerEvent('pointermove', { clientX: 500, clientY: 400 });
    window.dispatchEvent(moveEvent);

    const grid = (engine as unknown as { grid: AsciiGrid }).grid;
    const activeWave = (grid as unknown as { shockwaves: Array<{ maxRadius: number }> }).shockwaves[0];

    // maxDim = 1000. Expected radius = 1000 * 0.196 * 0.6 = 117.6
    expect(activeWave.maxRadius).toBeCloseTo(117.6, 1);

    engine.destroy();
    container.remove();
  });

  it('initializes cells with topographic elevation, tierIndex, and isRidge properties', () => {
    const grid = new AsciiGrid(300, 300);
    expect(grid.cells.length).toBeGreaterThan(0);
    for (const cell of grid.cells) {
      expect(cell.elevation).toBeDefined();
      expect(typeof cell.elevation).toBe('number');
      expect(cell.elevation).toBeGreaterThanOrEqual(0);
      expect(cell.elevation).toBeLessThanOrEqual(1);
      expect(cell.tierIndex).toBeGreaterThanOrEqual(0);
      expect(cell.tierIndex).toBeLessThanOrEqual(4);
      expect(typeof cell.isRidge).toBe('boolean');
    }
  });

  it('computes domain-warped topographic elevations bounded within [0, 1] and quantized tiers [0, 4]', () => {
    const grid = new AsciiGrid(400, 400);
    grid.update(0.1);

    const tiers = new Set<number>();
    for (const cell of grid.cells) {
      expect(cell.elevation).toBeGreaterThanOrEqual(0);
      expect(cell.elevation).toBeLessThanOrEqual(1);
      expect(cell.tierIndex).toBeGreaterThanOrEqual(0);
      expect(cell.tierIndex).toBeLessThanOrEqual(4);
      tiers.add(cell.tierIndex);
    }

    // Grid should cover multiple elevation bands across the 400x400 space
    expect(tiers.size).toBeGreaterThanOrEqual(3);
  });

  it('restricts cell glyphs strictly to binary zeros and ones across all elevation tiers', () => {
    const grid = new AsciiGrid(300, 300);
    grid.update(0.05);

    // All cells must strictly contain only '0' or '1'
    for (const cell of grid.cells) {
      expect(['0', '1']).toContain(cell.char);
    }
  });

  it('maintains 20% dimmed base opacity thresholds across all cells', () => {
    const grid = new AsciiGrid(300, 300);
    grid.update(0.016);

    for (const cell of grid.cells) {
      // With 20% dimming, cell opacity should never exceed 0.85
      expect(cell.opacity).toBeLessThanOrEqual(0.85);
      expect(cell.opacity).toBeGreaterThanOrEqual(0.15);
    }
  });
});
