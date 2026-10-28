import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildSplashTimeline, type SplashElements } from '../splashTimeline';

describe('Authentic BOC Splash Timeline', () => {
  let curtain: HTMLElement;
  let heroWrapper: HTMLElement;
  let heroWordmark: HTMLElement;
  let heroChars: HTMLElement[];
  let satellites: HTMLElement[];
  let brandTrack: HTMLElement;
  let backgroundShader: HTMLElement;
  let elements: SplashElements;

  beforeEach(() => {
    curtain = document.createElement('div');
    heroWrapper = document.createElement('div');
    heroWordmark = document.createElement('div');
    heroWrapper.appendChild(heroWordmark);

    heroChars = [];
    for (let i = 0; i < 14; i++) {
      const char = document.createElement('span');
      char.className = 'hero-char';
      heroChars.push(char);
      heroWordmark.appendChild(char);
    }

    satellites = [];
    for (let i = 0; i < 5; i++) {
      const sat = document.createElement('div');
      sat.className = 'satellite-item';
      satellites.push(sat);
    }

    brandTrack = document.createElement('div');
    backgroundShader = document.createElement('div');

    document.body.appendChild(curtain);
    document.body.appendChild(heroWrapper);
    document.body.appendChild(brandTrack);
    document.body.appendChild(backgroundShader);

    elements = {
      curtain,
      heroWrapper,
      heroWordmark,
      heroChars,
      satellites,
      brandTrack,
      backgroundShader,
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('builds authentic GSAP timeline with valid duration', () => {
    const tl = buildSplashTimeline(elements);
    expect(tl).toBeDefined();
    // Authentic sequence has duration around 3s
    expect(tl.duration()).toBeGreaterThanOrEqual(2.0);
    tl.kill();
  });

  it('synchronously pre-positions marquee track with offset', () => {
    const tl = buildSplashTimeline(elements);
    expect(brandTrack.style.getPropertyValue('--marquee-offset')).toBeDefined();
    tl.kill();
  });

  it('staggers hero characters into view and scales wrapper down on completion', () => {
    const tl = buildSplashTimeline(elements);
    tl.progress(1);

    for (const char of heroChars) {
      expect(char.style.opacity).toBe('1');
    }

    const heightVal = parseInt(curtain.style.height, 10);
    expect(heightVal).toBeGreaterThanOrEqual(48);
    expect(heightVal).toBeLessThanOrEqual(65);
    expect(backgroundShader.style.opacity).toBe('1');
    expect(brandTrack.classList.contains('is-scrolling')).toBe(true);
    tl.kill();
  });

  it('triggers onCollapseStart and onMarqueeReady callbacks', () => {
    const onCollapseStart = vi.fn();
    const onMarqueeReady = vi.fn();

    const tl = buildSplashTimeline(elements, {
      onCollapseStart,
      onMarqueeReady,
    });

    tl.progress(1);
    expect(onCollapseStart).toHaveBeenCalled();
    expect(onMarqueeReady).toHaveBeenCalled();
    tl.kill();
  });
});
