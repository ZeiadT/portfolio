import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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

  it('mounts in hidden circle state by default', () => {
    const tip = new CursorTip();
    tip.mount(container);

    const el = container.querySelector<HTMLElement>('[data-cursor-tip]');
    expect(el).not.toBeNull();
    expect(el?.className).toContain('backdrop-blur-md');
    expect(el?.style.opacity).toBe('0');
    tip.destroy();
  });

  it('reveals by expanding from circle to pill with blur-to-sharp content transition', async () => {
    const tip = new CursorTip({ label: 'Drag to stretch' });
    tip.mount(container);

    const el = container.querySelector<HTMLElement>('[data-cursor-tip]');
    const content = el?.querySelector<HTMLElement>('[data-pill-content]');

    expect(content).not.toBeNull();
    expect(content?.textContent).toContain('Drag to stretch');

    await tip.reveal();

    expect(el?.style.opacity).toBe('1');
    expect(content?.style.opacity).toBe('1');
    expect(content?.style.filter).toContain('blur(0px)');
    tip.destroy();
  });

  it('updates target coordinates on pointermove', () => {
    const tip = new CursorTip();
    tip.mount(container);

    const event = new MouseEvent('pointermove', {
      clientX: 180,
      clientY: 320,
    });
    window.dispatchEvent(event);

    const coords = tip.getPosition();
    expect(coords.x).toBe(180);
    expect(coords.y).toBe(320);
    tip.destroy();
  });

  it('hides and removes element cleanly on destroy()', async () => {
    const tip = new CursorTip();
    tip.mount(container);

    await tip.reveal();
    await tip.hide();

    const el = container.querySelector<HTMLElement>('[data-cursor-tip]');
    expect(el?.style.opacity).toBe('0');

    tip.destroy();
    expect(container.querySelector('[data-cursor-tip]')).toBeNull();
  });
});
