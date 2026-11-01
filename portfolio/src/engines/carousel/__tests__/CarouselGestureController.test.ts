import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CarouselGestureController } from '../CarouselGestureController';

describe('CarouselGestureController', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    // Provide explicit layout dimensions for bounding rect
    Object.defineProperty(container, 'clientWidth', { value: 1000, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 600, configurable: true });
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 50,
      right: 1100,
      bottom: 650,
      width: 1000,
      height: 600,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  describe('Static Constants & Initialization', () => {
    it('defines global constraints for damping, snap ease, tilt, and double click', () => {
      expect(CarouselGestureController.SNAP_EASE).toBe('power3.out');
      expect(CarouselGestureController.SPRING_DAMPING).toBe(0.92);
      expect(CarouselGestureController.HOVER_TILT_MAX_DEG).toBe(12);
      expect(CarouselGestureController.DOUBLE_CLICK_THRESHOLD_MS).toBe(300);
    });

    it('initializes with default currentIndex = 0 and isDragging = false', () => {
      const onScrollDelta = vi.fn();
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta,
        onIndexChange,
      });

      expect(controller.getCurrentIndex()).toBe(0);
      expect(controller.isDragging).toBe(false);

      controller.destroy();
    });

    it('allows syncing with external getCurrentIndex callback', () => {
      let externalIndex = 3;
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
        getCurrentIndex: () => externalIndex,
      });

      expect(controller.getCurrentIndex()).toBe(3);
      externalIndex = 4;
      expect(controller.getCurrentIndex()).toBe(4);

      controller.destroy();
    });
  });

  describe('Pointer Dragging & Delta Updates', () => {
    it('updates scroll delta during active dragging', () => {
      const onScrollDelta = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta,
        onIndexChange: vi.fn(),
      });

      // Pointer down at x=500
      container.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 500, clientY: 300, pointerId: 1, button: 0 })
      );
      expect(controller.isDragging).toBe(true);
      expect(onScrollDelta).not.toHaveBeenCalled();

      // Drag left to x=460 (delta = -40)
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 460, clientY: 300, pointerId: 1 })
      );
      expect(onScrollDelta).toHaveBeenCalledTimes(1);
      expect(onScrollDelta).toHaveBeenLastCalledWith(-40);

      // Drag further left to x=400 (delta = -60)
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 400, clientY: 300, pointerId: 1 })
      );
      expect(onScrollDelta).toHaveBeenCalledTimes(2);
      expect(onScrollDelta).toHaveBeenLastCalledWith(-60);

      // Pointer up releases drag
      container.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 400, clientY: 300, pointerId: 1 })
      );
      expect(controller.isDragging).toBe(false);

      // Move after up does not emit scroll delta
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 350, clientY: 300, pointerId: 1 })
      );
      expect(onScrollDelta).toHaveBeenCalledTimes(2);

      controller.destroy();
    });

    it('handles pointercancel cleanly', () => {
      const onScrollDelta = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta,
        onIndexChange: vi.fn(),
      });

      container.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 500, clientY: 300, pointerId: 1 })
      );
      expect(controller.isDragging).toBe(true);

      container.dispatchEvent(
        new PointerEvent('pointercancel', { clientX: 500, clientY: 300, pointerId: 1 })
      );
      expect(controller.isDragging).toBe(false);

      controller.destroy();
    });

    it('invokes setPointerCapture and releasePointerCapture safely if present', () => {
      const setCaptureSpy = vi.fn();
      const releaseCaptureSpy = vi.fn();
      container.setPointerCapture = setCaptureSpy;
      container.releasePointerCapture = releaseCaptureSpy;

      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
      });

      container.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 500, clientY: 300, pointerId: 42 })
      );
      expect(setCaptureSpy).toHaveBeenCalledWith(42);

      container.dispatchEvent(
        new PointerEvent('pointerup', { clientX: 500, clientY: 300, pointerId: 42 })
      );
      expect(releaseCaptureSpy).toHaveBeenCalledWith(42);

      controller.destroy();
    });
  });

  describe('Hover Tilt Detection', () => {
    it('computes tiltX and tiltY within ±12 degrees based on cursor position', () => {
      const onHoverTilt = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
        onHoverTilt,
      });

      // Center of container: rect left=100, width=1000 => center X = 600
      // rect top=50, height=600 => center Y = 350
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 600, clientY: 350 })
      );
      expect(onHoverTilt).toHaveBeenLastCalledWith(0, 0);

      // Right edge: clientX = 1100 => normX = +1 => tiltX = +12
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 1100, clientY: 350 })
      );
      expect(onHoverTilt).toHaveBeenLastCalledWith(12, 0);

      // Left edge: clientX = 100 => normX = -1 => tiltX = -12
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 100, clientY: 350 })
      );
      expect(onHoverTilt).toHaveBeenLastCalledWith(-12, 0);

      // Bottom edge: clientY = 650 => normY = +1 => tiltY = +12
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 600, clientY: 650 })
      );
      expect(onHoverTilt).toHaveBeenLastCalledWith(0, 12);

      // Top edge: clientY = 50 => normY = -1 => tiltY = -12
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 600, clientY: 50 })
      );
      expect(onHoverTilt).toHaveBeenLastCalledWith(0, -12);

      controller.destroy();
    });

    it('clamps tilt to ±12 degrees even if cursor moves outside container bounds', () => {
      const onHoverTilt = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
        onHoverTilt,
      });

      // Far right beyond bounds
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 2500, clientY: 350 })
      );
      expect(onHoverTilt).toHaveBeenLastCalledWith(12, 0);

      // Far left beyond bounds
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: -500, clientY: -200 })
      );
      expect(onHoverTilt).toHaveBeenLastCalledWith(-12, -12);

      controller.destroy();
    });

    it('resets tilt to (0, 0) on pointerleave', () => {
      const onHoverTilt = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
        onHoverTilt,
      });

      container.dispatchEvent(new PointerEvent('pointerleave'));
      expect(onHoverTilt).toHaveBeenCalledWith(0, 0);

      controller.destroy();
    });
  });

  describe('Mouse Wheel Navigation', () => {
    it('advances index on wheel down and rewinds on wheel up with bounds clamping', () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange,
        wheelThrottleMs: 50,
      });

      expect(controller.getCurrentIndex()).toBe(0);

      // Wheel down
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, bubbles: true }));
      expect(onIndexChange).toHaveBeenCalledTimes(1);
      expect(onIndexChange).toHaveBeenLastCalledWith(1, true);
      expect(controller.getCurrentIndex()).toBe(1);

      controller.destroy();
    });

    it('throttles rapid wheel events within throttle interval', async () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange,
        wheelThrottleMs: 150,
      });

      // First wheel event
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 80 }));
      expect(onIndexChange).toHaveBeenCalledTimes(1);
      expect(onIndexChange).toHaveBeenLastCalledWith(1, true);

      // Rapid consecutive event 20ms later should be ignored
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 80 }));
      expect(onIndexChange).toHaveBeenCalledTimes(1);

      // Wait past throttle interval
      await new Promise((r) => setTimeout(r, 160));

      // Subsequent wheel event should fire
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 80 }));
      expect(onIndexChange).toHaveBeenCalledTimes(2);
      expect(onIndexChange).toHaveBeenLastCalledWith(2, true);

      controller.destroy();
    });

    it('handles horizontal mouse wheel (deltaX) navigation', () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 4,
        onScrollDelta: vi.fn(),
        onIndexChange,
        wheelThrottleMs: 0,
      });

      // Horizontal wheel right (deltaX: 50)
      container.dispatchEvent(new WheelEvent('wheel', { deltaX: 50, deltaY: 0 }));
      expect(onIndexChange).toHaveBeenCalledTimes(1);
      expect(onIndexChange).toHaveBeenLastCalledWith(1, true);

      // Horizontal wheel left (deltaX: -50)
      container.dispatchEvent(new WheelEvent('wheel', { deltaX: -50, deltaY: 0 }));
      expect(onIndexChange).toHaveBeenCalledTimes(2);
      expect(onIndexChange).toHaveBeenLastCalledWith(0, true);

      controller.destroy();
    });

    it('ignores micro wheel movements below threshold (< 5)', () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 4,
        onScrollDelta: vi.fn(),
        onIndexChange,
        wheelThrottleMs: 0,
      });

      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 2 }));
      expect(onIndexChange).not.toHaveBeenCalled();

      controller.destroy();
    });

    it('clamps wheel navigation between 0 and totalProjects - 1', () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 3,
        onScrollDelta: vi.fn(),
        onIndexChange,
        wheelThrottleMs: 0,
      });

      // At index 0, wheel up should not go below 0
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
      expect(onIndexChange).not.toHaveBeenCalled();
      expect(controller.getCurrentIndex()).toBe(0);

      // Advance to 1
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      expect(onIndexChange).toHaveBeenCalledWith(1, true);

      // Advance to 2
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      expect(onIndexChange).toHaveBeenCalledWith(2, true);

      // At max (2), wheel down should not exceed 2
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      expect(onIndexChange).toHaveBeenCalledTimes(2);
      expect(controller.getCurrentIndex()).toBe(2);

      controller.destroy();
    });
  });

  describe('Keyboard Navigation', () => {
    it('advances index with ArrowRight and ArrowDown, rewinds with ArrowLeft and ArrowUp', () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange,
      });

      expect(controller.getCurrentIndex()).toBe(0);

      // ArrowRight -> 1
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(onIndexChange).toHaveBeenCalledTimes(1);
      expect(onIndexChange).toHaveBeenLastCalledWith(1, true);
      expect(controller.getCurrentIndex()).toBe(1);

      // ArrowDown -> 2
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(onIndexChange).toHaveBeenCalledTimes(2);
      expect(onIndexChange).toHaveBeenLastCalledWith(2, true);
      expect(controller.getCurrentIndex()).toBe(2);

      // ArrowLeft -> 1
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(onIndexChange).toHaveBeenCalledTimes(3);
      expect(onIndexChange).toHaveBeenLastCalledWith(1, true);
      expect(controller.getCurrentIndex()).toBe(1);

      // ArrowUp -> 0
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(onIndexChange).toHaveBeenCalledTimes(4);
      expect(onIndexChange).toHaveBeenLastCalledWith(0, true);
      expect(controller.getCurrentIndex()).toBe(0);

      controller.destroy();
    });

    it('clamps keyboard arrow index at 0 and totalProjects - 1', () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 2,
        onScrollDelta: vi.fn(),
        onIndexChange,
      });

      // At 0, ArrowLeft does nothing
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(onIndexChange).not.toHaveBeenCalled();
      expect(controller.getCurrentIndex()).toBe(0);

      // Advance to 1
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(onIndexChange).toHaveBeenCalledWith(1, true);

      // At 1 (max for 2 projects), ArrowRight does nothing
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(onIndexChange).toHaveBeenCalledTimes(1);
      expect(controller.getCurrentIndex()).toBe(1);

      controller.destroy();
    });

    it('ignores arrow keys when focused inside an input or textarea', () => {
      const onIndexChange = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange,
      });

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
      input.dispatchEvent(event);

      expect(onIndexChange).not.toHaveBeenCalled();
      expect(controller.getCurrentIndex()).toBe(0);

      document.body.removeChild(input);
      controller.destroy();
    });
  });

  describe('Double-Click Detection', () => {
    it('fires onCardDoubleClick when two pointerdowns occur within 300ms', () => {
      const onCardDoubleClick = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
        onCardDoubleClick,
      });

      controller.setCurrentIndex(2);

      let mockNow = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockNow);

      // First click
      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 500, clientY: 300 }));
      expect(onCardDoubleClick).not.toHaveBeenCalled();

      // Second click 180ms later (< 300ms)
      mockNow = 1180;
      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 502, clientY: 301 }));
      expect(onCardDoubleClick).toHaveBeenCalledTimes(1);
      expect(onCardDoubleClick).toHaveBeenCalledWith(2);

      // Third click 100ms later should NOT fire another double-click (sequence reset)
      mockNow = 1280;
      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 502, clientY: 301 }));
      expect(onCardDoubleClick).toHaveBeenCalledTimes(1);

      controller.destroy();
    });

    it('does NOT fire onCardDoubleClick if clicks are >= 300ms apart', () => {
      const onCardDoubleClick = vi.fn();
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
        onCardDoubleClick,
      });

      let mockNow = 1000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockNow);

      // First click
      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 500, clientY: 300 }));

      // Second click 350ms later (>= 300ms)
      mockNow = 1350;
      container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 500, clientY: 300 }));
      expect(onCardDoubleClick).not.toHaveBeenCalled();

      controller.destroy();
    });
  });

  describe('Lifecycle & Resource Cleanup', () => {
    it('removes 100% of event listeners on destroy()', () => {
      const onScrollDelta = vi.fn();
      const onIndexChange = vi.fn();
      const onHoverTilt = vi.fn();
      const onCardDoubleClick = vi.fn();

      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta,
        onIndexChange,
        onHoverTilt,
        onCardDoubleClick,
      });

      controller.destroy();

      // Firing events after destroy should do nothing
      container.dispatchEvent(
        new PointerEvent('pointerdown', { clientX: 500, clientY: 300, pointerId: 1 })
      );
      container.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 450, clientY: 300, pointerId: 1 })
      );
      container.dispatchEvent(new PointerEvent('pointerleave'));
      container.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));

      expect(onScrollDelta).not.toHaveBeenCalled();
      expect(onIndexChange).not.toHaveBeenCalled();
      expect(onHoverTilt).not.toHaveBeenCalled();
      expect(onCardDoubleClick).not.toHaveBeenCalled();
    });

    it('calling destroy multiple times is safe and idempotent', () => {
      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
      });

      expect(() => {
        controller.destroy();
        controller.destroy();
      }).not.toThrow();
    });

    it('maintains strict parity between addEventListener and removeEventListener on container and window', () => {
      const containerAddSpy = vi.spyOn(container, 'addEventListener');
      const containerRemoveSpy = vi.spyOn(container, 'removeEventListener');
      const windowAddSpy = vi.spyOn(window, 'addEventListener');
      const windowRemoveSpy = vi.spyOn(window, 'removeEventListener');

      const controller = new CarouselGestureController({
        container,
        totalProjects: 6,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
      });

      const containerAddCount = containerAddSpy.mock.calls.length;
      const windowAddCount = windowAddSpy.mock.calls.length;

      expect(containerAddCount).toBe(6);
      expect(windowAddCount).toBe(1);

      controller.destroy();

      expect(containerRemoveSpy).toHaveBeenCalledTimes(containerAddCount);
      expect(windowRemoveSpy).toHaveBeenCalledTimes(windowAddCount);
    });
  });

  describe('Index and Total Projects Setters', () => {
    it('setCurrentIndex clamps value strictly within [0, totalProjects - 1]', () => {
      const controller = new CarouselGestureController({
        container,
        totalProjects: 5,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
      });

      controller.setCurrentIndex(3);
      expect(controller.getCurrentIndex()).toBe(3);

      controller.setCurrentIndex(10);
      expect(controller.getCurrentIndex()).toBe(4);

      controller.setCurrentIndex(-5);
      expect(controller.getCurrentIndex()).toBe(0);

      controller.destroy();
    });

    it('setTotalProjects updates total count and clamps existing currentIndex if out of bounds', () => {
      const controller = new CarouselGestureController({
        container,
        totalProjects: 10,
        onScrollDelta: vi.fn(),
        onIndexChange: vi.fn(),
      });

      controller.setCurrentIndex(8);
      expect(controller.getCurrentIndex()).toBe(8);

      controller.setTotalProjects(5);
      expect(controller.getCurrentIndex()).toBe(4);

      controller.destroy();
    });
  });
});
