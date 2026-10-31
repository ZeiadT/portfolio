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

      <!-- Razor-sharp rectangular duotone portrait window with concentric radius: 24px - 16px = 8px -->
      <div data-summon-face-portrait-window class="relative z-10 w-full aspect-[16/10] rounded-[8px] overflow-hidden border border-white/20 bg-neutral-950 shadow-2xl group my-1 sm:my-1.5">
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

      <!-- Grid-aligned identity with Rare Edition badge -->
      <div data-summon-face-lore class="relative z-10 flex flex-col gap-1 w-full border-t border-b border-white/10 py-1.5">
        <div class="h-[1px] w-full mb-0.5 opacity-50" style="background: linear-gradient(90deg, ${coreColor}40, ${primaryColor}60, transparent);" aria-hidden="true"></div>
        <div class="flex items-center justify-between gap-2">
          <h3 data-summon-face-name class="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white font-sans truncate">
            ${escapeHtml(data.name)}
          </h3>
          <span data-summon-face-rarity-badge class="text-[9px] sm:text-[10px] font-mono tracking-wider text-amber-300 font-semibold uppercase px-2 py-0.5 rounded-[4px] border border-amber-400/30 bg-amber-400/10 backdrop-blur-sm shrink-0 select-none">
            Rare Edition
          </span>
        </div>

        <!-- Creature-Style Unique Skills (Development & Design) -->
        <div data-summon-face-skills class="flex flex-col gap-1.5 w-full mt-1">
          <!-- Skill 1: PASSIVE -->
          <div class="flex flex-col gap-0.5 rounded-[6px] bg-white/[0.02] border border-white/5 p-1.5">
            <div class="flex items-center justify-between font-mono">
              <span class="text-[9px] sm:text-[10px] font-bold text-amber-200 tracking-wide flex items-center gap-1">
                <span class="text-amber-400 text-[8px]">✦</span> REACTIVE FLOW
              </span>
              <span class="text-[7.5px] sm:text-[8px] font-semibold text-emerald-400/90 tracking-wider uppercase bg-emerald-950/40 px-1 py-0.5 rounded-[3px] border border-emerald-500/20">[PASSIVE]</span>
            </div>
            <p class="text-[8.5px] sm:text-[9.5px] text-white/70 leading-relaxed font-sans">
              Streams unidirectional state via Kotlin Coroutines & Flow; renders zero-recomposition 60fps frames.
            </p>
          </div>

          <!-- Skill 2: ACTIVE -->
          <div class="flex flex-col gap-0.5 rounded-[6px] bg-white/[0.02] border border-white/5 p-1.5">
            <div class="flex items-center justify-between font-mono">
              <span class="text-[9px] sm:text-[10px] font-bold text-amber-200 tracking-wide flex items-center gap-1">
                <span class="text-amber-400 text-[8px]">⚡</span> KMP SYNTHESIS
              </span>
              <span class="text-[7.5px] sm:text-[8px] font-semibold text-sky-400/90 tracking-wider uppercase bg-sky-950/40 px-1 py-0.5 rounded-[3px] border border-sky-500/20">[ACTIVE]</span>
            </div>
            <p class="text-[8.5px] sm:text-[9.5px] text-white/70 leading-relaxed font-sans">
              Transmutes multiplatform domain and data logic across Android and iOS targets with zero architectural leakage.
            </p>
          </div>

          <!-- Skill 3: ULTIMATE -->
          <div class="flex flex-col gap-0.5 rounded-[6px] bg-white/[0.02] border border-white/5 p-1.5">
            <div class="flex items-center justify-between font-mono">
              <span class="text-[9px] sm:text-[10px] font-bold text-amber-200 tracking-wide flex items-center gap-1">
                <span class="text-amber-400 text-[8px]">◈</span> KINETIC PRECISION
              </span>
              <span class="text-[7.5px] sm:text-[8px] font-semibold text-amber-400/90 tracking-wider uppercase bg-amber-950/40 px-1 py-0.5 rounded-[3px] border border-amber-500/20">[ULTIMATE]</span>
            </div>
            <p class="text-[8.5px] sm:text-[9.5px] text-white/70 leading-relaxed font-sans">
              Choreographs hardware-accelerated shaders and interruptible micro-gestures with sub-millisecond tactile response.
            </p>
          </div>
        </div>
      </div>

      <!-- High-contrast monospace attribute stats tickers with concentric rounded-[6px] -->
      <div data-summon-face-stats class="relative z-10 grid grid-cols-3 gap-1.5 w-full font-mono text-center">
        <div class="flex flex-col items-center justify-center p-1.5 rounded-[6px] bg-white/[0.02] border border-white/10">
          <span class="text-[7px] sm:text-[8px] text-white/40 tracking-wider">PERF // 60FPS</span>
          <span data-summon-stat-perf class="text-xs sm:text-sm font-semibold text-white tracking-tight mt-0.5">
            ${escapeHtml(String(perf))}
          </span>
          <div class="w-full bg-white/10 h-0.5 sm:h-1 rounded-full mt-1 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, perf))}%;"></div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center p-1.5 rounded-[6px] bg-white/[0.02] border border-white/10">
          <span class="text-[7px] sm:text-[8px] text-white/40 tracking-wider">ARCH // CLEAN</span>
          <span data-summon-stat-arch class="text-xs sm:text-sm font-semibold text-white tracking-tight mt-0.5">
            ${escapeHtml(String(arch))}
          </span>
          <div class="w-full bg-white/10 h-0.5 sm:h-1 rounded-full mt-1 overflow-hidden">
            <div class="h-full bg-amber-400" style="width: ${Math.min(100, Math.max(0, arch))}%;"></div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center p-1.5 rounded-[6px] bg-white/[0.02] border border-white/10">
          <span class="text-[7px] sm:text-[8px] text-white/40 tracking-wider">CODE // KMP</span>
          <span data-summon-stat-code class="text-xs sm:text-sm font-semibold text-white tracking-tight mt-0.5">
            ${escapeHtml(String(code))}
          </span>
          <div class="w-full bg-white/10 h-0.5 sm:h-1 rounded-full mt-1 overflow-hidden">
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
