/**
 * Wordmark Generator for "Zeiad Mohammed"
 * Produces structured DOM spans for letter-by-letter stagger animations
 * and repetitive marquee satellite tracks.
 */

export const BRAND_NAME = 'Zeiad Mohammed';

export function createWordmarkHtml(isHero: boolean = false): string {
  const chars = Array.from(BRAND_NAME);
  const charClass = isHero ? 'hero-char' : 'static-char';

  let charIndex = 0;
  const lettersHtml = chars
    .map((c) => {
      if (c === ' ') {
        return '<span class="inline-block w-2 md:w-3">&nbsp;</span>';
      }
      const span = `<span class="${charClass} inline-block select-none transform-gpu" data-index="${charIndex}">${c}</span>`;
      charIndex++;
      return span;
    })
    .join('');

  return `
    <span class="wordmark-label inline-flex items-center text-[#0d0d0d] font-bold text-[18px] md:text-[22px] tracking-[-0.01em] uppercase whitespace-nowrap leading-none select-none">
      ${lettersHtml}
      <span class="${charClass} text-[11px] md:text-[13px] font-semibold -translate-y-2 ml-0.5 select-none inline-block">®</span>
    </span>
  `.trim();
}
