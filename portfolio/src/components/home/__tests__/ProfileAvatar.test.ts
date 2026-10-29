import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfileAvatarComponent } from '../ProfileAvatar';
import { HoloCardEngine } from '@/engines/holo/HoloCardEngine';
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

  it('renders clean image card with WebGL2 HoloCardEngine canvas and edge-to-edge title', () => {
    const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
    avatar.mount(container);

    const cardEl = container.querySelector<HTMLElement>('[data-avatar-card]');
    expect(cardEl).toBeTruthy();

    // Confirm HoloCardEngine canvas is mounted inside [data-avatar-card]
    const holoCanvas = cardEl?.querySelector<HTMLCanvasElement>('canvas[data-holo-canvas]');
    expect(holoCanvas).toBeTruthy();
    expect(holoCanvas?.className).toContain('absolute inset-0');

    // Confirm clean portrait img remains intact as texture source & fallback
    const imgEl = container.querySelector<HTMLImageElement>('img');
    expect(imgEl).toBeTruthy();
    expect(imgEl?.src).toContain('profile.jpg');

    // Confirm NO legacy pseudo-element foil overlays or ambient glow halos exist
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

  it('cleans up elements and destroys HoloCardEngine on destroy', () => {
    const destroySpy = vi.spyOn(HoloCardEngine.prototype, 'destroy');

    const avatar = new ProfileAvatarComponent(mockAvatar, mockOptions);
    avatar.mount(container);
    expect(container.children.length).toBeGreaterThan(0);
    expect(container.querySelector('canvas[data-holo-canvas]')).toBeTruthy();

    avatar.destroy();
    expect(destroySpy).toHaveBeenCalled();
    expect(container.children.length).toBe(0);
  });
});
