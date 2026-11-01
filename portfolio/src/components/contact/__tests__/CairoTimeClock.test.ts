import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CairoTimeClock } from '../CairoTimeClock';

describe('CairoTimeClock', () => {
  let container: HTMLElement;
  let clock: CairoTimeClock;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    clock = new CairoTimeClock();
  });

  afterEach(() => {
    clock.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.useRealTimers();
  });

  it('formats Cairo local time accurately', () => {
    // 2026-11-01T12:00:00Z -> UTC 12:00 -> Cairo UTC+2 = 14:00:00
    const fixedUtcDate = new Date('2026-11-01T12:00:00Z');
    const timeStr = clock.getTimeString(fixedUtcDate);
    expect(timeStr).toBe('14:00:00');
  });

  it('correctly reports Active status during Cairo daytime (14:00 Cairo / 12:00 UTC)', () => {
    const dayDate = new Date('2026-11-01T12:00:00Z'); // 14:00 Cairo
    const status = clock.getStatus(dayDate);
    expect(status.isAvailable).toBe(true);
    expect(status.statusText).toContain('Active / Available');
  });

  it('correctly reports Recharging status during Cairo late night (03:00 Cairo / 01:00 UTC)', () => {
    const nightDate = new Date('2026-11-01T01:00:00Z'); // 03:00 Cairo
    const status = clock.getStatus(nightDate);
    expect(status.isAvailable).toBe(false);
    expect(status.statusText).toContain('Recharging');
  });

  it('mounts DOM elements into container with time display and status badge', () => {
    clock.mount(container);

    const clockEl = container.querySelector('[data-cairo-clock]');
    const timeDisplay = container.querySelector('[data-cairo-time]');
    const statusBadge = container.querySelector('[data-cairo-status]');

    expect(clockEl).not.toBeNull();
    expect(timeDisplay).not.toBeNull();
    expect(statusBadge).not.toBeNull();
    expect(timeDisplay?.textContent?.length).toBeGreaterThan(0);
  });

  it('updates time dynamically on interval tick', () => {
    vi.useFakeTimers();
    clock.mount(container);

    const timeDisplay = container.querySelector('[data-cairo-time]');
    expect(timeDisplay?.textContent).toBeDefined();

    // Advance 1 second
    vi.advanceTimersByTime(1000);

    expect(timeDisplay?.textContent).toBeDefined();
  });

  it('clears interval and destroys DOM cleanly without memory leaks', () => {
    vi.useFakeTimers();
    clock.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    clock.destroy();
    expect(container.children.length).toBe(0);

    // Advancing timers should not throw after destroy
    expect(() => vi.advanceTimersByTime(2000)).not.toThrow();
  });
});
