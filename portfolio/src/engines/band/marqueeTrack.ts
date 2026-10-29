import { createWordmarkHtml } from './wordmark';

export const MARQUEE_SATELLITES = {
  phrase1: 'MOBILE ARCHITECTURE & MOTION',
  symbol1: '✦',
  phrase2: 'HIGH-PERFORMANCE SYSTEMS',
  symbol2: '●',
  action: 'VIEW ENGINEERING WORK',
} as const;

export interface MarqueeTrackOptions {
  totalUnits?: number;
  heroIndex?: number;
}

/**
 * Calculates the exact horizontal translation needed so that the hero wordmark inside
 * the marquee track sits precisely at the center of the viewport before scrolling starts.
 */
export function calculateTrackCenterOffset(
  viewportWidth: number,
  heroWordmarkRect: { left: number; width: number }
): number {
  if (!viewportWidth) return 0;
  const targetCenter = viewportWidth / 2;
  const currentCenter = heroWordmarkRect.left + heroWordmarkRect.width / 2;
  return targetCenter - currentCenter;
}

/**
 * Generates repetitive marquee track units (Option B content) with zero-jump hero wordmark.
 */
export function generateMarqueeTrackHtml(options: MarqueeTrackOptions = {}): string {
  const totalUnits = options.totalUnits ?? 6;
  const heroIndex = options.heroIndex ?? 2;

  let unitsHtml = '';

  for (let i = 0; i < totalUnits; i++) {
    const isHero = i === heroIndex;

    const wordmarkSection = isHero
      ? `<div id="hero-wordmark-wrapper" data-marquee-lockup="true" class="relative inline-flex items-center justify-center origin-center">
           <div id="hero-wordmark">${createWordmarkHtml(true)}</div>
         </div>`
      : `<div data-marquee-lockup="true" class="satellite-item inline-flex items-center justify-center opacity-0">${createWordmarkHtml(false)}</div>`;

    unitsHtml += `
      <div data-unit-index="${i}" class="marquee-unit flex items-center shrink-0" style="gap: clamp(2rem, 1.5rem + 1.5vw, 3.125rem); padding-right: clamp(2rem, 1.5rem + 1.5vw, 3.125rem);">
        ${wordmarkSection}

        <div class="track-render-item satellite-item flex items-center text-[12px] md:text-[13px] font-semibold tracking-[0.05em] uppercase text-[#0d0d0d] whitespace-nowrap opacity-0">
          ${MARQUEE_SATELLITES.phrase1}
        </div>

        <span class="track-render-item satellite-item text-[#0d0d0d] opacity-0 text-[10px] select-none">${MARQUEE_SATELLITES.symbol1}</span>

        <div class="track-render-item satellite-item flex items-center text-[12px] md:text-[13px] font-semibold tracking-[0.05em] uppercase text-[#0d0d0d] whitespace-nowrap opacity-0">
          ${MARQUEE_SATELLITES.phrase2}
        </div>

        <span class="track-render-item satellite-item text-[#0d0d0d] opacity-0 text-[10px] select-none">${MARQUEE_SATELLITES.symbol2}</span>

        <div class="track-render-item satellite-item flex items-center text-[12px] md:text-[13px] font-bold tracking-[0.05em] uppercase text-[#0d0d0d] whitespace-nowrap underline underline-offset-4 cursor-pointer hover:opacity-75 opacity-0">
          ${MARQUEE_SATELLITES.action}
        </div>
      </div>
    `.trim();
  }

  return unitsHtml;
}
