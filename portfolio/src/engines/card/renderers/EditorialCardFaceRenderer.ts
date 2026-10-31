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
      'p-4',
      'sm:p-5',
      'text-white',
      'font-sans',
      'h-full',
      'w-full',
      'rounded-3xl',
    ];
    for (const cls of baseClasses) {
      container.classList.add(cls);
    }
    container.classList.remove('bg-neutral-900', 'from-[#141419]');

    const roleTitle = data.role || 'Mobile Developer';

    container.innerHTML = `
      <!-- Sleek monoline hairline border frame with concentric radius: 24px - 6px = 18px -->
      <div data-summon-face-frame class="absolute inset-0 pointer-events-none rounded-[18px] border border-white/10 m-1.5" aria-hidden="true">
        <!-- Corner hairline crosshairs -->
        <span class="absolute top-1.5 left-1.5 text-[8px] sm:text-[9px] font-mono text-white/30 select-none">+</span>
        <span class="absolute top-1.5 right-1.5 text-[8px] sm:text-[9px] font-mono text-white/30 select-none">+</span>
        <span class="absolute bottom-1.5 left-1.5 text-[8px] sm:text-[9px] font-mono text-white/30 select-none">+</span>
        <span class="absolute bottom-1.5 right-1.5 text-[8px] sm:text-[9px] font-mono text-white/30 select-none">+</span>
      </div>

      <!-- Header block -->
      <div data-summon-face-header class="relative z-10 flex flex-col gap-1 w-full pt-0.5">
        <div class="flex items-center justify-between gap-2 w-full">
          <!-- Role on left side in golden font -->
          <div class="flex items-center gap-1.5 min-w-0">
            <span style="background-color: ${primaryColor};" class="inline-block w-1.5 h-1.5 rounded-full shrink-0 shadow-[0_0_6px_${primaryColor}]"></span>
            <span data-summon-face-role class="text-xs sm:text-sm font-mono tracking-widest uppercase text-amber-200/90 font-bold drop-shadow-sm truncate">
              ${escapeHtml(roleTitle)}
            </span>
          </div>

          <!-- Stars on right side filling previous position -->
          <div class="flex items-center shrink-0">
            <span data-summon-face-stars class="text-amber-400 text-xs sm:text-sm tracking-widest select-none drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
              ${'★'.repeat(starCount)}
            </span>
          </div>
        </div>

        <!-- Technical coordinates subheader -->
        <div class="flex items-center justify-between text-[7px] sm:text-[8px] font-mono tracking-widest text-white/35 uppercase">
          <span>SPEC: 5x7 ARCHIVE</span>
          <span>LAT: 30.04° N // LON: 31.23° E</span>
        </div>
      </div>

      <!-- Razor-sharp rectangular duotone portrait window with vertical space aspect-[4/3] and concentric radius: 24px - 16px = 8px -->
      <div data-summon-face-portrait-window class="relative z-10 w-full aspect-[4/3] rounded-[8px] overflow-hidden border border-white/20 bg-neutral-950 shadow-2xl group my-1 sm:my-1.5">
        <!-- Avatar image with monochrome duotone treatment -->
        <img data-summon-face-avatar src="${escapeHtml(data.imageSrc)}" alt="${escapeHtml(data.imageAlt)}" class="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700 select-none relative z-10" />

        <!-- Editorial hairline frame overlay & vignette -->
        <div class="absolute inset-0 border border-white/10 pointer-events-none z-20"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none z-20"></div>

        <!-- Corner catalog stamp -->
        <div class="absolute bottom-1.5 right-1.5 z-30 font-mono text-[7px] sm:text-[8px] tracking-wider text-white/50 uppercase select-none bg-black/60 px-1.5 py-0.5 rounded-[4px] border border-white/10 backdrop-blur-sm">
          INDEX: 01 // CV
        </div>
      </div>

      <!-- Unified Boxed Identity & Skills Container (concentric radius: 24px - 16px = 8px) -->
      <div data-summon-face-lore class="relative z-10 flex flex-col gap-2 w-full rounded-[8px] p-2.5 sm:p-3 bg-white/[0.03] border border-white/10 backdrop-blur-sm shadow-inner my-1">
        <!-- Top Row: Name + Rare Edition Badge -->
        <div class="flex items-center justify-between gap-2 w-full">
          <h3 data-summon-face-name class="text-sm sm:text-base md:text-lg font-bold tracking-tight text-white font-sans truncate">
            ${escapeHtml(data.name)}
          </h3>
          <span data-summon-face-rarity-badge class="text-[8px] sm:text-[9px] font-mono tracking-wider text-amber-300 font-semibold uppercase px-2 py-0.5 rounded-[4px] border border-amber-400/30 bg-amber-400/10 backdrop-blur-sm shrink-0 select-none">
            Rare Edition
          </span>
        </div>

        <!-- Subtle hairline separator -->
        <div class="h-[1px] w-full opacity-40" style="background: linear-gradient(90deg, ${coreColor}30, ${primaryColor}50, transparent);" aria-hidden="true"></div>

        <!-- Skills: Single rows with vector SVG icons, no description, no active/passive -->
        <div data-summon-face-skills class="flex flex-col gap-1.5 w-full">
          <!-- Skill 1: Reactive State Flow -->
          <div class="flex items-center justify-between gap-2 py-0.5">
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-3.5 h-3.5 text-amber-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M2 12c2.5-4 5.5-4 8 0s5.5 4 8 0 5.5-4 8 0" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
              <span class="text-[9px] sm:text-[10px] font-mono font-medium text-white/90 tracking-wide truncate">
                Reactive State Flow
              </span>
            </div>
            <span class="text-[7.5px] sm:text-[8px] font-mono text-amber-400/70 shrink-0">COROUTINES</span>
          </div>

          <!-- Skill 2: KMP Multiplatform Architecture -->
          <div class="flex items-center justify-between gap-2 py-0.5">
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-3.5 h-3.5 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="7" width="9" height="10" rx="1.5" />
                <rect x="13" y="7" width="9" height="10" rx="1.5" />
                <path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
              </svg>
              <span class="text-[9px] sm:text-[10px] font-mono font-medium text-white/90 tracking-wide truncate">
                KMP Multiplatform Architecture
              </span>
            </div>
            <span class="text-[7.5px] sm:text-[8px] font-mono text-sky-400/70 shrink-0">SHARED</span>
          </div>

          <!-- Skill 3: Kinetic 60FPS UI & Motion -->
          <div class="flex items-center justify-between gap-2 py-0.5">
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-3.5 h-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              <span class="text-[9px] sm:text-[10px] font-mono font-medium text-white/90 tracking-wide truncate">
                Kinetic 60FPS UI & Motion
              </span>
            </div>
            <span class="text-[7.5px] sm:text-[8px] font-mono text-emerald-400/70 shrink-0">COMPOSE</span>
          </div>
        </div>
      </div>

      <!-- High-contrast monospace attribute stats tickers with concentric rounded-[6px] and increased title typography -->
      <div data-summon-face-stats class="relative z-10 grid grid-cols-3 gap-1.5 w-full font-mono text-center">
        <div class="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-[6px] bg-white/[0.02] border border-white/10">
          <span data-summon-stat-title class="text-[9px] sm:text-[10px] font-mono font-semibold text-neutral-300 tracking-wider">PERF // 60FPS</span>
          <span data-summon-stat-perf class="text-sm sm:text-base font-bold text-white tracking-tight mt-1">
            ${escapeHtml(String(perf))}
          </span>
          <div class="w-full bg-white/10 h-1 sm:h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, perf))}%;"></div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-[6px] bg-white/[0.02] border border-white/10">
          <span data-summon-stat-title class="text-[9px] sm:text-[10px] font-mono font-semibold text-neutral-300 tracking-wider">ARCH // CLEAN</span>
          <span data-summon-stat-arch class="text-sm sm:text-base font-bold text-white tracking-tight mt-1">
            ${escapeHtml(String(arch))}
          </span>
          <div class="w-full bg-white/10 h-1 sm:h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, arch))}%;"></div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-[6px] bg-white/[0.02] border border-white/10">
          <span data-summon-stat-title class="text-[9px] sm:text-[10px] font-mono font-semibold text-neutral-300 tracking-wider">CODE // KMP</span>
          <span data-summon-stat-code class="text-sm sm:text-base font-bold text-white tracking-tight mt-1">
            ${escapeHtml(String(code))}
          </span>
          <div class="w-full bg-white/10 h-1 sm:h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, code))}%;"></div>
          </div>
        </div>
      </div>

      <!-- Accreditation Footer -->
      <div data-summon-face-accreditation class="relative z-10 w-full text-center text-[7px] sm:text-[8px] font-mono tracking-widest text-white/30 uppercase border-t border-white/10 pt-1">
        BENHA UNIVERSITY B.SC. (CS) • ITI SMART VILLAGE 9-MONTH DIPLOMA • 2026
      </div>
    `;
  }
}
