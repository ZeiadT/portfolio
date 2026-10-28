import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CursorTip } from '../CursorTip';

describe('CursorTip Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts into container with default label and frosted styling classes', () => {
    const tip = new CursorTip();
    tip.mount(container);

    const el = container.querySelector<HTMLElement>('[data-cursor-tip]');
    expect(el).not.toBeNull();
    expect(el?.textContent).toContain('Click to enter');
    expect(el?.className).toContain('backdrop-blur-md');
    expect(el?.className).toContain('pointer-events-none');
    tip.destroy();
  });

  it('supports custom label', () => {
    const tip = new CursorTip({ label: 'Explore Portfolio' });
    tip.mount(container);

    const el = container.querySelector<HTMLElement>('[data-cursor-tip]');
    expect(el?.textContent).toContain('Explore Portfolio');
    tip.destroy();
  });

  it('updates target coordinates on pointermove', () => {
    const tip = new CursorTip();
    tip.mount(container);

    const event = new MouseEvent('pointermove', {
      clientX: 150,
      clientY: 250,
    });
    window.dispatchEvent(event);

    const coords = tip.getPosition();
    expect(coords.x).toBe(150);
    expect(coords.y).toBe(250);
    tip.destroy();
  });

  it('hides and removes element cleanly on destroy()', async () => {
    const tip = new CursorTip();
    tip.mount(container);

    const el = container.querySelector<HTMLElement>('[data-cursor-tip]');
    expect(el).not.toBeNull();

    await tip.hide();
    expect(el?.style.opacity).toBe('0');

    tip.destroy();
    expect(container.querySelector('[data-cursor-tip]')).toBeNull();
  });
});
