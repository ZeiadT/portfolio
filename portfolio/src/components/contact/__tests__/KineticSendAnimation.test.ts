import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KineticSendAnimation } from '../KineticSendAnimation';
import { AudioHaptics } from '../AudioHaptics';

describe('KineticSendAnimation', () => {
  let container: HTMLElement;
  let animation: KineticSendAnimation;
  let mockHaptics: AudioHaptics;
  let testButton: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    testButton = document.createElement('button');
    testButton.setAttribute('data-submit-btn', 'true');
    testButton.innerHTML = '<span>SEND</span>';
    container.appendChild(testButton);

    mockHaptics = new AudioHaptics();
    vi.spyOn(mockHaptics, 'playSwoosh').mockImplementation(() => {});
    vi.spyOn(mockHaptics, 'playSuccess').mockImplementation(() => {});

    animation = new KineticSendAnimation({
      audioHaptics: mockHaptics,
      particleCount: 20, // Lightweight for tests
    });
  });

  afterEach(() => {
    animation.destroy();
    mockHaptics.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('mounts confetti canvas and success container cleanly', () => {
    animation.mount(container);

    const canvas = container.querySelector('[data-confetti-canvas]');
    expect(canvas).not.toBeNull();
  });

  it('executes send animation sequence and triggers audio cues', async () => {
    animation.mount(container);

    const animPromise = animation.play(testButton);

    expect(animPromise).toBeInstanceOf(Promise);
    await animPromise;

    expect(mockHaptics.playSwoosh).toHaveBeenCalled();
    expect(mockHaptics.playSuccess).toHaveBeenCalled();

    const successEl = container.querySelector('[data-send-success]');
    expect(successEl).not.toBeNull();
    expect(successEl?.textContent).toContain('Dispatched');
  });

  it('resets button and removes success overlay on reset()', async () => {
    animation.mount(container);

    await animation.play(testButton);
    expect(container.querySelector('[data-send-success]')).not.toBeNull();

    animation.reset(testButton);
    expect(container.querySelector('[data-send-success]')).toBeNull();
    expect(testButton.style.display).not.toBe('none');
  });

  it('cleans up canvas, GSAP animations, and DOM on destroy()', () => {
    animation.mount(container);
    expect(container.querySelector('[data-confetti-canvas]')).not.toBeNull();

    animation.destroy();
    expect(container.querySelector('[data-confetti-canvas]')).toBeNull();
  });
});
