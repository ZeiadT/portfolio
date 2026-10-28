import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ElasticBandEngine, setupMarqueeTrack } from '../index';

describe('ElasticBandEngine', () => {
  let container: HTMLElement;
  let trackEl: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'brand-bar';
    container.style.width = '1000px';
    container.style.height = '60px';

    trackEl = document.createElement('div');
    trackEl.id = 'brand-track';
    container.appendChild(trackEl);

    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('implements Engine lifecycle interface', () => {
    const engine = new ElasticBandEngine();
    expect(engine.id).toBe('elastic-band');
    expect(typeof engine.mount).toBe('function');
    expect(typeof engine.destroy).toBe('function');
    expect(typeof engine.resize).toBe('function');
  });

  it('setupMarqueeTrack populates hero and satellite items into track', () => {
    setupMarqueeTrack(trackEl);
    expect(trackEl.innerHTML).toContain('hero-wordmark-wrapper');
    expect(trackEl.innerHTML).toContain('hero-wordmark');
    expect(trackEl.innerHTML).toContain('satellite-item');
    expect(trackEl.textContent?.replace(/\u00A0/g, ' ')).toContain('Zeiad Mohammed');
  });

  it('mounts canvas element and starts lifecycle', () => {
    const engine = new ElasticBandEngine();
    engine.mount(container);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.className).toContain('pointer-events-auto');

    engine.destroy();
  });

  it('handles resize() gracefully without throwing', () => {
    const engine = new ElasticBandEngine();
    engine.mount(container);

    expect(() => engine.resize()).not.toThrow();
    engine.destroy();
  });

  it('cleans up completely on destroy()', () => {
    const engine = new ElasticBandEngine();
    engine.mount(container);

    engine.destroy();
    expect(container.querySelector('canvas')).toBeNull();
  });
});
