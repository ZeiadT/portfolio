import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { gsap } from 'gsap';
import {
  BentoRevealController,
  BENTO_REVEAL_TIMINGS,
  BENTO_REVEAL_STYLES,
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
    it('sets initial hidden state with opacity 0 and negative translateY offsets', () => {
      controller.prepareInitialState();

      // Bottom cards offset: y: -32px
      expect(Number(gsap.getProperty(education, 'opacity'))).toBe(0);
      expect(Number(gsap.getProperty(education, 'y'))).toBe(-32);

      expect(Number(gsap.getProperty(globe, 'opacity'))).toBe(0);
      expect(Number(gsap.getProperty(globe, 'y'))).toBe(-32);
      expect(Number(gsap.getProperty(globe, 'scale'))).toBeCloseTo(0.94, 2);

      expect(Number(gsap.getProperty(summary, 'opacity'))).toBe(0);
      expect(Number(gsap.getProperty(summary, 'y'))).toBe(-32);

      // Hero cards offset: y: -40px
      expect(Number(gsap.getProperty(heroLeft, 'opacity'))).toBe(0);
      expect(Number(gsap.getProperty(heroLeft, 'y'))).toBe(-40);

      expect(Number(gsap.getProperty(heroRight, 'opacity'))).toBe(0);
      expect(Number(gsap.getProperty(heroRight, 'y'))).toBe(-40);
      expect(Number(gsap.getProperty(heroRight, 'rotationX'))).toBeCloseTo(-6, 1);
    });

    it('applies hardware accelerated will-change style', () => {
      controller.prepareInitialState();
      expect(education.style.willChange).toContain('transform');
      expect(education.style.willChange).toContain('opacity');
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

    it('sequences Step 1: wireframe outline trace at t = 0 with 350ms duration', () => {
      const tl = controller.createRevealTimeline();
      const children = tl.getChildren();

      // Wireframe trace tween starting at t = 0
      const wireframeTween = children.find((c: any) => {
        const targets = c.targets?.() || [];
        return (
          c.startTime() === BENTO_REVEAL_TIMINGS.wireframeStart &&
          targets.includes(education)
        );
      }) as gsap.core.Tween | undefined;

      expect(wireframeTween).toBeDefined();
      expect(wireframeTween?.duration()).toBeCloseTo(BENTO_REVEAL_TIMINGS.wireframeDuration, 2);
      expect(wireframeTween?.startTime()).toBe(0);
    });

    it('sequences Step 2: foundation-up Tetris drop cascade starting at t = 0.35s', () => {
      const tl = controller.createRevealTimeline();

      const getTweensFor = (el: HTMLElement) =>
        tl.getChildren().filter((c: any) => c.targets?.().includes(el));

      // 1. Education (bottom left): starts at t = 0.35s, y -> 0, back.out(1.4)
      const eduTweens = getTweensFor(education);
      const eduDrop = eduTweens.find((t: any) => t.vars.y === 0);
      expect(eduDrop).toBeDefined();
      expect(eduDrop?.startTime()).toBeCloseTo(BENTO_REVEAL_TIMINGS.educationDropStart, 2);
      expect(eduDrop?.vars.ease).toBe('back.out(1.4)');

      // 2. Globe (bottom middle): starts at t = 0.43s (stagger +80ms), scale -> 1.0, back.out(1.4)
      const globeTweens = getTweensFor(globe);
      const globeDrop = globeTweens.find((t: any) => t.vars.y === 0);
      expect(globeDrop).toBeDefined();
      expect(globeDrop?.startTime()).toBeCloseTo(BENTO_REVEAL_TIMINGS.globeDropStart, 2);
      expect(globeDrop?.vars.ease).toBe('back.out(1.4)');
      const globeScale = globeTweens.find((t: any) => t.vars.scale === 1);
      expect(globeScale).toBeDefined();

      // 3. Summary (bottom right): starts at t = 0.51s (stagger +80ms), y -> 0, back.out(1.4)
      const summaryTweens = getTweensFor(summary);
      const summaryDrop = summaryTweens.find((t: any) => t.vars.y === 0);
      expect(summaryDrop).toBeDefined();
      expect(summaryDrop?.startTime()).toBeCloseTo(BENTO_REVEAL_TIMINGS.summaryDropStart, 2);
      expect(summaryDrop?.vars.ease).toBe('back.out(1.4)');

      // 4. Hero Left (top left): starts at t = 0.63s, y -> 0, back.out(1.3)
      const heroLeftTweens = getTweensFor(heroLeft);
      const heroLeftDrop = heroLeftTweens.find((t: any) => t.vars.y === 0);
      expect(heroLeftDrop).toBeDefined();
      expect(heroLeftDrop?.startTime()).toBeCloseTo(BENTO_REVEAL_TIMINGS.heroLeftDropStart, 2);
      expect(heroLeftDrop?.vars.ease).toBe('back.out(1.3)');

      // 5. Hero Right (top right): starts at t = 0.71s (stagger +80ms), y -> 0, rotationX -> 0, back.out(1.3)
      const heroRightTweens = getTweensFor(heroRight);
      const heroRightDrop = heroRightTweens.find((t: any) => t.vars.y === 0);
      expect(heroRightDrop).toBeDefined();
      expect(heroRightDrop?.startTime()).toBeCloseTo(BENTO_REVEAL_TIMINGS.heroRightDropStart, 2);
      expect(heroRightDrop?.vars.ease).toBe('back.out(1.3)');
      const heroRightRot = heroRightTweens.find((t: any) => t.vars.rotationX === 0 || t.vars.rotateX === 0);
      expect(heroRightRot).toBeDefined();
    });

    it('triggers hairline pulse box-shadow for 80ms on each landing', () => {
      const tl = controller.createRevealTimeline();

      const eduTweens = tl.getChildren().filter((c: any) => c.targets?.().includes(education));
      const pulseTween = eduTweens.find((t: any) => {
        const shadow = t.vars.boxShadow || t.vars.css?.boxShadow;
        return typeof shadow === 'string' && shadow.includes(BENTO_REVEAL_STYLES.restingBoxShadow);
      });

      expect(pulseTween).toBeDefined();
      expect(pulseTween?.duration()).toBeCloseTo(BENTO_REVEAL_TIMINGS.flashDuration, 2);
    });

    it('handles reducedMotion by cross-fading opacity only without transform drops', () => {
      controller.prepareInitialState();
      const tl = controller.createRevealTimeline({ reducedMotion: true });

      const children = tl.getChildren();
      expect(children.length).toBeGreaterThan(0);

      // Verify no transform tweens (y, scale, rotationX) exist
      const hasTransform = children.some((c: any) => {
        const vars = c.vars || {};
        return (
          vars.y !== undefined ||
          vars.scale !== undefined ||
          vars.rotationX !== undefined ||
          vars.rotateX !== undefined
        );
      });
      expect(hasTransform).toBe(false);

      // Verify opacity tweens exist
      const opacityTween = children.find((c: any) => c.vars?.opacity === 1);
      expect(opacityTween).toBeDefined();
      expect(opacityTween?.duration()).toBeCloseTo(BENTO_REVEAL_TIMINGS.reducedMotionDuration, 2);
    });
  });

  describe('destroy', () => {
    it('kills active timeline and clears inline style properties', () => {
      controller.prepareInitialState();
      const tl = controller.createRevealTimeline();
      expect(tl.isActive() || tl.progress() === 0).toBe(true);

      controller.destroy();

      // Ensure inline properties cleared
      expect(education.style.transform).toBe('');
      expect(education.style.opacity).toBe('');
      expect(heroRight.style.transform).toBe('');
    });

    it('is safe to call multiple times', () => {
      expect(() => {
        controller.destroy();
        controller.destroy();
      }).not.toThrow();
    });
  });
});
