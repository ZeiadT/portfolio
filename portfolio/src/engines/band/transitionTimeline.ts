import { gsap } from 'gsap';
import { TRANSITION_TIMINGS, TRANSITION_EASES, NAV_DIMENSIONS } from './constants';
import type { BentoRevealController } from '@/components/home/BentoRevealController';

export interface BandToNavOptions {
  brandBar: HTMLElement;
  brandTrack: HTMLElement;
  navLogoAnchor: HTMLElement;
  heroHeader?: HTMLElement | null;
  background?: HTMLElement | null;
  appContainer?: HTMLElement | null;
  marqueeCanvas?: HTMLCanvasElement | null;
  bentoController?: BentoRevealController | null;
  onStart?: () => void;
  onGlideStart?: () => void;
  onAscentStart?: () => void;
  onComplete?: () => void;
}

/**
 * Finds the nearest on-screen brand wordmark lockup to targetX.
 * Prioritizes lockups positioned at or to the right of targetX to create a smooth leftward glide.
 */
export function findNearestLockup(lockups: HTMLElement[], targetX: number): HTMLElement | null {
  if (!lockups || lockups.length === 0) return null;

  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;

  // Filter lockups visible horizontally
  const visible = lockups.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.right >= 0 && r.left <= screenWidth;
  });

  const candidates = visible.length > 0 ? visible : lockups;

  let bestAhead: HTMLElement | null = null;
  let minAheadDist = Infinity;

  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    const dist = r.left - targetX;
    if (dist >= 0 && dist < minAheadDist) {
      bestAhead = el;
      minAheadDist = dist;
    }
  }

  if (bestAhead) return bestAhead;

  // Fallback: closest absolute distance
  let bestClosest: HTMLElement | null = null;
  let minClosestDist = Infinity;

  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    const dist = Math.abs(r.left - targetX);
    if (dist < minClosestDist) {
      bestClosest = el;
      minClosestDist = dist;
    }
  }

  return bestClosest || candidates[0] || null;
}

/**
 * Builds the GSAP timeline orchestrating the 1:1 Boc.Studio transition
 * from the center splash marquee band into the docked top navigation bar.
 */
