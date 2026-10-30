import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gsap } from 'gsap';
import { CardSummonEngine } from '@/engines/card/CardSummonEngine';

describe('CardSummonEngine Phase 1 - Dim & Bottom Glow', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
  });

  describe('Engine Contract & Initialization', () => {
    it('implements the Engine contract with id card-summon', () => {
      engine = new CardSummonEngine();
      expect(engine.id).toBe('card-summon');
      expect(typeof engine.mount).toBe('function');
      expect(typeof engine.destroy).toBe('function');
      expect(typeof engine.open).toBe('function');
      expect(typeof engine.close).toBe('function');
      expect(typeof engine.isOpen).toBe('function');
    });

    it('is closed by default and does not mount DOM until opened or mounted', () => {
      engine = new CardSummonEngine();
      expect(engine.isOpen()).toBe(false);
      expect(document.querySelector('[data-card-summon-modal]')).toBeNull();
    });
  });

  describe('DOM Elements & Structure', () => {
    it('creates modal with proper dialog semantics and required data attributes on open', () => {
      engine = new CardSummonEngine();
      engine.open();

      expect(engine.isOpen()).toBe(true);
      const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
      expect(modal).not.toBeNull();
      expect(modal?.getAttribute('role')).toBe('dialog');
      expect(modal?.getAttribute('aria-modal')).toBe('true');

      // Backdrop element
      const backdrop = modal?.querySelector<HTMLElement>('[data-summon-backdrop]');
      expect(backdrop).not.toBeNull();

      // Bottom curved hill glow element
      const bottomGlow = modal?.querySelector<HTMLElement>('[data-summon-bottom-glow]');
      expect(bottomGlow).not.toBeNull();

      // Close button
      const closeBtn = modal?.querySelector<HTMLButtonElement>('[data-summon-close]');
      expect(closeBtn).not.toBeNull();
      expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();
    });

    it('mounts to a specified container element if mounted explicitly', () => {
      engine = new CardSummonEngine();
      engine.mount(container);
      engine.open();

      const modal = container.querySelector('[data-card-summon-modal]');
      expect(modal).not.toBeNull();
    });

    it('mounts to document.body if open is called without prior mount', () => {
      engine = new CardSummonEngine();
      engine.open();

      const modal = document.body.querySelector('[data-card-summon-modal]');
      expect(modal).not.toBeNull();
    });
  });

  describe('Swappable Color Theme', () => {
    it('uses default colors (#ff4421 and #ffffff) in the bottom glow SVG/gradient', () => {
      engine = new CardSummonEngine();
      engine.open();

      const glow = document.querySelector('[data-summon-bottom-glow]');
      expect(glow).not.toBeNull();
      const html = glow?.outerHTML || '';
      expect(html).toContain('#ff4421');
      expect(html).toContain('#ffffff');
    });

    it('applies custom theme primaryColor and coreColor when supplied in options', () => {
      engine = new CardSummonEngine({
        theme: {
          primaryColor: '#00ffff',
          coreColor: '#ffff00',
        },
      });
      engine.open();

      const glow = document.querySelector('[data-summon-bottom-glow]');
      expect(glow).not.toBeNull();
      const html = glow?.outerHTML || '';
      expect(html).toContain('#00ffff');
      expect(html).toContain('#ffff00');
      expect(html).not.toContain('#ff4421');
    });
  });

  describe('GSAP Animation & Timeline', () => {
    it('creates an active GSAP timeline on open with backdrop fade and ~0.4s bottom glow emergence', () => {
      engine = new CardSummonEngine();
      engine.open();

      const tl = engine.getTimeline();
      expect(tl).not.toBeNull();
      expect(tl?.duration()).toBeGreaterThanOrEqual(0.35);

      const bottomGlow = document.querySelector<HTMLElement>('[data-summon-bottom-glow]');
      expect(bottomGlow).not.toBeNull();
    });

    it('respects prefers-reduced-motion media query by rendering immediately without motion delays', () => {
      const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList));

      engine = new CardSummonEngine();
      engine.open();

      const tl = engine.getTimeline();
      // When reduced motion is requested, duration should be 0 or instant
      if (tl) {
        expect(tl.duration()).toBe(0);
      }

      matchMediaSpy.mockRestore();
    });
  });

  describe('Accessible Dismissal', () => {
    it('closes on Escape key press and invokes onClose callback', () => {
      const onClose = vi.fn();
      engine = new CardSummonEngine({ onClose });
      engine.open();

      expect(engine.isOpen()).toBe(true);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(engine.isOpen()).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on backdrop click and invokes onClose callback', () => {
      const onClose = vi.fn();
      engine = new CardSummonEngine({ onClose });
      engine.open();

      const backdrop = document.querySelector<HTMLElement>('[data-summon-backdrop]');
      expect(backdrop).not.toBeNull();
      backdrop?.click();

      expect(engine.isOpen()).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on close button click and invokes onClose callback', () => {
      const onClose = vi.fn();
      engine = new CardSummonEngine({ onClose });
      engine.open();

      const closeBtn = document.querySelector<HTMLButtonElement>('[data-summon-close]');
      expect(closeBtn).not.toBeNull();
      closeBtn?.click();

      expect(engine.isOpen()).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not trigger close on Escape if already closed', () => {
      const onClose = vi.fn();
      engine = new CardSummonEngine({ onClose });

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Lifecycle Cleanup & Edge Cases', () => {
    it('kills active GSAP timelines and removes elements on destroy', () => {
      engine = new CardSummonEngine();
      engine.open();

      const tl = engine.getTimeline();
      expect(tl).not.toBeNull();

      engine.destroy();

      expect(engine.isOpen()).toBe(false);
      expect(document.querySelector('[data-card-summon-modal]')).toBeNull();
      expect(tl?.isActive()).toBe(false);
    });

    it('removes keyboard listeners after close or destroy', () => {
      const onClose = vi.fn();
      engine = new CardSummonEngine({ onClose });
      engine.open();
      engine.close();

      // Pressing Escape now should not trigger onClose again
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('handles multiple calls to open gracefully without duplicating DOM elements', () => {
      engine = new CardSummonEngine();
      engine.open();
      engine.open();

      const modals = document.querySelectorAll('[data-card-summon-modal]');
      expect(modals.length).toBe(1);
    });

    it('handles multiple calls to close or destroy gracefully without throwing', () => {
      engine = new CardSummonEngine();
      expect(() => engine.close()).not.toThrow();
      expect(() => engine.destroy()).not.toThrow();
      expect(() => engine.destroy()).not.toThrow();
    });
  });
});

describe('Phase 2: 3D card ascent and rotation', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (engine) {
      engine.destroy();
    }
  });

  it('renders 3D card stage [data-summon-card-stage] and card element [data-summon-card] inside the modal on open', () => {
    engine = new CardSummonEngine();
    engine.open();

    const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
    expect(modal).not.toBeNull();

    const stage = modal?.querySelector<HTMLElement>('[data-summon-card-stage]');
    expect(stage).not.toBeNull();

    const card = stage?.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();
  });

  it('configures 3D perspective on stage and preserve-3d on card element', () => {
    engine = new CardSummonEngine();
    engine.open();

    const stage = document.querySelector<HTMLElement>('[data-summon-card-stage]');
    const card = document.querySelector<HTMLElement>('[data-summon-card]');

    expect(stage).not.toBeNull();
    expect(card).not.toBeNull();

    const stagePerspective = stage?.style.perspective || stage?.className || '';
    expect(
      stagePerspective.includes('1200px') || stage?.style.perspective === '1200px'
    ).toBe(true);

    const cardTransformStyle = card?.style.transformStyle || card?.className || '';
    expect(
      cardTransformStyle.includes('preserve-3d') || card?.style.transformStyle === 'preserve-3d'
    ).toBe(true);
  });

  it('animates card ascent with yPercent towards 0, 3D Y-rotation spin, and 12° Z-tilt deceleration', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();
    expect(tl?.duration()).toBeGreaterThanOrEqual(0.6);

    // Initial state at progress 0 / seek 0
    tl?.seek(0);
    const startYPercent = Number(gsap.getProperty(card, 'yPercent'));
    const startRotY = Math.abs(Number(gsap.getProperty(card, 'rotationY')));
    const startRotZ = Math.abs(Number(gsap.getProperty(card, 'rotationZ')));

    expect(startYPercent).toBeGreaterThan(50);
    expect(startRotY).toBeGreaterThanOrEqual(720);
    expect(startRotZ).toBeGreaterThanOrEqual(10);

    // Resting state at progress 1
    tl?.progress(1);
    const endYPercent = Number(gsap.getProperty(card, 'yPercent'));
    const endRotY = Number(gsap.getProperty(card, 'rotationY'));
    const endRotZ = Number(gsap.getProperty(card, 'rotationZ'));

    expect(endYPercent).toBe(0);
    expect(endRotY).toBe(0);
    expect(endRotZ).toBe(0);
  });

  it('bypasses rapid spinning and ascent animation when prefers-reduced-motion is active', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList));

    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const yPercent = Number(gsap.getProperty(card, 'yPercent'));
    const rotY = Number(gsap.getProperty(card, 'rotationY'));
    const rotZ = Number(gsap.getProperty(card, 'rotationZ'));

    expect(yPercent).toBe(0);
    expect(rotY).toBe(0);
    expect(rotZ).toBe(0);

    matchMediaSpy.mockRestore();
  });

  it('removes card stage and card elements from DOM on close() and destroy()', () => {
    engine = new CardSummonEngine();
    engine.open();

    expect(document.querySelector('[data-summon-card-stage]')).not.toBeNull();
    expect(document.querySelector('[data-summon-card]')).not.toBeNull();

    engine.close();
    expect(document.querySelector('[data-summon-card-stage]')).toBeNull();
    expect(document.querySelector('[data-summon-card]')).toBeNull();

    // Re-open and verify destroy() cleanup
    engine.open();
    expect(document.querySelector('[data-summon-card-stage]')).not.toBeNull();
    expect(document.querySelector('[data-summon-card]')).not.toBeNull();

    engine.destroy();
    expect(document.querySelector('[data-summon-card-stage]')).toBeNull();
    expect(document.querySelector('[data-summon-card]')).toBeNull();
  });
});
