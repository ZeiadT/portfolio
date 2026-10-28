import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildSplashToBandTimeline, type SplashElements } from '../splashTimeline';

describe('Splash-to-Band Timeline', () => {
  let curtain: HTMLElement;
  let splashLogo: HTMLElement;
  let navLogo: HTMLElement;
  let navTabs: HTMLElement;
  let bandContainer: HTMLElement;
  let elements: SplashElements;

  beforeEach(() => {
    curtain = document.createElement('div');
    curtain.style.height = '100vh';

    splashLogo = document.createElement('div');
    splashLogo.textContent = 'Zeiad Mohammed';
    splashLogo.style.color = '#0d0d0d';

    navLogo = document.createElement('div');
    navLogo.textContent = 'Zeiad Mohammed';
    navLogo.style.opacity = '0';

    navTabs = document.createElement('nav');
    navTabs.innerHTML = '<a href="#">Work</a><a href="#">About</a><a href="#">Contact</a>';
    navTabs.style.opacity = '0';

    bandContainer = document.createElement('header');

    document.body.appendChild(curtain);
    document.body.appendChild(splashLogo);
    document.body.appendChild(navLogo);
    document.body.appendChild(navTabs);
    document.body.appendChild(bandContainer);

    elements = {
      curtain,
      splashLogo,
      navLogo,
      navTabs,
      bandContainer,
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('creates and returns a valid GSAP timeline', () => {
    const tl = buildSplashToBandTimeline(elements);
    expect(tl).toBeDefined();
    expect(tl.duration()).toBeGreaterThan(0.5);
    tl.kill();
  });

  it('executes callbacks during timeline progression', () => {
    const onStart = vi.fn();
    const onComplete = vi.fn();

    const tl = buildSplashToBandTimeline(elements, {
      onStart,
      onComplete,
    });

    // Jump to completion
    tl.progress(1);
    expect(onStart).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalled();
    tl.kill();
  });

  it('transforms curtain from 100vh to header height', () => {
    const tl = buildSplashToBandTimeline(elements);
    tl.progress(1);

    expect(curtain.style.height).toBe('64px');
    tl.kill();
  });

  it('migrates logo color to white (#ffffff)', () => {
    const tl = buildSplashToBandTimeline(elements);
    tl.progress(1);

    // Either splashLogo or navLogo ends with white color
    const activeLogoColor = splashLogo.style.color || navLogo.style.color;
    expect(activeLogoColor).toMatch(/rgb\(255,\s*255,\s*255\)|#ffffff/i);
    tl.kill();
  });

  it('reveals nav tabs after logo docking', () => {
    const tl = buildSplashToBandTimeline(elements);
    tl.progress(1);

    expect(navTabs.style.opacity).toBe('1');
    tl.kill();
  });
});