export function buildBandToNavTimeline(options: BandToNavOptions): gsap.core.Timeline {
  const {
    brandBar,
    brandTrack,
    navLogoAnchor,
    heroHeader,
    background,
    appContainer,
    marqueeCanvas,
    bentoController,
    onStart,
    onGlideStart,
    onAscentStart,
    onComplete,
  } = options;

  // 0. Prepare initial hidden state of bento cards before animations begin
  if (bentoController) {
    bentoController.prepareInitialState();
  }

  // 1. Freeze track animation at current rendered transform
  const currentTrackTransform = getComputedStyle(brandTrack).transform;
  if (currentTrackTransform && currentTrackTransform !== 'none') {
    brandTrack.style.transform = currentTrackTransform;
  }
  brandTrack.style.animation = 'none';

  // 2. Remove mirrored state so brand-bar regains orange background & DOM track visibility
  brandBar.removeAttribute('data-mirrored');

  // 3. Hide WebGL rubber canvas overlay immediately (seamless handoff to frozen DOM band)
  if (marqueeCanvas) {
    marqueeCanvas.style.display = 'none';
  }

  // 4. Calculate geometry matching Boc.Studio's exact formula
  const d = brandBar.getBoundingClientRect();
  const h = navLogoAnchor.getBoundingClientRect();
  const navLink = navLogoAnchor.querySelector('a');
  const g = navLink ? navLink.getBoundingClientRect() : h;

  const isDesktop =
    typeof window !== 'undefined'
      ? window.innerWidth >= NAV_DIMENSIONS.breakpointDesktop
      : true;
  const v = isDesktop
    ? NAV_DIMENSIONS.desktopHeight
    : NAV_DIMENSIONS.mobileHeight;

  const w = g.left || (isDesktop ? 24 : 16);
  // Vertical delta of nav logo relative to brand bar center:
  const y = g.top + g.height / 2 - (d.top + d.height / 2);

  // 5. Find nearest lockup and clone to body
  const lockupElements = Array.from(
    brandTrack.querySelectorAll<HTMLElement>('[data-marquee-lockup]')
  );
  const activeLockup = findNearestLockup(lockupElements, w);

  let flyingClone: HTMLElement | null = null;
  let lockupRect = { left: d.left + 200, top: d.top + 10, width: 200, height: 30 };

  if (activeLockup) {
    const r = activeLockup.getBoundingClientRect();
    lockupRect = { left: r.left, top: r.top, width: r.width, height: r.height };

    flyingClone = activeLockup.cloneNode(true) as HTMLElement;
    flyingClone.removeAttribute('data-marquee-lockup');
    flyingClone.classList.add('flying-wordmark-clone');
    flyingClone.style.transition = 'none';

    // Strip black color classes from all descendants and set color: inherit
    flyingClone.querySelectorAll<HTMLElement>('*').forEach((el) => {
      el.classList.remove('text-[#0d0d0d]');
      el.style.color = 'inherit';
    });

    document.body.appendChild(flyingClone);

    gsap.set(flyingClone, {
      position: 'fixed',
      top: lockupRect.top,
      left: lockupRect.left,
      margin: 0,
      transformOrigin: 'left center',
      zIndex: 60,
      color: '#0d0d0d',
      opacity: 1,
      force3D: true,
    });

    activeLockup.style.visibility = 'hidden';
  }

  // 6. Query satellite items to fade out
  const satellites: HTMLElement[] = [];
  brandTrack.querySelectorAll<HTMLElement>('.satellite-item, [data-marquee-fade]').forEach((el) => {
    satellites.push(el);
  });
  lockupElements.forEach((el) => {
    if (el !== activeLockup) satellites.push(el);
  });

  satellites.sort(
    (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left
  );
  satellites.forEach((el) => {
    el.style.transition = 'none';
  });

  // 7. Assemble Boc.Studio Timeline
  const tl = gsap.timeline({
    onStart: () => {
      onStart?.();
    },
    onComplete: () => {
      if (flyingClone && flyingClone.parentElement) {
        flyingClone.parentElement.removeChild(flyingClone);
      }
      gsap.set(brandBar, { clearProps: 'transform,x,y,height,scale' });
      onComplete?.();
    },
  });

  // Minimal delay before movement & scaling starts (almost together with fade/color change)
  const startMotionTime = TRANSITION_TIMINGS.startMotionDelay;

  // GSAP Timeline labels for clean choreography and debugging
  tl.addLabel('fade', 0);
  tl.addLabel('glide', startMotionTime);
  tl.addLabel('ascent', startMotionTime);

  // Phase 1 ('fade', t = 0):
  // - Satellites fade out rapidly
  // - Hero statement & affordances fade out
  // - Cloned wordmark morphs color to pure white
  if (satellites.length > 0) {
    tl.to(
      satellites,
      {
        opacity: 0,
        duration: TRANSITION_TIMINGS.satelliteFadeOut,
        stagger: TRANSITION_TIMINGS.satelliteStagger,
        ease: TRANSITION_EASES.satelliteFade,
      },
      'fade'
    );
  }

  if (heroHeader) {
    tl.to(
      heroHeader,
      {
        opacity: 0,
        y: 24,
        duration: TRANSITION_TIMINGS.satelliteFadeOut,
        ease: TRANSITION_EASES.headerFade,
      },
      'fade'
    );
  }

  if (flyingClone) {
    tl.to(
      flyingClone,
      {
        color: '#ffffff',
        opacity: 1,
        duration: TRANSITION_TIMINGS.logoColorMorph,
        ease: TRANSITION_EASES.colorMorph,
      },
      'fade'
    );
  }

  // Phase 2 ('glide' / 'ascent', t = startMotionTime):
  // Horizontal glide, vertical ascent, and size scaling start almost together with minimal delay
  if (flyingClone) {
    tl.call(() => onGlideStart?.(), [], 'glide');
    tl.to(
      flyingClone,
      {
        x: w - lockupRect.left,
        duration: TRANSITION_TIMINGS.logoHorizontalGlide,
        ease: TRANSITION_EASES.logoGlide,
      },
      'glide'
    );
  }

  // Phase 3 ('ascent', t = startMotionTime):
  // Upward ascent of brand bar to top 0 in perfect lockstep with vertical logo ascent & scale
  const currentBandTop = d.top;

  brandBar.style.transform = `translateY(${currentBandTop}px)`;
  gsap.set(brandBar, { y: currentBandTop, height: d.height });

  tl.call(() => onAscentStart?.(), [], 'ascent');

  // Brand bar ascends to y: 0 and collapses to nav height v
  tl.to(
    brandBar,
    {
      y: 0,
      height: v,
      duration: TRANSITION_TIMINGS.upwardAscent,
      ease: TRANSITION_EASES.bandAscent,
    },
    'ascent'
  );

  // Flying wordmark ascends vertically and scales to match resting position variant
  if (flyingClone) {
    // Authentic resting position variant scale ratio:
    // Compares rendered width of navLink vs activeLockup, falling back to font-size ratio (14/26 on desktop, 12/22 on mobile)
    const fallbackScale = isDesktop ? 14 / 26 : 12 / 22;
    const scaleRatio =
      g.width > 0 && lockupRect.width > 0
        ? g.width / lockupRect.width
        : fallbackScale;
    const targetYInBar = v / 2 + y;

    tl.to(
      flyingClone,
      {
        y: targetYInBar - (lockupRect.top + lockupRect.height / 2),
        scale: scaleRatio,
        duration: TRANSITION_TIMINGS.upwardAscent,
        ease: TRANSITION_EASES.logoAscent,
      },
      'ascent'
    );
  }

  // Background ASCII stage: oceanic blur fade-out in-place
  if (background) {
    tl.to(
      background,
      {
        opacity: 0,
        filter: 'blur(24px)',
        y: 24,
        scale: 0.96,
        duration: TRANSITION_TIMINGS.upwardAscent,
        ease: TRANSITION_EASES.backgroundSink,
        force3D: true,
      },
      'ascent'
    );
  }

  // Main screen container is set visible immediately without monolithic slide
  if (appContainer) {
    gsap.set(appContainer, {
      opacity: 1,
      y: 0,
    });
  }

  // Bento 2-step Tetris puzzle entrance reveal nested into master timeline
  if (bentoController) {
    tl.add(
      bentoController.createRevealTimeline(),
      `ascent+=${TRANSITION_TIMINGS.bentoWireframeStart}`
    );
  }

  return tl;
}
