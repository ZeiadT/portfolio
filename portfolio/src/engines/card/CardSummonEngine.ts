import type { Engine } from '@/domain/types';
import { gsap } from 'gsap';

export interface CardSummonTheme {
  primaryColor?: string; // default: '#ff4421'
  coreColor?: string;    // default: '#ffffff'
  accentColor?: string;  // default: '#ff7700'
}

export interface CardSummonData {
  name: string;
  rarity: string;
  stars: number;
  role: string;
  imageSrc: string;
  imageAlt: string;
  skillName: string;
  skillDescription: string;
  atk: number;
  def: number;
}

export interface CardSummonOptions {
  theme?: CardSummonTheme;
  cardData?: CardSummonData;
  onClose?: () => void;
}

/**
 * CardSummonEngine
 *
 * Cinematic card summoning modal dialog orchestrator.
 * Phase 1 implements:
 * - Fullscreen fixed dialog modal with accessibility attributes
 * - Dimmed backdrop with blur
 * - Fast-emerging bottom curved hill energy glow powered by GSAP
 * - Swappable vermilion/core theme colors
 * - Accessible ESC key, backdrop, and close button dismissal
 * - Clean teardown conforming to Engine lifecycle
 */
export class CardSummonEngine implements Engine {
  public readonly id = 'card-summon';

  private container: HTMLElement | null = null;
  private modalEl: HTMLElement | null = null;
  private backdropEl: HTMLElement | null = null;
  private bottomGlowEl: HTMLElement | null = null;
  private cardStageEl: HTMLElement | null = null;
  private cardAuraEl: HTMLElement | null = null;
  private cardEl: HTMLElement | null = null;
  private closeBtnEl: HTMLButtonElement | null = null;
  private openTimeline: gsap.core.Timeline | null = null;
  private isDialogOpen: boolean = false;
  private options: CardSummonOptions;

  private boundOnKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private previousActiveElement: HTMLElement | null = null;
  private boundOnBackdropClick: ((e: MouseEvent) => void) | null = null;
  private boundOnCloseClick: ((e: MouseEvent) => void) | null = null;

  constructor(options: CardSummonOptions = {}) {
    this.options = options;
  }

  /**
   * Mounts the engine to a specific parent DOM element.
   * If omitted, modal attaches to document.body on open().
   */
  public mount(container: HTMLElement): void {
    this.container = container;
  }

  /**
   * Returns whether the summon modal is currently open.
   */
  public isOpen(): boolean {
    return this.isDialogOpen;
  }

  /**
   * Returns the active GSAP opening timeline, if any.
   */
  public getTimeline(): gsap.core.Timeline | null {
    return this.openTimeline;
  }

