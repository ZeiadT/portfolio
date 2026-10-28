import { describe, it, expect } from 'vitest';
import { createWordmarkHtml, BRAND_NAME } from '../wordmark';

describe('Wordmark Generator', () => {
  it('has brand name set to Zeiad Mohammed', () => {
    expect(BRAND_NAME).toBe('Zeiad Mohammed');
  });

  it('generates hero wordmark with individual .hero-char spans and registered trademark', () => {
    const html = createWordmarkHtml(true);

    expect(html).toContain('hero-char');
    expect(html).toContain('data-index=');
    expect(html).toContain('®');
    expect(html).toContain('wordmark-label');

    // Counts letters (excluding space)
    const matchCount = (html.match(/hero-char/g) || []).length;
    // 13 letters in "Zeiad Mohammed" + 1 for "®" = 14 hero-char spans
    expect(matchCount).toBe(14);
  });

  it('generates static wordmark with .static-char spans for satellite track items', () => {
    const html = createWordmarkHtml(false);

    expect(html).toContain('static-char');
    expect(html).not.toContain('hero-char');
    expect(html).toContain('®');
  });

  it('handles spaces with non-breaking width spacers', () => {
    const html = createWordmarkHtml(true);
    expect(html).toContain('&nbsp;');
  });
});
