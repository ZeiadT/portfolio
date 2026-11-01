import createGlobe from 'cobe';

/**
 * Escapes unsafe HTML characters to prevent XSS injection.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * ProfileGlobeComponent
 * Renders an isolated interactive 3D WebGL dot globe powered by `cobe`
 * inside an editorial Bento Card with smooth auto-rotation, grabbing drag
 * physics, and ambient radial glow.
 */
export class ProfileGlobeComponent {
  private location: string;
  private rootEl: HTMLElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private globe: { destroy: () => void; update?: (state: any) => void } | null = null;
  private animFrameId: number | null = null;

  private phi: number = 0;
  private pointerInteracting: number | null = null;
  private pointerInteractionMovement: number = 0;

  constructor(location: string = 'Egypt') {
    this.location = location || 'Egypt';
  }

  /**
   * Parses the location name from a location string (e.g. "Egypt" or "Cairo, Egypt" -> "Egypt").
   */
  private parseCity(locationStr?: string): string {
    if (!locationStr || !locationStr.trim()) {
      return 'Egypt';
    }
    const firstPart = locationStr.split(',')[0]?.trim();
    return firstPart || 'Egypt';
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.pointerInteracting = e.clientX - this.pointerInteractionMovement;
    if (this.canvasEl) {
      this.canvasEl.style.cursor = 'grabbing';
      if (typeof this.canvasEl.setPointerCapture === 'function') {
        try {
          this.canvasEl.setPointerCapture(e.pointerId);
        } catch {
          // Fallback if pointer capture fails in non-standard test DOMs
        }
      }
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (this.pointerInteracting !== null) {
      const delta = e.clientX - this.pointerInteracting;
      this.pointerInteractionMovement = delta;
    }
  };

  private onPointerUp = (e?: PointerEvent): void => {
    this.pointerInteracting = null;
    if (this.canvasEl) {
      this.canvasEl.style.cursor = 'grab';
      if (e && typeof this.canvasEl.releasePointerCapture === 'function') {
        try {
          this.canvasEl.releasePointerCapture(e.pointerId);
        } catch {
          // Safe fallback
        }
      }
    }
  };

  private onResize = (): void => {
    if (this.canvasEl && this.globe && typeof this.globe.update === 'function') {
      const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
      const width = (this.canvasEl.offsetWidth || 300) * dpr;
      const height = (this.canvasEl.offsetHeight || 300) * dpr;
      this.globe.update({ width, height });
    }
  };

  public mount(container: HTMLElement): void {
    if (this.rootEl) {
      this.destroy();
    }

    const city = this.parseCity(this.location);

    const root = document.createElement('div');
    root.setAttribute('data-bento-globe', 'true');
    root.className =
      'p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-between h-full select-text group/globe overflow-hidden relative transition-colors duration-200 hover:border-white/20';

    root.innerHTML = `
      <!-- Header Copy -->
      <div class="relative z-10 select-text">
        <span data-globe-subtitle class="text-[11px] uppercase tracking-[0.2em] font-semibold text-neutral-400 mb-1.5 block">FLEXIBLE WITH TIMEZONES</span>
        <h3 data-globe-title class="text-base sm:text-lg font-bold text-neutral-100 leading-snug">
          Based in <span class="text-[#ff4421] font-bold">${escapeHtml(city)}</span>, <span class="text-neutral-400 font-normal">available globally</span>
        </h3>
      </div>

      <!-- Canvas Container with Radial Glow Backdrop -->
      <div class="relative w-full aspect-square max-w-[260px] sm:max-w-[300px] mx-auto flex items-center justify-center -mb-20 sm:-mb-28 select-none">
        <div data-globe-glow class="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
          <div class="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#ff4421]/15 blur-3xl"></div>
        </div>
        <canvas
          data-globe-canvas
          class="w-full h-full cursor-grab active:cursor-grabbing touch-none relative z-10"
          style="width: 100%; height: 100%;"
        ></canvas>
      </div>
    `;

    container.appendChild(root);
    this.rootEl = root;

    const canvas = root.querySelector<HTMLCanvasElement>('canvas[data-globe-canvas]');
    if (!canvas) {
      return;
    }
    this.canvasEl = canvas;

    // Attach pointer interaction listeners to canvas
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('pointerup', this.onPointerUp);
    canvas.addEventListener('pointercancel', this.onPointerUp);
    canvas.addEventListener('pointerleave', this.onPointerUp);
    window.addEventListener('resize', this.onResize);

    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    const width = (canvas.offsetWidth || 300) * dpr;
    const height = (canvas.offsetHeight || 300) * dpr;

    const onRender = (state: Record<string, any>) => {
      if (this.pointerInteracting === null) {
        this.phi += 0.001;
      }
      state.phi = this.phi + this.pointerInteractionMovement / 200;
    };

    const cobeOptions = {
      devicePixelRatio: dpr,
      width,
      height,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      scale: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3] as [number, number, number],
      markerColor: [1, 0.27, 0.13] as [number, number, number],
      glowColor: [0.15, 0.15, 0.15] as [number, number, number],
      markers: [],
      onRender,
    };

    try {
      this.globe = createGlobe(canvas, cobeOptions as any);
    } catch {
      // Graceful fallback if WebGL is unavailable or fails to initialize
      this.globe = null;
    }

    // Drive animation loop for dynamic updates and cobe v2 compatibility
    const renderState: Record<string, any> = { phi: 0 };
    const animate = () => {
      onRender(renderState);
      if (this.globe && typeof this.globe.update === 'function') {
        this.globe.update({ phi: renderState.phi });
      }
      this.animFrameId = requestAnimationFrame(animate);
    };
    this.animFrameId = requestAnimationFrame(animate);
  }

  public destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.canvasEl) {
      this.canvasEl.removeEventListener('pointerdown', this.onPointerDown);
      this.canvasEl.removeEventListener('pointermove', this.onPointerMove);
      this.canvasEl.removeEventListener('pointerup', this.onPointerUp);
      this.canvasEl.removeEventListener('pointercancel', this.onPointerUp);
      this.canvasEl.removeEventListener('pointerleave', this.onPointerUp);
      this.canvasEl = null;
    }

    window.removeEventListener('resize', this.onResize);

    if (this.globe) {
      try {
        this.globe.destroy();
      } catch {
        // Safe fallback during teardown
      }
      this.globe = null;
    }

    if (this.rootEl) {
      if (this.rootEl.parentElement) {
        this.rootEl.parentElement.removeChild(this.rootEl);
      }
      this.rootEl = null;
    }

    this.pointerInteracting = null;
    this.pointerInteractionMovement = 0;
    this.phi = 0;
  }
}

export { ProfileGlobeComponent as ProfileGlobe };
