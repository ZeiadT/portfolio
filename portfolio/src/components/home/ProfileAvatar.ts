import { gsap } from 'gsap';
import type { ProfileAvatarConfig } from '@/domain/types';

export interface ProfileAvatarOptions {
  title?: string;
  phone?: string;
  phoneRaw?: string;
  onImageClick?: (src: string, alt: string) => void;
}

/**
 * ProfileAvatarComponent
 * Renders the clean portrait card:
 * - Pure, crisp portrait image (un-obscured)
 * - Fallback monogram if image fails to load
 * - Edge-to-edge uppercase role title ("MOBILE DEVELOPER")
 * - Continuous subtle diagonal card shimmer animation via GSAP timeline
 * - Interactive click handling and clean lifecycle disposal
 */
export class ProfileAvatarComponent {
  private config: ProfileAvatarConfig;
  private options: ProfileAvatarOptions;
  private rootEl: HTMLElement | null = null;
  private cardEl: HTMLElement | null = null;
  private imgEl: HTMLImageElement | null = null;
  private shineTimeline: gsap.core.Timeline | null = null;

  // Event handlers for clean disposal
  private clickHandler: (() => void) | null = null;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private errorHandler: (() => void) | null = null;

  constructor(config: ProfileAvatarConfig, options: ProfileAvatarOptions = {}) {
    this.config = config;
    this.options = options;
  }

  public mount(container: HTMLElement): void {
    if (this.shineTimeline) {
      this.shineTimeline.kill();
      this.shineTimeline = null;
    }

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
          class="relative w-full aspect-[4/5] rounded-2xl sm:rounded-3xl border border-white/15 bg-neutral-900/80 backdrop-blur-md overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421] active:scale-[0.99] transition-transform duration-200 hover:scale-[1.01]"
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

          <!-- Shimmer Overlay -->
          <div
            data-avatar-shine
            aria-hidden="true"
            class="pointer-events-none absolute -inset-full w-[300%] h-[300%] opacity-0 select-none"
            style="background: linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.06) 30%, rgba(255, 255, 255, 0.30) 50%, rgba(255, 255, 255, 0.06) 70%, transparent 100%);"
          ></div>
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

    // Continuous subtle shimmer animation
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (!prefersReducedMotion) {
      const shineEl = root.querySelector<HTMLElement>('[data-avatar-shine]');
      if (shineEl) {
        this.shineTimeline = gsap.timeline({
          repeat: -1,
          repeatDelay: 3.5,
        });
        this.shineTimeline.fromTo(
          shineEl,
          { xPercent: -100, yPercent: -100, opacity: 1 },
          {
            xPercent: 100,
            yPercent: 100,
            opacity: 1,
            duration: 2.5,
            ease: 'power2.inOut',
          }
        );
      }
    }
  }

  public destroy(): void {
    if (this.shineTimeline) {
      this.shineTimeline.kill();
      this.shineTimeline = null;
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
