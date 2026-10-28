import { describe, it, expect } from 'vitest';
import { BandPhysicsSimulator } from '../bandPhysics';

describe('BandPhysicsSimulator', () => {
  it('initializes grid with neutral displacement (byte 128)', () => {
    const sim = new BandPhysicsSimulator({ grid: 40 });
    sim.initGrid(800, 64);

    const dims = sim.getGridDimensions();
    expect(dims.gridX).toBe(40);
    expect(dims.gridY).toBeGreaterThanOrEqual(4);

    const tex = sim.getDisplacementTexture();
    expect(tex.length).toBe(dims.gridX * dims.gridY * 4);

    // Byte 128 = 0 displacement
    for (let i = 0; i < dims.gridX * dims.gridY; i++) {
      expect(tex[i * 4]).toBe(128);     // X offset
      expect(tex[i * 4 + 1]).toBe(128); // Y offset
      expect(tex[i * 4 + 3]).toBe(255); // Alpha
    }
  });

  it('injects force and increases kinetic energy', () => {
    const sim = new BandPhysicsSimulator({ grid: 32 });
    sim.initGrid(400, 60);

    const initialEnergy = sim.step();
    expect(initialEnergy).toBe(0);

    sim.injectForce(0.5, 0.5, 0.05, -0.05);
    const activeEnergy = sim.step();
    expect(activeEnergy).toBeGreaterThan(0);
  });

  it('strictly clamps extreme forces without byte wrapping or tearing', () => {
    const sim = new BandPhysicsSimulator({ grid: 32, maxDistortion: 20 });
    sim.initGrid(400, 60);

    // Extreme force injection
    sim.injectForce(0.5, 0.5, 50.0, -50.0);
    sim.step();

    const tex = sim.getDisplacementTexture();
    for (let i = 0; i < tex.length; i += 4) {
      expect(tex[i]).toBeGreaterThanOrEqual(0);
      expect(tex[i]).toBeLessThanOrEqual(255);
      expect(tex[i + 1]).toBeGreaterThanOrEqual(0);
      expect(tex[i + 1]).toBeLessThanOrEqual(255);
    }
  });

  it('relaxes and decays energy over successive steps', () => {
    const sim = new BandPhysicsSimulator({
      grid: 32,
      relaxation: 0.85,
      elasticity: 0.1,
    });
    sim.initGrid(400, 60);

    sim.injectForce(0.5, 0.5, 0.1, 0.1);
    const energy1 = sim.step();

    // Step multiple frames without adding force
    for (let i = 0; i < 40; i++) {
      sim.step();
    }
    const finalEnergy = sim.step();
    expect(finalEnergy).toBeLessThan(energy1);
    expect(finalEnergy).toBeLessThan(1.0);
  });

  it('resets grid to neutral state cleanly', () => {
    const sim = new BandPhysicsSimulator();
    sim.initGrid(400, 60);
    sim.injectForce(0.5, 0.5, 0.2, 0.2);
    sim.step();

    sim.reset();
    const energy = sim.step();
    expect(energy).toBe(0);

    const tex = sim.getDisplacementTexture();
    const dims = sim.getGridDimensions();
    for (let i = 0; i < dims.gridX * dims.gridY; i++) {
      expect(tex[i * 4]).toBe(128);
      expect(tex[i * 4 + 1]).toBe(128);
    }
  });
});
