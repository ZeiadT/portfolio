import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfileContactComponent } from '../ProfileContact';
import type { ProfileContact } from '@/domain/types';

describe('ProfileContactComponent', () => {
  let container: HTMLElement;
  const mockContact: ProfileContact = {
    phone: '+201000000000',
    phoneFormatted: '+20 100 000 0000',
    email: 'contact@zeiad.dev',
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('renders phone button with dimmed copy icon and animates to check icon on click', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    const component = new ProfileContactComponent(mockContact);
    component.mount(container);

    // Confirm emoji and floating tooltips are completely gone
    expect(container.textContent).not.toContain('📋');
    expect(container.querySelector('[data-phone-feedback]')).toBeNull();
    expect(container.querySelector('[data-copy-feedback]')).toBeNull();

    const phoneBtn = container.querySelector<HTMLButtonElement>('button[data-contact-phone]');
    expect(phoneBtn).toBeTruthy();
    expect(phoneBtn?.textContent?.trim()).toContain(mockContact.phoneFormatted);

    const copyIcon = phoneBtn?.querySelector<SVGElement>('[data-icon-copy]');
    const checkIcon = phoneBtn?.querySelector<SVGElement>('[data-icon-check]');
    expect(copyIcon).toBeTruthy();
    expect(checkIcon).toBeTruthy();
    expect(copyIcon?.classList.contains('opacity-100')).toBe(true);
    expect(checkIcon?.classList.contains('opacity-0')).toBe(true);
    // Base transition is slower and calmer (duration-500)
    expect(copyIcon?.classList.contains('duration-500')).toBe(true);

    phoneBtn?.click();
    expect(writeTextMock).toHaveBeenCalledWith(mockContact.phone);

    // Check animated state uses fast forward transition (duration-200)
    expect(copyIcon?.classList.contains('opacity-0')).toBe(true);
    expect(copyIcon?.classList.contains('duration-200')).toBe(true);
    expect(checkIcon?.classList.contains('opacity-100')).toBe(true);
    expect(checkIcon?.classList.contains('duration-200')).toBe(true);
  });

  it('renders email button and animates to check icon on click', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    const component = new ProfileContactComponent(mockContact);
    component.mount(container);

    const emailBtn = container.querySelector<HTMLButtonElement>('button[data-contact-email]');
    expect(emailBtn).toBeTruthy();
    expect(emailBtn?.textContent?.trim()).toContain(mockContact.email);

    const copyIcon = emailBtn?.querySelector<SVGElement>('[data-icon-copy]');
    const checkIcon = emailBtn?.querySelector<SVGElement>('[data-icon-check]');
    expect(copyIcon).toBeTruthy();
    expect(checkIcon).toBeTruthy();

    emailBtn?.click();
    expect(writeTextMock).toHaveBeenCalledWith(mockContact.email);

    expect(copyIcon?.classList.contains('opacity-0')).toBe(true);
    expect(copyIcon?.classList.contains('duration-200')).toBe(true);
    expect(checkIcon?.classList.contains('opacity-100')).toBe(true);
    expect(checkIcon?.classList.contains('duration-200')).toBe(true);
  });

  it('reverts copy icon state back with a slower, calmer transition after timeout', () => {
    vi.useFakeTimers();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
      writable: true,
    });

    const component = new ProfileContactComponent(mockContact);
    component.mount(container);

    const phoneBtn = container.querySelector<HTMLButtonElement>('button[data-contact-phone]');
    const copyIcon = phoneBtn?.querySelector<SVGElement>('[data-icon-copy]');
    const checkIcon = phoneBtn?.querySelector<SVGElement>('[data-icon-check]');

    phoneBtn?.click();
    expect(copyIcon?.classList.contains('opacity-0')).toBe(true);
    expect(copyIcon?.classList.contains('duration-200')).toBe(true);

    // Fast-forward past timeout
    vi.advanceTimersByTime(1500);

    // Returns to copy icon with slower, calmer transition (duration-500 ease-in-out)
    expect(copyIcon?.classList.contains('opacity-100')).toBe(true);
    expect(copyIcon?.classList.contains('duration-500')).toBe(true);
    expect(checkIcon?.classList.contains('opacity-0')).toBe(true);
    expect(checkIcon?.classList.contains('duration-500')).toBe(true);

    vi.useRealTimers();
  });

  it('cleans up elements and timeout listeners on destroy', () => {
    const component = new ProfileContactComponent(mockContact);
    component.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    component.destroy();
    expect(container.children.length).toBe(0);
  });
});
