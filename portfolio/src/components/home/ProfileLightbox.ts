/**
 * ProfileLightbox Component
 * Accessible modal dialog that presents an enlarged portrait with backdrop blur and keyboard escape listener.
 */
export class ProfileLightbox {
  private modalEl: HTMLElement | null = null;
  private keydownListener: ((e: KeyboardEvent) => void) | null = null;
  private onCloseCallback?: () => void;
  private openState: boolean = false;

  public isOpen(): boolean {
    return this.openState;
  }

  public setOnClose(cb: () => void): void {
    this.onCloseCallback = cb;
  }

  public open(src: string, alt: string): void {
    if (this.openState) return;
    this.openState = true;

    const modal = document.createElement('div');
    modal.setAttribute('data-profile-lightbox', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Enlarged portrait view');
    modal.className =
      'fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 select-none animate-fadeIn';

    modal.innerHTML = `
      <!-- Backdrop with heavy blur and click-to-dismiss -->
      <div
        data-lightbox-backdrop
        class="absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity duration-300"
        aria-hidden="true"
      ></div>

      <!-- Dialog Card Container -->
      <div class="relative z-10 max-w-sm sm:max-w-md md:max-w-lg w-full max-h-[90vh] flex flex-col items-center">
        <!-- Close Button -->
        <button
          type="button"
          data-lightbox-close
          aria-label="Close dialog"
          class="absolute -top-12 right-0 sm:-right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-[#ff4421] text-white flex items-center justify-center border border-white/20 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421]"
        >
          <svg class="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Framed High-Res Image -->
        <div class="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-neutral-950">
          <img
            src="${src}"
            alt="${alt}"
            class="w-full h-full object-cover object-top select-none"
          />
        </div>

        <p class="text-xs uppercase tracking-widest text-neutral-400 mt-4 font-mono select-none">
          Press <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-white font-sans">ESC</kbd> or click outside to dismiss
        </p>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalEl = modal;

    // Bind Close Button
    const closeBtn = modal.querySelector<HTMLButtonElement>('[data-lightbox-close]');
    closeBtn?.addEventListener('click', () => this.close());

    // Bind Backdrop Click
    const backdrop = modal.querySelector<HTMLElement>('[data-lightbox-backdrop]');
    backdrop?.addEventListener('click', () => this.close());

    // Bind Keyboard Escape
    this.keydownListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    window.addEventListener('keydown', this.keydownListener);
  }

  public close(): void {
    if (!this.openState) return;
    this.openState = false;

    if (this.keydownListener) {
      window.removeEventListener('keydown', this.keydownListener);
      this.keydownListener = null;
    }

    if (this.modalEl && this.modalEl.parentElement) {
      this.modalEl.parentElement.removeChild(this.modalEl);
    }
    this.modalEl = null;

    this.onCloseCallback?.();
  }

  public destroy(): void {
    this.close();
    this.onCloseCallback = undefined;
  }
}
