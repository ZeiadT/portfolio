import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gsap } from 'gsap';
import { ProfileAvatarComponent } from '../ProfileAvatar';
import type { ProfileAvatarConfig } from '@/domain/types';

describe('ProfileAvatarComponent', () => {
  let container: HTMLElement;
  const mockAvatar: ProfileAvatarConfig = {
    src: '/profile.jpg',
    alt: 'Zeiad Mohammed Portrait',
    fallbackInitials: 'ZM',
  };
  const mockOptions = {
    title: 'Mobile Developer',
    onImageClick: vi.fn(),
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders pure portrait image card with edge-to-edge title and zero holographic effects or overlays', () => {
    const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
    avatar.mount(container);

    const cardEl = container.querySelector<HTMLElement>('[data-avatar-card]');
    expect(cardEl).toBeTruthy();

    // Confirm pure portrait img remains intact and completely unobstructed
    const imgEl = container.querySelector<HTMLImageElement>('img');
    expect(imgEl).toBeTruthy();
    expect(imgEl?.src).toContain('profile.jpg');
    expect(imgEl?.alt).toBe('Zeiad Mohammed Portrait');

    // Confirm ZERO holographic canvas or WebGL elements exist
    const holoCanvas = cardEl?.querySelector<HTMLCanvasElement>('canvas[data-holo-canvas]');
    expect(holoCanvas).toBeNull();
    expect(container.querySelector('canvas')).toBeNull();

    // Confirm ZERO legacy pseudo-element foil overlays or ambient glow halos exist
    expect(container.querySelector('[data-avatar-foil]')).toBeNull();
    expect(container.querySelector('[data-foil-rainbow]')).toBeNull();
    expect(container.querySelector('[data-foil-glare]')).toBeNull();
    expect(container.querySelector('[data-corner-glow-left]')).toBeNull();
    expect(container.querySelector('[data-corner-glow-right]')).toBeNull();
    expect(container.querySelector('[data-avatar-glow]')).toBeNull();

    // Title is rendered edge-to-edge uppercase
    const titleEl = container.querySelector('[data-avatar-title]');
    expect(titleEl).toBeTruthy();
    expect(titleEl?.textContent?.trim().toUpperCase()).toBe('MOBILE DEVELOPER');
    expect(titleEl?.className).toContain('tracking-[0.25em]');

    // Confirm NO phone elements exist under image card
    expect(container.querySelector('[data-avatar-phone]')).toBeNull();
    expect(container.querySelector('[data-phone-copy]')).toBeNull();
    expect(container.querySelector('[data-phone-copy-feedback]')).toBeNull();

    avatar.destroy();
  });

  it('triggers onImageClick when card is clicked', () => {
    const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
    avatar.mount(container);

    const cardEl = container.querySelector<HTMLElement>('[data-avatar-card]');
    expect(cardEl).toBeTruthy();

    cardEl?.click();
    expect(mockOptions.onImageClick).toHaveBeenCalledWith(mockAvatar.src, mockAvatar.alt);

    avatar.destroy();
  });

  it('triggers onImageClick when Enter or Space is pressed on card', () => {
    const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
    avatar.mount(container);

    const cardEl = container.querySelector<HTMLElement>('[data-avatar-card]');
    expect(cardEl).toBeTruthy();

    // Enter key
    cardEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(mockOptions.onImageClick).toHaveBeenCalledWith(mockAvatar.src, mockAvatar.alt);

    mockOptions.onImageClick.mockClear();

    // Space key
    cardEl?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(mockOptions.onImageClick).toHaveBeenCalledWith(mockAvatar.src, mockAvatar.alt);

    mockOptions.onImageClick.mockClear();

    // Other key (should not trigger)
    cardEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(mockOptions.onImageClick).not.toHaveBeenCalled();

    avatar.destroy();
  });

  it('displays fallback monogram when portrait image fails to load', () => {
    const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
    avatar.mount(container);

    const imgEl = container.querySelector<HTMLImageElement>('img')!;
    const fallbackEl = container.querySelector<HTMLElement>('[data-avatar-fallback]')!;
    expect(fallbackEl.classList.contains('hidden')).toBe(true);

    imgEl.dispatchEvent(new Event('error'));
    expect(imgEl.classList.contains('hidden')).toBe(true);
    expect(fallbackEl.classList.contains('hidden')).toBe(false);
    expect(fallbackEl.textContent).toContain(mockAvatar.fallbackInitials);

    avatar.destroy();
  });

  it('cleans up elements and removes event listeners on destroy', () => {
    const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
    avatar.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    avatar.destroy();
    expect(container.children.length).toBe(0);
  });

  describe('continuous card shimmer animation', () => {
    it('mounts data-avatar-shine overlay inside card with non-blocking blend mode and diagonal gradient', () => {
      const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
      avatar.mount(container);

      const cardEl = container.querySelector<HTMLElement>('[data-avatar-card]');
      expect(cardEl).toBeTruthy();

      const shineEl = cardEl?.querySelector<HTMLElement>('[data-avatar-shine]');
      expect(shineEl).toBeTruthy();
      expect(shineEl?.getAttribute('aria-hidden')).toBe('true');
      expect(shineEl?.classList.contains('pointer-events-none')).toBe(true);
      expect(shineEl?.classList.contains('absolute')).toBe(true);
      expect(shineEl?.classList.contains('mix-blend-overlay')).toBe(true);
      expect(shineEl?.style.background).toContain('linear-gradient');

      avatar.destroy();
    });

    it('initializes continuous GSAP shimmer timeline with periodic repeat interval and diagonal sweep', () => {
      const timelineSpy = vi.spyOn(gsap, 'timeline');
      const fromToSpy = vi.spyOn(gsap.core.Timeline.prototype, 'fromTo');

      const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
      avatar.mount(container);

      expect(timelineSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          repeat: -1,
          repeatDelay: 3.5,
        })
      );

      const cardEl = container.querySelector<HTMLElement>('[data-avatar-card]');
      const shineEl = cardEl?.querySelector<HTMLElement>('[data-avatar-shine]');
      expect(shineEl).toBeTruthy();

      expect(fromToSpy).toHaveBeenCalledWith(
        shineEl,
        expect.objectContaining({
          xPercent: -100,
          yPercent: -100,
          opacity: 0,
        }),
        expect.objectContaining({
          xPercent: 100,
          yPercent: 100,
          opacity: 1,
          duration: 2.5,
          ease: 'power2.inOut',
        })
      );

      avatar.destroy();
    });

    it('suppresses shimmer GSAP animation when prefers-reduced-motion is active', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList));

      const timelineSpy = vi.spyOn(gsap, 'timeline');

      const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
      avatar.mount(container);

      expect(timelineSpy).not.toHaveBeenCalled();

      const cardEl = container.querySelector<HTMLElement>('[data-avatar-card]');
      const shineEl = cardEl?.querySelector<HTMLElement>('[data-avatar-shine]');
      expect(shineEl).toBeTruthy();
      expect(shineEl?.classList.contains('opacity-0')).toBe(true);

      avatar.destroy();
    });

    it('kills GSAP shimmer timeline cleanly upon component destroy lifecycle', () => {
      const timelineSpy = vi.spyOn(gsap, 'timeline');

      const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
      avatar.mount(container);

      expect(timelineSpy).toHaveBeenCalled();
      const tlInstance = timelineSpy.mock.results[0]?.value as gsap.core.Timeline;
      expect(tlInstance).toBeDefined();

      const killSpy = vi.spyOn(tlInstance, 'kill');

      avatar.destroy();

      expect(killSpy).toHaveBeenCalledTimes(1);
    });
  });
});
