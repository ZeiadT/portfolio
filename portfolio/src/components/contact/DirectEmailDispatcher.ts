import type { ContactPayload } from '@/domain/types';
import { validateContactPayload } from '@/services/contactService';
import type { AudioHaptics } from './AudioHaptics';

export interface DirectEmailDispatcherConfig {
  audioHaptics?: AudioHaptics;
  onSubmit?: (payload: ContactPayload) => Promise<void> | void;
  onToggleTerminal?: () => void;
}

/**
 * DirectEmailDispatcher
 * Modern in-app email dispatcher form with laser-hairline focus glow,
 * live character counter, inline validation, and terminal mode trigger.
 */
export class DirectEmailDispatcher {
  private haptics?: AudioHaptics;
  private onSubmit?: (payload: ContactPayload) => Promise<void> | void;
  private onToggleTerminal?: () => void;

  private container: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private cleanups: Array<() => void> = [];

  constructor(config: DirectEmailDispatcherConfig = {}) {
    this.haptics = config.audioHaptics;
    this.onSubmit = config.onSubmit;
    this.onToggleTerminal = config.onToggleTerminal;
  }

  public getSubmitButton(): HTMLButtonElement | null {
    if (!this.rootEl) return null;
    return this.rootEl.querySelector('[data-submit-btn]');
  }

  public resetForm(): void {
    if (!this.rootEl) return;
    const form = this.rootEl.querySelector('form') as HTMLFormElement | null;
    if (form) {
      form.reset();
      this.updateCharCounter(0);
      this.clearErrors();
    }
  }

  public setSubmitting(isSubmitting: boolean): void {
    if (!this.rootEl) return;
    const inputs = this.rootEl.querySelectorAll('input, textarea, button[type="submit"]');
    inputs.forEach((el) => {
      if (isSubmitting) {
        el.setAttribute('disabled', 'true');
      } else {
        el.removeAttribute('disabled');
      }
    });
  }

  public mount(container: HTMLElement): void {
    this.container = container;

    const root = document.createElement('div');
    root.className =
      'direct-email-dispatcher relative overflow-hidden rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300';

    root.innerHTML = `
      <!-- Ambient Vermilion Glow in Background -->
      <div class="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#ff4421]/10 blur-3xl" aria-hidden="true"></div>

      <div>
        <!-- Header with Terminal Mode Toggle -->
        <div class="flex items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-[#ff4421]/15 border border-[#ff4421]/30 flex items-center justify-center text-[#ff4421] shadow-inner">
              <svg class="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span class="text-[11px] font-mono uppercase tracking-wider text-[#ff4421]">Transmission Hub</span>
              <h3 class="text-lg font-semibold text-neutral-100">
                Direct Dispatcher
              </h3>
            </div>
          </div>

          <!-- Retro Terminal Mode Switch Button -->
          <button
            type="button"
            data-terminal-toggle
            class="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#00ff66]/50 hover:bg-[#00ff66]/10 text-neutral-400 hover:text-[#00ff66] transition-all duration-200 cursor-pointer select-none text-xs font-mono"
            title="Switch to Retro Monospace Terminal Mode"
            aria-label="Switch to Retro Monospace Terminal Mode"
          >
            <span class="font-bold text-sm tracking-tighter">&gt;_</span>
            <span class="hidden sm:inline">CLI Mode</span>
          </button>
        </div>

        <p class="text-sm text-neutral-400 leading-relaxed mb-6">
          Send an in-app message directly to my inbox. Validated in real-time with instant dispatch.
        </p>

        <!-- Form Body -->
        <form class="space-y-4" novalidate>
          <!-- Name Input -->
          <div>
            <label class="block text-xs font-mono text-neutral-400 mb-1.5" for="contact-name">
              YOUR NAME <span class="text-[#ff4421]">*</span>
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              placeholder="e.g. Alex Rivera"
              autocomplete="name"
              class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-neutral-100 text-sm placeholder-neutral-600 transition-all duration-200 focus:outline-none focus:border-[#ff4421] focus:ring-1 focus:ring-[#ff4421]/50 focus:shadow-[0_0_15px_rgba(255,68,33,0.2)]"
            />
            <span data-error-name class="block text-xs text-[#ff4421] mt-1 font-mono min-h-[16px]"></span>
          </div>

          <!-- Email or Handle Input -->
          <div>
            <label class="block text-xs font-mono text-neutral-400 mb-1.5" for="contact-email">
              EMAIL OR @HANDLE <span class="text-[#ff4421]">*</span>
            </label>
            <input
              id="contact-email"
              type="text"
              name="emailOrHandle"
              placeholder="alex@company.com or @alex_lead"
              autocomplete="email"
              class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-neutral-100 text-sm placeholder-neutral-600 transition-all duration-200 focus:outline-none focus:border-[#ff4421] focus:ring-1 focus:ring-[#ff4421]/50 focus:shadow-[0_0_15px_rgba(255,68,33,0.2)]"
            />
            <span data-error-email class="block text-xs text-[#ff4421] mt-1 font-mono min-h-[16px]"></span>
          </div>

          <!-- Message Textarea -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-mono text-neutral-400" for="contact-message">
                MESSAGE <span class="text-[#ff4421]">*</span>
              </label>
              <span data-char-counter class="text-[11px] font-mono text-neutral-500 tabular-nums">
                0 / 1000
              </span>
            </div>
            <textarea
              id="contact-message"
              name="message"
              rows="4"
              maxlength="1000"
              placeholder="How can I help engineer your next vision?"
              class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-neutral-100 text-sm placeholder-neutral-600 resize-none transition-all duration-200 focus:outline-none focus:border-[#ff4421] focus:ring-1 focus:ring-[#ff4421]/50 focus:shadow-[0_0_15px_rgba(255,68,33,0.2)]"
            ></textarea>
            <span data-error-message class="block text-xs text-[#ff4421] mt-1 font-mono min-h-[16px]"></span>
          </div>

          <!-- Submit Button Mount -->
          <div class="pt-2 flex items-center justify-end">
            <button
              type="submit"
              data-submit-btn
              class="relative min-w-[140px] h-11 px-6 rounded-xl bg-[#ff4421] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#ff4421]/90 active:scale-95 transition-all duration-200 shadow-lg shadow-[#ff4421]/25 flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <span data-submit-text class="flex items-center gap-2">
                <span>SEND TRANSMISSION</span>
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </span>
            </button>
          </div>
        </form>
      </div>
    `;

    this.rootEl = root;
    this.container.appendChild(root);

    this.bindEvents();
  }

