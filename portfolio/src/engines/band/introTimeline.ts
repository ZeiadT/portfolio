import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { CUSTOM_EASES, INTRO_TIMINGS } from './constants';

let isEasesRegistered = false;

/**
 * Registers authentic Boc.Studio and elastic cubic-bezier eases into GSAP once.
 */
export function registerCustomEases(): void {
  if (isEasesRegistered) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create(CUSTOM_EASES.bocLetters.name, CUSTOM_EASES.bocLetters.path);
  CustomEase.create(CUSTOM_EASES.bocOvershoot.name, CUSTOM_EASES.bocOvershoot.path);
  CustomEase.create(CUSTOM_EASES.elasticCollapse.name, CUSTOM_EASES.elasticCollapse.path);
  isEasesRegistered = true;
}

export interface IntroTimelineOptions {
  curtain: HTMLElement;
  wrapper: HTMLElement;
  chars: HTMLElement[] | NodeListOf<HTMLElement>;
  satellites?: HTMLElement[] | NodeListOf<HTMLElement>;
  background?: HTMLElement | null;
  heroHeader?: HTMLElement | null;
  initialScale: number;
  onZoomComplete?: () => void;
  onCollapseStart?: () => void;
  onMarqueeReady?: () => void;
}

/**
 * Builds the complete Step 2 choreographed intro timeline:
 * 1. Initial scale setup
 * 2. Letter stagger reveal (bocLetters)
 * 3. Hold pause
 * 4. Energetic overshoot zoom down to scale 1.0 (bocOvershoot)
 * 5. Settle hold
 * 6. Elastic curtain collapse to band height (elasticCollapse) + background reveal
 * 7. Satellite badges stagger in & marquee activation
 */
export function buildIntroTimeline(options: IntroTimelineOptions): gsap.core.Timeline {
  registerCustomEases();

  const {
    curtain,
    wrapper,
    chars,
    satellites,
    background,
    initialScale,
    onZoomComplete,
    onCollapseStart,
    onMarqueeReady,
  } = options;

  // Initialize starting positions
  gsap.set(curtain, { height: '100vh' });

  // Protective physical minimum height floor preventing the curtain from ever shrinking below the logo/band
  const barEl = typeof document !== 'undefined' ? document.getElementById('brand-bar') : null;
  curtain.style.minHeight =
    barEl && barEl.getBoundingClientRect().height > 0
      ? `${barEl.getBoundingClientRect().height}px`
      : 'clamp(3.25rem, 2.75rem + 1.2vw, 3.897rem)';

  gsap.set(wrapper, {
    scale: initialScale,
    transformOrigin: '50% 50%',
    force3D: true,
  });

  gsap.set(chars, {
    opacity: 0,
    y: 16,
    force3D: true,
  });

  if (satellites && satellites.length) {
    gsap.set(satellites, { opacity: 0, y: 6 });
  }

  if (background) {
    gsap.set(background, { opacity: 0 });
  }

  const header =
    options.heroHeader !== undefined
      ? options.heroHeader
      : typeof document !== 'undefined'
      ? document.getElementById('hero-header')
      : null;

  if (header) {
    gsap.set(header, { opacity: 0, y: 16 });
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
  });

  // 1. Initial Hold before start
  tl.to({}, { duration: INTRO_TIMINGS.holdBeforeStart });

  // 2. Letters stagger into view
  tl.to(chars, {
    opacity: 1,
    y: 0,
    stagger: INTRO_TIMINGS.letterStagger,
    duration: INTRO_TIMINGS.letterDuration,
    ease: CUSTOM_EASES.bocLetters.name,
  });

  // 3. Hold after letters appear
  tl.to({}, { duration: INTRO_TIMINGS.holdAfterLetters });

  // 4. Energetic overshoot zoom down
  tl.to(wrapper, {
    scale: 1.0,
    duration: INTRO_TIMINGS.shrinkDuration,
    ease: CUSTOM_EASES.bocOvershoot.name,
    onComplete: onZoomComplete,
  });

  // 5. Settle hold
  tl.to({}, { duration: INTRO_TIMINGS.settleHold });

  // 6. Elastic Curtain Collapse into Horizontal Band
  tl.to(curtain, {
    height: () => {
      const bar = document.getElementById('brand-bar');
      return bar && bar.getBoundingClientRect().height > 0
        ? `${bar.getBoundingClientRect().height}px`
        : 'clamp(3.25rem, 2.75rem + 1.2vw, 3.897rem)';
    },
    duration: INTRO_TIMINGS.barShrinkDuration,
    ease: CUSTOM_EASES.elasticCollapse.name,
    onStart: () => {
      onCollapseStart?.();
      if (background) {
        gsap.to(background, { opacity: 1, duration: 0.6, ease: 'power2.out' });
      }
      if (header) {
        gsap.to(header, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 });
      }
    },
  });

  // 7. Satellite Text & Badges Fade in
  if (satellites && satellites.length) {
    tl.to(satellites, {
      opacity: 1,
      y: 0,
      stagger: INTRO_TIMINGS.satelliteStagger,
      duration: INTRO_TIMINGS.satelliteDuration,
      ease: CUSTOM_EASES.bocLetters.name,
      onComplete: onMarqueeReady,
    });
  } else {
    tl.add(() => {
      onMarqueeReady?.();
    });
  }

  return tl;
}
