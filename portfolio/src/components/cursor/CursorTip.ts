import { gsap } from 'gsap';

export interface CursorTipOptions {
  label?: string;
  className?: string;
}

export class CursorTip {
  private element: HTMLElement | null = null;
  private contentEl: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private label: string;
  private className: string;
  private x = 0;
  private y = 0;
  private isVisible = false;
  private quickX: ((value: number) => void) | null = null;
  private quickY: ((value: number) => void) | null = null;

  constructor(options: CursorTipOptions = {}) {
    this.label = options.label ?? 'Drag to stretch';
    this.className = options.className ?? '';
  }

  public mount(container: HTMLElement = document.body): void {
    this.container = container;

    // Outer pill container (starts as a small circle)
    this.element = document.createElement('div');
    this.element.setAttribute('data-cursor-tip', 'true');
    this.element.className = [
      'fixed pointer-events-none z-50 flex items-center justify-center select-none overflow-hidden',
      'backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-xl',
      'rounded-full',
      this.className,
    ].filter(Boolean).join(' ');

    this.element.style.opacity = '0';
    this.element.style.width = '14px';
    this.element.style.height = '14px';
    this.element.style.padding = '0';
    this.element.style.transform = 'translate(-50%, -50%)';

    // Inner content container (fades in with blur removal)
    this.contentEl = document.createElement('span');
    this.contentEl.setAttribute('data-pill-content', 'true');
    this.contentEl.className = 'inline-block whitespace-nowrap text-xs font-mono tracking-wide px-3.5 py-1.5 select-none';
    this.contentEl.textContent = this.label;
    this.contentEl.style.opacity = '0';
    this.contentEl.style.filter = 'blur(8px)';

    this.element.appendChild(this.contentEl);
    this.container.appendChild(this.element);

    this.quickX = gsap.quickTo(this.element, 'left', { duration: 0.15, ease: 'power2.out' });
    this.quickY = gsap.quickTo(this.element, 'top', { duration: 0.15, ease: 'power2.out' });

    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
  }

  private onPointerMove = (e: MouseEvent | PointerEvent): void => {
    this.x = e.clientX;
    this.y = e.clientY;

    if (this.quickX && this.quickY) {
      this.quickX(this.x);
      this.quickY(this.y);
    } else if (this.element) {
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
    }
  };

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Reveals the cursor tip by expanding from a small circle into a pill,
   * while fading in the content with a blur-to-sharp animation.
   */
  public reveal(): Promise<void> {
    if (!this.element || !this.contentEl) return Promise.resolve();
    this.isVisible = true;

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => resolve(),
      });

      // 1. Fade circle in
      tl.to(this.element, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out',
      });

      // 2. Expand horizontally from circle to pill
      tl.to(
        this.element,
        {
          width: 'auto',
          height: 'auto',
          duration: 0.45,
          ease: 'power3.out',
        },
        '-=0.1'
      );

      // 3. Fade in content with blur transition
      tl.to(
        this.contentEl,
        {
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.35,
          ease: 'power2.out',
        },
        '-=0.25'
      );
    });
  }

  public hide(): Promise<void> {
    if (!this.element || !this.isVisible) return Promise.resolve();
    this.isVisible = false;

    return new Promise((resolve) => {
      gsap.to(this.element!, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          if (this.element) {
            this.element.style.opacity = '0';
          }
          resolve();
        },
      });
    });
  }

  public destroy(): void {
    window.removeEventListener('pointermove', this.onPointerMove);
    if (this.element && this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
    this.element = null;
    this.contentEl = null;
    this.container = null;
    this.quickX = null;
    this.quickY = null;
  }
}
