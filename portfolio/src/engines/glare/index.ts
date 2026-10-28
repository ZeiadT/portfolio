import gsap from 'gsap';
import type { Engine, ViewState } from '@/domain/types';

/**
 * Core-A Glare Transition & Rotary Navigation Engine Adapter
 */
export class GlareNavEngine implements Engine {
  public readonly id = 'glare-nav';
  private container: HTMLElement | null = null;
  private currentView: ViewState = 'home';
  private isTransitioning = false;

  public mount(container: HTMLElement): void {
    this.container = container;
  }

  public navigateTo(view: ViewState, onComplete?: () => void): void {
    if (this.isTransitioning || view === this.currentView || !this.container) return;

    this.isTransitioning = true;
    const overlay = this.container.querySelector<HTMLElement>('#glare-overlay');

    if (!overlay) {
      this.currentView = view;
      this.isTransitioning = false;
      onComplete?.();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.currentView = view;
        this.isTransitioning = false;
        onComplete?.();
      },
    });

    tl.to(overlay, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.inOut',
    }).to(overlay, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      delay: 0.1,
    });
  }

  public getCurrentView(): ViewState {
    return this.currentView;
  }

  public destroy(): void {
    this.container = null;
    this.isTransitioning = false;
  }
}
