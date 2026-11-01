import { gsap } from 'gsap';

export interface BentoElements {
  heroLeft: HTMLElement;
  heroRight: HTMLElement;
  education: HTMLElement;
  globe: HTMLElement;
  summary: HTMLElement;
}

export interface BentoRevealOptions {
  reducedMotion?: boolean;
}

export const BENTO_REVEAL_TIMINGS = {
  stagger: 0.08,
  cardDuration: 0.55,
  reducedMotionDuration: 0.4,
  initialY: 24,
  initialScale: 0.96,
  initialBlur: 12,
} as const;

export const BENTO_REVEAL_EASES = {
  transform: 'back.out(1.1)',
  fade: 'power2.out',
} as const;

/**
 * BentoRevealController
 *
 * Encapsulates the Reverse-Sink reveal animation for the Bento Grid cards:
 * Surfacing 5 cards out of deep spatial perspective (y: 24px, scale: 0.96, filter: blur(12px), opacity: 0)
 * along an Identity-First storytelling hierarchy:
 *   1. Hero Right (Avatar & Identity) (t = 0.00s)
 *   2. Hero Left (Quote/Contact) (t = 0.08s)
 *   3. Globe (WebGL Dot Globe) (t = 0.16s)
 *   4. Education (Milestones & Credentials) (t = 0.24s)
 *   5. Summary (Editorial narrative) (t = 0.32s)
 *
 * Physics & Performance:
 * - Transforms animate to resting scale (1.0) and y (0) with a micro-spring cushion: back.out(1.1) (550ms).
 * - Opacity (1) and filter (blur(0px)) animate via power2.out (550ms).
 * - Hardware acceleration hints (willChange: 'transform, opacity, filter') and blur filters are
 *   automatically cleared via clearProps upon landing for crisp typography and 60/120fps lock.
 *
 * Accessibility:
 * - When reducedMotion is active, transforms and blurs are bypassed in favor of a soft opacity cross-fade.
 */
export class BentoRevealController {
  private rootContainer: HTMLElement;
  private cachedElements: BentoElements | null = null;
  private currentTimeline: gsap.core.Timeline | null = null;

  constructor(rootContainer: HTMLElement) {
    this.rootContainer = rootContainer;
  }

  /**
   * Queries and caches the 5 Bento grid cards by data attributes.
   * Returns null if any card is not present in the DOM container.
   */
  public queryElements(): BentoElements | null {
    if (this.cachedElements) {
      return this.cachedElements;
    }

    const heroLeft = this.rootContainer.querySelector<HTMLElement>('[data-bento-hero-left]');
    const heroRight = this.rootContainer.querySelector<HTMLElement>('[data-bento-hero-right]');
    const education = this.rootContainer.querySelector<HTMLElement>('[data-bento-education]');
    const globe = this.rootContainer.querySelector<HTMLElement>('[data-bento-globe]');
    const summary = this.rootContainer.querySelector<HTMLElement>('[data-bento-summary]');

    if (!heroLeft || !heroRight || !education || !globe || !summary) {
      return null;
    }

    this.cachedElements = {
      heroLeft,
      heroRight,
      education,
      globe,
      summary,
    };

    return this.cachedElements;
  }

  /**
   * Prepares the initial reverse-sink hidden state for all 5 cards without causing layout shifts.
   * Sets opacity: 0, y: 24px, scale: 0.96, and filter: blur(12px).
   */
  public prepareInitialState(): void {
    const elements = this.queryElements();
    if (!elements) {
      return;
    }

    const allCards = [
      elements.heroRight,
      elements.heroLeft,
      elements.globe,
      elements.education,
      elements.summary,
    ];

    // Hardware accelerated will-change hint
    allCards.forEach((card) => {
      card.style.willChange = 'transform, opacity, filter';
    });

    gsap.set(allCards, {
      opacity: 0,
      y: BENTO_REVEAL_TIMINGS.initialY,
      scale: BENTO_REVEAL_TIMINGS.initialScale,
      filter: `blur(${BENTO_REVEAL_TIMINGS.initialBlur}px)`,
      force3D: true,
    });
  }

  /**
   * Creates and returns the orchestrated GSAP reverse-sink reveal timeline.
   */
  public createRevealTimeline(options?: BentoRevealOptions): gsap.core.Timeline {
    if (this.currentTimeline) {
      this.currentTimeline.kill();
      this.currentTimeline = null;
    }

    const tl = gsap.timeline();
    this.currentTimeline = tl;

    const elements = this.queryElements();
    if (!elements) {
      return tl;
    }

    const allCards = [
      elements.heroRight,
      elements.heroLeft,
      elements.globe,
      elements.education,
      elements.summary,
    ];

    // Accessibility fallback: simple opacity cross-fade without physical transforms/blurs
    const isReducedMotion =
      options?.reducedMotion ??
      (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true);

    if (isReducedMotion) {
      gsap.set(allCards, {
        y: 0,
        scale: 1,
        filter: 'none',
        opacity: 0,
        clearProps: 'transform,filter',
      });

      tl.to(
        allCards,
        {
          opacity: 1,
          duration: BENTO_REVEAL_TIMINGS.reducedMotionDuration,
          ease: 'power1.out',
        },
        0
      );

      tl.set(
        allCards,
        {
          clearProps: 'willChange',
        },
        BENTO_REVEAL_TIMINGS.reducedMotionDuration
      );

      return tl;
    }

    // Identity-First ordered sequence
    const orderedCards = [
      elements.heroRight,
      elements.heroLeft,
      elements.globe,
      elements.education,
      elements.summary,
    ];

    orderedCards.forEach((card, index) => {
      const startTime = index * BENTO_REVEAL_TIMINGS.stagger;

      // Transform tween: y: 0, scale: 1
      tl.to(
        card,
        {
          y: 0,
          scale: 1,
          duration: BENTO_REVEAL_TIMINGS.cardDuration,
          ease: BENTO_REVEAL_EASES.transform,
        },
        startTime
      );

      // Visual tween: opacity: 1, filter: blur(0px)
      tl.to(
        card,
        {
          opacity: 1,
          filter: 'blur(0px)',
          duration: BENTO_REVEAL_TIMINGS.cardDuration,
          ease: BENTO_REVEAL_EASES.fade,
        },
        startTime
      );
    });

    const totalDuration =
      (orderedCards.length - 1) * BENTO_REVEAL_TIMINGS.stagger +
      BENTO_REVEAL_TIMINGS.cardDuration;

    tl.set(
      allCards,
      {
        clearProps: 'filter,willChange',
      },
      totalDuration
    );

    return tl;
  }

  /**
   * Cleans up all active tweens, clears inline styles/transforms, and releases references.
   */
  public destroy(): void {
    if (this.currentTimeline) {
      this.currentTimeline.kill();
      this.currentTimeline = null;
    }

    if (this.cachedElements) {
      const cards = [
        this.cachedElements.heroRight,
        this.cachedElements.heroLeft,
        this.cachedElements.globe,
        this.cachedElements.education,
        this.cachedElements.summary,
      ];

      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: 'all' });

      cards.forEach((card) => {
        card.style.willChange = '';
        card.style.transform = '';
        card.style.opacity = '';
        card.style.filter = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
      });

      this.cachedElements = null;
    }
  }
}
