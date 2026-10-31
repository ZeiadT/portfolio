import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import { gsap } from 'gsap';
import { CardSummonEngine } from '@/engines/card/CardSummonEngine';
import { ThreeCardModel } from '@/engines/card/three/ThreeCardModel';

// Polyfill Canvas 2D context for headless happy-dom environment
const originalGetContext = typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.getContext : undefined;

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextType: string, ...args: unknown[]) {
    if (contextType === '2d') {
      return {
        canvas: this,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
        globalAlpha: 1,
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        drawImage: vi.fn(),
        createLinearGradient: vi.fn(() => ({
          addColorStop: vi.fn(),
        })),
        createRadialGradient: vi.fn(() => ({
          addColorStop: vi.fn(),
        })),
        measureText: vi.fn((text: string) => ({
          width: text.length * 8,
          actualBoundingBoxAscent: 10,
          actualBoundingBoxDescent: 2,
        })),
        setTransform: vi.fn(),
        resetTransform: vi.fn(),
        roundRect: vi.fn(),
        clip: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
    }
    return originalGetContext ? (originalGetContext.apply(this, [contextType, ...args] as any) as any) : null;
  };
}

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
    vi.restoreAllMocks();
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

      // Backdrop element with reduced 10% dimming (bg-black/75)
      const backdrop = modal?.querySelector<HTMLElement>('[data-summon-backdrop]');
      expect(backdrop).not.toBeNull();
      expect(backdrop?.className).toContain('bg-black/75');

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
    vi.restoreAllMocks();
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
    expect(endRotY).toBe(180);
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
    expect(rotY).toBe(180);
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

