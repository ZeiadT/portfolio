import type { Engine, ContactPayload, ProfileData } from '@/domain/types';
import { ContactService, RateLimitError } from '@/services/contactService';
import { AudioHaptics } from './AudioHaptics';
import { CairoTimeClock } from './CairoTimeClock';
import { TelegramChannelCard } from './TelegramChannelCard';
import { DirectEmailDispatcher } from './DirectEmailDispatcher';
import { RetroTerminalMode } from './RetroTerminalMode';
import { KineticSendAnimation } from './KineticSendAnimation';

export interface ContactHubConfig {
  profileData?: ProfileData;
  contactService?: ContactService;
}

/**
 * ContactHub
 * Dual-Channel Transmission Hub (Telegram Fast Track & Direct Email Dispatcher)
 * Complete with Live Cairo Timezone HUD, Kinetic Paper Airplane Send Animation,
 * Retro Monospace CLI Terminal Mode, and Native Web Audio Haptics.
 *
 * Implements Engine lifecycle: mount(container), destroy(), resize?().
 */
export class ContactHub implements Engine {
  public readonly id = 'contact-hub';

  private container: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private rightColumnContainer: HTMLElement | null = null;

  private isTerminalMode: boolean = false;

  private audioHaptics: AudioHaptics;
  private contactService: ContactService;
  private cairoClock: CairoTimeClock;
  private telegramCard: TelegramChannelCard;
  private emailDispatcher: DirectEmailDispatcher;
  private terminalMode: RetroTerminalMode;
  private kineticAnimation: KineticSendAnimation;

  constructor(config: ContactHubConfig = {}) {
    this.audioHaptics = new AudioHaptics();
    this.contactService = config.contactService || new ContactService();

    this.cairoClock = new CairoTimeClock();

    this.telegramCard = new TelegramChannelCard({
      telegramHandle: 'zeiad_mohammed',
      audioHaptics: this.audioHaptics,
    });

    this.emailDispatcher = new DirectEmailDispatcher({
      audioHaptics: this.audioHaptics,
      onSubmit: (payload) => this.handleSubmit(payload),
      onToggleTerminal: () => this.setTerminalMode(true),
    });

    this.terminalMode = new RetroTerminalMode({
      audioHaptics: this.audioHaptics,
      onSubmit: (payload) => this.handleSubmit(payload),
      onSwitchToGui: () => this.setTerminalMode(false),
    });

    this.kineticAnimation = new KineticSendAnimation({
      audioHaptics: this.audioHaptics,
    });
  }

  public mount(container: HTMLElement): void {
    this.container = container;

    const root = document.createElement('section');
    root.setAttribute('data-contact-hub', 'true');
    root.className = 'contact-hub w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-30 flex flex-col gap-8';

    root.innerHTML = `
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div class="max-w-xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4421]/10 border border-[#ff4421]/20 text-[#ff4421] text-[11px] font-mono uppercase tracking-wider mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-[#ff4421] animate-ping"></span>
            Signal &amp; Transmission Hub
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
            Let's build something <span class="text-[#ff4421]">extraordinary</span>.
          </h2>
          <p class="mt-2 text-sm text-neutral-400 leading-relaxed">
            Direct channels open for recruitment, contract projects, and architecture advisory.
          </p>
        </div>

        <!-- Live Cairo Timezone HUD Mount -->
        <div data-cairo-clock-slot class="shrink-0"></div>
      </div>

      <!-- Transmission Grid (Side-by-Side Desktop / Stacked Mobile) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch relative">
        <!-- Left Column: Telegram Channel Card -->
        <div data-telegram-card-slot class="flex flex-col"></div>

        <!-- Right Column: Direct Email Dispatcher / Retro Terminal Mode -->
        <div data-right-column-slot class="flex flex-col"></div>
      </div>
    `;

    this.rootEl = root;
    this.container.appendChild(root);

    // 1. Mount Cairo Clock
    const clockSlot = root.querySelector('[data-cairo-clock-slot]') as HTMLElement | null;
    if (clockSlot) {
      this.cairoClock.mount(clockSlot);
    }

    // 2. Mount Telegram Channel Card
    const telegramSlot = root.querySelector('[data-telegram-card-slot]') as HTMLElement | null;
    if (telegramSlot) {
      this.telegramCard.mount(telegramSlot);
    }

    // 3. Mount Right Column (Email Dispatcher by default)
    this.rightColumnContainer = root.querySelector('[data-right-column-slot]');
    if (this.rightColumnContainer) {
      this.emailDispatcher.mount(this.rightColumnContainer);
    }

    // 4. Mount Kinetic Animation overlay
    this.kineticAnimation.mount(root);
  }

  public setTerminalMode(enable: boolean): void {
    if (this.isTerminalMode === enable || !this.rightColumnContainer) return;
    this.isTerminalMode = enable;

    if (enable) {
      this.emailDispatcher.destroy();
      this.terminalMode.mount(this.rightColumnContainer);
    } else {
      this.terminalMode.destroy();
      this.emailDispatcher.mount(this.rightColumnContainer);
    }
  }

  private async handleSubmit(payload: ContactPayload): Promise<void> {
    const submitBtn = this.emailDispatcher.getSubmitButton();
    this.emailDispatcher.setSubmitting(true);

    try {
      // 1. Submit through ContactService
      await this.contactService.submitMessage(payload);

      // 2. Play kinetic animation if button is present
      if (submitBtn) {
        await this.kineticAnimation.play(submitBtn);

        // Reset after 3 seconds
        setTimeout(() => {
          this.kineticAnimation.reset(submitBtn);
          this.emailDispatcher.resetForm();
          this.emailDispatcher.setSubmitting(false);
        }, 3200);
      }
    } catch (err: any) {
      this.emailDispatcher.setSubmitting(false);
      if (submitBtn) {
        this.kineticAnimation.reset(submitBtn);
      }

      if (err instanceof RateLimitError) {
        alert(err.message);
      } else {
        alert(err.message || 'Transmission failed. Please try again or reach out on Telegram.');
      }
      throw err;
    }
  }

  public resize(): void {
    // Engine resize handler
  }

  public destroy(): void {
    this.cairoClock.destroy();
    this.telegramCard.destroy();
    this.emailDispatcher.destroy();
    this.terminalMode.destroy();
    this.kineticAnimation.destroy();
    this.audioHaptics.destroy();

    this.rightColumnContainer = null;

    if (this.rootEl && this.rootEl.parentNode) {
      this.rootEl.parentNode.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.container = null;
  }
}
