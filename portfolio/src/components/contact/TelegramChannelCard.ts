import type { AudioHaptics } from './AudioHaptics';

export interface PromptChip {
  id: string;
  label: string;
  text: string;
}

export const TELEGRAM_PROMPT_CHIPS: PromptChip[] = [
  {
    id: 'project',
    label: '💼 Project Inquiry',
    text: "Hi Zeiad, I'd like to discuss an engineering project with you.",
  },
  {
    id: 'opportunity',
    label: '🚀 Job Opportunity',
    text: "Hi Zeiad, I'm reaching out regarding a mobile engineering opportunity.",
  },
  {
    id: 'hello',
    label: '☕ Say Hello',
    text: 'Hi Zeiad, just wanted to say hello and connect!',
  },
];

export interface TelegramChannelCardConfig {
  telegramHandle?: string;
  audioHaptics?: AudioHaptics;
  onChipSelected?: (chip: PromptChip) => void;
}

/**
 * TelegramChannelCard
 * Prominent dark glassmorphic channel card with Telegram visual accents
 * and fast inquiry prompt chips.
 */
export class TelegramChannelCard {
  private handle: string;
  private haptics?: AudioHaptics;
  private onChipSelected?: (chip: PromptChip) => void;

  private container: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private clickCleanups: Array<() => void> = [];

  constructor(config: TelegramChannelCardConfig = {}) {
    this.handle = config.telegramHandle || 'zeiad_mohammed';
    this.haptics = config.audioHaptics;
    this.onChipSelected = config.onChipSelected;
  }

  public mount(container: HTMLElement): void {
    this.container = container;

    const root = document.createElement('div');
    root.className =
      'telegram-channel-card relative overflow-hidden rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-[#229ED9]/40';

    root.innerHTML = `
      <!-- Ambient Telegram Blue Glow in Corner -->
      <div class="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#229ED9]/15 blur-3xl" aria-hidden="true"></div>

      <div>
        <!-- Card Header with Telegram Icon & Badge -->
        <div class="flex items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9] shadow-inner">
              <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.923z"/>
              </svg>
            </div>
            <div>
              <span class="text-[11px] font-mono uppercase tracking-wider text-[#229ED9]">Direct Channel</span>
              <h3 class="text-lg font-semibold text-neutral-100 flex items-center gap-1.5">
                Telegram Fast Track
              </h3>
            </div>
          </div>

          <span class="px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/25">
            Instant
          </span>
        </div>

        <p class="text-sm text-neutral-400 leading-relaxed mb-6">
          Connect immediately on Telegram for quick inquiries, architecture consultations, or direct chat.
        </p>

        <!-- Pre-filled Inquiry Chips Section -->
        <div class="mb-6">
          <span class="block text-xs font-mono uppercase text-neutral-500 mb-3 tracking-wide">
            Pre-filled quick inquiries:
          </span>
          <div class="flex flex-wrap gap-2">
            ${TELEGRAM_PROMPT_CHIPS.map(
              (chip) => `
              <button
                type="button"
                data-prompt-chip="${chip.id}"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-neutral-300 hover:text-white hover:bg-[#229ED9]/15 hover:border-[#229ED9]/40 active:scale-95 transition-all duration-200 cursor-pointer select-none"
              >
                ${chip.label}
              </button>
            `
            ).join('')}
          </div>
        </div>
      </div>

      <!-- Handle & Direct Launch CTA -->
      <div class="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="text-xs font-mono text-neutral-400">
          Handle: <span data-telegram-handle class="text-neutral-200 font-semibold">@${this.handle}</span>
        </div>

        <a
          href="https://t.me/${this.handle}"
          target="_blank"
          rel="noopener noreferrer"
          data-telegram-direct-link
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#229ED9] text-white text-xs font-semibold hover:bg-[#229ED9]/90 active:scale-95 transition-all duration-200 shadow-lg shadow-[#229ED9]/20"
        >
          <span>OPEN TELEGRAM</span>
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      </div>
    `;

    this.rootEl = root;
    this.container.appendChild(root);

    // Bind chip listeners
    TELEGRAM_PROMPT_CHIPS.forEach((chip) => {
      const chipBtn = root.querySelector(`[data-prompt-chip="${chip.id}"]`) as HTMLButtonElement | null;
      if (chipBtn) {
        const handler = () => {
          this.haptics?.playClick();
          if (this.onChipSelected) {
            this.onChipSelected(chip);
          }
          const encoded = encodeURIComponent(chip.text);
          window.open(`https://t.me/${this.handle}?text=${encoded}`, '_blank', 'noopener,noreferrer');
        };
        chipBtn.addEventListener('click', handler);
        this.clickCleanups.push(() => chipBtn.removeEventListener('click', handler));
      }
    });
  }

  public destroy(): void {
    this.clickCleanups.forEach((cleanup) => cleanup());
    this.clickCleanups = [];

    if (this.rootEl && this.rootEl.parentNode) {
      this.rootEl.parentNode.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.container = null;
  }
}