describe('Phase 3: Card Slam Animation & Impact Aura', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (engine) {
      engine.destroy();
    }
  });

  it('creates [data-summon-card-aura] positioned before [data-summon-card] within [data-summon-card-stage]', () => {
    engine = new CardSummonEngine();
    engine.open();

    const stage = document.querySelector<HTMLElement>('[data-summon-card-stage]');
    expect(stage).not.toBeNull();

    const aura = stage?.querySelector<HTMLElement>('[data-summon-card-aura]');
    const card = stage?.querySelector<HTMLElement>('[data-summon-card]');

    expect(aura).not.toBeNull();
    expect(card).not.toBeNull();

    // Verify DOM order: aura must precede card so that CSS stacking/DOM order renders aura behind card
    const stageChildren = Array.from(stage?.children || []);
    const auraIndex = stageChildren.indexOf(aura!);
    const cardIndex = stageChildren.indexOf(card!);

    expect(auraIndex).toBeGreaterThanOrEqual(0);
    expect(cardIndex).toBeGreaterThan(auraIndex);
  });

  it('animates bottom energy portal glow [data-summon-bottom-glow] to recede and fade out (opacity <= 0.05) as the card ascends', () => {
    engine = new CardSummonEngine();
    engine.open();

    const bottomGlow = document.querySelector<HTMLElement>('[data-summon-bottom-glow]');
    expect(bottomGlow).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // At progress 1 (completion of entrance), bottom glow should recede and fade out
    tl?.progress(1);
    const endOpacity = Number(gsap.getProperty(bottomGlow, 'opacity'));
    expect(endOpacity).toBeLessThanOrEqual(0.05);
  });

  it('launches card with 3 full spins (1080°) and sustains slow-motion apex hover with negative yPercent before graceful descent', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Initial state at progress 0 / seek 0: exactly 3 spins (1080°) ending at 180° (start = -900°)
    tl?.seek(0);
    const startRotY = Number(gsap.getProperty(card, 'rotationY'));
    expect(startRotY).toBe(-900);

    // During apex slow-motion hover (sampled between progress 0.65 and 0.80),
    // yPercent remains in negative overshoot (< 0) while rotationY has decelerated to <= 30° from 180°
    for (let p = 0.65; p <= 0.80; p += 0.05) {
      tl?.progress(p);
      const yPercent = Number(gsap.getProperty(card, 'yPercent'));
      const rotY = Number(gsap.getProperty(card, 'rotationY'));

      expect(yPercent).toBeLessThan(0);
      expect(Math.abs(rotY - 180)).toBeLessThanOrEqual(30);
    }
  });

  it('animates card through a lowered apex overshoot past center (minYPercent between -3.5 and -2.0) before settling to 0', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Sample yPercent values across timeline progress to verify apex overshoot
    let minYPercent = 0;
    for (let p = 0; p <= 1; p += 0.02) {
      tl?.progress(p);
      const y = Number(gsap.getProperty(card, 'yPercent'));
      if (y < minYPercent) {
        minYPercent = y;
      }
    }

    // Must overshoot vertically past center into subtle negative yPercent between -3.5 and -2.0 (not -6.0)
    expect(minYPercent).toBeLessThanOrEqual(-2.0);
    expect(minYPercent).toBeGreaterThanOrEqual(-3.5);

    // Final settled state at completion must be precisely 0
    tl?.progress(1);
    expect(Number(gsap.getProperty(card, 'yPercent'))).toBe(0);
  });

  it('animates slower graceful fall into place lasting >= 0.4s without violent squash compression (scaleY >= 0.98)', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Find the descent tween that transitions card into resting yPercent: 0
    const descentTween = tl?.getChildren().find((child: any) => {
      const isCard = typeof child.targets === 'function' ? child.targets().includes(card) : true;
      return isCard && child.vars && child.vars.yPercent === 0;
    }) as gsap.core.Tween | undefined;

    expect(descentTween).toBeDefined();
    const descentDuration = descentTween!.duration();

    // Descent into resting position must take >= 0.4s (graceful fall, not violent snap)
    expect(descentDuration).toBeGreaterThanOrEqual(0.4);

    const descentStart = descentTween!.startTime();
    const descentEnd = descentStart + descentDuration;

    // Sample scaleY across the descent interval to verify no violent squash compression
    let minDescentScaleY = 1.0;
    for (let t = descentStart; t <= descentEnd; t += 0.01) {
      tl?.seek(t);
      const sY = Number(gsap.getProperty(card, 'scaleY'));
      if (sY < minDescentScaleY) {
        minDescentScaleY = sY;
      }
    }
    expect(minDescentScaleY).toBeGreaterThanOrEqual(0.98);

    // Locks smoothly into resting state at progress(1)
    tl?.progress(1);
    expect(Number(gsap.getProperty(card, 'yPercent'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(Number(gsap.getProperty(card, 'rotationZ'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'scale'))).toBe(1);
  });

  it('synchronizes landing at timeline completion with yPercent 0, rotationY 180, and rotationZ 0', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    tl?.progress(1);

    expect(Number(gsap.getProperty(card, 'yPercent'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(Number(gsap.getProperty(card, 'rotationZ'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'scale'))).toBe(1);
    expect(Number(gsap.getProperty(card, 'scaleY'))).toBe(1);
    expect(Number(gsap.getProperty(card, 'scaleX'))).toBe(1);
    expect(Number(gsap.getProperty(card, 'opacity'))).toBe(1);
  });

  it('animates perimeter aura to swell during apex and softly dissipate to <= 0.05 upon landing', () => {
    engine = new CardSummonEngine();
    engine.open();

    const aura = document.querySelector<HTMLElement>('[data-summon-card-aura]');
    expect(aura).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Sample aura opacity across timeline progression
    let peakAuraOpacity = 0;
    for (let p = 0; p <= 1; p += 0.02) {
      tl?.progress(p);
      const opacity = Number(gsap.getProperty(aura, 'opacity'));
      if (opacity > peakAuraOpacity) {
        peakAuraOpacity = opacity;
      }
    }

    // Aura swells during apex hover
    expect(peakAuraOpacity).toBeGreaterThanOrEqual(0.8);

    // Softly fades out to <= 0.05 at completion / resting state
    tl?.progress(1);
    const finalAuraOpacity = Number(gsap.getProperty(aura, 'opacity'));
    expect(finalAuraOpacity).toBeLessThanOrEqual(0.05);
  });

  it('bypasses card apex overshoot and aura flare when prefers-reduced-motion is active', () => {
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
    const aura = document.querySelector<HTMLElement>('[data-summon-card-aura]');

    expect(card).not.toBeNull();
    expect(aura).not.toBeNull();

    // In reduced motion mode, card must be immediately at resting state
    expect(Number(gsap.getProperty(card, 'yPercent'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(Number(gsap.getProperty(card, 'rotationZ'))).toBe(0);

    // Aura must not flare (opacity <= 0.2 or 0)
    expect(Number(gsap.getProperty(aura, 'opacity'))).toBeLessThanOrEqual(0.2);

    matchMediaSpy.mockRestore();
  });

  it('removes [data-summon-card-aura] from DOM on close() and destroy()', () => {
    engine = new CardSummonEngine();
    engine.open();

    expect(document.querySelector('[data-summon-card-aura]')).not.toBeNull();

    engine.close();
    expect(document.querySelector('[data-summon-card-aura]')).toBeNull();

    // Re-open and verify destroy() cleanup
    engine.open();
    expect(document.querySelector('[data-summon-card-aura]')).not.toBeNull();

    engine.destroy();
    expect(document.querySelector('[data-summon-card-aura]')).toBeNull();
  });
});

describe('Phase 4: TCG Mystic Sigil Card Back Design', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (engine) {
      engine.destroy();
    }
  });

  it('creates double-sided 3D card structure with [data-summon-card-back] and [data-summon-card-face]', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const cardBack = card?.querySelector<HTMLElement>('[data-summon-card-back]');
    const cardFace = card?.querySelector<HTMLElement>('[data-summon-card-face]');

    expect(cardBack).not.toBeNull();
    expect(cardFace).not.toBeNull();

    // Verify absolute inset-0 coverage
    expect(cardBack?.className).toMatch(/\babsolute\b/);
    expect(cardBack?.className).toMatch(/\binset-0\b/);
    expect(cardFace?.className).toMatch(/\babsolute\b/);
    expect(cardFace?.className).toMatch(/\binset-0\b/);

    // Verify backface-visibility: hidden on both sides
    const hasBackfaceHidden = (el: HTMLElement) =>
      el.style.backfaceVisibility === 'hidden' ||
      el.className.includes('backface-hidden') ||
      el.className.includes('[backface-visibility:hidden]');

    expect(hasBackfaceHidden(cardBack!)).toBe(true);
    expect(hasBackfaceHidden(cardFace!)).toBe(true);

    // Verify card face is rotated 180deg in Y axis for true double-sided 3D entity
    const hasRotateY180 = (el: HTMLElement) =>
      el.style.transform.includes('rotateY(180deg)') ||
      el.className.includes('rotate-y-180') ||
      el.className.includes('[transform:rotateY(180deg)]');

    expect(hasRotateY180(cardFace!)).toBe(true);
  });

  it('renders Mystic Sigil SVG containing outer frame, 4 corner filigrees, halo rings, and Ace crest', () => {
    engine = new CardSummonEngine();
    engine.open();

    const cardBack = document.querySelector<HTMLElement>('[data-summon-card-back]');
    expect(cardBack).not.toBeNull();

    const svg = cardBack?.querySelector('svg');
    expect(svg).not.toBeNull();

    const frame = cardBack?.querySelector('[data-summon-card-back-frame]');
    expect(frame).not.toBeNull();

    const filigrees = cardBack?.querySelectorAll('[data-summon-card-filigree]');
    expect(filigrees?.length).toBe(4);

    const halo = cardBack?.querySelector('[data-summon-card-halo]');
    expect(halo).not.toBeNull();

    const crest = cardBack?.querySelector('[data-summon-card-crest]');
    expect(crest).not.toBeNull();

    const patterns = cardBack?.querySelector('[data-summon-card-pattern]');
    expect(patterns).not.toBeNull();
  });

  it('renders default theme colors in the Mystic Sigil SVG definitions', () => {
    engine = new CardSummonEngine();
    engine.open();

    const cardBack = document.querySelector('[data-summon-card-back]');
    expect(cardBack).not.toBeNull();
    const svgHtml = cardBack?.innerHTML || '';

    expect(svgHtml).toContain('#ff4421');
    expect(svgHtml).toContain('#ffffff');
  });

  it('renders custom theme primaryColor and coreColor in the Mystic Sigil SVG definitions', () => {
    engine = new CardSummonEngine({
      theme: {
        primaryColor: '#00ffcc',
        coreColor: '#ffd700',
      },
    });
    engine.open();

    const cardBack = document.querySelector('[data-summon-card-back]');
    expect(cardBack).not.toBeNull();
    const svgHtml = cardBack?.innerHTML || '';

    expect(svgHtml).toContain('#00ffcc');
    expect(svgHtml).toContain('#ffd700');
  });

  it('removes card back and card face elements from DOM on close() and destroy()', () => {
    engine = new CardSummonEngine();
    engine.open();

    expect(document.querySelector('[data-summon-card-back]')).not.toBeNull();
    expect(document.querySelector('[data-summon-card-face]')).not.toBeNull();

    engine.close();
    expect(document.querySelector('[data-summon-card-back]')).toBeNull();
    expect(document.querySelector('[data-summon-card-face]')).toBeNull();

    // Re-open and verify destroy() cleanup
    engine.open();
    expect(document.querySelector('[data-summon-card-back]')).not.toBeNull();
    expect(document.querySelector('[data-summon-card-face]')).not.toBeNull();

    engine.destroy();
    expect(document.querySelector('[data-summon-card-back]')).toBeNull();
    expect(document.querySelector('[data-summon-card-face]')).toBeNull();
  });
});



describe('Gacha Psychology & Motion Redesign', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (engine) {
      engine.destroy();
    }
  });

  it('creates [data-summon-flash-veil] and [data-summon-shockwave] inside modal with aria-hidden="true" and pointer-events-none', () => {
    engine = new CardSummonEngine();
    engine.open();

    const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
    expect(modal).not.toBeNull();

    const flashVeil = modal?.querySelector<HTMLElement>('[data-summon-flash-veil]');
    const shockwave = modal?.querySelector<HTMLElement>('[data-summon-shockwave]');

    expect(flashVeil).not.toBeNull();
    expect(shockwave).not.toBeNull();

    expect(flashVeil?.getAttribute('aria-hidden')).toBe('true');
    expect(shockwave?.getAttribute('aria-hidden')).toBe('true');

    expect(flashVeil?.className).toMatch(/\bpointer-events-none\b/);
    expect(shockwave?.className).toMatch(/\bpointer-events-none\b/);
  });

  it('animates anticipatory inhale squash on bottom glow (scaleY < 0.9, scaleX > 1.05) prior to card launch', () => {
    engine = new CardSummonEngine();
    engine.open();

    const bottomGlow = document.querySelector<HTMLElement>('[data-summon-bottom-glow]');
    expect(bottomGlow).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Sample scaleY and scaleX on bottom glow during early timeline (p ~ 0.12 - 0.20)
    let minScaleY = 1.0;
    let maxScaleX = 1.0;

    for (let p = 0.12; p <= 0.20; p += 0.02) {
      tl?.progress(p);
      const sY = Number(gsap.getProperty(bottomGlow, 'scaleY'));
      const sX = Number(gsap.getProperty(bottomGlow, 'scaleX'));
      if (sY < minScaleY) minScaleY = sY;
      if (sX > maxScaleX) maxScaleX = sX;
    }

    expect(minScaleY).toBeLessThan(0.9);
    expect(maxScaleX).toBeGreaterThan(1.05);
  });

  it('executes a subtle tension hum vibration (amplitude <= 1.0px) before terminating at the fermata freeze', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Sample during the pre-fermata vibration window (0.75s - 1.10s)
    let maxAbsX = 0;
    for (let t = 0.76; t <= 1.05; t += 0.02) {
      tl?.seek(t);
      const xVal = Math.abs(Number(gsap.getProperty(card!, 'x')) || 0);
      if (xVal > maxAbsX) maxAbsX = xVal;
    }

    // Should have subtle tension hum (non-zero, but <= 1.0px to avoid violent jarring)
    expect(maxAbsX).toBeGreaterThan(0.2);
    expect(maxAbsX).toBeLessThanOrEqual(1.0);

    // Terminates cleanly at x: 0 at the start of the 150ms fermata freeze (1.10s)
    tl?.seek(1.10);
    expect(Number(gsap.getProperty(card!, 'x'))).toBe(0);
  });

  it('implements the 150ms Fermata freeze locking spatial translation while subtly expanding scale at apex', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Sample card motion at start and end of the 150ms Fermata freeze window (p ~ 0.55 - 0.65)
    tl?.progress(0.55);
    const startX = Number(gsap.getProperty(card, 'x'));
    const startRotY = Number(gsap.getProperty(card, 'rotationY'));
    const startRotZ = Number(gsap.getProperty(card, 'rotationZ'));
    const startScale = Number(gsap.getProperty(card, 'scale'));

    tl?.progress(0.65);
    const endX = Number(gsap.getProperty(card, 'x'));
    const endRotY = Number(gsap.getProperty(card, 'rotationY'));
    const endRotZ = Number(gsap.getProperty(card, 'rotationZ'));
    const endScale = Number(gsap.getProperty(card, 'scale'));

    // Spatial translation locked (zero vibration, locked at x: 0)
    expect(startX).toBe(0);
    expect(endX).toBe(0);

    // Rotations are steady during fermata freeze
    expect(Math.abs(endRotY - startRotY)).toBeLessThanOrEqual(1.0);
    expect(Math.abs(endRotZ - startRotZ)).toBeLessThanOrEqual(0.5);

    // Subtle tension scale expansion at apex (scale: 1.020 -> 1.025)
    expect(startScale).toBeGreaterThanOrEqual(1.018);
    expect(endScale).toBeGreaterThan(startScale);
    expect(endScale).toBeLessThanOrEqual(1.030);
  });

  it('animates optical flash veil (peak opacity >= 0.9) and shockwave expansion (scale >= 2.0) at climax', () => {
    engine = new CardSummonEngine();
    engine.open();

    const flashVeil = document.querySelector<HTMLElement>('[data-summon-flash-veil]');
    const shockwave = document.querySelector<HTMLElement>('[data-summon-shockwave]');
    expect(flashVeil).not.toBeNull();
    expect(shockwave).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    let peakFlashOpacity = 0;
    let maxShockwaveScale = 0;

    for (let p = 0; p <= 1; p += 0.02) {
      tl?.progress(p);
      const flashOpacity = Number(gsap.getProperty(flashVeil, 'opacity'));
      const swScale = Number(gsap.getProperty(shockwave, 'scale'));
      if (flashOpacity > peakFlashOpacity) {
        peakFlashOpacity = flashOpacity;
      }
      if (swScale > maxShockwaveScale) {
        maxShockwaveScale = swScale;
      }
    }

    expect(peakFlashOpacity).toBeGreaterThanOrEqual(0.9);
    expect(maxShockwaveScale).toBeGreaterThanOrEqual(2.0);

    // Dissipates to 0 (or opacity <= 0.05) when animation settles
    tl?.progress(1);
    expect(Number(gsap.getProperty(flashVeil, 'opacity'))).toBeLessThanOrEqual(0.05);
    expect(Number(gsap.getProperty(shockwave, 'opacity'))).toBeLessThanOrEqual(0.05);
  });

  it('activates interactive 3D pointer parallax tilt on settled state and resets on pointer leave', () => {
    engine = new CardSummonEngine();
    engine.open();

    const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(modal).not.toBeNull();
    expect(card).not.toBeNull();

    // Mock modal bounds for deterministic parallax calculations
    vi.spyOn(modal!, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      right: 1000,
      bottom: 800,
      width: 1000,
      height: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Finish opening animation into settled state
    tl?.progress(1);

    // Initial settled rotations must be 180 (front face) and 0 (pitch)
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(Number(gsap.getProperty(card, 'rotationX'))).toBe(0);

    // Dispatch pointermove away from center (bottom-right offset)
    modal?.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 800,
        clientY: 650,
        bubbles: true,
      })
    );

    // Resolve active GSAP tweens on card
    gsap.getTweensOf(card).forEach((tween) => tween.progress(1));

    const movedRotY = Number(gsap.getProperty(card, 'rotationY'));
    const movedRotX = Number(gsap.getProperty(card, 'rotationX'));

    // Should have non-zero rotation tilt relative to 180 within [-15, 15] degrees
    expect(movedRotY).not.toBe(180);
    expect(Math.abs(movedRotY - 180)).toBeLessThanOrEqual(15);
    expect(movedRotX).not.toBe(0);
    expect(Math.abs(movedRotX)).toBeLessThanOrEqual(15);

    // Dispatch pointerleave on modal - restores card rotation back towards 180
    modal?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    gsap.getTweensOf(card).forEach((tween) => tween.progress(1));

    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(Number(gsap.getProperty(card, 'rotationX'))).toBe(0);
  });

  it('leaves rotationY strictly at 180 and rotationX at 0 when pointermove is dispatched under prefers-reduced-motion: reduce', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    engine = new CardSummonEngine();
    engine.open();

    const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(modal).not.toBeNull();
    expect(card).not.toBeNull();

    vi.spyOn(modal!, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 800,
      right: 1000,
      bottom: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const tl = engine.getTimeline();
    tl?.progress(1);

    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(Number(gsap.getProperty(card, 'rotationX'))).toBe(0);

    // Dispatch pointermove away from center
    modal?.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: 800,
        clientY: 650,
        bubbles: true,
      })
    );

    // Resolve any active GSAP tweens on card
    gsap.getTweensOf(card).forEach((tween) => tween.progress(1));

    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(Number(gsap.getProperty(card, 'rotationX'))).toBe(0);

    matchMediaSpy.mockRestore();
  });

  it('removes flash veil, shockwave, and pointer listeners cleanly on close() and destroy()', () => {
    engine = new CardSummonEngine();
    engine.open();

    const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
    expect(modal).not.toBeNull();
    expect(document.querySelector('[data-summon-flash-veil]')).not.toBeNull();
    expect(document.querySelector('[data-summon-shockwave]')).not.toBeNull();

    const tl = engine.getTimeline();
    tl?.progress(1);

    const removeEventListenerSpy = vi.spyOn(modal!, 'removeEventListener');

    engine.close();

    // DOM elements removed
    expect(document.querySelector('[data-summon-flash-veil]')).toBeNull();
    expect(document.querySelector('[data-summon-shockwave]')).toBeNull();

    // Pointer listeners detached
    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerleave', expect.any(Function));

    // Re-open and verify destroy() teardown
    engine.open();
    const modal2 = document.querySelector<HTMLElement>('[data-card-summon-modal]');
    expect(modal2).not.toBeNull();
    expect(document.querySelector('[data-summon-flash-veil]')).not.toBeNull();
    expect(document.querySelector('[data-summon-shockwave]')).not.toBeNull();

    const tl2 = engine.getTimeline();
    tl2?.progress(1);

    const removeEventListenerSpy2 = vi.spyOn(modal2!, 'removeEventListener');

    engine.destroy();

    expect(document.querySelector('[data-summon-flash-veil]')).toBeNull();
    expect(document.querySelector('[data-summon-shockwave]')).toBeNull();
    expect(removeEventListenerSpy2).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeEventListenerSpy2).toHaveBeenCalledWith('pointerleave', expect.any(Function));
  });
});

