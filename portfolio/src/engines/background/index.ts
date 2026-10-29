import type { Engine } from '@/domain/types';
import { AsciiGrid, createAsciiGridConfig } from './asciiGrid';
import { TOPOGRAPHIC_TIERS } from './types';

export class BackgroundCanvasEngine implements Engine {
  public readonly id = 'shader-background';
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private grid: AsciiGrid | null = null;
  private animId: number | null = null;
  private lastTime = 0;
  private resizeObserver: ResizeObserver | null = null;
  private boundPointerMove: ((e: PointerEvent) => void) | null = null;
  private boundPointerDown: ((e: PointerEvent) => void) | null = null;

  public mount(container: HTMLElement): void {
    this.container = container;

    // Create or select canvas
    let canvas = container.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'absolute inset-0 w-full h-full pointer-events-none';
      container.appendChild(canvas);
    }
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });

    const width = container.clientWidth || window.innerWidth || 1024;
    const height = container.clientHeight || window.innerHeight || 768;

    this.grid = new AsciiGrid(width, height, createAsciiGridConfig());
    this.resize();

    // 1. Mouse move: subtle focused ripple with additional 40% reduced radius
    this.boundPointerMove = (e: PointerEvent) => {
      if (!this.grid || !this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const maxDim = Math.max(rect.width, rect.height);
      const reducedHoverRadius = (maxDim * 0.196) * 0.6; // Additional 40% reduction (0.1176 * maxDim)
      this.grid.triggerShockwave(x, y, this.grid.config.mouseMoveStrength, reducedHoverRadius);
    };
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });

    // 2. Mouse left click: punchy radial shockwave
    this.boundPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || !this.grid || !this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.grid.triggerShockwave(x, y, this.grid.config.mouseClickStrength);
    };
    window.addEventListener('pointerdown', this.boundPointerDown, { passive: true });

    // Observe resizing
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(container);
    }

    this.startLoop();
  }

  public triggerShockwave(x?: number, y?: number, strength = 45): void {
    if (!this.grid || !this.canvas) return;
    const targetX = x ?? this.canvas.width / (2 * (window.devicePixelRatio || 1));
    const targetY = y ?? this.canvas.height / (2 * (window.devicePixelRatio || 1));
    this.grid.triggerShockwave(targetX, targetY, strength);
  }

  private startLoop(): void {
    this.lastTime = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.064, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.render(dt);
      this.animId = requestAnimationFrame(frame);
    };

    this.animId = requestAnimationFrame(frame);
  }

  private render(dt: number): void {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const grid = this.grid;
    if (!ctx || !canvas || !grid) return;

    grid.update(dt);

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.font = grid.config.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const cell of grid.cells) {
      const renderX = cell.baseX + cell.dispX;
      const renderY = cell.baseY + cell.dispY;

      // 1. Base color and opacity from active topographic tier
      const tier = TOPOGRAPHIC_TIERS[cell.tierIndex] || TOPOGRAPHIC_TIERS[0];
      let [r, g, b] = tier.colorRgb;
      let alpha = cell.opacity;

      // 2. Isoline Ridge Highlight: trace vector contour boundaries in crisp radiant white/cyan
      if (cell.isRidge) {
        r = Math.round(r * 0.35 + 248 * 0.65);
        g = Math.round(g * 0.35 + 250 * 0.65);
        b = Math.round(b * 0.35 + 255 * 0.65);
        alpha = Math.min(0.96, alpha + 0.18);
      }

      // 3. Pointer displacement & shockwave surge
      const dispMag = Math.hypot(cell.dispX, cell.dispY);
      if (dispMag > 0.5) {
        const surge = Math.min(1.0, dispMag / 12);
        // Shift toward brilliant electric cyan/white shockwave glow
        r = Math.round(r * (1 - surge) + 56 * surge);
        g = Math.round(g * (1 - surge) + 189 * surge);
        b = Math.round(b * (1 - surge) + 248 * surge);
        alpha = Math.min(0.98, alpha + surge * 0.35);
      }

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
      ctx.fillText(cell.char, renderX, renderY);
    }

    ctx.restore();
  }

  public resize(): void {
    if (!this.canvas || !this.container) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.container.clientWidth || window.innerWidth || 1024;
    const height = this.container.clientHeight || window.innerHeight || 768;

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);

    this.grid?.resize(width, height);
  }

  public destroy(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.boundPointerMove) {
      window.removeEventListener('pointermove', this.boundPointerMove);
      this.boundPointerMove = null;
    }
    if (this.boundPointerDown) {
      window.removeEventListener('pointerdown', this.boundPointerDown);
      this.boundPointerDown = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.grid = null;
  }
}
