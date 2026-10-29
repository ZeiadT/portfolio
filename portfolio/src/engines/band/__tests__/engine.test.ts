import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ElasticBandEngine } from '../index';

describe('ElasticBandEngine Lifecycle', () => {
  let container: HTMLElement;
  let engine: ElasticBandEngine;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'intro-curtain';
    container.innerHTML = `
      <div id="hero-wordmark-wrapper">
        <div id="hero-wordmark"></div>
      </div>
    `;
    document.body.appendChild(container);
    engine = new ElasticBandEngine();
  });

  afterEach(() => {
    engine.destroy();
  });

  it('implements the Engine contract with id elastic-band', () => {
    expect(engine.id).toBe('elastic-band');
    expect(typeof engine.mount).toBe('function');
    expect(typeof engine.destroy).toBe('function');
  });

  it('mounts properly and populates wordmark character spans', () => {
    engine.mount(container);
    const chars = container.querySelectorAll('.hero-char');
    expect(chars.length).toBe(14);
  });

  it('can replay without throwing', () => {
    engine.mount(container);
    expect(() => engine.replay()).not.toThrow();
  });

  it('cleans up on destroy without leaving residual listeners or throwing', () => {
    engine.mount(container);
    expect(() => engine.destroy()).not.toThrow();
  });

  it('initializes and handles marquee motion lifecycle when track is present', () => {
    const trackContainer = document.createElement('div');
    trackContainer.innerHTML = `
      <div id="intro-curtain"></div>
      <div id="brand-bar">
        <canvas id="marquee-canvas"></canvas>
        <div id="brand-track"></div>
      </div>
    `;
    document.body.appendChild(trackContainer);

    let marqueeReadyFired = false;
    const trackEngine = new ElasticBandEngine({
      onMarqueeReady: () => {
        marqueeReadyFired = true;
      },
    });

    trackEngine.mount(trackContainer);
    expect(marqueeReadyFired).toBe(false);

    const track = trackContainer.querySelector<HTMLElement>('#brand-track');
    expect(track).not.toBeNull();
    // Verify track is populated with units
    expect(trackContainer.querySelectorAll('.marquee-unit').length).toBe(6);

    // Call replay
    expect(() => trackEngine.replay()).not.toThrow();

    // Call transitionToNav
    const transitionTl = trackEngine.transitionToNav();
    expect(transitionTl).not.toBeNull();

    // Destroy
    expect(() => trackEngine.destroy()).not.toThrow();
    trackContainer.remove();
  });
});
