import type { Engine } from '@/domain/types';

/**
 * BOC Elastic Splash Band Engine Adapter
 */
export class ElasticBandEngine implements Engine {
  public readonly id = 'elastic-band';
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private animId: number | null = null;

  public mount(container: HTMLElement): void {
    this.container = container;
    this.canvas = container.querySelector<HTMLCanvasElement>('canvas');
    if (!this.canvas) return;

    window.addEventListener('resize', this.resize);
  }

  public resize = (): void => {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = (this.container?.clientHeight || 80) * dpr;
  };

  public destroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.resize);
    this.container = null;
    this.canvas = null;
  }
}
