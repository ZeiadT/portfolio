import gsap from 'gsap';

export interface EnterPillOptions {
  pillElement: HTMLElement;
  textElement: HTMLElement;
  arrowElement?: HTMLElement | null;
  targetWidth?: number;
  onClick?: () => void;
}

/**
 * EnterPillController
 * Choreographs the "Click to enter" frosted glass interaction:
 * 1. Reveals frosted glass circle (scale 0.7 -> 1, blur 8px -> 0px)
 * 2. Expands circle horizontally into pill shape
 * 3. Shows uppercase text using blur fade-in animation
 * 4. Reveals energized down arrow executing rhythmic bouncing loop
 * 5. On click, hides pill and arrow using blur fade-out animation
 */
export class EnterPillController {
  private pill: HTMLElement;
  private text: HTMLElement;
  private arrow: HTMLElement | null = null;
  private targetWidth: number;
  private onClick?: () => void;
  private timeline: gsap.core.Timeline | null = null;
  private arrowLoop: gsap.core.Tween | null = null;
  private clickHandler: (() => void) | null = null;
  private isDestroyed = false;

  constructor(options: EnterPillOptions) {
    this.pill = options.pillElement;
    this.text = options.textElement;
    this.arrow = options.arrowElement ?? null;
    this.targetWidth = options.targetWidth ?? 172;
    this.onClick = options.onClick;

    this.initStyles();
    this.bindEvents();
  }

  private initStyles(): void {
    // Initial circle state
    gsap.set(this.pill, {
      width: 44,
      height: 44,
      borderRadius: 9999,
      opacity: 0,
      scale: 0.7,
      filter: 'blur(8px)',
      force3D: true,
    });

    // Initial hidden text state
    gsap.set(this.text, {
      opacity: 0,
      filter: 'blur(8px)',
      y: 2,
      force3D: true,
    });

    // Initial arrow state
    if (this.arrow) {
      gsap.set(this.arrow, {
        opacity: 0,
        y: -4,
        force3D: true,
      });
    }
  }

  private bindEvents(): void {
    this.clickHandler = () => {
      if (this.isDestroyed) return;
      this.pill.style.pointerEvents = 'none';
      if (this.arrow) {
        this.arrow.style.pointerEvents = 'none';
      }
      this.onClick?.();
      this.animateOut();
    };

    this.pill.addEventListener('click', this.clickHandler);
    if (this.arrow) {
      this.arrow.addEventListener('click', this.clickHandler);
    }
  }

  public animateIn(): gsap.core.Timeline {
    if (this.timeline) {
      this.timeline.kill();
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Step 1: Frosted glass circle appears
    tl.to(this.pill, {
      opacity: 1,
      scale: 1.0,
      filter: 'blur(0px)',
      duration: 0.45,
    });

    // Step 2: Circle expands horizontally into pill shape
    tl.to(this.pill, {
      width: this.targetWidth,
      duration: 0.5,
      ease: 'power3.out',
    });

    // Step 3: Text blurs and fades in
    tl.to(
      this.text,
      {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
      },
      '-=0.2'
    );

    // Step 4: Down arrow reveals and starts energized bouncing loop
    if (this.arrow) {
      tl.to(
        this.arrow,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            if (this.isDestroyed || !this.arrow) return;
            this.arrowLoop = gsap.to(this.arrow, {
              y: 6,
              opacity: 0.65,
              duration: 0.55,
              repeat: -1,
              yoyo: true,
              ease: 'power2.inOut',
            });
          },
        },
        '-=0.15'
      );
    }

    this.timeline = tl;
    return tl;
  }

  public animateOut(): gsap.core.Tween {
    if (this.timeline) {
      this.timeline.kill();
    }
    if (this.arrowLoop) {
      this.arrowLoop.kill();
      this.arrowLoop = null;
    }
    if (this.arrow) {
      gsap.to(this.arrow, {
        opacity: 0,
        y: 8,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          if (this.arrow) {
            this.arrow.style.display = 'none';
          }
        },
      });
    }

    // Blur fade-out animation hiding the pill
    return gsap.to(this.pill, {
      opacity: 0,
      filter: 'blur(12px)',
      scale: 0.92,
      duration: 0.42,
      ease: 'power2.in',
      onComplete: () => {
        this.pill.style.display = 'none';
      },
    });
  }

  public getArrowLoop(): gsap.core.Tween | null {
    return this.arrowLoop;
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    if (this.arrowLoop) {
      this.arrowLoop.kill();
      this.arrowLoop = null;
    }
    gsap.killTweensOf(this.pill);
    gsap.killTweensOf(this.text);
    if (this.arrow) {
      gsap.killTweensOf(this.arrow);
      if (this.clickHandler) {
        this.arrow.removeEventListener('click', this.clickHandler);
      }
    }

    if (this.clickHandler) {
      this.pill.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
  }
}
