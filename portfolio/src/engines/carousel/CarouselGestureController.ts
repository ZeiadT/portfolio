/**
 * Options configuring the CarouselGestureController
 */
export interface CarouselGestureControllerOptions {
  container: HTMLElement;
  totalProjects: number;
  onScrollDelta: (delta: number) => void;
  onIndexChange: (index: number, snap: boolean) => void;
  onCardDoubleClick?: (index: number) => void;
  onHoverTilt?: (tiltX: number, tiltY: number) => void;
  getCurrentIndex?: () => number;
  wheelThrottleMs?: number;
}

/**
 * Unified pointer, touch, mouse wheel, keyboard, and double-click interaction
 * controller for the 3D WebGL Project Carousel Engine.
 *
 * Implements:
 * - Pointer drag & touch swiping with inertial momentum delegation
 * - Throttled wheel navigation with index bounds clamping
 * - Keyboard navigation (ArrowLeft/Right, ArrowUp/Down) with GSAP 'power3.out' snap indication
 * - Real-time hover tilt mapping within ±12 degrees
 * - Rapid double-click detection (< 300ms) for particle shockwaves
 * - Clean lifecycle disposal with zero dangling listeners
 */
export class CarouselGestureController {
  public static readonly SNAP_EASE = 'power3.out';
  public static readonly SPRING_DAMPING = 0.92;
  public static readonly HOVER_TILT_MAX_DEG = 12;
  public static readonly DOUBLE_CLICK_THRESHOLD_MS = 300;

  private options: CarouselGestureControllerOptions;
  private container: HTMLElement;
  private totalProjects: number;
  private currentIndex = 0;
  private isDraggingInternal = false;
  private lastPointerX = 0;
  private lastClickTime = 0;
  private lastWheelTime = 0;
  private wheelThrottleMs: number;
  private isDestroyed = false;

  constructor(options: CarouselGestureControllerOptions) {
    this.options = options;
    this.container = options.container;
    this.totalProjects = Math.max(1, options.totalProjects);
    this.wheelThrottleMs = options.wheelThrottleMs ?? 200;

    this.bindEvents();
  }

  public get isDragging(): boolean {
    return this.isDraggingInternal;
  }

  public getIsDragging(): boolean {
    return this.isDraggingInternal;
  }

  public getCurrentIndex(): number {
    if (this.options.getCurrentIndex) {
      return this.options.getCurrentIndex();
    }
    return this.currentIndex;
  }

  public setCurrentIndex(index: number): void {
    this.currentIndex = Math.max(0, Math.min(this.totalProjects - 1, Math.floor(index)));
  }

  public setTotalProjects(count: number): void {
    this.totalProjects = Math.max(1, Math.floor(count));
    if (this.currentIndex >= this.totalProjects) {
      this.currentIndex = this.totalProjects - 1;
    }
  }

  private bindEvents(): void {
    this.container.addEventListener('pointerdown', this.handlePointerDown);
    this.container.addEventListener('pointermove', this.handlePointerMove);
    this.container.addEventListener('pointerup', this.handlePointerUp);
    this.container.addEventListener('pointercancel', this.handlePointerCancel);
    this.container.addEventListener('pointerleave', this.handlePointerLeave);
    this.container.addEventListener('wheel', this.handleWheel, { passive: false });
    window.addEventListener('keydown', this.handleKeyDown);
  }

