import type { CardFaceRenderer } from './CardFaceRenderer';
import type { CardSummonData, CardSummonTheme } from '../CardSummonEngine';

function escapeHtml(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * EditorialCardFaceRenderer
 *
 * Implements Option 3: Minimalist Editorial Luxury card face strategy.
 * Visual Characteristics:
 * - Ultra-clean Swiss typographic editorial layout
 * - Sleek monoline white/15 hairline borders & frosted glass container (bg-black/90 backdrop-blur-2xl)
 * - Restrained high-contrast typography with subtle warm gold accents
 * - Minimalist header with small uppercase edition title ("PORTFOLIO EDITION // 2026")
 * - Razor-sharp rectangular cut portrait window with monochrome duotone treatment
 * - Grid-aligned identity and core engineering statement
 * - High-contrast monospace data tickers for PERF: 99 / ARCH: 98 / CODE: 95
 * - Zero external graphic assets (100% inline HTML/CSS vectors)
 */
export class EditorialCardFaceRenderer implements CardFaceRenderer {
  public readonly id = 'minimalist-editorial-luxury';

  public render(container: HTMLElement, data: CardSummonData, theme: CardSummonTheme = {}): void {
    const primaryColor = theme.primaryColor || '#ff4421';
    const coreColor = theme.coreColor || '#ffffff';

    const starCount = Math.max(0, Math.floor(data.stars || 5));
    const perf = data.stats?.perf ?? 99;
    const arch = data.stats?.arch ?? 98;
    const code = data.stats?.code ?? 95;

    // Apply frosted glass container styling
    const baseClasses = [
      'bg-black/90',
      'backdrop-blur-2xl',
      'border',
      'border-white/15',
      'relative',
      'flex',
      'flex-col',
      'justify-between',
      'p-3',
      'sm:p-3.5',
      'md:p-4',
      'text-white',
      'font-sans',
      'h-full',
      'w-full',
    ];
    for (const cls of baseClasses) {
      container.classList.add(cls);
    }
    container.classList.remove('bg-neutral-900', 'from-[#141419]');

    const editionTitle = data.rarity === 'MYTHIC RARE' ? 'PORTFOLIO EDITION // 2026' : (data.rarity || 'PORTFOLIO EDITION // 2026');

    container.innerHTML = `
      <!-- Sleek monoline hairline border frame -->
      <div data-summon-face-frame class="absolute inset-0 pointer-events-none rounded-3xl border border-white/10 m-1 sm:m-1.5" aria-hidden="true">
        <!-- Corner hairline crosshairs -->
        <span class="absolute top-1.5 left-1.5 text-[7px] sm:text-[8px] font-mono text-white/30 select-none">+</span>
        <span class="absolute top-1.5 right-1.5 text-[7px] sm:text-[8px] font-mono text-white/30 select-none">+</span>
        <span class="absolute bottom-1.5 left-1.5 text-[7px] sm:text-[8px] font-mono text-white/30 select-none">+</span>
        <span class="absolute bottom-1.5 right-1.5 text-[7px] sm:text-[8px] font-mono text-white/30 select-none">+</span>
      </div>

      <!-- Header block -->
      <div data-summon-face-header class="relative z-10 flex flex-col gap-0.5 w-full pt-0.5">
        <div class="flex items-center justify-between gap-1.5 w-full">
          <div class="flex items-center gap-1 min-w-0">
            <span style="background-color: ${primaryColor};" class="inline-block w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_6px_${primaryColor}]"></span>
            <span data-summon-face-rarity class="text-[8px] sm:text-[9px] font-mono tracking-wider uppercase text-amber-200/90 font-medium truncate">
              ${escapeHtml(editionTitle)}
            </span>
            <span class="text-white/20 text-[9px] select-none">•</span>
            <span data-summon-face-stars class="text-amber-400/80 text-[8px] sm:text-[9px] tracking-tight select-none">
              ${'★'.repeat(starCount)}
            </span>
          </div>
          <div class="flex items-center shrink-0">
            <span data-summon-face-class class="text-[7.5px] sm:text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border border-white/20 text-neutral-300 bg-white/[0.03] backdrop-blur-sm tracking-wider truncate max-w-[120px] sm:max-w-[140px]">
              ${escapeHtml(data.role)}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between text-[6.5px] sm:text-[7px] font-mono tracking-wider text-white/35 uppercase">
          <span>SPEC: 5x7 ARCHIVE</span>
          <span>LAT: 30.04° N // LON: 31.23° E</span>
        </div>
      </div>

      <!-- Razor-sharp rectangular duotone portrait window -->
      <div data-summon-face-portrait-window class="relative z-10 w-full aspect-[16/10] rounded-sm overflow-hidden border border-white/20 bg-neutral-950 shadow-2xl group my-1 sm:my-1.5">
        <!-- Avatar image with monochrome duotone treatment -->
        <img data-summon-face-avatar src="${escapeHtml(data.imageSrc)}" alt="${escapeHtml(data.imageAlt)}" class="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700 select-none relative z-10" />

        <!-- Editorial hairline frame overlay & vignette -->
        <div class="absolute inset-0 border border-white/10 pointer-events-none z-20"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none z-20"></div>

        <!-- Inset technical badges -->
        <div class="absolute top-1.5 left-1.5 z-30 font-mono text-[6.5px] sm:text-[7px] tracking-wider text-emerald-400/90 uppercase select-none flex items-center gap-1 bg-black/60 px-1 py-0.5 rounded border border-white/10 backdrop-blur-sm">
          <span class="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ACTIVE // CAIRO</span>
        </div>
        <div class="absolute bottom-1.5 left-1.5 z-30 font-mono text-[6.5px] sm:text-[7px] tracking-wider text-white/70 uppercase select-none bg-black/60 px-1 py-0.5 rounded border border-white/10 backdrop-blur-sm">
          KOTLIN • COMPOSE • MVI
        </div>
        <div class="absolute bottom-1.5 right-1.5 z-30 font-mono text-[6.5px] sm:text-[7px] tracking-wider text-white/60 uppercase select-none bg-black/60 px-1 py-0.5 rounded border border-white/10 backdrop-blur-sm">
          INDEX: 01 // CV
        </div>
      </div>

      <!-- Grid-aligned identity and lore block -->
      <div data-summon-face-lore class="relative z-10 flex flex-col gap-0.5 w-full border-t border-b border-white/10 py-1 sm:py-1.5">
        <div class="h-[1px] w-full mb-0.5 opacity-50" style="background: linear-gradient(90deg, ${coreColor}40, ${primaryColor}60, transparent);" aria-hidden="true"></div>
        <div class="flex items-baseline justify-between gap-1.5">
          <h3 data-summon-face-name class="text-sm sm:text-base font-bold tracking-tight text-white font-sans truncate">
            ${escapeHtml(data.name)}
          </h3>
          <span data-summon-face-skill-title class="text-[8.5px] sm:text-[9px] font-mono tracking-wider text-amber-300/90 font-medium uppercase truncate max-w-[130px] sm:max-w-[150px]">
            ${escapeHtml(data.skillName)}
          </span>
        </div>
        <p data-summon-face-skill-desc class="text-[9.5px] sm:text-[10px] leading-snug text-white/75 font-light line-clamp-2">
          ${escapeHtml(data.skillDescription)}
        </p>

        <!-- Core Engineering Pillars Tags -->
        <div data-summon-face-pillars class="flex flex-wrap items-center gap-1 mt-0.5 pt-0.5 border-t border-white/5">
          <span class="text-[7px] sm:text-[7.5px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/80">Native Android & KMP</span>
          <span class="text-[7px] sm:text-[7.5px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/80">Clean Architecture & MVI</span>
          <span class="text-[7px] sm:text-[7.5px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/80">Deterministic Perf</span>
          <span class="text-[7px] sm:text-[7.5px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/80">Flow & Coroutines</span>
        </div>
      </div>

      <!-- High-contrast monospace attribute stats tickers -->
      <div data-summon-face-stats class="relative z-10 grid grid-cols-3 gap-1 sm:gap-1.5 w-full font-mono text-center">
        <div class="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded bg-white/[0.02] border border-white/10">
          <span class="text-[6.5px] sm:text-[7px] text-white/40 tracking-wider">PERF // 60FPS</span>
          <span data-summon-stat-perf class="text-[10px] sm:text-[11px] font-semibold text-white tracking-tight mt-0.5">
            ${escapeHtml(String(perf))}
          </span>
          <div class="w-full bg-white/10 h-0.5 sm:h-1 rounded-full mt-0.5 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, perf))}%;"></div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded bg-white/[0.02] border border-white/10">
          <span class="text-[6.5px] sm:text-[7px] text-white/40 tracking-wider">ARCH // CLEAN</span>
          <span data-summon-stat-arch class="text-[10px] sm:text-[11px] font-semibold text-white tracking-tight mt-0.5">
            ${escapeHtml(String(arch))}
          </span>
          <div class="w-full bg-white/10 h-0.5 sm:h-1 rounded-full mt-0.5 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, arch))}%;"></div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded bg-white/[0.02] border border-white/10">
          <span class="text-[6.5px] sm:text-[7px] text-white/40 tracking-wider">CODE // KMP</span>
          <span data-summon-stat-code class="text-[10px] sm:text-[11px] font-semibold text-white tracking-tight mt-0.5">
            ${escapeHtml(String(code))}
          </span>
          <div class="w-full bg-white/10 h-0.5 sm:h-1 rounded-full mt-0.5 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, code))}%;"></div>
          </div>
        </div>
      </div>

      <!-- Accreditation Footer -->
      <div data-summon-face-accreditation class="relative z-10 w-full text-center text-[6.5px] sm:text-[7px] font-mono tracking-widest text-white/30 uppercase border-t border-white/10 pt-0.5">
        BENHA UNIVERSITY B.SC. (CS) • ITI SMART VILLAGE 9-MONTH DIPLOMA • 2026
      </div>
    `;
  }
}
