import type { ProfileAvatarConfig } from '@/domain/types';
import { HoloCardEngine } from '@/engines/holo/HoloCardEngine';

export interface ProfileAvatarOptions {
  title?: string;
  phone?: string;
  phoneRaw?: string;
  onImageClick?: (src: string, alt: string) => void;
}

/**
 * ProfileAvatarComponent
 * Renders the clean portrait card:
 * - Pure, crisp portrait image with WebGL2 holographic card engine
 * - Fallback monogram if image fails to load
 * - Edge-to-edge uppercase role title ("MOBILE DEVELOPER")
 * - Interactive click handling and clean lifecycle disposal
 */
export class ProfileAvatarComponent {
  private config: ProfileAvatarConfig;
  private options: ProfileAvatarOptions;
  private rootEl: HTMLElement | null = null;
  private cardEl: HTMLElement | null = null;
  private imgEl: HTMLImageElement | null = null;
  private holoEngine: HoloCardEngine | null = null;

  // Event handlers for clean disposal
  private clickHandler: (() => void) | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private errorHandler: (() => void) | null = null;

  constructor(config: ProfileAvatarConfig, options: ProfileAvatarOptions = {}) {
    this.config = config;
    this.options = options;
  }

  public mount(container: HTMLElement): void {
    const root = document.createElement('div');
    root.className =
      'profile-avatar relative flex flex-col items-start select-none w-full max-w-[220px] sm:max-w-[250px] md:max-w-[270px]';

    const titleHtml = this.options.title
      ? `
        <div class="mt-4 w-full flex items-center justify-center">
          <h3
            data-avatar-title
            class="w-full text-center uppercase tracking-[0.25em] text-xs sm:text-sm font-bold text-white select-none pl-[0.25em]"
          >
            ${(this.options.title || '').toUpperCase()}
          </h3>
        </div>
      `
      : '';

    root.innerHTML = `
      <!-- Clean Portrait Card Container -->
      <div class="relative w-full flex items-center justify-center">
        <!-- Portrait Card -->
        <div
          data-avatar-card
          role="button"
          tabindex="0"
          aria-label="Portrait photo"
          class="relative w-full aspect-[4/5] rounded-2xl sm:rounded-3xl border border-white/15 bg-neutral-900/80 backdrop-blur-md overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
        >
          <!-- The Portrait Image (Pure & Un-obscured) -->
          <img
            src="${this.config.src}"
            alt="${this.config.alt}"
            class="w-full h-full object-cover object-top select-none pointer-events-none"
            loading="eager"
          />

          <!-- Fallback Monogram SVG (Hidden unless image fails) -->
          <div
            data-avatar-fallback
            class="hidden absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-950 text-neutral-100"
          >
            <div class="w-16 h-16 rounded-2xl border border-white/20 flex items-center justify-center bg-white/[0.05] shadow-inner mb-2">
              <span class="text-2xl font-bold tracking-widest text-[#ff4421]">${this.config.fallbackInitials}</span>
            </div>
            <span class="text-xs uppercase tracking-widest text-neutral-400 font-mono">Portrait</span>
          </div>
        </div>
      </div>

      <!-- Identity Data Directly Below Picture -->
      ${titleHtml}
    `;

    container.appendChild(root);
    this.rootEl = root;

    this.cardEl = root.querySelector<HTMLElement>('[data-avatar-card]');
    this.imgEl = root.querySelector<HTMLImageElement>('img');
    const fallbackEl = root.querySelector<HTMLElement>('[data-avatar-fallback]');

    // Initialize WebGL2 Holographic Engine
    if (this.cardEl) {
      this.holoEngine = new HoloCardEngine({
        imageSrc: this.config.src,
        alt: this.config.alt,
        targetEl: this.cardEl,
      });
      this.holoEngine.mount(this.cardEl);
    }

    // Image error fallback
    if (this.imgEl && fallbackEl) {
      this.errorHandler = () => {
        if (this.imgEl) this.imgEl.classList.add('hidden');
        fallbackEl.classList.remove('hidden');
      };
      this.imgEl.addEventListener('error', this.errorHandler);
    }

    // Card click and keydown handlers
    if (this.cardEl) {
      this.clickHandler = () => {
        this.options.onImageClick?.(this.config.src, this.config.alt);
      };
      this.cardEl.addEventListener('click', this.clickHandler);

      this.keydownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.options.onImageClick?.(this.config.src, this.config.alt);
        }
      };
      this.cardEl.addEventListener('keydown', this.keydownHandler);
    }
  }

  public destroy(): void {
    if (this.holoEngine) {
      this.holoEngine.destroy();
      this.holoEngine = null;
    }
    if (this.cardEl) {
      if (this.clickHandler) {
        this.cardEl.removeEventListener('click', this.clickHandler);
        this.clickHandler = null;
      }
      if (this.keydownHandler) {
        this.cardEl.removeEventListener('keydown', this.keydownHandler);
        this.keydownHandler = null;
      }
    }
    if (this.imgEl && this.errorHandler) {
      this.imgEl.removeEventListener('error', this.errorHandler);
      this.errorHandler = null;
    }
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.cardEl = null;
    this.imgEl = null;
  }
}