  private unbindEvents(): void {
    this.container.removeEventListener('pointerdown', this.handlePointerDown);
    this.container.removeEventListener('pointermove', this.handlePointerMove);
    this.container.removeEventListener('pointerup', this.handlePointerUp);
    this.container.removeEventListener('pointercancel', this.handlePointerCancel);
    this.container.removeEventListener('pointerleave', this.handlePointerLeave);
    this.container.removeEventListener('wheel', this.handleWheel);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private now(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (this.isDestroyed) return;
    if (event.button !== 0 && event.button !== undefined) {
      // Allow primary button or touch/pen (where button may be 0)
      return;
    }

    const currentTime = this.now();
    const timeDelta = currentTime - this.lastClickTime;

    if (timeDelta > 0 && timeDelta < CarouselGestureController.DOUBLE_CLICK_THRESHOLD_MS) {
      this.options.onCardDoubleClick?.(this.getCurrentIndex());
      this.lastClickTime = 0;
    } else {
      this.lastClickTime = currentTime;
    }

    this.isDraggingInternal = true;
    this.lastPointerX = event.clientX;

    if (typeof this.container.setPointerCapture === 'function') {
      try {
        this.container.setPointerCapture(event.pointerId);
      } catch {
        // Safe fallthrough for headless / non-supporting environments
      }
    }
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (this.isDestroyed) return;

    this.updateHoverTilt(event);

    if (!this.isDraggingInternal) return;

    const deltaX = event.clientX - this.lastPointerX;
    this.lastPointerX = event.clientX;

    this.options.onScrollDelta(deltaX);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (this.isDestroyed || !this.isDraggingInternal) return;

    this.isDraggingInternal = false;

    if (typeof this.container.releasePointerCapture === 'function') {
      try {
        this.container.releasePointerCapture(event.pointerId);
      } catch {
        // Safe fallthrough
      }
    }
  };

  private handlePointerCancel = (event: PointerEvent): void => {
    if (this.isDestroyed || !this.isDraggingInternal) return;

    this.isDraggingInternal = false;

    if (typeof this.container.releasePointerCapture === 'function') {
      try {
        this.container.releasePointerCapture(event.pointerId);
      } catch {
        // Safe fallthrough
      }
    }
  };

  private handlePointerLeave = (): void => {
    if (this.isDestroyed) return;
    this.options.onHoverTilt?.(0, 0);
  };

  private updateHoverTilt(event: PointerEvent): void {
    if (!this.options.onHoverTilt) return;

    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1000);
    const height = rect.height || this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);
    const left = rect.left || 0;
    const top = rect.top || 0;

    const relX = event.clientX - left;
    const relY = event.clientY - top;

    const normX = Math.max(-1, Math.min(1, (relX / width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (relY / height) * 2 - 1));

    const tiltX = normX * CarouselGestureController.HOVER_TILT_MAX_DEG;
    const tiltY = normY * CarouselGestureController.HOVER_TILT_MAX_DEG;

    this.options.onHoverTilt(tiltX, tiltY);
  }

  private handleWheel = (event: WheelEvent): void => {
    if (this.isDestroyed) return;

    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    const currentTime = this.now();
    if (currentTime - this.lastWheelTime < this.wheelThrottleMs) {
      return;
    }

    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (Math.abs(delta) < 5) {
      return;
    }

    this.lastWheelTime = currentTime;
    const current = this.getCurrentIndex();

    if (delta > 0) {
      // Forward / down -> next project
      const next = Math.min(this.totalProjects - 1, current + 1);
      if (next !== current) {
        this.currentIndex = next;
        this.options.onIndexChange(next, true);
      }
    } else if (delta < 0) {
      // Backward / up -> previous project
      const prev = Math.max(0, current - 1);
      if (prev !== current) {
        this.currentIndex = prev;
        this.options.onIndexChange(prev, true);
      }
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.isDestroyed) return;

    const target = event.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.getAttribute && target.getAttribute('contenteditable') === 'true'))
    ) {
      return;
    }

    const current = this.getCurrentIndex();
    let next = current;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      next = Math.min(this.totalProjects - 1, current + 1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      next = Math.max(0, current - 1);
    } else {
      return;
    }

    if (next !== current) {
      this.currentIndex = next;
      this.options.onIndexChange(next, true);
    }
  };

  public destroy(): void {
    if (this.isDestroyed) return;
    this.unbindEvents();
    this.isDraggingInternal = false;
    this.isDestroyed = true;
  }
}
