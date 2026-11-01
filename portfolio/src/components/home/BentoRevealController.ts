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
  wireframeStart: 0,
  wireframeDuration: 0.35,
  educationDropStart: 0.35,
  globeDropStart: 0.43,
  summaryDropStart: 0.51,
  heroLeftDropStart: 0.63,
  heroRightDropStart: 0.71,
  dropDuration: 0.38,
  heroDropDuration: 0.42,
  flashDuration: 0.08,
  reducedMotionDuration: 0.4,
} as const;

export const BENTO_REVEAL_STYLES = {
  restingBoxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
  impactBoxShadow: '0 0 16px rgba(255, 68, 33, 0.4)',
  wireframeBorderColor: 'rgba(255, 255, 255, 0.2)',
  restingBorderColor: 'rgba(255, 255, 255, 0.1)',
} as const;

/**
 * BentoRevealController
 *
 * Encapsulates the 2-step Tetris puzzle entrance reveal for the Bento Grid cards:
 * - Step 1 (t = 0..0.35s): Ghost wireframe outlines trace in with glowing vermilion/white borders.
 * - Step 2 (t = 0.35s+): Foundation-up Tetris cascade drops each card into place:
 *   1. Education (bottom left 3 cols): y: -32px -> 0, back.out(1.4)
 *   2. Globe (bottom middle 3 cols): y: -32px -> 0, scale: 0.94 -> 1.0, back.out(1.4) (stagger +80ms)
 *   3. Summary (bottom right 6 cols): y: -32px -> 0, back.out(1.4) (stagger +80ms)
 *   4. Hero Left (top left 7 cols): y: -40px -> 0, back.out(1.3) (starts at t = 0.63s)
 *   5. Hero Right (top right 5 cols): y: -40px -> 0, rotationX: -6deg -> 0deg, back.out(1.3) (stagger +80ms)
 *
 * Impact Feedback:
 * - On arrival, cards pulse a vermilion hairline box-shadow for 80ms before settling to resting glass shadow.
 *
 * Accessibility:
 * - When reducedMotion is active, transforms are bypassed in favor of a soft opacity cross-fade.
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
   * Prepares the initial hidden state for all 5 cards without causing layout shifts.
   * Sets opacity: 0, negative translateY, initial scale and 3D tilt.
   */
  public prepareInitialState(): void {
    const elements = this.queryElements();
    if (!elements) {
      return;
    }

    const bottomCards = [elements.education, elements.globe, elements.summary];
    const topCards = [elements.heroLeft, elements.heroRight];
    const allCards = [...bottomCards, ...topCards];

    // Hardware accelerated will-change hint
    allCards.forEach((card) => {
      card.style.willChange = 'transform, opacity';
    });

    // Bottom foundation cards (Education, Globe, Summary)
    gsap.set(elements.education, {
      opacity: 0,
      y: -32,
      force3D: true,
    });

    gsap.set(elements.globe, {
      opacity: 0,
      y: -32,
      scale: 0.94,
      force3D: true,
    });

    gsap.set(elements.summary, {
      opacity: 0,
      y: -32,
      force3D: true,
    });

    // Top hero row cards (Hero Left, Hero Right)
    gsap.set(elements.heroLeft, {
      opacity: 0,
      y: -40,
      force3D: true,
    });

    gsap.set(elements.heroRight, {
      opacity: 0,
      y: -40,
      rotationX: -6,
      transformPerspective: 1000,
      force3D: true,
    });
  }

  /**
   * Creates and returns the orchestrated GSAP reveal timeline.
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
      elements.education,
      elements.globe,
      elements.summary,
      elements.heroLeft,
      elements.heroRight,
    ];

    // Accessibility fallback: simple opacity cross-fade without physical drop/tilt
    const isReducedMotion =
      options?.reducedMotion ??
      (typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true);

    if (isReducedMotion) {
      gsap.set(allCards, {
        y: 0,
        scale: 1,
        rotationX: 0,
        opacity: 0,
        clearProps: 'transform',
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

    // Step 1: Wireframe outline trace-in at t = 0 (350ms duration)
    tl.to(
      allCards,
      {
        opacity: 0.25,
        borderColor: BENTO_REVEAL_STYLES.wireframeBorderColor,
        boxShadow: '0 0 12px rgba(255, 68, 33, 0.15)',
        duration: BENTO_REVEAL_TIMINGS.wireframeDuration,
        ease: 'power2.out',
      },
      BENTO_REVEAL_TIMINGS.wireframeStart
    );

    // Step 2: Foundation-up Tetris drop cascade starting at t = 0.35s
    // 1. Education (bottom left 3 cols): y: -32px -> 0, back.out(1.4)
    tl.to(
      elements.education,
      {
        y: 0,
        opacity: 1,
        duration: BENTO_REVEAL_TIMINGS.dropDuration,
        ease: 'back.out(1.4)',
      },
      BENTO_REVEAL_TIMINGS.educationDropStart
    );
    tl.fromTo(
      elements.education,
      { boxShadow: BENTO_REVEAL_STYLES.impactBoxShadow },
      {
        boxShadow: BENTO_REVEAL_STYLES.restingBoxShadow,
        borderColor: BENTO_REVEAL_STYLES.restingBorderColor,
        duration: BENTO_REVEAL_TIMINGS.flashDuration,
        ease: 'power2.out',
      },
      BENTO_REVEAL_TIMINGS.educationDropStart + BENTO_REVEAL_TIMINGS.dropDuration
    );

    // 2. Globe (bottom middle 3 cols): y: -32px -> 0, scale: 0.94 -> 1.0, back.out(1.4) (stagger +80ms)
    tl.to(
      elements.globe,
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: BENTO_REVEAL_TIMINGS.dropDuration,
        ease: 'back.out(1.4)',
      },
      BENTO_REVEAL_TIMINGS.globeDropStart
    );
    tl.fromTo(
      elements.globe,
      { boxShadow: BENTO_REVEAL_STYLES.impactBoxShadow },
      {
        boxShadow: BENTO_REVEAL_STYLES.restingBoxShadow,
        borderColor: BENTO_REVEAL_STYLES.restingBorderColor,
        duration: BENTO_REVEAL_TIMINGS.flashDuration,
        ease: 'power2.out',
      },
      BENTO_REVEAL_TIMINGS.globeDropStart + BENTO_REVEAL_TIMINGS.dropDuration
    );

    // 3. Summary (bottom right 6 cols): y: -32px -> 0, back.out(1.4) (stagger +80ms)
    tl.to(
      elements.summary,
      {
        y: 0,
        opacity: 1,
        duration: BENTO_REVEAL_TIMINGS.dropDuration,
        ease: 'back.out(1.4)',
      },
      BENTO_REVEAL_TIMINGS.summaryDropStart
    );
    tl.fromTo(
      elements.summary,
      { boxShadow: BENTO_REVEAL_STYLES.impactBoxShadow },
      {
        boxShadow: BENTO_REVEAL_STYLES.restingBoxShadow,
        borderColor: BENTO_REVEAL_STYLES.restingBorderColor,
        duration: BENTO_REVEAL_TIMINGS.flashDuration,
        ease: 'power2.out',
      },
      BENTO_REVEAL_TIMINGS.summaryDropStart + BENTO_REVEAL_TIMINGS.dropDuration
    );

    // 4. Hero Left (top left 7 cols): y: -40px -> 0, back.out(1.3) (starts at t = 0.63s)
    tl.to(
      elements.heroLeft,
      {
        y: 0,
        opacity: 1,
        duration: BENTO_REVEAL_TIMINGS.heroDropDuration,
        ease: 'back.out(1.3)',
      },
      BENTO_REVEAL_TIMINGS.heroLeftDropStart
    );
    tl.fromTo(
      elements.heroLeft,
      { boxShadow: BENTO_REVEAL_STYLES.impactBoxShadow },
      {
        boxShadow: BENTO_REVEAL_STYLES.restingBoxShadow,
        borderColor: BENTO_REVEAL_STYLES.restingBorderColor,
        duration: BENTO_REVEAL_TIMINGS.flashDuration,
        ease: 'power2.out',
      },
      BENTO_REVEAL_TIMINGS.heroLeftDropStart + BENTO_REVEAL_TIMINGS.heroDropDuration
    );

    // 5. Hero Right (top right 5 cols): y: -40px -> 0, rotationX: -6deg -> 0deg, back.out(1.3) (stagger +80ms)
    tl.to(
      elements.heroRight,
      {
        y: 0,
        rotationX: 0,
        opacity: 1,
        duration: BENTO_REVEAL_TIMINGS.heroDropDuration,
        ease: 'back.out(1.3)',
      },
      BENTO_REVEAL_TIMINGS.heroRightDropStart
    );
    tl.fromTo(
      elements.heroRight,
      { boxShadow: BENTO_REVEAL_STYLES.impactBoxShadow },
      {
        boxShadow: BENTO_REVEAL_STYLES.restingBoxShadow,
        borderColor: BENTO_REVEAL_STYLES.restingBorderColor,
        duration: BENTO_REVEAL_TIMINGS.flashDuration,
        ease: 'power2.out',
      },
      BENTO_REVEAL_TIMINGS.heroRightDropStart + BENTO_REVEAL_TIMINGS.heroDropDuration
    );

    // Release willChange GPU layer allocation when sequence finishes
    const totalDuration =
      BENTO_REVEAL_TIMINGS.heroRightDropStart +
      BENTO_REVEAL_TIMINGS.heroDropDuration +
      BENTO_REVEAL_TIMINGS.flashDuration;

    tl.set(
      allCards,
      {
        clearProps: 'willChange',
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
        this.cachedElements.education,
        this.cachedElements.globe,
        this.cachedElements.summary,
        this.cachedElements.heroLeft,
        this.cachedElements.heroRight,
      ];

      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: 'all' });

      cards.forEach((card) => {
        card.style.willChange = '';
        card.style.transform = '';
        card.style.opacity = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
      });

      this.cachedElements = null;
    }
  }
}
