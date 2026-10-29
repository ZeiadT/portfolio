import { describe, it, expect } from 'vitest';
import { createWordmarkHtml, calculateHeroScale } from '../wordmark';

describe('Band Wordmark Module', () => {
  describe('createWordmarkHtml', () => {
    it('generates hero markup with .hero-char class for individual letters', () => {
      const html = createWordmarkHtml(true);
      expect(html).toContain('hero-char');
      expect(html).not.toContain('static-char');
      expect(html).toContain('®');

      // Verify letters of ZEIAD MOHAMMED are wrapped as uppercase character spans
      const div = document.createElement('div');
      div.innerHTML = html;
      const text = div.textContent?.replace(/\s+/g, ' ').trim();
      expect(text).toContain('ZEIAD');
      expect(text).toContain('MOHAMMED');
      expect(text).toContain('®');
    });

    it('generates static markup with .static-char class for non-hero items', () => {
      const html = createWordmarkHtml(false);
      expect(html).toContain('static-char');
      expect(html).not.toContain('hero-char');
      expect(html).toContain('®');
    });

    it('handles spaces with non-breaking space spans', () => {
      const html = createWordmarkHtml(true);
      expect(html).toContain('&nbsp;');
    });

    it('contains all 13 letters of the brand name plus trademark', () => {
      const html = createWordmarkHtml(true);
      const heroCharMatches = html.match(/hero-char/g) || [];
      // 13 letters ('Zeiad Mohammed' without space) + 1 trademark symbol '®' = 14 hero-char spans
      expect(heroCharMatches.length).toBe(14);
    });

    it('wraps the trademark symbol in a dedicated superscript container with .trademark-char', () => {
      const html = createWordmarkHtml(true);
      expect(html).toContain('trademark-char');
      expect(html).toContain('trademark-wrapper');
    });

    it('does not apply artificial tracking to wordmark wrapper ensuring natural character metrics', () => {
      const html = createWordmarkHtml(true);
      expect(html).not.toContain('tracking-[-0.02em]');
    });

    it('uses font-bold class on wordmark-label for 1:1 font weight parity with canvas rasterizer', () => {
      const html = createWordmarkHtml(true);
      expect(html).toContain('font-bold');
      expect(html).not.toContain('font-black');
    });
  });

  describe('calculateHeroScale', () => {
    const baseWidth = 300;

    it('uses the reduced 10% targetRatio (0.792) by default for desktop (1440px)', () => {
      const scale = calculateHeroScale(1440, baseWidth);
      // (0.792 * 1440) / 300 = 1140.48 / 300 = 3.8016
      expect(scale).toBeCloseTo(3.8016, 2);
    });

    it('calculates the correct proportional scale for standard desktop (1440px) with custom ratio', () => {
      const scale = calculateHeroScale(1440, baseWidth, 0.792);
      expect(scale).toBeCloseTo(3.8016, 2);
    });

    it('calculates the scale for standard tablet (800px)', () => {
      const scale = calculateHeroScale(800, baseWidth);
      // (0.792 * 800) / 300 = 633.6 / 300 = 2.112
      expect(scale).toBeCloseTo(2.112, 2);
    });

    it('clamps to min scale (1.5) on very small screens', () => {
      const scale = calculateHeroScale(320, baseWidth);
      // (0.792 * 320) / 300 = 253.44 / 300 = 0.8448 -> clamped to min 1.5
      expect(scale).toBe(1.5);
    });

    it('handles invalid or zero wordmark width safely without returning Infinity or NaN', () => {
      expect(calculateHeroScale(1000, 0)).toBe(1.5);
      expect(calculateHeroScale(1000, -100)).toBe(1.5);
      expect(calculateHeroScale(0, 300)).toBe(1.5);
    });
  });
});
