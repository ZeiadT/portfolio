import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gsap } from 'gsap';
import { findNearestLockup, buildBandToNavTimeline, type BandToNavOptions } from '../transitionTimeline';
import { TRANSITION_EASES, TRANSITION_TIMINGS } from '../constants';
import type { BentoRevealController } from '@/components/home/BentoRevealController';

describe('transitionTimeline', () => {
  describe('findNearestLockup', () => {
    it('returns null when lockups list is empty', () => {
      expect(findNearestLockup([], 100)).toBeNull();
    });

    it('prefers visible lockups to the right of or at targetX', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const el3 = document.createElement('div');

      vi.spyOn(el1, 'getBoundingClientRect').mockReturnValue({
        left: 50,
        right: 150,
        top: 200,
        bottom: 250,
        width: 100,
        height: 50,
        x: 50,
        y: 200,
        toJSON: () => {},
      });

      vi.spyOn(el2, 'getBoundingClientRect').mockReturnValue({
        left: 200,
        right: 300,
        top: 200,
        bottom: 250,
        width: 100,
        height: 50,
        x: 200,
        y: 200,
        toJSON: () => {},
      });

      vi.spyOn(el3, 'getBoundingClientRect').mockReturnValue({
        left: 400,
        right: 500,
        top: 200,
        bottom: 250,
        width: 100,
        height: 50,
        x: 400,
        y: 200,
        toJSON: () => {},
      });

      // Target X is 120. el2 is at 200 (delta +80), el1 is at 50 (to the left), el3 is at 400 (delta +280)
      const selected = findNearestLockup([el1, el2, el3], 120);
      expect(selected).toBe(el2);
    });

    it('falls back to the closest element overall when all are to the left of targetX', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');

      vi.spyOn(el1, 'getBoundingClientRect').mockReturnValue({
        left: 50,
        right: 150,
        top: 200,
        bottom: 250,
        width: 100,
        height: 50,
        x: 50,
        y: 200,
        toJSON: () => {},
      });

      vi.spyOn(el2, 'getBoundingClientRect').mockReturnValue({
        left: 150,
        right: 250,
        top: 200,
        bottom: 250,
        width: 100,
        height: 50,
        x: 150,
        y: 200,
        toJSON: () => {},
      });

      // Target X is 300. el2 is at 150 (dist 150), el1 is at 50 (dist 250)
      const selected = findNearestLockup([el1, el2], 300);
      expect(selected).toBe(el2);
    });
  });

  describe('buildBandToNavTimeline', () => {
    let brandBar: HTMLElement;
    let brandTrack: HTMLElement;
    let lockup: HTMLElement;
    let navLogoAnchor: HTMLElement;
    let heroHeader: HTMLElement;
    let background: HTMLElement;
    let appContainer: HTMLElement;
    let marqueeCanvas: HTMLCanvasElement;

    beforeEach(() => {
      brandBar = document.createElement('div');
      brandBar.id = 'brand-bar';
      brandBar.setAttribute('data-brand-bar', 'true');
      brandBar.setAttribute('data-mirrored', 'true');

      brandTrack = document.createElement('div');
      brandTrack.id = 'brand-track';
      brandBar.appendChild(brandTrack);

      lockup = document.createElement('div');
      lockup.setAttribute('data-marquee-lockup', 'true');
      lockup.innerHTML = `
        <span class="track-render-item wordmark-label text-[#0d0d0d]">
          <span class="hero-char text-[#0d0d0d]">Z</span>
          <span class="hero-char text-[#0d0d0d]">E</span>
          <span class="hero-char text-[#0d0d0d]">I</span>
        </span>
      `;
      brandTrack.appendChild(lockup);

      navLogoAnchor = document.createElement('div');
      navLogoAnchor.id = 'nav-anchor';
      navLogoAnchor.innerHTML = '<a href="/" data-nav-home="true">ZEIAD MOHAMMED ®</a>';
      brandBar.appendChild(navLogoAnchor);

      heroHeader = document.createElement('header');
      heroHeader.id = 'hero-header';

      background = document.createElement('div');
      background.id = 'shader-background';

      appContainer = document.createElement('main');
      appContainer.id = 'app';

      marqueeCanvas = document.createElement('canvas');
      marqueeCanvas.id = 'marquee-canvas';
      brandBar.appendChild(marqueeCanvas);

      document.body.appendChild(brandBar);
      document.body.appendChild(heroHeader);
      document.body.appendChild(background);
      document.body.appendChild(appContainer);

      // Mock bounding rects
      vi.spyOn(brandBar, 'getBoundingClientRect').mockReturnValue({
        top: 400,
        bottom: 460,
        left: 0,
        right: 1200,
        width: 1200,
        height: 60,
        x: 0,
        y: 400,
        toJSON: () => {},
      });

      vi.spyOn(lockup, 'getBoundingClientRect').mockReturnValue({
        top: 415,
        bottom: 445,
        left: 600,
        right: 800,
        width: 200,
        height: 30,
        x: 600,
        y: 415,
        toJSON: () => {},
      });

      const navLink = navLogoAnchor.querySelector('a')!;
      vi.spyOn(navLink, 'getBoundingClientRect').mockReturnValue({
        top: 418,
        bottom: 442,
        left: 24,
        right: 160,
        width: 136,
        height: 24,
        x: 24,
        y: 418,
        toJSON: () => {},
      });

      vi.spyOn(navLogoAnchor, 'getBoundingClientRect').mockReturnValue({
        top: 415,
        bottom: 445,
        left: 24,
        right: 160,
        width: 136,
        height: 30,
        x: 24,
        y: 415,
        toJSON: () => {},
      });
    });

    afterEach(() => {
      brandBar.remove();
      heroHeader.remove();
      background.remove();
      appContainer.remove();
      document.querySelectorAll('.flying-wordmark-clone').forEach((el) => el.remove());
    });

    it('builds a GSAP timeline and creates a flying clone with stripped black classes', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);
      expect(tl).toBeInstanceOf(gsap.core.Timeline);
      expect(tl.duration()).toBeGreaterThanOrEqual(1.3);

      const clone = document.querySelector('.flying-wordmark-clone') as HTMLElement;
      expect(clone).toBeTruthy();
      // Ensure all text-[#0d0d0d] classes were stripped so color inherits cleanly
      expect(clone.querySelectorAll('.text-\\[\\#0d0d0d\\]').length).toBe(0);
      expect(clone.querySelector('span')?.style.color).toBe('inherit');
    });

    it('removes data-mirrored and hides marquee canvas', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      buildBandToNavTimeline(options);
      expect(brandBar.hasAttribute('data-mirrored')).toBe(false);
      expect(marqueeCanvas.style.display).toBe('none');
    });

    it('morphs clone color to white starting at t = 0', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);
      const clone = document.querySelector('.flying-wordmark-clone') as HTMLElement;
      const cloneTweens = tl.getChildren().filter((child: any) => child.targets?.().includes(clone));
      const colorTween = cloneTweens.find((t: any) => t.vars.color === '#ffffff');
      expect(colorTween).toBeDefined();
      expect(colorTween?.startTime()).toBe(0);
    });

    it('starts color morph, logo glide, and band ascent almost together with minimal delay', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);
      const clone = document.querySelector('.flying-wordmark-clone') as HTMLElement;
      const cloneTweens = tl.getChildren().filter((child: any) => child.targets?.().includes(clone));
      const barTweens = tl.getChildren().filter((child: any) => child.targets?.().includes(brandBar));

      const colorTween = cloneTweens.find((t: any) => t.vars.color === '#ffffff');
      const glideXTween = cloneTweens.find((t: any) => t.vars.x !== undefined);
      const barAscent = barTweens.find((t: any) => t.vars.y === 0);

      expect(colorTween?.startTime()).toBe(0);
      expect(glideXTween?.startTime()).toBeLessThanOrEqual(0.2);
      expect(barAscent?.startTime()).toBeLessThanOrEqual(0.2);
      expect(barAscent?.duration()).toBeGreaterThanOrEqual(1.2);
      // Both glide and ascent start almost together (within 0.05s of each other)
      expect(Math.abs(barAscent!.startTime() - glideXTween!.startTime())).toBeLessThanOrEqual(0.05);
      expect(glideXTween?.vars.ease).toBe(TRANSITION_EASES.logoGlide);
    });

    it('animates logo size (scale) to match the resting position variant', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);
      const clone = document.querySelector('.flying-wordmark-clone') as HTMLElement;
      const cloneTweens = tl.getChildren().filter((child: any) => child.targets?.().includes(clone));

      const scaleTween = cloneTweens.find((t: any) => t.vars.scale !== undefined);
      expect(scaleTween).toBeDefined();
      // Resting variant ratio: navLink width 136 / lockup width 200 = 0.68
      expect(scaleTween?.vars.scale).toBeCloseTo(136 / 200, 2);
      expect(scaleTween?.startTime()).toBeLessThanOrEqual(0.2);
    });

    it('ascends brandBar to y: 0 in sync with vertical logo ascent using calibrated curve', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);
      const barTweens = tl.getChildren().filter((child: any) => child.targets?.().includes(brandBar));
      const barAscent = barTweens.find((t: any) => t.vars.y === 0);
      expect(barAscent).toBeDefined();
      expect(barAscent?.vars.ease).toBe(TRANSITION_EASES.bandAscent);

      const clone = document.querySelector('.flying-wordmark-clone') as HTMLElement;
      const cloneTweens = tl.getChildren().filter((child: any) => child.targets?.().includes(clone));
      const cloneAscent = cloneTweens.find((t: any) => t.vars.y !== undefined);

      // Bar ascent and clone vertical ascent must start at the exact same time and have matching eases
      expect(barAscent?.startTime()).toBe(cloneAscent?.startTime());
      expect(barAscent?.vars.ease).toBe(cloneAscent?.vars.ease);
    });

    it('defines semantic gsap timeline labels for fade, glide, and ascent', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);
      expect(tl.labels.fade).toBe(0);
      expect(typeof tl.labels.glide).toBe('number');
      expect(typeof tl.labels.ascent).toBe('number');
      expect(tl.labels.glide).toBeLessThanOrEqual(0.2);
      expect(tl.labels.ascent).toBeLessThanOrEqual(0.2);
    });

    it('animates the background with in-place blur and opacity sinking', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);
      const bgTweens = tl.getChildren().filter((child: any) => child.targets?.().includes(background));
      expect(bgTweens.length).toBeGreaterThan(0);
      const bgVars = (bgTweens[0] as any).vars;
      expect(bgVars.filter).toContain('blur');
      expect(bgVars.opacity).toBe(0);
      expect(bgVars.yPercent).toBeUndefined();
    });

    it('executes onComplete and cleans up the flying clone and brandBar props', () => {
      const onComplete = vi.fn();
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
        onComplete,
      };

      const tl = buildBandToNavTimeline(options);
      tl.progress(1); // Seek to end

      expect(onComplete).toHaveBeenCalled();
      expect(document.querySelector('.flying-wordmark-clone')).toBeNull();
    });

    it('calls bentoController.prepareInitialState() and nests reveal timeline at ascent + 0.70s', () => {
      const mockRevealTimeline = gsap.timeline();
      const mockBentoController = {
        prepareInitialState: vi.fn(),
        createRevealTimeline: vi.fn().mockReturnValue(mockRevealTimeline),
        destroy: vi.fn(),
        queryElements: vi.fn(),
      } as unknown as BentoRevealController;

      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
        bentoController: mockBentoController,
      };

      const tl = buildBandToNavTimeline(options);

      expect(mockBentoController.prepareInitialState).toHaveBeenCalledTimes(1);
      expect(mockBentoController.createRevealTimeline).toHaveBeenCalledTimes(1);

      // Verify reveal timeline is nested at label ascent + 0.70s
      const ascentLabelTime = tl.labels.ascent;
      expect(ascentLabelTime).toBeDefined();
      expect(mockRevealTimeline.startTime()).toBeCloseTo(
        ascentLabelTime + (TRANSITION_TIMINGS.bentoWireframeStart ?? 0.7),
        2
      );
    });

    it('sets appContainer immediately to opacity 1 and y 0 without monolithic slide animation', () => {
      const options: BandToNavOptions = {
        brandBar,
        brandTrack,
        navLogoAnchor,
        heroHeader,
        background,
        appContainer,
        marqueeCanvas,
      };

      const tl = buildBandToNavTimeline(options);

      // Verify no tween animating appContainer on the timeline
      const appTweens = tl
        .getChildren()
        .filter((child: any) => child.targets?.().includes(appContainer));
      expect(appTweens.length).toBe(0);

      // Verify appContainer inline styles or gsap properties
      expect(appContainer.style.opacity).toBe('1');
    });
  });
});
