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
 * MythicCardFaceRenderer
 *
 * Concrete renderer for the Mythic Rare Holographic TCG playing card face.
 * Features:
 * - Obsidian radial dark background with multi-layer gold/vermilion metallic bevel frame
 * - Header block with Mythic Rarity metallic gradient text, golden stars, and role class badge
 * - Holographic arch portrait window with metallic vector orbit rings, avatar, and LV. 99 badge
 * - Identity and Lore block with candidate title, skill name, and description
 * - Glowing attribute stats tickers (PERF: 99 / ARCH: 98 / CODE: 95) with themed linear gradient bars
 * - 100% inline SVG/HTML vectors with zero external graphical dependencies
 */
export class MythicCardFaceRenderer implements CardFaceRenderer {
  public readonly id = 'mythic-rare-tcg';

  public render(container: HTMLElement, data: CardSummonData, theme: CardSummonTheme = {}): void {
    const primaryColor = theme.primaryColor || '#ff4421';
    const coreColor = theme.coreColor || '#ffffff';

    const starCount = Math.max(0, Math.floor(data.stars || 0));
    const perf = data.stats?.perf ?? 99;
    const arch = data.stats?.arch ?? 98;
    const code = data.stats?.code ?? 95;

    const frameId = `face-frame-${Math.random().toString(36).slice(2, 9)}`;

    // Apply base container styling
    const baseClasses = [
      'bg-gradient-to-b',
      'from-[#141419]',
      'via-[#0c0c10]',
      'to-[#070709]',
      'relative',
      'flex',
      'flex-col',
      'justify-between',
      'p-4',
      'sm:p-5',
      'text-white',
      'h-full',
      'w-full',
    ];
    for (const cls of baseClasses) {
      container.classList.add(cls);
    }
    container.classList.remove('bg-neutral-900');

    container.innerHTML = `
      <!-- Multi-layer metallic bevel frame -->
      <div data-summon-face-frame class="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden select-none" aria-hidden="true">
        <svg class="w-full h-full" viewBox="0 0 350 490" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${frameId}-border" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.8" />
              <stop offset="30%" stop-color="${primaryColor}" stop-opacity="0.6" />
              <stop offset="50%" stop-color="${coreColor}" stop-opacity="0.9" />
              <stop offset="70%" stop-color="${primaryColor}" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.8" />
            </linearGradient>
          </defs>
          <!-- Outer hairline border with inset gold/vermilion glow -->
          <rect x="6" y="6" width="338" height="478" rx="20" fill="none" stroke="url(#${frameId}-border)" stroke-width="1.5" />
          <rect x="9" y="9" width="332" height="472" rx="17" fill="none" stroke="${coreColor}" stroke-opacity="0.1" stroke-width="0.8" />
          <!-- Corner metallic brackets / filigree -->
          <g stroke="url(#${frameId}-border)" stroke-width="1.5" fill="none" stroke-linecap="round">
            <path d="M 12 26 L 12 16 Q 12 12 16 12 L 26 12" />
            <path d="M 338 26 L 338 16 Q 338 12 334 12 L 324 12" />
            <path d="M 12 464 L 12 474 Q 12 478 16 478 L 26 478" />
            <path d="M 338 464 L 338 474 Q 338 478 334 478 L 324 478" />
          </g>
          <!-- Corner metallic accent studs -->
          <circle cx="16" cy="16" r="2" fill="#fbbf24" />
          <circle cx="334" cy="16" r="2" fill="#fbbf24" />
          <circle cx="16" cy="474" r="2" fill="#fbbf24" />
          <circle cx="334" cy="474" r="2" fill="#fbbf24" />
        </svg>
      </div>

      <!-- Header block -->
      <div data-summon-face-header class="relative z-10 flex items-center justify-between gap-1.5 w-full">
        <div class="flex items-center gap-1.5 min-w-0">
          <span data-summon-face-rarity class="text-[9px] sm:text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm font-mono truncate">
            ${escapeHtml(data.rarity)}
          </span>
          <span data-summon-face-stars class="inline-flex items-center gap-0.5 text-amber-400 text-[10px] sm:text-xs tracking-tighter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] select-none">
            ${Array.from({ length: starCount }, () => `<span data-summon-star class="inline-block transform-gpu">★</span>`).join('')}
          </span>
        </div>
        <div class="flex items-center shrink-0">
          <span data-summon-face-class class="text-[8px] sm:text-[8.5px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-neutral-200 backdrop-blur-sm shadow-sm truncate max-w-[110px] sm:max-w-[130px]">
            ${escapeHtml(data.role)}
          </span>
        </div>
      </div>

      <!-- Holographic Arch Window -->
      <div data-summon-face-portrait-window class="relative z-10 w-full aspect-[16/10] rounded-t-[40px] rounded-b-xl overflow-hidden border border-white/20 bg-neutral-950 shadow-inner group my-1 sm:my-1.5">
        <!-- Subtle vector orbit rings behind avatar -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-30 select-none" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="100" cy="75" rx="80" ry="35" fill="none" stroke="${primaryColor}" stroke-width="0.8" stroke-dasharray="3 3" />
          <ellipse cx="100" cy="75" rx="55" ry="65" fill="none" stroke="${coreColor}" stroke-width="0.6" stroke-opacity="0.5" />
          <circle cx="100" cy="75" r="45" fill="none" stroke="${primaryColor}" stroke-width="0.5" stroke-dasharray="8 4" />
        </svg>

        <!-- Avatar image -->
        <img data-summon-face-avatar src="${escapeHtml(data.imageSrc)}" alt="${escapeHtml(data.imageAlt)}" class="w-full h-full object-cover select-none relative z-10" />

        <!-- Bottom vignette & rim gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/25 to-transparent pointer-events-none z-20"></div>
        <div class="absolute inset-0 rounded-t-[40px] rounded-b-xl ring-1 ring-inset ring-white/10 pointer-events-none z-20"></div>

        <!-- Level badge in corner -->
        <div class="absolute bottom-1.5 right-2 z-30 px-1.5 py-0.5 rounded bg-black/70 border border-amber-400/40 text-[8px] font-mono font-bold text-amber-300 tracking-wider shadow-sm select-none">
          LV. 99
        </div>
      </div>

      <!-- Identity & Lore block -->
      <div data-summon-face-lore class="relative z-10 flex flex-col gap-0.5 w-full bg-neutral-950/50 rounded-xl p-2 sm:p-2.5 border border-white/10 backdrop-blur-xs">
        <div class="flex items-center justify-between">
          <span data-summon-face-name class="font-bold text-xs sm:text-sm tracking-wide text-white drop-shadow-sm font-sans truncate">
            ${escapeHtml(data.name)}
          </span>
          <span class="text-[8px] font-mono text-white/40 uppercase tracking-widest select-none">
            TCG-001
          </span>
        </div>
        <div class="flex flex-col gap-0.5">
          <span data-summon-face-skill-title class="text-[10px] sm:text-[11px] text-amber-300 font-semibold tracking-wide">
            ${escapeHtml(data.skillName)}
          </span>
          <p data-summon-face-skill-desc class="text-[9.5px] sm:text-[10px] text-white/70 leading-snug line-clamp-2">
            ${escapeHtml(data.skillDescription)}
          </p>
        </div>
      </div>

      <!-- Attribute Stats block -->
      <div data-summon-face-stats class="relative z-10 flex items-center justify-between gap-1 sm:gap-1.5 w-full">
        <!-- PERF stat -->
        <div class="flex-1 flex flex-col gap-0.5 items-center bg-white/[0.04] rounded-lg p-1 sm:p-1.5 border border-white/5 shadow-xs">
          <div class="flex items-center justify-between w-full px-0.5">
            <span class="text-[7px] sm:text-[7.5px] font-mono text-neutral-400 uppercase">SPD</span>
            <span data-summon-stat-perf class="text-[9.5px] sm:text-[10px] font-mono font-bold text-amber-200">
              PERF: ${perf}
            </span>
          </div>
          <div data-summon-stat-bar class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div data-summon-stat-bar-fill data-target-width="${Math.min(100, Math.max(0, perf))}" class="h-full rounded-full transition-all duration-300 origin-left" style="width: 0%; background: linear-gradient(90deg, ${primaryColor}, ${coreColor});"></div>
          </div>
        </div>

        <!-- ARCH stat -->
        <div class="flex-1 flex flex-col gap-0.5 items-center bg-white/[0.04] rounded-lg p-1 sm:p-1.5 border border-white/5 shadow-xs">
          <div class="flex items-center justify-between w-full px-0.5">
            <span class="text-[7px] sm:text-[7.5px] font-mono text-neutral-400 uppercase">SYS</span>
            <span data-summon-stat-arch class="text-[9.5px] sm:text-[10px] font-mono font-bold text-amber-200">
              ARCH: ${arch}
            </span>
          </div>
          <div data-summon-stat-bar class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div data-summon-stat-bar-fill data-target-width="${Math.min(100, Math.max(0, arch))}" class="h-full rounded-full transition-all duration-300 origin-left" style="width: 0%; background: linear-gradient(90deg, ${primaryColor}, ${coreColor});"></div>
          </div>
        </div>

        <!-- CODE stat -->
        <div class="flex-1 flex flex-col gap-0.5 items-center bg-white/[0.04] rounded-lg p-1 sm:p-1.5 border border-white/5 shadow-xs">
          <div class="flex items-center justify-between w-full px-0.5">
            <span class="text-[7px] sm:text-[7.5px] font-mono text-neutral-400 uppercase">SYN</span>
            <span data-summon-stat-code class="text-[9.5px] sm:text-[10px] font-mono font-bold text-amber-200">
              CODE: ${code}
            </span>
          </div>
          <div data-summon-stat-bar class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div data-summon-stat-bar-fill data-target-width="${Math.min(100, Math.max(0, code))}" class="h-full rounded-full transition-all duration-300 origin-left" style="width: 0%; background: linear-gradient(90deg, ${primaryColor}, ${coreColor});"></div>
          </div>
        </div>
      </div>
    `;
  }
}
