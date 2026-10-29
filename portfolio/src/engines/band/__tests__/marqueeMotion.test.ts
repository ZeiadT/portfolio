import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MarqueeMotionController } from '../marqueeMotion';

describe('MarqueeMotionController', () => {
  let track: HTMLElement;
  let controller: MarqueeMotionController;

  beforeEach(() => {
    track = document.createElement('div');
    track.className = 'boc-marquee-track';
    document.body.appendChild(track);
  });

  afterEach(() => {
    controller?.destroy();
    track.remove();
  });

  it('initializes with inactive state', () => {
    controller = new MarqueeMotionController({
      track,
      centerOffset: 120,
    });
    expect(controller.isActive()).toBe(false);
    expect(controller.getLoopTween()).toBeNull();
    expect(controller.getAccelTween()).toBeNull();
  });

  it('starts with timeScale 0 on an infinite linear loop tween and 20% faster acceleration duration', () => {
    controller = new MarqueeMotionController({
      track,
      centerOffset: 120,
      duration: 32,
    });

    controller.start();

    expect(controller.isActive()).toBe(true);
    const loopTween = controller.getLoopTween();
    const accelTween = controller.getAccelTween();

    expect(loopTween).not.toBeNull();
    expect(accelTween).not.toBeNull();

    // Verify infinite repeat and linear ease on the loop tween
    expect(loopTween?.repeat()).toBe(-1);
    expect(loopTween?.vars.ease).toBe('none');

    // Verify 20% faster acceleration duration (1.92s vs original 2.4s)
    expect(accelTween?.duration()).toBeCloseTo(1.92, 2);

    // Verify starting timeScale is 0 (stands completely still at first tick)
    expect(loopTween?.timeScale()).toBe(0);
  });

  it('animates timeScale from 0 to 1 with an ease-in curve', () => {
    controller = new MarqueeMotionController({
      track,
      centerOffset: 50,
      duration: 30,
      accelDuration: 2.0,
      easeIn: 'power2.in',
    });

    controller.start();

    const loopTween = controller.getLoopTween();
    const accelTween = controller.getAccelTween();

    expect(accelTween?.vars.ease).toBe('power2.in');
    expect(accelTween?.duration()).toBe(2.0);

    // Advance acceleration tween halfway
    accelTween?.seek(1.0);
    const midTimeScale = loopTween?.timeScale() ?? 0;
    // For power2.in at 50% time, timeScale should be (0.5)^2 = 0.25 < 0.5
    expect(midTimeScale).toBeGreaterThan(0);
    expect(midTimeScale).toBeLessThan(0.5);

    // Complete acceleration tween
    accelTween?.seek(2.0);
    expect(loopTween?.timeScale()).toBe(1.0);
  });

  it('stops and kills active tweens on stop()', () => {
    controller = new MarqueeMotionController({
      track,
      centerOffset: 0,
    });

    controller.start();
    expect(controller.isActive()).toBe(true);

    controller.stop();
    expect(controller.isActive()).toBe(false);
    expect(controller.getLoopTween()).toBeNull();
    expect(controller.getAccelTween()).toBeNull();
  });

  it('disposes cleanly on destroy() and is idempotent', () => {
    controller = new MarqueeMotionController({
      track,
      centerOffset: 0,
    });

    controller.start();
    expect(() => {
      controller.destroy();
      controller.destroy();
    }).not.toThrow();

    expect(controller.isActive()).toBe(false);
  });

  it('handles fallback width when scrollWidth is 0', () => {
    // In happy-dom or unmeasured containers, scrollWidth may be 0
    controller = new MarqueeMotionController({
      track,
      centerOffset: -20,
    });

    controller.start();
    const loopTween = controller.getLoopTween();
    expect(loopTween).not.toBeNull();
    // Verify vars.x is a finite number
    expect(Number.isFinite(loopTween?.vars.x)).toBe(true);
  });
});