  /**
   * Opens the summon modal and plays the entrance animation.
   */
  public open(): void {
    if (this.isDialogOpen) {
      return;
    }

    const targetContainer = this.container ?? (typeof document !== 'undefined' ? document.body : null);
    if (!targetContainer) {
      return;
    }

    this.isDialogOpen = true;
    if (typeof document !== 'undefined') {
      this.previousActiveElement = document.activeElement as HTMLElement | null;
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    }

    // Resolve theme colors
    const primaryColor = this.options.theme?.primaryColor ?? '#ff4421';
    const coreColor = this.options.theme?.coreColor ?? '#ffffff';
    const gradientId = `summon-glow-${Math.random().toString(36).slice(2, 9)}`;

    // Create modal dialog container
    const modal = document.createElement('div');
    modal.setAttribute('data-card-summon-modal', '');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Card Summon');
    modal.className = 'fixed inset-0 z-[100] flex items-center justify-center overflow-hidden';

    // Backdrop element
    const backdrop = document.createElement('div');
    backdrop.setAttribute('data-summon-backdrop', '');
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.className = 'absolute inset-0 bg-black/85 backdrop-blur-xl';
    modal.appendChild(backdrop);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.setAttribute('type', 'button');
    closeBtn.setAttribute('data-summon-close', '');
    closeBtn.setAttribute('aria-label', 'Close summon dialog');
    closeBtn.className = 'absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white';
    closeBtn.innerHTML = `
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    modal.appendChild(closeBtn);

    // Bottom curved hill glow element
    const bottomGlow = document.createElement('div');
    bottomGlow.setAttribute('data-summon-bottom-glow', '');
    bottomGlow.setAttribute('aria-hidden', 'true');
    bottomGlow.className = 'pointer-events-none absolute bottom-0 left-1/2 flex flex-col items-center justify-end w-[640px] max-w-[100vw] h-[220px] overflow-hidden select-none';
    bottomGlow.innerHTML = `
      <svg viewBox="0 0 600 200" class="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="${gradientId}-core" cx="50%" cy="100%" r="50%">
            <stop offset="0%" stop-color="${coreColor}" stop-opacity="0.95" />
            <stop offset="35%" stop-color="${primaryColor}" stop-opacity="0.75" />
            <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="${gradientId}-ambient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.5" />
            <stop offset="60%" stop-color="${primaryColor}" stop-opacity="0.15" />
            <stop offset="100%" stop-color="${coreColor}" stop-opacity="0" />
          </linearGradient>
          <filter id="${gradientId}-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="10" result="blur" />
          </filter>
        </defs>
        <path d="M 0 200 Q 300 -20 600 200 Z" fill="url(#${gradientId}-ambient)" filter="url(#${gradientId}-blur)" />
        <path d="M 60 200 Q 300 20 540 200 Z" fill="url(#${gradientId}-core)" />
      </svg>
    `;
    modal.appendChild(bottomGlow);

    // Card stage (3D perspective container)
    const cardStage = document.createElement('div');
    cardStage.setAttribute('data-summon-card-stage', '');
    cardStage.className = 'absolute inset-0 flex items-center justify-center pointer-events-none [perspective:1200px]';
    cardStage.style.perspective = '1200px';

    // Card aura glow element
    const cardAura = document.createElement('div');
    cardAura.setAttribute('data-summon-card-aura', '');
    cardAura.setAttribute('aria-hidden', 'true');
    cardAura.className = 'pointer-events-none absolute w-[280px] sm:w-[320px] md:w-[340px] aspect-[5/7] rounded-3xl blur-xl';
    cardAura.style.opacity = '0';
    cardAura.style.background = `radial-gradient(circle at center, ${coreColor} 0%, ${primaryColor} 60%, transparent 100%)`;
    cardAura.style.boxShadow = `0 0 50px 10px ${primaryColor}80, 0 0 100px 30px ${primaryColor}40`;

    // Card element (preserve-3d container)
    const card = document.createElement('div');
    card.setAttribute('data-summon-card', '');
    card.className = 'pointer-events-auto relative w-[280px] sm:w-[320px] md:w-[340px] aspect-[5/7] rounded-3xl bg-neutral-900 border border-white/20 shadow-2xl overflow-hidden [transform-style:preserve-3d]';
    card.style.transformStyle = 'preserve-3d';

    cardStage.appendChild(cardAura);
    cardStage.appendChild(card);
    modal.appendChild(cardStage);

    targetContainer.appendChild(modal);

    this.modalEl = modal;
    this.backdropEl = backdrop;
    this.bottomGlowEl = bottomGlow;
    this.cardStageEl = cardStage;
    this.cardAuraEl = cardAura;
    this.cardEl = card;
    this.closeBtnEl = closeBtn;

    // Attach listeners
    this.boundOnBackdropClick = () => {
      this.close();
    };
    backdrop.addEventListener('click', this.boundOnBackdropClick);

    this.boundOnCloseClick = () => {
      this.close();
    };
    closeBtn.addEventListener('click', this.boundOnCloseClick);

    this.boundOnKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      }
    };
    window.addEventListener('keydown', this.boundOnKeyDown);

    // Check prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);

    // Build entrance timeline
    this.openTimeline = gsap.timeline();

    if (prefersReducedMotion) {
      this.openTimeline.set(this.backdropEl, { autoAlpha: 1 });
      this.openTimeline.set(this.bottomGlowEl, { xPercent: -50, yPercent: 0, opacity: 1, scaleY: 1 });
      if (this.cardAuraEl) {
        this.openTimeline.set(this.cardAuraEl, { opacity: 0, scale: 1 });
      }
      if (this.cardEl) {
        this.openTimeline.set(this.cardEl, {
          yPercent: 0,
          rotationY: 0,
          rotationZ: 0,
          opacity: 1,
          scale: 1,
        });
      }
    } else {
      this.openTimeline.fromTo(
        this.backdropEl,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: 'power2.out' },
        0
      );
      this.openTimeline.fromTo(
        this.bottomGlowEl,
        { xPercent: -50, yPercent: 100, opacity: 0, scaleY: 0, transformOrigin: 'bottom center' },
        { xPercent: -50, yPercent: 0, opacity: 1, scaleY: 1, duration: 0.4, ease: 'power3.out' },
        0
      );
      if (this.cardAuraEl) {
        this.openTimeline.fromTo(
          this.cardAuraEl,
          {
            opacity: 0,
            scale: 0.8,
          },
          {
            opacity: 0.85,
            scale: 1.12,
            duration: 0.3,
            ease: 'power2.out',
          },
          0.7
        );
        this.openTimeline.to(
          this.cardAuraEl,
          {
            opacity: 0.1,
            scale: 1.0,
            duration: 0.25,
            ease: 'power2.inOut',
          },
          1.0
        );
      }
      if (this.cardEl) {
        this.openTimeline.fromTo(
          this.cardEl,
          {
            yPercent: 120,
            rotationY: -1080,
            rotationZ: 12,
            opacity: 0,
            scale: 0.6,
          },
          {
            yPercent: -4,
            rotationY: -25,
            rotationZ: 2,
            opacity: 1,
            scale: 1.03,
            duration: 0.9,
            ease: 'power2.out',
          },
          0.1
        );
        this.openTimeline.to(
          this.cardEl,
          {
            yPercent: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1,
            duration: 0.25,
            ease: 'power3.inOut',
          },
          1.0
        );
      }
    }

    // Set accessible focus to close button
    this.closeBtnEl?.focus();
  }

  /**
   * Closes the modal, tears down DOM and listeners, and fires onClose callback.
   */
  public close(): void {
    if (!this.isDialogOpen) {
      return;
    }
    this.isDialogOpen = false;

    this.cleanupDomAndListeners();
    this.options.onClose?.();
  }

  /**
   * Destroys the engine completely.
   */
  public destroy(): void {
    this.close();
    if (this.openTimeline) {
      this.openTimeline.kill();
      this.openTimeline = null;
    }
    this.container = null;
  }

  private cleanupDomAndListeners(): void {
    if (this.boundOnKeyDown) {
      window.removeEventListener('keydown', this.boundOnKeyDown);
      this.boundOnKeyDown = null;
    }
    if (this.backdropEl && this.boundOnBackdropClick) {
      this.backdropEl.removeEventListener('click', this.boundOnBackdropClick);
      this.boundOnBackdropClick = null;
    }
    if (this.closeBtnEl && this.boundOnCloseClick) {
      this.closeBtnEl.removeEventListener('click', this.boundOnCloseClick);
      this.boundOnCloseClick = null;
    }
    if (this.openTimeline) {
      this.openTimeline.kill();
      this.openTimeline = null;
    }
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    if (this.cardAuraEl) {
      this.cardAuraEl.remove();
      this.cardAuraEl = null;
    }
    if (this.cardEl) {
      this.cardEl.remove();
      this.cardEl = null;
    }
    if (this.cardStageEl) {
      this.cardStageEl.remove();
      this.cardStageEl = null;
    }
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
    }
    this.previousActiveElement?.focus();
    this.previousActiveElement = null;
    this.backdropEl = null;
    this.bottomGlowEl = null;
    this.closeBtnEl = null;
  }
}
