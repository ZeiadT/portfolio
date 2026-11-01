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

  it('renders resume button with default resumeUrl and required attributes', () => {
    const component = new ProfileContactComponent(mockContact);
    component.mount(container);

    const resumeLink = container.querySelector<HTMLAnchorElement>('a[data-contact-resume]');
    expect(resumeLink).toBeTruthy();
    expect(resumeLink?.getAttribute('href')).toBe('/resume.pdf');
    expect(resumeLink?.getAttribute('target')).toBe('_blank');
    expect(resumeLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(resumeLink?.textContent).toContain('Resume');
    expect(resumeLink?.querySelector('svg')).toBeTruthy();
  });

  it('renders resume button with custom resumeUrl if provided', () => {
    const customUrl = 'https://example.com/custom-cv.pdf';
    const component = new ProfileContactComponent(mockContact, customUrl);
    component.mount(container);

    const resumeLink = container.querySelector<HTMLAnchorElement>('a[data-contact-resume]');
    expect(resumeLink).toBeTruthy();
    expect(resumeLink?.getAttribute('href')).toBe(customUrl);
  });

  it('renders flex-1 spacer positioned between email button and resume link', () => {
    const component = new ProfileContactComponent(mockContact);
    component.mount(container);

    const emailBtn = container.querySelector('[data-contact-email]');
    const spacer = container.querySelector('[data-contact-spacer]');
    const resumeLink = container.querySelector('[data-contact-resume]');

    expect(spacer).toBeTruthy();
    expect(spacer?.classList.contains('flex-1')).toBe(true);

    expect(emailBtn).toBeTruthy();
    expect(resumeLink).toBeTruthy();

    // Verify ordering: emailBtn comes before spacer, spacer comes before resumeLink
    const isEmailBeforeSpacer = !!(emailBtn && spacer && (emailBtn.compareDocumentPosition(spacer) & Node.DOCUMENT_POSITION_FOLLOWING));
    const isSpacerBeforeResume = !!(spacer && resumeLink && (spacer.compareDocumentPosition(resumeLink) & Node.DOCUMENT_POSITION_FOLLOWING));

    expect(isEmailBeforeSpacer).toBe(true);
    expect(isSpacerBeforeResume).toBe(true);
  });

  it('cleans up elements and timeout listeners on destroy', () => {
    const component = new ProfileContactComponent(mockContact);
    component.mount(container);
    expect(container.children.length).toBeGreaterThan(0);
    expect(container.querySelector('[data-contact-resume]')).toBeTruthy();
    expect(container.querySelector('[data-contact-spacer]')).toBeTruthy();

    component.destroy();
    expect(container.children.length).toBe(0);
    expect(container.querySelector('[data-contact-resume]')).toBeNull();
    expect(container.querySelector('[data-contact-spacer]')).toBeNull();
  });
});
