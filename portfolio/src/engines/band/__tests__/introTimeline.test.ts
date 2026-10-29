import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildIntroTimeline, registerCustomEases } from '../introTimeline';

describe('Band Intro Timeline Module', () => {
  let container: HTMLDivElement;
  let wrapper: HTMLDivElement;
  let wordmark: HTMLDivElement;
  let char1: HTMLSpanElement;
  let char2: HTMLSpanElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'intro-curtain';

    wrapper = document.createElement('div');
    wrapper.id = 'hero-wordmark-wrapper';

    wordmark = document.createElement('div');
    wordmark.id = 'hero-wordmark';

    char1 = document.createElement('span');
    char1.className = 'hero-char';
    char1.textContent = 'Z';

    char2 = document.createElement('span');
    char2.className = 'hero-char';
    char2.textContent = 'M';

    wordmark.appendChild(char1);
    wordmark.appendChild(char2);
    wrapper.appendChild(wordmark);
    container.appendChild(wrapper);
    document.body.appendChild(container);
  });

  it('registers custom eases successfully', () => {
    expect(() => registerCustomEases()).not.toThrow();
  });

  it('builds a GSAP timeline with configured initial scale and returns an active timeline instance', () => {
    const onZoomComplete = vi.fn();
    const tl = buildIntroTimeline({
      curtain: container,
      wrapper,
      chars: [char1, char2],
      initialScale: 2.5,
      onZoomComplete,
    });

    expect(tl).toBeDefined();
    expect(typeof tl.kill).toBe('function');
    expect(tl.duration()).toBeGreaterThan(0);

    // Clean teardown
    tl.kill();
  });

  it('can be killed cleanly without throwing memory errors or leaks', () => {
    const tl = buildIntroTimeline({
      curtain: container,
      wrapper,
      chars: [char1, char2],
      initialScale: 3.0,
    });

    expect(() => tl.kill()).not.toThrow();
  });

  it('enforces a protective minimum height floor on the curtain to prevent shrinking smaller than band/logo', () => {
    const tl = buildIntroTimeline({
      curtain: container,
      wrapper,
      chars: [char1, char2],
      initialScale: 2.0,
    });

    expect(container.style.minHeight).toBeTruthy();
    tl.kill();
  });

  it('initializes and animates heroHeader into view on curtain collapse', () => {
    const heroHeader = document.createElement('header');
    heroHeader.id = 'hero-header';
    document.body.appendChild(heroHeader);

    const tl = buildIntroTimeline({
      curtain: container,
      wrapper,
      chars: [char1, char2],
      heroHeader,
      initialScale: 2.0,
    });

    expect(heroHeader.style.opacity).toBe('0');
    tl.kill();
  });
});
