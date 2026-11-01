import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gsap } from 'gsap';
import {
  BentoRevealController,
  BENTO_REVEAL_TIMINGS,
  BENTO_REVEAL_EASES,
  type BentoElements,
} from '../BentoRevealController';

describe('BentoRevealController', () => {
  let rootContainer: HTMLElement;
  let heroLeft: HTMLElement;
  let heroRight: HTMLElement;
  let education: HTMLElement;
  let globe: HTMLElement;
  let summary: HTMLElement;
  let controller: BentoRevealController;

  beforeEach(() => {
    rootContainer = document.createElement('div');
    rootContainer.className = 'profile-header-root';

    heroLeft = document.createElement('div');
    heroLeft.setAttribute('data-bento-hero-left', 'true');

    heroRight = document.createElement('div');
    heroRight.setAttribute('data-bento-hero-right', 'true');

    education = document.createElement('div');
    education.setAttribute('data-bento-education', 'true');

    globe = document.createElement('div');
    globe.setAttribute('data-bento-globe', 'true');

    summary = document.createElement('div');
    summary.setAttribute('data-bento-summary', 'true');

    rootContainer.appendChild(heroLeft);
    rootContainer.appendChild(heroRight);
    rootContainer.appendChild(education);
    rootContainer.appendChild(globe);
    rootContainer.appendChild(summary);

    document.body.appendChild(rootContainer);
    controller = new BentoRevealController(rootContainer);
  });

  afterEach(() => {
    controller.destroy();
    if (rootContainer.parentElement) {
      rootContainer.parentElement.removeChild(rootContainer);
    }
  });

  describe('queryElements', () => {
    it('locates and returns all 5 bento elements by data attributes', () => {
      const elements: BentoElements | null = controller.queryElements();
      expect(elements).not.toBeNull();
      expect(elements?.heroLeft).toBe(heroLeft);
      expect(elements?.heroRight).toBe(heroRight);
      expect(elements?.education).toBe(education);
      expect(elements?.globe).toBe(globe);
      expect(elements?.summary).toBe(summary);
    });

    it('caches the queried elements across repeated calls', () => {
      const first = controller.queryElements();
      const second = controller.queryElements();
      expect(first).toBe(second);
    });

    it('returns null if any required card is missing', () => {
      globe.remove();
      const brokenController = new BentoRevealController(rootContainer);
      expect(brokenController.queryElements()).toBeNull();
    });
  });

  describe('prepareInitialState', () => {
    it('sets initial reverse-sink hidden state with y: 24, scale: 0.96, opacity: 0, and blur(12px) for all 5 cards', () => {
      controller.prepareInitialState();

      const cards = [heroRight, heroLeft, globe, education, summary];
      cards.forEach((card) => {
        expect(Number(gsap.getProperty(card, 'opacity'))).toBe(0);
        expect(Number(gsap.getProperty(card, 'y'))).toBe(BENTO_REVEAL_TIMINGS.initialY);
        expect(Number(gsap.getProperty(card, 'scale'))).toBeCloseTo(BENTO_REVEAL_TIMINGS.initialScale, 2);
        const filterVal = card.style.filter || (gsap.getProperty(card, 'filter') as string);
        expect(filterVal).toContain(`blur(${BENTO_REVEAL_TIMINGS.initialBlur}px)`);
      });
    });

    it('applies hardware accelerated will-change style including transform, opacity, and filter to all cards', () => {
      controller.prepareInitialState();
      const cards = [heroRight, heroLeft, globe, education, summary];
      cards.forEach((card) => {
        expect(card.style.willChange).toContain('transform');
        expect(card.style.willChange).toContain('opacity');
        expect(card.style.willChange).toContain('filter');
      });
    });

    it('gracefully handles containers with missing elements without throwing', () => {
      const emptyDiv = document.createElement('div');
      const emptyController = new BentoRevealController(emptyDiv);
      expect(() => emptyController.prepareInitialState()).not.toThrow();
    });
  });

  describe('createRevealTimeline', () => {
    it('returns a gsap.core.Timeline instance', () => {
      const tl = controller.createRevealTimeline();
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
    });

    it('returns an empty timeline if elements are missing', () => {
      const emptyDiv = document.createElement('div');
      const emptyController = new BentoRevealController(emptyDiv);
      const tl = emptyController.createRevealTimeline();
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.getChildren().length).toBe(0);
    });

    it('sequences Identity-First stagger order with transform and visual tweens for each card', () => {
      const tl = controller.createRevealTimeline();

      const getTweensFor = (el: HTMLElement) =>
        tl.getChildren().filter((c: any) => c.targets?.().includes(el));

      // Ordered cards and expected start times
      const sequence = [
        { el: heroRight, expectedStart: 0.00 },
        { el: heroLeft, expectedStart: 0.08 },
        { el: globe, expectedStart: 0.16 },
        { el: education, expectedStart: 0.24 },
        { el: summary, expectedStart: 0.32 },
      ];

      sequence.forEach(({ el, expectedStart }) => {
        const tweens = getTweensFor(el);

        // Transform tween: y: 0, scale: 1, duration: 0.55, ease: back.out(1.1)
        const transformTween = tweens.find(
          (t: any) => t.vars.y === 0 && t.vars.scale === 1
        );
        expect(transformTween).toBeDefined();
        expect(transformTween?.startTime()).toBeCloseTo(expectedStart, 2);
        expect(transformTween?.duration()).toBeCloseTo(BENTO_REVEAL_TIMINGS.cardDuration, 2);
        expect(transformTween?.vars.ease).toBe(BENTO_REVEAL_EASES.transform);

        // Visual tween: opacity: 1, filter: blur(0px), duration: 0.55, ease: power2.out
        const visualTween = tweens.find(
          (t: any) => t.vars.opacity === 1 && (t.vars.filter === 'blur(0px)' || t.vars.css?.filter === 'blur(0px)')
        );
        expect(visualTween).toBeDefined();
        expect(visualTween?.startTime()).toBeCloseTo(expectedStart, 2);
        expect(visualTween?.duration()).toBeCloseTo(BENTO_REVEAL_TIMINGS.cardDuration, 2);
        expect(visualTween?.vars.ease).toBe(BENTO_REVEAL_EASES.fade);
      });
    });

    it('clears filter and willChange via clearProps upon completion of reveal animation', () => {
      controller.prepareInitialState();
      expect(heroRight.style.willChange).toContain('filter');

      const tl = controller.createRevealTimeline();
      tl.progress(1);

      const cards = [heroRight, heroLeft, globe, education, summary];
      cards.forEach((card) => {
        expect(card.style.willChange).toBe('');
        expect(card.style.filter).toBe('');
        expect(Number(gsap.getProperty(card, 'opacity'))).toBe(1);
        expect(Number(gsap.getProperty(card, 'y'))).toBe(0);
        expect(Number(gsap.getProperty(card, 'scale'))).toBe(1);
      });
    });

    it('clears willChange on completion in reducedMotion mode', () => {
      controller.prepareInitialState();
      expect(education.style.willChange).toContain('transform');

      const tl = controller.createRevealTimeline({ reducedMotion: true });
      tl.progress(1);

      expect(education.style.willChange).toBe('');
      expect(heroRight.style.willChange).toBe('');
    });

    it('handles reducedMotion by cross-fading opacity only without transform drops or blur filters', () => {
      controller.prepareInitialState();
      const tl = controller.createRevealTimeline({ reducedMotion: true });

      const children = tl.getChildren();
      expect(children.length).toBeGreaterThan(0);

      // Verify no transform tweens (y, scale, rotationX) or filter tweens exist
      const hasTransformOrFilter = children.some((c: any) => {
        const vars = c.vars || {};
        return (
          vars.y !== undefined ||
          vars.scale !== undefined ||
          vars.rotationX !== undefined ||
          vars.rotateX !== undefined ||
          vars.filter !== undefined
        );
      });
      expect(hasTransformOrFilter).toBe(false);

      // Verify opacity tweens exist
      const opacityTween = children.find((c: any) => c.vars?.opacity === 1);
      expect(opacityTween).toBeDefined();
      expect(opacityTween?.duration()).toBeCloseTo(BENTO_REVEAL_TIMINGS.reducedMotionDuration, 2);
    });

    it('auto-detects OS prefers-reduced-motion media query when options are omitted', () => {
      const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as any));

      controller.prepareInitialState();
      const tl = controller.createRevealTimeline(); // no options passed

      const children = tl.getChildren();
      const hasTransformOrFilter = children.some((c: any) => {
        const vars = c.vars || {};
        return (
          vars.y !== undefined ||
          vars.scale !== undefined ||
          vars.rotationX !== undefined ||
          vars.rotateX !== undefined ||
          vars.filter !== undefined
        );
      });
      expect(hasTransformOrFilter).toBe(false);

      const opacityTween = children.find((c: any) => c.vars?.opacity === 1);
      expect(opacityTween).toBeDefined();

      matchMediaSpy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('kills active timeline and clears inline style properties', () => {
      controller.prepareInitialState();
      const tl = controller.createRevealTimeline();
      expect(tl.isActive() || tl.progress() === 0).toBe(true);

      controller.destroy();

      // Ensure inline properties cleared including filter, transform, opacity, willChange
      const cards = [heroRight, heroLeft, globe, education, summary];
      cards.forEach((card) => {
        expect(card.style.transform).toBe('');
        expect(card.style.opacity).toBe('');
        expect(card.style.filter).toBe('');
        expect(card.style.willChange).toBe('');
      });
    });

    it('is safe to call multiple times', () => {
      expect(() => {
        controller.destroy();
        controller.destroy();
      }).not.toThrow();
    });
  });
});