describe('CardSummonEngine Phase 5 - Front Card Face & Concealment Sheen', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (engine) {
      engine.destroy();
    }
  });

  it('renders front card face structure inside [data-summon-card-face] with header, stars, class, portrait, lore, and attribute tickers', () => {
    engine = new CardSummonEngine();
    engine.open();

    const cardFace = document.querySelector<HTMLElement>('[data-summon-card-face]');
    expect(cardFace).not.toBeNull();

    // Header block
    const header = cardFace?.querySelector<HTMLElement>('[data-summon-face-header]');
    expect(header).not.toBeNull();

    const rarity = header?.querySelector<HTMLElement>('[data-summon-face-rarity]');
    expect(rarity).not.toBeNull();
    expect(rarity?.textContent).toContain('MYTHIC RARE');

    const stars = header?.querySelector<HTMLElement>('[data-summon-face-stars]');
    expect(stars).not.toBeNull();
    expect(stars?.textContent).toContain('★★★★★');

    const classBadge = header?.querySelector<HTMLElement>('[data-summon-face-class]');
    expect(classBadge).not.toBeNull();
    expect(classBadge?.textContent).toContain('Mobile & Frontend Architect');

    // Holographic arch portrait window
    const portraitWindow = cardFace?.querySelector<HTMLElement>('[data-summon-face-portrait-window]');
    expect(portraitWindow).not.toBeNull();

    const avatar = portraitWindow?.querySelector<HTMLImageElement>('[data-summon-face-avatar]');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('src')).toBe('/profile.jpg');
    expect(avatar?.getAttribute('alt')).toBeTruthy();

    // Lore block
    const lore = cardFace?.querySelector<HTMLElement>('[data-summon-face-lore]');
    expect(lore).not.toBeNull();

    const name = lore?.querySelector<HTMLElement>('[data-summon-face-name]');
    expect(name).not.toBeNull();
    expect(name?.textContent).toContain('Zeiad Mohammed');

    const skillTitle = lore?.querySelector<HTMLElement>('[data-summon-face-skill-title]');
    expect(skillTitle).not.toBeNull();
    expect(skillTitle?.textContent).toContain('Engineered Precision');

    const skillDesc = lore?.querySelector<HTMLElement>('[data-summon-face-skill-desc]');
    expect(skillDesc).not.toBeNull();
    expect(skillDesc?.textContent).toContain('Orchestrates zero-overhead 60fps reactive motion');

    // Attribute stats block
    const stats = cardFace?.querySelector<HTMLElement>('[data-summon-face-stats]');
    expect(stats).not.toBeNull();

    const statPerf = stats?.querySelector<HTMLElement>('[data-summon-stat-perf]');
    expect(statPerf).not.toBeNull();
    expect(statPerf?.textContent).toContain('99');

    const statArch = stats?.querySelector<HTMLElement>('[data-summon-stat-arch]');
    expect(statArch).not.toBeNull();
    expect(statArch?.textContent).toContain('98');

    const statCode = stats?.querySelector<HTMLElement>('[data-summon-stat-code]');
    expect(statCode).not.toBeNull();
    expect(statCode?.textContent).toContain('95');
  });

  it('supports custom cardData configuration', () => {
    const customData = {
      name: 'Custom Developer',
      rarity: 'SECRET RARE',
      stars: 3,
      role: 'Systems Engineer',
      imageSrc: '/custom.jpg',
      imageAlt: 'Custom Avatar',
      skillName: 'Zero Alloc',
      skillDescription: 'No GC latency',
      stats: { perf: 100, arch: 92, code: 99 },
    };

    engine = new CardSummonEngine({
      cardData: customData as any,
    });
    engine.open();

    const cardFace = document.querySelector<HTMLElement>('[data-summon-card-face]');
    expect(cardFace).not.toBeNull();

    const rarity = cardFace?.querySelector<HTMLElement>('[data-summon-face-rarity]');
    expect(rarity).not.toBeNull();
    expect(rarity?.textContent).toContain('SECRET RARE');

    const stars = cardFace?.querySelector<HTMLElement>('[data-summon-face-stars]');
    expect(stars).not.toBeNull();
    expect(stars?.textContent).toContain('★★★');

    const roleBadge = cardFace?.querySelector<HTMLElement>('[data-summon-face-class]');
    expect(roleBadge).not.toBeNull();
    expect(roleBadge?.textContent).toContain('Systems Engineer');

    const avatar = cardFace?.querySelector<HTMLImageElement>('[data-summon-face-avatar]');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('src')).toBe('/custom.jpg');
    expect(avatar?.getAttribute('alt')).toBe('Custom Avatar');

    const name = cardFace?.querySelector<HTMLElement>('[data-summon-face-name]');
    expect(name).not.toBeNull();
    expect(name?.textContent).toContain('Custom Developer');

    const skillTitle = cardFace?.querySelector<HTMLElement>('[data-summon-face-skill-title]');
    expect(skillTitle).not.toBeNull();
    expect(skillTitle?.textContent).toContain('Zero Alloc');

    const skillDesc = cardFace?.querySelector<HTMLElement>('[data-summon-face-skill-desc]');
    expect(skillDesc).not.toBeNull();
    expect(skillDesc?.textContent).toContain('No GC latency');

    const statPerf = cardFace?.querySelector<HTMLElement>('[data-summon-stat-perf]');
    expect(statPerf).not.toBeNull();
    expect(statPerf?.textContent).toContain('100');

    const statArch = cardFace?.querySelector<HTMLElement>('[data-summon-stat-arch]');
    expect(statArch).not.toBeNull();
    expect(statArch?.textContent).toContain('92');

    const statCode = cardFace?.querySelector<HTMLElement>('[data-summon-stat-code]');
    expect(statCode).not.toBeNull();
    expect(statCode?.textContent).toContain('99');
  });

  it('renders frosted obsidian concealment veil [data-summon-card-front-mask] with specular sheen [data-summon-card-front-sheen]', () => {
    engine = new CardSummonEngine();
    engine.open();

    const cardFace = document.querySelector<HTMLElement>('[data-summon-card-face]');
    expect(cardFace).not.toBeNull();

    const frontMask = cardFace?.querySelector<HTMLElement>('[data-summon-card-front-mask]');
    expect(frontMask).not.toBeNull();
    expect(frontMask?.className).toContain('backdrop-blur-xl');

    const sheen = frontMask?.querySelector<HTMLElement>('[data-summon-card-front-sheen]');
    expect(sheen).not.toBeNull();

    const tweens = gsap.getTweensOf(sheen!);
    expect(tweens.length).toBeGreaterThan(0);
  });

  it('supports swappable CardFaceRenderer via options.faceRenderer', () => {
    const mockRender = vi.fn((container: HTMLElement) => {
      const customEl = document.createElement('div');
      customEl.setAttribute('data-custom-face', '');
      customEl.textContent = 'Custom Rendered Face';
      container.appendChild(customEl);
    });

    const mockRenderer = {
      id: 'custom-face-renderer',
      render: mockRender,
    };

    engine = new CardSummonEngine({
      faceRenderer: mockRenderer,
    } as any);

    engine.open();

    const cardFace = document.querySelector<HTMLElement>('[data-summon-card-face]');
    expect(cardFace).not.toBeNull();
    expect(mockRender).toHaveBeenCalledWith(
      cardFace,
      expect.any(Object),
      expect.any(Object)
    );
    expect(cardFace?.querySelector('[data-custom-face]')).not.toBeNull();
  });

  it('respects prefers-reduced-motion for concealment sheen animation', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      engine = new CardSummonEngine();
      engine.open();

      const sheen = document.querySelector<HTMLElement>('[data-summon-card-front-sheen]');
      expect(sheen).not.toBeNull();

      const tweens = gsap.getTweensOf(sheen!);
      expect(tweens.length).toBe(0);
    } finally {
      matchMediaSpy.mockRestore();
    }
  });

  it('cleans up front card face, concealment mask, and sheen tweens on close() and destroy()', () => {
    engine = new CardSummonEngine();
    engine.open();

    const sheen = document.querySelector<HTMLElement>('[data-summon-card-front-sheen]');
    expect(sheen).not.toBeNull();
    const mask = document.querySelector<HTMLElement>('[data-summon-card-front-mask]');
    expect(mask).not.toBeNull();

    engine.close();

    expect(document.querySelector('[data-summon-card-front-mask]')).toBeNull();
    expect(document.querySelector('[data-summon-card-front-sheen]')).toBeNull();
    expect(document.querySelector('[data-card-summon-modal]')).toBeNull();
    if (sheen) {
      expect(gsap.getTweensOf(sheen).length).toBe(0);
    }

    // Re-open and verify destroy() teardown
    engine.open();
    const sheen2 = document.querySelector<HTMLElement>('[data-summon-card-front-sheen]');
    expect(sheen2).not.toBeNull();

    engine.destroy();

    expect(document.querySelector('[data-summon-card-front-mask]')).toBeNull();
    expect(document.querySelector('[data-summon-card-front-sheen]')).toBeNull();
    expect(document.querySelector('[data-card-summon-modal]')).toBeNull();
    if (sheen2) {
      expect(gsap.getTweensOf(sheen2).length).toBe(0);
    }
  });

  it('supports autoFlipToFront option to automatically rotate card to front face upon timeline completion', () => {
    engine = new CardSummonEngine({ autoFlipToFront: true });
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Trigger onComplete
    tl?.progress(1);

    // Engine's isFlipped state should be true
    expect(engine.isCardFlipped()).toBe(true);
  });

  it('supports interactive card flip and concealment mask toggle controls', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    tl?.progress(1);

    // Initial state: lands on front side, blurred
    expect(engine.isCardFlipped()).toBe(true);

    // Flip card programmatically or via click to back sigil (0deg)
    engine.flipCard();
    expect(engine.isCardFlipped()).toBe(false);

    // Flip back to front face (180deg)
    engine.flipCard();
    expect(engine.isCardFlipped()).toBe(true);

    // Toggle concealment mask
    const mask = document.querySelector<HTMLElement>('[data-summon-card-front-mask]');
    expect(mask).not.toBeNull();

    // Inspection controls: mask starts dissolved after reveal, button toggles it back on and off
    expect(engine.isMaskConcealed()).toBe(false);
    engine.toggleConcealment();
    expect(engine.isMaskConcealed()).toBe(true);
    engine.toggleConcealment();
    expect(engine.isMaskConcealed()).toBe(false);
  });

  it('concludes summon spin directly on the front card face (rotationY: 180) veiled by the frosted blur mask', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    const frontMask = document.querySelector<HTMLElement>('[data-summon-card-front-mask]');
    expect(card).not.toBeNull();
    expect(frontMask).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Verify 3-spin start (-900deg) to front face (180deg)
    tl?.seek(0);
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(-900);

    // Settle animation
    tl?.progress(1);

    // Concludes squarely at 180deg on front face without post-landing auto-flip jump
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(180);
    expect(engine.isCardFlipped()).toBe(true);

    // During summon reveal, the veil dissolves (1 -> 0) so the card rests bright & clear
    expect(frontMask?.className).toContain('backdrop-blur-xl');
    expect(engine.isMaskConcealed()).toBe(false);
  });

  it('applies calibrated zoomed card dimensions reduced by 10% w-[290px] sm:w-[335px] md:w-[370px] lg:w-[396px]', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();
    expect(card?.className).toContain('w-[290px]');
    expect(card?.className).toContain('sm:w-[335px]');
    expect(card?.className).toContain('md:w-[370px]');
    expect(card?.className).toContain('lg:w-[396px]');

    const cardAura = document.querySelector<HTMLElement>('[data-summon-card-aura]');
    expect(cardAura?.className).toContain('w-[290px]');
    expect(cardAura?.className).toContain('lg:w-[396px]');

    const shockwave = document.querySelector<HTMLElement>('[data-summon-shockwave]');
    expect(shockwave?.className).toContain('w-[306px]');
    expect(shockwave?.className).toContain('md:w-[405px]');
  });
});