  private updateCharCounter(count: number): void {
    if (!this.rootEl) return;
    const counter = this.rootEl.querySelector('[data-char-counter]');
    if (counter) {
      counter.textContent = `${count} / 1000`;
      if (count > 950) {
        counter.className = 'text-[11px] font-mono text-[#ff4421] font-semibold tabular-nums';
      } else {
        counter.className = 'text-[11px] font-mono text-neutral-500 tabular-nums';
      }
    }
  }

  private clearErrors(): void {
    if (!this.rootEl) return;
    ['name', 'email', 'message'].forEach((key) => {
      const errEl = this.rootEl!.querySelector(`[data-error-${key}]`);
      if (errEl) errEl.textContent = '';
    });
  }

  private bindEvents(): void {
    if (!this.rootEl) return;

    const form = this.rootEl.querySelector('form') as HTMLFormElement | null;
    const nameInput = this.rootEl.querySelector('input[name="name"]') as HTMLInputElement | null;
    const emailInput = this.rootEl.querySelector('input[name="emailOrHandle"]') as HTMLInputElement | null;
    const messageInput = this.rootEl.querySelector('textarea[name="message"]') as HTMLTextAreaElement | null;
    const terminalToggle = this.rootEl.querySelector('[data-terminal-toggle]') as HTMLButtonElement | null;

    // Terminal Mode Toggle
    if (terminalToggle) {
      const onToggle = () => {
        this.haptics?.playClick();
        if (this.onToggleTerminal) {
          this.onToggleTerminal();
        }
      };
      terminalToggle.addEventListener('click', onToggle);
      this.cleanups.push(() => terminalToggle.removeEventListener('click', onToggle));
    }

    // Input Typing / Keypress haptics & live char counting
    const onTextInput = () => {
      this.haptics?.playKeypress();
    };

    if (nameInput) {
      nameInput.addEventListener('input', onTextInput);
      this.cleanups.push(() => nameInput.removeEventListener('input', onTextInput));
    }

    if (emailInput) {
      emailInput.addEventListener('input', onTextInput);
      this.cleanups.push(() => emailInput.removeEventListener('input', onTextInput));
    }

    if (messageInput) {
      const onMessageInput = () => {
        this.haptics?.playKeypress();
        this.updateCharCounter(messageInput.value.length);
      };
      messageInput.addEventListener('input', onMessageInput);
      this.cleanups.push(() => messageInput.removeEventListener('input', onMessageInput));
    }

    // Form submission
    if (form) {
      const onSubmitHandler = async (e: Event) => {
        e.preventDefault();
        this.haptics?.playClick();
        this.clearErrors();

        const payload: ContactPayload = {
          name: nameInput?.value || '',
          emailOrHandle: emailInput?.value || '',
          channel: 'email',
          message: messageInput?.value || '',
          timestamp: Date.now(),
        };

        const validation = validateContactPayload(payload);
        if (!validation.isValid) {
          if (validation.errors.name && this.rootEl) {
            const errEl = this.rootEl.querySelector('[data-error-name]');
            if (errEl) errEl.textContent = validation.errors.name;
          }
          if (validation.errors.emailOrHandle && this.rootEl) {
            const errEl = this.rootEl.querySelector('[data-error-email]');
            if (errEl) errEl.textContent = validation.errors.emailOrHandle;
          }
          if (validation.errors.message && this.rootEl) {
            const errEl = this.rootEl.querySelector('[data-error-message]');
            if (errEl) errEl.textContent = validation.errors.message;
          }
          return;
        }

        if (this.onSubmit) {
          await this.onSubmit(payload);
        }
      };

      form.addEventListener('submit', onSubmitHandler);
      this.cleanups.push(() => form.removeEventListener('submit', onSubmitHandler));
    }
  }

  public destroy(): void {
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];

    if (this.rootEl && this.rootEl.parentNode) {
      this.rootEl.parentNode.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.container = null;
  }
}
