import type { Engine } from '@/domain/types';
import { gsap } from 'gsap';
import type { CardFaceRenderer } from './renderers/CardFaceRenderer';

export type { CardFaceRenderer };

export interface CardSummonTheme {
  primaryColor?: string; // default: '#ff4421'
  coreColor?: string;    // default: '#ffffff'
  accentColor?: string;  // default: '#ff7700'
}

export interface CardSummonStats {
  perf?: number;
  arch?: number;
  code?: number;
  [key: string]: number | undefined;
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
  atk?: number;
  def?: number;
  stats?: CardSummonStats;
}

export interface CardSummonOptions {
  theme?: CardSummonTheme;
  cardData?: CardSummonData;
  faceRenderer?: CardFaceRenderer;
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
  private flashVeilEl: HTMLElement | null = null;
  private shockwaveEl: HTMLElement | null = null;
  private cardAuraEl: HTMLElement | null = null;
  private cardEl: HTMLElement | null = null;
  private cardBackEl: HTMLElement | null = null;
  private cardFaceEl: HTMLElement | null = null;
  private closeBtnEl: HTMLButtonElement | null = null;
  private openTimeline: gsap.core.Timeline | null = null;
  private isDialogOpen: boolean = false;
  private isSettled: boolean = false;
  private options: CardSummonOptions;

  private boundOnKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private previousActiveElement: HTMLElement | null = null;
  private boundOnBackdropClick: ((e: MouseEvent) => void) | null = null;
  private boundOnCloseClick: ((e: MouseEvent) => void) | null = null;
  private boundOnPointerMove: ((e: PointerEvent) => void) | null = null;
  private boundOnPointerLeave: (() => void) | null = null;

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

    // Fullscreen optical flash veil element
    const flashVeil = document.createElement('div');
    flashVeil.setAttribute('data-summon-flash-veil', '');
    flashVeil.setAttribute('aria-hidden', 'true');
    flashVeil.className = 'pointer-events-none fixed inset-0 z-30 bg-white opacity-0 select-none';
    modal.appendChild(flashVeil);

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

    // Radial shockwave ring element
    const shockwave = document.createElement('div');
    shockwave.setAttribute('data-summon-shockwave', '');
    shockwave.setAttribute('aria-hidden', 'true');
    shockwave.className = 'pointer-events-none absolute w-[280px] h-[280px] rounded-full border-2 border-white/80 opacity-0 select-none';

    // Card element (preserve-3d container)
    const card = document.createElement('div');
    card.setAttribute('data-summon-card', '');
    card.className = 'pointer-events-auto relative w-[280px] sm:w-[320px] md:w-[340px] aspect-[5/7] rounded-3xl shadow-2xl [transform-style:preserve-3d]';
    card.style.transformStyle = 'preserve-3d';

    const sigilId = `sigil-${Math.random().toString(36).slice(2, 9)}`;

