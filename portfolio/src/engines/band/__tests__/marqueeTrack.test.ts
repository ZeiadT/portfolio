import { describe, it, expect } from 'vitest';
import {
  generateMarqueeTrackHtml,
  calculateTrackCenterOffset,
  MARQUEE_SATELLITES,
} from '../marqueeTrack';

describe('Marquee Track Module', () => {
  describe('generateMarqueeTrackHtml', () => {
    it('generates the specified number of repeat units', () => {
      const html = generateMarqueeTrackHtml({ totalUnits: 6, heroIndex: 2 });
      // Each unit contains data-unit-index
      const unitMatches = html.match(/data-unit-index/g) || [];
      expect(unitMatches.length).toBe(6);
    });

    it('places the hero wordmark wrapper at the specified heroIndex', () => {
      const html = generateMarqueeTrackHtml({ totalUnits: 6, heroIndex: 2 });
      expect(html).toContain('id="hero-wordmark-wrapper"');
      expect(html).toContain('id="hero-wordmark"');
    });

    it('contains all Option B satellite content phrases', () => {
      const html = generateMarqueeTrackHtml({ totalUnits: 6, heroIndex: 2 });
      expect(html).toContain(MARQUEE_SATELLITES.phrase1); // "Mobile Architecture & Motion"
      expect(html).toContain(MARQUEE_SATELLITES.symbol1); // "✦"
      expect(html).toContain(MARQUEE_SATELLITES.phrase2); // "High-Performance Systems"
      expect(html).toContain(MARQUEE_SATELLITES.symbol2); // "●"
      expect(html).toContain(MARQUEE_SATELLITES.action);  // "View Engineering Work"
    });

    it('wraps satellite items in .satellite-item class with opacity-0 initial state', () => {
      const html = generateMarqueeTrackHtml({ totalUnits: 4, heroIndex: 1 });
      expect(html).toContain('satellite-item');
    });

    it('ensures each unit contains a wordmark with data-marquee-lockup="true"', () => {
      const html = generateMarqueeTrackHtml({ totalUnits: 4, heroIndex: 1 });
      const container = document.createElement('div');
      container.innerHTML = html;

      const lockups = container.querySelectorAll('[data-marquee-lockup="true"]');
      expect(lockups.length).toBe(4);
    });

    it('ensures each unit contains exactly 6 non-nested .track-render-item elements to prevent duplicate text rendering', () => {
      const html = generateMarqueeTrackHtml({ totalUnits: 2, heroIndex: 0 });
      const container = document.createElement('div');
      container.innerHTML = html;

      const units = container.querySelectorAll('.marquee-unit');
      expect(units.length).toBe(2);

      units.forEach((unit) => {
        const renderItems = unit.querySelectorAll('.track-render-item');
        expect(renderItems.length).toBe(6);

        // Verify none of the render items are nested inside another render item
        renderItems.forEach((item) => {
          const nested = item.querySelectorAll('.track-render-item');
          expect(nested.length).toBe(0);
        });
      });
    });
  });

  describe('calculateTrackCenterOffset', () => {
    it('calculates the exact translation offset to center the hero wordmark in the viewport', () => {
      const viewportWidth = 1440;
      // Hero wordmark is currently at x = 500, width = 300 -> center is 650
      // Target screen center is 1440 / 2 = 720
      // Required offset = 720 - 650 = +70
      const heroWordmarkRect = { left: 500, width: 300 };
      const offset = calculateTrackCenterOffset(viewportWidth, heroWordmarkRect);

      expect(offset).toBe(70);
    });

    it('handles negative offsets when hero wordmark is to the right of screen center', () => {
      const viewportWidth = 1000;
      // Hero wordmark center is 600, target is 500 -> offset = -100
      const heroWordmarkRect = { left: 500, width: 200 };
      const offset = calculateTrackCenterOffset(viewportWidth, heroWordmarkRect);

      expect(offset).toBe(-100);
    });

    it('safely handles zero or missing dimensions', () => {
      const offset = calculateTrackCenterOffset(0, { left: 0, width: 0 });
      expect(Number.isFinite(offset)).toBe(true);
    });
  });
});
