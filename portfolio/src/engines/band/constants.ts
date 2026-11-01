/**
 * Kinetic Intro & Band Visual Tokens and Easing Definitions
 * Authentic mathematical cubic-beziers from Boc.Studio
 */

export const CUSTOM_EASES = {
  bocLetters: {
    name: 'bocLetters',
    path: 'M0,0 C0.16,1 0.3,1 1,1',
  },
  bocOvershoot: {
    name: 'bocOvershoot',
    path: 'M0,0 C1,-0.02 0,1.44 1,1',
  },
  elasticCollapse: {
    name: 'elasticCollapse',
    path: 'M0,0 C0.25,1 0.35,1.006 1,1',
  },
} as const;

export const INTRO_TIMINGS = {
  holdBeforeStart: 0.25,
  letterStagger: 0.035,
  letterDuration: 0.55,
  holdAfterLetters: 0.15,
  shrinkDuration: 0.95,
  settleHold: 0.25,
  barShrinkDuration: 0.8,
  satelliteStagger: 0.04,
  satelliteDuration: 0.35,
} as const;

export const TRANSITION_TIMINGS = {
  startMotionDelay: 0.15,
  headerFadeOut: 0.4,
  satelliteFadeOut: 0.25,
  satelliteStagger: 0.02,
  logoColorMorph: 0.4,
  logoHorizontalGlide: 1.15,
  upwardAscent: 1.3,
  navTabsStagger: 0.08,
  navTabsDuration: 0.45,
  bentoWireframeStart: 0.70,
  bentoWireframeDuration: 0.35,
  /** Absolute time in seconds from transition start when Tetris drop begins (0.70s + 0.35s duration) */
  bentoDropStart: 1.05,
} as const;

export const TRANSITION_EASES = {
  satelliteFade: 'power1.in',
  headerFade: 'power1.in',
  colorMorph: 'power2.inOut',
  logoGlide: 'power2.inOut',
  bandAscent: 'power3.inOut',
  logoAscent: 'power3.inOut',
  backgroundSink: 'power2.inOut',
  appEntrance: 'power3.inOut',
} as const;

export const NAV_DIMENSIONS = {
  desktopHeight: 38,
  mobileHeight: 60,
  breakpointDesktop: 1024,
} as const;