    // Double-sided 3D card faces
    const cardBack = document.createElement('div');
    cardBack.setAttribute('data-summon-card-back', '');
    cardBack.className = 'absolute inset-0 rounded-3xl overflow-hidden pointer-events-none select-none [backface-visibility:hidden]';
    cardBack.style.backfaceVisibility = 'hidden';
    cardBack.innerHTML = `
      <svg viewBox="0 0 350 490" class="w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="${sigilId}-bg" cx="50%" cy="50%" r="75%">
            <stop offset="0%" stop-color="#141419" />
            <stop offset="60%" stop-color="#0a0a0d" />
            <stop offset="100%" stop-color="#050507" />
          </radialGradient>
          <linearGradient id="${sigilId}-energy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.9" />
            <stop offset="50%" stop-color="${coreColor}" stop-opacity="1" />
            <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.8" />
          </linearGradient>
          <radialGradient id="${sigilId}-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${coreColor}" stop-opacity="0.9" />
            <stop offset="40%" stop-color="${primaryColor}" stop-opacity="0.6" />
            <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="${sigilId}-border" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${coreColor}" stop-opacity="0.6" />
            <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.4" />
            <stop offset="100%" stop-color="${coreColor}" stop-opacity="0.2" />
          </linearGradient>
        </defs>

        <!-- Obsidian Glass Surface -->
        <rect width="350" height="490" rx="24" fill="url(#${sigilId}-bg)" />

        <!-- Outer Obsidian & Metallic Frame -->
        <g data-summon-card-back-frame>
          <rect x="12" y="12" width="326" height="466" rx="16" fill="none" stroke="url(#${sigilId}-border)" stroke-width="1.5" />
          <rect x="18" y="18" width="314" height="454" rx="12" fill="none" stroke="${primaryColor}" stroke-opacity="0.25" stroke-width="1" stroke-dasharray="6 4" />
        </g>

        <!-- 4 Symmetrical Corner Filigrees -->
        <g data-summon-card-filigree transform="translate(24, 24)">
          <path d="M 0 35 L 0 10 Q 0 0 10 0 L 35 0 Q 15 5 10 10 Q 5 15 0 35 Z" fill="${primaryColor}" fill-opacity="0.4" />
          <path d="M 4 28 C 4 14 14 4 28 4 M 10 18 C 10 12 12 10 18 10" stroke="${coreColor}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8" />
          <circle cx="8" cy="8" r="2.5" fill="${primaryColor}" />
        </g>
        <g data-summon-card-filigree transform="translate(326, 24) scale(-1, 1)">
          <path d="M 0 35 L 0 10 Q 0 0 10 0 L 35 0 Q 15 5 10 10 Q 5 15 0 35 Z" fill="${primaryColor}" fill-opacity="0.4" />
          <path d="M 4 28 C 4 14 14 4 28 4 M 10 18 C 10 12 12 10 18 10" stroke="${coreColor}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8" />
          <circle cx="8" cy="8" r="2.5" fill="${primaryColor}" />
        </g>
        <g data-summon-card-filigree transform="translate(24, 466) scale(1, -1)">
          <path d="M 0 35 L 0 10 Q 0 0 10 0 L 35 0 Q 15 5 10 10 Q 5 15 0 35 Z" fill="${primaryColor}" fill-opacity="0.4" />
          <path d="M 4 28 C 4 14 14 4 28 4 M 10 18 C 10 12 12 10 18 10" stroke="${coreColor}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8" />
          <circle cx="8" cy="8" r="2.5" fill="${primaryColor}" />
        </g>
        <g data-summon-card-filigree transform="translate(326, 466) scale(-1, -1)">
          <path d="M 0 35 L 0 10 Q 0 0 10 0 L 35 0 Q 15 5 10 10 Q 5 15 0 35 Z" fill="${primaryColor}" fill-opacity="0.4" />
          <path d="M 4 28 C 4 14 14 4 28 4 M 10 18 C 10 12 12 10 18 10" stroke="${coreColor}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.8" />
          <circle cx="8" cy="8" r="2.5" fill="${primaryColor}" />
        </g>

        <!-- Concentric Halo Rings & Radiating Celestial Notches -->
        <g data-summon-card-halo transform="translate(175, 245)">
          <circle cx="0" cy="0" r="95" fill="none" stroke="${primaryColor}" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="3 6" />
          <circle cx="0" cy="0" r="82" fill="none" stroke="${coreColor}" stroke-opacity="0.5" stroke-width="1.2" />
          <circle cx="0" cy="0" r="68" fill="none" stroke="${primaryColor}" stroke-opacity="0.6" stroke-width="1" stroke-dasharray="12 4 4 4" />
          <circle cx="0" cy="0" r="52" fill="none" stroke="${coreColor}" stroke-opacity="0.4" stroke-width="1" />
          <path d="M 0 -98 L 0 -88 M 0 88 L 0 98 M -98 0 L -88 0 M 88 0 L 98 0" stroke="${coreColor}" stroke-width="1.5" stroke-linecap="round" />
          <path d="M -69 -69 L -62 -62 M 62 62 L 69 69 M 69 -69 L 62 -62 M -62 62 L -69 69" stroke="${primaryColor}" stroke-width="1.2" stroke-linecap="round" />
        </g>

        <!-- Central Glowing Ace Crest -->
        <g data-summon-card-crest transform="translate(175, 245)">
          <circle cx="0" cy="0" r="44" fill="url(#${sigilId}-glow)" />
          <polygon points="0,-42 28,0 0,42 -28,0" fill="none" stroke="url(#${sigilId}-energy)" stroke-width="1.5" />
          <polygon points="0,-32 20,0 0,32 -20,0" fill="${primaryColor}" fill-opacity="0.15" stroke="${coreColor}" stroke-width="1" />
          <path d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill="${coreColor}" fill-opacity="0.9" />
          <circle cx="0" cy="0" r="3.5" fill="${coreColor}" />
        </g>
      </svg>
    `;

