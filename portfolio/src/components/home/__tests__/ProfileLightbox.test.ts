import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfileLightbox } from '../ProfileLightbox';

describe('ProfileLightbox Component', () => {
  let lightbox: ProfileLightbox;

  beforeEach(() => {
    lightbox = new ProfileLightbox();
  });

  afterEach(() => {
    lightbox.destroy();
  });

  it('is closed by default', () => {
    expect(lightbox.isOpen()).toBe(false);
    expect(document.querySelector('[data-profile-lightbox]')).toBeNull();
  });

  it('opens and injects modal into document body', () => {
    lightbox.open('/download.jpg', 'Portrait Test');
    expect(lightbox.isOpen()).toBe(true);

    const dialogEl = document.querySelector<HTMLElement>('[data-profile-lightbox]');
    expect(dialogEl).toBeTruthy();
    expect(dialogEl?.getAttribute('role')).toBe('dialog');
    expect(dialogEl?.getAttribute('aria-modal')).toBe('true');

    const imgEl = dialogEl?.querySelector<HTMLImageElement>('img');
    expect(imgEl).toBeTruthy();
    expect(imgEl?.src).toContain('download.jpg');
    expect(imgEl?.alt).toBe('Portrait Test');
  });

  it('closes on close button click', () => {
    const onClose = vi.fn();
    lightbox.setOnClose(onClose);
    lightbox.open('/download.jpg', 'Portrait');

    const closeBtn = document.querySelector<HTMLButtonElement>('[data-lightbox-close]');
    expect(closeBtn).toBeTruthy();
    closeBtn?.click();

    expect(lightbox.isOpen()).toBe(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key press', () => {
    lightbox.open('/download.jpg', 'Portrait');
    expect(lightbox.isOpen()).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lightbox.isOpen()).toBe(false);
  });

  it('closes on outside backdrop click', () => {
    lightbox.open('/download.jpg', 'Portrait');
    expect(lightbox.isOpen()).toBe(true);

    const backdropEl = document.querySelector<HTMLElement>('[data-lightbox-backdrop]');
    expect(backdropEl).toBeTruthy();
    backdropEl?.click();

    expect(lightbox.isOpen()).toBe(false);
  });

  it('cleans up DOM on destroy', () => {
    lightbox.open('/download.jpg', 'Portrait');
    expect(document.querySelector('[data-profile-lightbox]')).toBeTruthy();

    lightbox.destroy();
    expect(document.querySelector('[data-profile-lightbox]')).toBeNull();
    expect(lightbox.isOpen()).toBe(false);
  });
});
