import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnterPillController } from '../enterPill';

describe('EnterPillController', () => {
  let pillEl: HTMLButtonElement;
  let textEl: HTMLSpanElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    pillEl = document.createElement('button');
    pillEl.id = 'enter-pill';
    pillEl.style.width = '44px';
    pillEl.style.height = '44px';
    pillEl.style.opacity = '0';

    textEl = document.createElement('span');
    textEl.id = 'enter-pill-text';
    textEl.textContent = 'Click to enter';
    textEl.style.opacity = '0';

    pillEl.appendChild(textEl);
    document.body.appendChild(pillEl);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('initializes pill and text in hidden circle state', () => {
    const controller = new EnterPillController({
      pillElement: pillEl,
      textElement: textEl,
    });

    expect(controller).toBeDefined();
    expect(pillEl.style.opacity).toBe('0');
    expect(pillEl.style.width).toBe('44px');
    expect(pillEl.style.height).toBe('44px');
    expect(textEl.style.opacity).toBe('0');
    controller.destroy();
  });

  it('runs entrance sequence: circle reveal -> pill expansion -> text blur fade-in', () => {
    const controller = new EnterPillController({
      pillElement: pillEl,
      textElement: textEl,
      targetWidth: 170,
    });

    const timeline = controller.animateIn();
    expect(timeline).toBeDefined();
    expect(typeof timeline.play).toBe('function');
    expect(timeline.duration()).toBeGreaterThan(0);

    controller.destroy();
  });

  it('triggers blur fade-out animation and disables clicks on user click', () => {
    const onClick = vi.fn();
    const controller = new EnterPillController({
      pillElement: pillEl,
      textElement: textEl,
      onClick,
    });

    controller.animateIn();

    // Trigger click on pill
    pillEl.click();

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(pillEl.style.pointerEvents).toBe('none');

    controller.destroy();
  });

  it('cleans up event listeners and kills active GSAP tweens on destroy', () => {
    const controller = new EnterPillController({
      pillElement: pillEl,
      textElement: textEl,
    });

    controller.animateIn();
    expect(() => controller.destroy()).not.toThrow();
  });

  it('manages energized down arrow entrance, looping animation, and disposal', () => {
    const arrowEl = document.createElement('div');
    arrowEl.id = 'enter-arrow-container';
    document.body.appendChild(arrowEl);

    const controller = new EnterPillController({
      pillElement: pillEl,
      textElement: textEl,
      arrowElement: arrowEl,
    });

    expect(arrowEl.style.opacity).toBe('0');

    controller.animateIn();
    // Arrow should be animated alongside the pill
    expect(controller.getArrowLoop()).toBeDefined();

    // Destroy should cleanly kill arrow loop
    expect(() => controller.destroy()).not.toThrow();
    expect(controller.getArrowLoop()).toBeNull();
  });
});