    // Card Face placeholder (rotated 180deg on Y axis)
    const cardFace = document.createElement('div');
    cardFace.setAttribute('data-summon-card-face', '');
    cardFace.className = 'absolute inset-0 rounded-3xl overflow-hidden pointer-events-none select-none bg-neutral-900 border border-white/20 [backface-visibility:hidden] [transform:rotateY(180deg)]';
    cardFace.style.backfaceVisibility = 'hidden';
    cardFace.style.transform = 'rotateY(180deg)';

    card.appendChild(cardBack);
    card.appendChild(cardFace);

    cardStage.appendChild(cardAura);
    cardStage.appendChild(shockwave);
    cardStage.appendChild(card);
    modal.appendChild(cardStage);

    targetContainer.appendChild(modal);

    this.modalEl = modal;
    this.backdropEl = backdrop;
    this.flashVeilEl = flashVeil;
    this.shockwaveEl = shockwave;
    this.bottomGlowEl = bottomGlow;
    this.cardStageEl = cardStage;
    this.cardAuraEl = cardAura;
    this.cardEl = card;
    this.cardBackEl = cardBack;
    this.cardFaceEl = cardFace;
    this.closeBtnEl = closeBtn;
    this.isSettled = false;

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

    // Attach 3D parallax tilt listeners to modal
    this.boundOnPointerMove = (e: PointerEvent) => {
      if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
        return;
      }
      if (!this.isSettled) {
        if (this.openTimeline && this.openTimeline.progress() >= 1) {
          this.isSettled = true;
        } else {
          return;
        }
      }
      if (!this.cardEl || !this.modalEl) return;
      const rect = this.modalEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const maxTilt = 12;
      const targetRotY = x * (maxTilt * 2);
      const targetRotX = -y * (maxTilt * 2);
      gsap.to(this.cardEl, {
        rotationY: targetRotY,
        rotationX: targetRotX,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    modal.addEventListener('pointermove', this.boundOnPointerMove);

    this.boundOnPointerLeave = () => {
      if (!this.cardEl) return;
      gsap.to(this.cardEl, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    modal.addEventListener('pointerleave', this.boundOnPointerLeave);

    // Check prefers-reduced-motion
    const prefersReducedMotion = typeof window !== 'undefined' &&
      (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);

    // Build entrance timeline
    this.openTimeline = gsap.timeline({
      onComplete: () => {
        this.isSettled = true;
      },
    });

    if (prefersReducedMotion) {
      this.isSettled = true;
      this.openTimeline.set(this.backdropEl, { autoAlpha: 1 });
      this.openTimeline.set(this.bottomGlowEl, { xPercent: -50, yPercent: 0, opacity: 0, scaleY: 1, scaleX: 1 });
      if (this.flashVeilEl) {
        this.openTimeline.set(this.flashVeilEl, { opacity: 0 });
      }
      if (this.shockwaveEl) {
        this.openTimeline.set(this.shockwaveEl, { opacity: 0, scale: 1 });
      }
      if (this.cardAuraEl) {
        this.openTimeline.set(this.cardAuraEl, { opacity: 0, scale: 1 });
      }
      if (this.cardEl) {
        this.openTimeline.set(this.cardEl, {
          yPercent: 0,
          rotationY: 0,
          rotationX: 0,
          rotationZ: 0,
          opacity: 1,
          scale: 1,
          scaleX: 1,
          scaleY: 1,
          x: 0,
        });
      }
    } else {
      this.openTimeline.fromTo(
        this.backdropEl,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.25, ease: 'power2.out' },
        0
      );

      // Bottom curved hill glow: initial emergence (0s to 0.25s)
      this.openTimeline.fromTo(
        this.bottomGlowEl,
        { xPercent: -50, yPercent: 100, opacity: 0, scaleY: 0, scaleX: 1, transformOrigin: 'bottom center' },
        { xPercent: -50, yPercent: 0, opacity: 1, scaleY: 1, scaleX: 1, duration: 0.25, ease: 'power3.out' },
        0
      );

      // Inhale squash on bottom glow (0.25s to 0.35s)
      this.openTimeline.to(
        this.bottomGlowEl,
        { scaleY: 0.70, scaleX: 1.15, duration: 0.10, ease: 'power1.in' },
        0.25
      );

      // Bottom glow recedes downward & fades (0.35s to 0.95s)
      this.openTimeline.to(
        this.bottomGlowEl,
        { opacity: 0, scaleY: 0.2, scaleX: 1.0, duration: 0.60, ease: 'power2.inOut' },
        0.35
      );

      if (this.cardEl) {
        // Card ascent (0.35s to 1.10s, duration 0.75s)
        this.openTimeline.fromTo(
          this.cardEl,
          {
            yPercent: 120,
            rotationY: -1080,
            rotationX: 0,
            rotationZ: 12,
            opacity: 0,
            scale: 0.55,
            scaleX: 1,
            scaleY: 1,
            x: 0,
          },
          {
            yPercent: -3,
            rotationY: 0,
            rotationZ: 0,
            opacity: 1,
            scale: 1.020,
            duration: 0.75,
            ease: 'power3.out',
          },
          0.35
        );

        // Pre-fermata 20Hz vibration (0.75s to 1.10s)
        this.openTimeline.to(
          this.cardEl,
          {
            x: 2.5,
            duration: 0.025,
            repeat: 13,
            yoyo: true,
            ease: 'sine.inOut',
          },
          0.75
        );

        // The 150ms Fermata Freeze (1.10s to 1.25s)
        this.openTimeline.set(this.cardEl, { x: 0 }, 1.10);
        this.openTimeline.to(
          this.cardEl,
          {
            scale: 1.025,
            duration: 0.15,
            ease: 'none',
          },
          1.10
        );

        // Card graceful descent to center (1.45s to 1.95s, duration 0.50s)
        this.openTimeline.to(
          this.cardEl,
          {
            yPercent: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1.0,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 0.50,
            ease: 'power2.out',
          },
          1.45
        );
      }

      // Aura swell and dissipation
      if (this.cardAuraEl) {
        this.openTimeline.set(
          this.cardAuraEl,
          {
            opacity: 0,
            scale: 0.8,
          },
          0
        );

        // Aura swell (0.70s to 1.10s)
        this.openTimeline.fromTo(
          this.cardAuraEl,
          { opacity: 0, scale: 0.8 },
          { opacity: 0.95, scale: 1.15, duration: 0.40, ease: 'power2.out' },
          0.70
        );

        // Aura soft dissipation during graceful descent (1.45s to 1.95s)
        this.openTimeline.to(
          this.cardAuraEl,
          {
            opacity: 0,
            scale: 1.25,
            duration: 0.50,
            ease: 'power2.out',
          },
          1.45
        );
      }

      // Climax optical flash veil & shockwave (1.25s)
      if (this.flashVeilEl) {
        this.openTimeline.to(
          this.flashVeilEl,
          { opacity: 0.95, duration: 0.03, ease: 'power2.out' },
          1.25
        );
        this.openTimeline.to(
          this.flashVeilEl,
          { opacity: 0, duration: 0.17, ease: 'power2.out' },
          1.28
        );
      }

      if (this.shockwaveEl) {
        this.openTimeline.fromTo(
          this.shockwaveEl,
          { scale: 0.2, opacity: 1 },
          { scale: 2.8, opacity: 0, duration: 0.22, ease: 'power4.out' },
          1.25
        );
      }

      // Pad timeline total duration to 2.0s
      this.openTimeline.set({}, {}, 2.0);
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
    if (this.modalEl && this.boundOnPointerMove) {
      this.modalEl.removeEventListener('pointermove', this.boundOnPointerMove);
      this.boundOnPointerMove = null;
    }
    if (this.modalEl && this.boundOnPointerLeave) {
      this.modalEl.removeEventListener('pointerleave', this.boundOnPointerLeave);
      this.boundOnPointerLeave = null;
    }
    this.isSettled = false;
    if (this.openTimeline) {
      this.openTimeline.kill();
      this.openTimeline = null;
    }
    if (this.flashVeilEl) {
      this.flashVeilEl.remove();
      this.flashVeilEl = null;
    }
    if (this.shockwaveEl) {
      this.shockwaveEl.remove();
      this.shockwaveEl = null;
    }
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
    if (this.cardAuraEl) {
      this.cardAuraEl.remove();
      this.cardAuraEl = null;
    }
    if (this.cardBackEl) {
      this.cardBackEl.remove();
      this.cardBackEl = null;
    }
    if (this.cardFaceEl) {
      this.cardFaceEl.remove();
      this.cardFaceEl = null;
    }
    if (this.cardEl) {
      gsap.killTweensOf(this.cardEl);
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
