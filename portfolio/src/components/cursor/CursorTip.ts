import { gsap } from 'gsap';

export interface CursorTipOptions {
  label?: string;
  className?: string;
}

export class CursorTip {
  private element: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private label: string;
  private className: string;
  private x = 0;
  private y = 0;
  private isVisible = true;
  private quickX: ((value: number) => void) | null = null;
  private quickY: ((value: number) => void) | null = null;

  constructor(options: CursorTipOptions = {}) {
    this.label = options.label ?? 'Click to enter';
    this.className = options.className ?? '';
  }

  public mount(container: HTMLElement = document.body): void {
    this.container = container;
    this.element = document.createElement('div');
    this.element.setAttribute('data-cursor-tip', 'true');
    this.element.className = [
      'fixed pointer-events-none z-50 flex items-center justify-center select-none',
      'backdrop-blur-md bg-white/10 border border-white/20 text-white',
      'rounded-full px-4 py-1.5 text-xs font-mono tracking-wide shadow-xl',
      this.className,
    ].filter(Boolean).join(' ');

    this.element.textContent = this.label;
    this.element.style.opacity = '0';
    this.element.style.transform = 'translate(-50%, -50%)';

    this.container.appendChild(this.element);

    // Initial slow reveal (1.0s, power2.out)
    gsap.to(this.element, {
      opacity: 1,
      duration: 1.0,
      ease: 'power2.out',
    });

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

  public hide(): Promise<void> {
    if (!this.element || !this.isVisible) return Promise.resolve();
    this.isVisible = false;

    return new Promise((resolve) => {
      gsap.to(this.element!, {
        opacity: 0,
        scale: 0.95,
        duration: 0.2, // fast hide as specified
        ease: 'power3.in',
        onComplete: () => {
          if (this.element) {
            this.element.style.opacity = '0';
            this.element.style.display = 'none';
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
    this.container = null;
    this.quickX = null;
    this.quickY = null;
  }
}
