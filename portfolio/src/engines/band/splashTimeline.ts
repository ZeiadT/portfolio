import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

// Register authentic BOC cubic-beziers
CustomEase.create('bocLetters', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('bocOvershoot', 'M0,0 C1,-0.02 0,1.44 1,1');
CustomEase.create('bocCollapse', 'M0,0 C1,0 0.99,0.21 1,1');

export interface SplashElements {
  curtain: HTMLElement;
  heroWrapper: HTMLElement;
  heroWordmark: HTMLElement;
  heroChars: NodeListOf<HTMLElement> | HTMLElement[];
  satellites: NodeListOf<HTMLElement> | HTMLElement[];
  brandTrack: HTMLElement;
  backgroundShader?: HTMLElement | null;
}

export interface SplashTimelineCallbacks {
  onCollapseStart?: () => void;
  onMarqueeReady?: () => void;
}

/**
 * Builds the authentic BOC.Studio splash-to-band timeline:
 * 1. Letters stagger in with 'bocLetters'
 * 2. Energetic overshoot zoom down with 'bocOvershoot'
 * 3. Curtain collapses automatically into center horizontal band with 'bocCollapse'
 * 4. Background reveals and marquee starts
 */
export function buildSplashTimeline(
  elements: SplashElements,
  callbacks: SplashTimelineCallbacks = {}
): gsap.core.Timeline {
  const {
    curtain,
    heroWrapper,
    heroWordmark,
    heroChars,
    satellites,
    brandTrack,
    backgroundShader,
  } = elements;

  // Calculate dynamic scale to fill ~88% of screen width
  const naturalWidth = heroWordmark.offsetWidth || 300;
  const initialScale = Math.min(3.8, Math.max(1.8, (0.88 * window.innerWidth) / naturalWidth));

  // Pre-position marquee track so heroWordmark sits right at screen center
  brandTrack.classList.remove('is-scrolling');
  brandTrack.style.transform = 'translate3d(0, 0, 0)';

  const rect = heroWordmark.getBoundingClientRect();
  const screenCenter = window.innerWidth / 2;
  const heroCenter = rect.width > 0 ? rect.left + rect.width / 2 : screenCenter;
  const centerOffset = screenCenter - heroCenter;

  brandTrack.style.setProperty('--marquee-offset', `${centerOffset}px`);
  brandTrack.style.transform = `translate3d(${centerOffset}px, 0, 0)`;

  // Reset starting states (using pixel values for seamless GSAP interpolation)
  const screenHeight = window.innerHeight || 800;
  const targetBandHeight = Math.min(62.35, Math.max(52, 44 + 0.012 * (window.innerWidth || 1000)));

  gsap.set(curtain, { height: screenHeight });
  gsap.set(heroWrapper, { scale: initialScale, transformOrigin: '50% 50%' });
  gsap.set(heroChars, { opacity: 0, y: 16 });
  gsap.set(satellites, { opacity: 0, y: 6 });
  if (backgroundShader) {
    gsap.set(backgroundShader, { opacity: 0 });
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
  });

  // 1. Initial Hold
  tl.to({}, { duration: 0.25 });

  // 2. Letters Stagger In
  tl.to(heroChars, {
    opacity: 1,
    y: 0,
    stagger: 0.035,
    duration: 0.55,
    ease: 'bocLetters',
  });

  // 3. Pause briefly
  tl.to({}, { duration: 0.15 });

  // 4. Energetic Overshoot Zoom Down
  tl.to(heroWrapper, {
    scale: 1,
    duration: 0.95,
    ease: 'bocOvershoot',
  });

  // 5. Settle pause
  tl.to({}, { duration: 0.25 });

  // 6. Curtain Collapse into Horizontal Band
  tl.to(curtain, {
    height: targetBandHeight,
    duration: 0.8,
    ease: 'bocCollapse',
    onStart: () => {
      callbacks.onCollapseStart?.();
    },
    onComplete: () => {
      curtain.style.height = 'clamp(3.25rem, 2.75rem + 1.2vw, 3.897rem)';
    },
  });

  if (backgroundShader) {
    tl.to(
      backgroundShader,
      {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      },
      '<'
    );
  }

  // 7. Satellite Text & Badges Fade in around the continuous Wordmark
  tl.to(satellites, {
    opacity: 1,
    y: 0,
    stagger: 0.04,
    duration: 0.35,
    ease: 'bocLetters',
    onComplete: () => {
      brandTrack.classList.add('is-scrolling');
      callbacks.onMarqueeReady?.();
    },
  });

  return tl;
}
