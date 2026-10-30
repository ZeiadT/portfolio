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

    // Initial state at progress 0 / seek 0: exactly 3 spins (1080°), not 1440°
    tl?.seek(0);
    const startRotY = Math.abs(Number(gsap.getProperty(card, 'rotationY')));
    expect(startRotY).toBe(1080);

    // During apex slow-motion hover (sampled between progress 0.65 and 0.80),
    // yPercent remains in negative overshoot (< 0) while rotationY has decelerated to <= 30°
    for (let p = 0.65; p <= 0.80; p += 0.05) {
      tl?.progress(p);
      const yPercent = Number(gsap.getProperty(card, 'yPercent'));
      const rotY = Math.abs(Number(gsap.getProperty(card, 'rotationY')));

      expect(yPercent).toBeLessThan(0);
      expect(rotY).toBeLessThanOrEqual(30);
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
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'rotationZ'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'scale'))).toBe(1);
  });

  it('synchronizes landing at timeline completion with yPercent 0, rotationY 0, and rotationZ 0', () => {
    engine = new CardSummonEngine();
    engine.open();

    const card = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(card).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    tl?.progress(1);

    expect(Number(gsap.getProperty(card, 'yPercent'))).toBe(0);
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(0);
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
    expect(Number(gsap.getProperty(card, 'rotationY'))).toBe(0);
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