describe('Three.js 3D Physical Card Model Integration', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (engine) {
      engine.destroy();
    }
  });

  afterAll(() => {
    if (typeof HTMLCanvasElement !== 'undefined' && originalGetContext) {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  it('instantiates and mounts ThreeCardModel inside card stage on open()', () => {
    engine = new CardSummonEngine();
    engine.open();

    const threeModel = engine.getThreeCardModel();
    expect(threeModel).not.toBeNull();
    expect(threeModel).toBeInstanceOf(ThreeCardModel);

    const stage = document.querySelector<HTMLElement>('[data-summon-card-stage]');
    expect(stage).not.toBeNull();
    const canvas = stage?.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('synchronously coordinates ThreeCardModel 3D rotation, position, and scale with GSAP openTimeline', () => {
    engine = new CardSummonEngine();
    engine.open();

    const tl = engine.getTimeline();
    const threeModel = engine.getThreeCardModel();
    expect(tl).not.toBeNull();
    expect(threeModel).not.toBeNull();

    // At timeline start (seek 0): rotation around Y is approximately -900° in radians (-15.708 rad)
    tl?.seek(0);
    const startRotY = threeModel!.getCardGroup().rotation.y;
    expect(startRotY).toBeCloseTo(-900 * (Math.PI / 180), 0);

    // At timeline end (progress 1): lands on front face (180° = Math.PI rad) and scale 1.0
    tl?.progress(1);
    const endRotY = threeModel!.getCardGroup().rotation.y;
    const endPosY = threeModel!.getCardGroup().position.y;
    const endScale = threeModel!.getCardGroup().scale.x;

    expect(endRotY).toBeCloseTo(Math.PI, 1);
    expect(endPosY).toBeCloseTo(0, 1);
    expect(endScale).toBeCloseTo(1, 1);
  });

  it('updates ThreeCardModel rotation upon flipCard() between front (Math.PI) and back (0)', () => {
    engine = new CardSummonEngine();
    engine.open();

    const tl = engine.getTimeline();
    tl?.progress(1);

    const threeModel = engine.getThreeCardModel();
    expect(threeModel).not.toBeNull();
    expect(threeModel!.getCardGroup().rotation.y).toBeCloseTo(Math.PI, 1);

    // Flip to back side (0 rad)
    engine.flipCard();
    // Progress tweens
    gsap.globalTimeline.getChildren().forEach((child) => child.progress?.(1));
    expect(threeModel!.getCardGroup().rotation.y).toBeCloseTo(0, 1);

    // Flip back to front side (Math.PI rad)
    engine.flipCard();
    gsap.globalTimeline.getChildren().forEach((child) => child.progress?.(1));
    expect(threeModel!.getCardGroup().rotation.y).toBeCloseTo(Math.PI, 1);
  });

  it('updates ThreeCardModel veil opacity upon toggleConcealment() between 1 and 0', () => {
    engine = new CardSummonEngine();
    engine.open();

    const threeModel = engine.getThreeCardModel();
    expect(threeModel).not.toBeNull();
    // At start of summon spin, the card is concealed under the dark veil
    expect(threeModel!.getVeilOpacity()).toBeCloseTo(1, 1);

    // Fast-forward timeline to completion: reveal dissolves the veil to 0
    engine.getTimeline()?.progress(1);
    expect(threeModel!.getVeilOpacity()).toBeCloseTo(0, 1);

    // Toggle concealment on
    engine.toggleConcealment();
    gsap.globalTimeline.getChildren().forEach((child) => child.progress?.(1));
    expect(threeModel!.getVeilOpacity()).toBeCloseTo(1, 1);

    // Toggle concealment off
    engine.toggleConcealment();
    gsap.globalTimeline.getChildren().forEach((child) => child.progress?.(1));
    expect(threeModel!.getVeilOpacity()).toBeCloseTo(0, 1);
  });

  it('animates front stars and progress bars from 0 to 1 during reveal settlement', () => {
    engine = new CardSummonEngine();
    engine.open();

    const threeModel = engine.getThreeCardModel();
    expect(threeModel).not.toBeNull();

    // At start of summon timeline, stats animation is at 0
    engine.getTimeline()?.seek(0.5);
    expect(threeModel!.getStatsAnimationProgress().barsProgress).toBeCloseTo(0, 1);

    // At completion of summon timeline, stats animation finishes at 1
    engine.getTimeline()?.progress(1);
    expect(threeModel!.getStatsAnimationProgress().barsProgress).toBeCloseTo(1, 1);
    expect(threeModel!.getStatsAnimationProgress().starsProgress).toBeCloseTo(1, 1);
  });

  it('destroys ThreeCardModel cleanly upon close() and destroy()', () => {
    engine = new CardSummonEngine();
    engine.open();

    const threeModel = engine.getThreeCardModel();
    expect(threeModel).not.toBeNull();
    const destroySpy = vi.spyOn(threeModel!, 'destroy');

    engine.close();
    expect(destroySpy).toHaveBeenCalled();
    expect(engine.getThreeCardModel()).toBeNull();

    // Re-open and verify engine.destroy()
    engine.open();
    const secondModel = engine.getThreeCardModel();
    expect(secondModel).not.toBeNull();
    const secondDestroySpy = vi.spyOn(secondModel!, 'destroy');

    engine.destroy();
    expect(secondDestroySpy).toHaveBeenCalled();
    expect(engine.getThreeCardModel()).toBeNull();
  });
});
