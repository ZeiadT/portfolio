/**
 * Wordmark Generator & Dynamic Scale Calculator
 */

export const BRAND_NAME = 'ZEIAD MOHAMMED';

/**
 * Calculates the dynamic viewport scale so the wordmark fills a specific fraction
 * of the screen width (default 79.2%, reduced by 10% from 88%), safely clamped
 * to minimum and maximum thresholds.
 */
export function calculateHeroScale(
  viewportWidth: number,
  baseWordmarkWidth: number,
  targetRatio = 0.792,
  minScale = 1.5,
  maxScale = 4.0
): number {
  if (!viewportWidth || !baseWordmarkWidth || viewportWidth <= 0 || baseWordmarkWidth <= 0) {
    return minScale;
  }

  const rawScale = (targetRatio * viewportWidth) / baseWordmarkWidth;
  if (!Number.isFinite(rawScale)) {
    return minScale;
  }

  return Math.min(maxScale, Math.max(minScale, rawScale));
}

/**
 * Generates semantic, accessible HTML for the brand wordmark with staggered letter spans.
 */
export function createWordmarkHtml(isHero = false): string {
  const charClass = isHero ? 'hero-char' : 'static-char';
  const chars = Array.from(BRAND_NAME);

  const lettersHtml = chars
    .map((c, i) => {
      if (c === ' ') {
        return `<span class="inline-block w-[0.35em]">&nbsp;</span>`;
      }
      return `<span class="${charClass} inline-block select-none will-change-transform" data-index="${i}">${c}</span>`;
    })
    .join('');

  return `
    <span class="track-render-item wordmark-label inline-flex items-center text-[#0d0d0d] font-bold uppercase whitespace-nowrap leading-none select-none text-[22px] md:text-[26px]">
      ${lettersHtml}
      <span class="trademark-wrapper inline-flex self-start -translate-y-1.5 ml-1 select-none">
        <span class="${charClass} trademark-char inline-block will-change-transform text-[12px] md:text-[14px] font-bold">®</span>
      </span>
    </span>
  `.trim();
}
