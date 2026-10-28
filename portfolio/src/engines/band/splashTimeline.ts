import { gsap } from 'gsap';

export interface SplashElements {
  curtain: HTMLElement;
  splashLogo: HTMLElement;
  navLogo: HTMLElement;
  navTabs: HTMLElement;
  bandContainer: HTMLElement;
}

export interface SplashTimelineCallbacks {
  onStart?: () => void;
  onCollapseComplete?: () => void;
  onComplete?: () => void;
}

/**
 * Builds the GSAP timeline orchestrating the transition from fullscreen splash
 * to the docked elastic top navigation bar.
 */
export function buildSplashToBandTimeline(
  elements: SplashElements,
  callbacks: SplashTimelineCallbacks = {}
): gsap.core.Timeline {
  const { curtain, splashLogo, navLogo, navTabs, bandContainer } = elements;

  const tl = gsap.timeline({
    onStart: () => {
      callbacks.onStart?.();
    },
    onComplete: () => {
      callbacks.onComplete?.();
    },
  });

  // Calculate coordinates for seamless logo glide from splash center to nav anchor
  const splashRect = splashLogo.getBoundingClientRect();
  const navRect = navLogo.getBoundingClientRect();

  // If getBoundingClientRect returns 0 (e.g. in test env), calculate reasonable fallback
  const startX = splashRect.left || window.innerWidth / 2;
  const startY = splashRect.top || window.innerHeight / 2;
  const targetX = navRect.left || 32;
  const targetY = navRect.top || 20;

  const deltaX = targetX - startX;
  const deltaY = targetY - startY;

  // Initial setup
  gsap.set(splashLogo, {
    x: 0,
    y: 0,
    color: '#0d0d0d',
    opacity: 1,
    transformOrigin: 'left center',
  });
  gsap.set(navLogo, { opacity: 0 });
  gsap.set(navTabs, { opacity: 0, y: 8 });

  // 1. Curtain Collapse: Starts slow, ends fast (power3.in, 0.85s)
  tl.to(
    curtain,
    {
      height: '64px',
      duration: 0.85,
      ease: 'power3.in',
      onComplete: () => {
        callbacks.onCollapseComplete?.();
      },
    },
    0
  );

  // 2. Logo Glide & Color Morph: Ease in out (power2.inOut, 0.9s)
  tl.to(
    splashLogo,
    {
      x: deltaX,
      y: deltaY,
      scale: 1,
      color: '#ffffff',
      duration: 0.9,
      ease: 'power2.inOut',
      onComplete: () => {
        // Swap visibility cleanly to navLogo with zero flicker
        gsap.set(navLogo, { opacity: 1, color: '#ffffff' });
        gsap.set(splashLogo, { opacity: 0 });
      },
    },
    0
  );

  // 3. Delayed Nav Tabs Reveal: Appears only after logo finishes prominent docking (+0.2s)
  const tabChildren = navTabs.children.length > 0 ? Array.from(navTabs.children) : [navTabs];
  tl.to(
    navTabs,
    {
      opacity: 1,
      duration: 0.2,
      ease: 'power1.out',
    },
    '+=0.15'
  );

  tl.fromTo(
    tabChildren,
    { opacity: 0, y: 6 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.08,
      duration: 0.4,
      ease: 'power2.out',
    },
    '<'
  );

  return tl;
}
