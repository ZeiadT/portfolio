import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfileHeader } from '../ProfileHeader';
import { CardSummonEngine } from '@/engines/card/CardSummonEngine';
import type { ProfileData } from '@/domain/types';

describe('ProfileHeader Component', () => {
  let container: HTMLElement;
  const mockData: ProfileData = {
    title: 'Mobile Developer',
    quote: '“I love turning complex problems into simple, reliable systems that teams can trust.”',
    summary:
      'Dedicated software developer building deterministic, high-performance applications and reliable systems.',
    location: 'Cairo, Egypt',
    contact: {
      phone: '+201019880091',
      phoneFormatted: '+20 1019880091',
      email: 'contact@zeiad.dev',
    },
    links: [
      {
        label: 'GitHub',
        url: 'https://github.com/zeiad-mohammed',
        icon: 'github',
      },
      {
        label: 'Codewars',
        url: 'https://www.codewars.com/users/zeiad-mohammed',
        icon: 'codewars',
      },
      {
        label: 'LinkedIn',
        url: 'https://linkedin.com/in/zeiad-mohammed',
        icon: 'linkedin',
      },
    ],
    avatar: {
      src: '/profile.jpg',
      alt: 'Portrait',
      fallbackInitials: 'ZM',
    },
    pillars: [
      'Mobile & Systems Architecture',
      'Deterministic Performance',
      'Kinetic Motion & WebGL',
      'Clean Architecture & TDD',
    ],
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('mounts Bento Grid layout with Hero Card 1, Hero Card 2, and Bottom Summary Card', () => {
    const header = new ProfileHeader(mockData);
    header.mount(container);

    expect(container.querySelector('.profile-header-root')).toBeTruthy();
    expect(container.querySelector('[data-bento-hero-left]')).toBeTruthy();
    expect(container.querySelector('[data-bento-hero-right]')).toBeTruthy();
    expect(container.querySelector('.profile-links')).toBeTruthy();
    expect(container.querySelector('.profile-quote-section')).toBeTruthy();
    expect(container.querySelector('.profile-avatar')).toBeTruthy();
    expect(container.querySelector('.profile-summary-section')).toBeTruthy();

    // Check title in avatar card
    const titleEl = container.querySelector('[data-avatar-title]');
    expect(titleEl?.textContent?.trim().toUpperCase()).toContain('MOBILE DEVELOPER');

    // Contact channels in Hero Card 1
    const contactPhoneBtn = container.querySelector('button[data-contact-phone]');
    expect(contactPhoneBtn).toBeTruthy();
    expect(contactPhoneBtn?.textContent).toContain('+20 1019880091');

    const contactEmailBtn = container.querySelector('button[data-contact-email]');
    expect(contactEmailBtn).toBeTruthy();

    const contactResumeLink = container.querySelector('a[data-contact-resume]');
    expect(contactResumeLink).toBeTruthy();
    expect(contactResumeLink?.getAttribute('href')).toBe('/resume.pdf');
    expect(container.querySelector('[data-contact-spacer]')).toBeTruthy();

    // Confirm no phone elements under portrait card
    expect(container.querySelector('[data-avatar-phone]')).toBeNull();
    expect(container.querySelector('[data-phone-copy]')).toBeNull();

    const summaryHeading = container.querySelector('[data-summary-heading]');
    expect(summaryHeading?.textContent?.trim()).toBe('Summary');

    const pillarEls = container.querySelectorAll('[data-pillar-tag]');
    expect(pillarEls.length).toBe(4);
  });

  it('cleans up all subcomponents and DOM on destroy', () => {
    const header = new ProfileHeader(mockData);
    header.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    header.destroy();
    expect(container.children.length).toBe(0);
  });

  it('passes custom resumeUrl to ProfileContactComponent if defined', () => {
    const customHeader = new ProfileHeader({
      ...mockData,
      resumeUrl: 'https://example.com/custom-resume.pdf',
    });
    customHeader.mount(container);

    const resumeLink = container.querySelector('a[data-contact-resume]');
    expect(resumeLink?.getAttribute('href')).toBe('https://example.com/custom-resume.pdf');

    customHeader.destroy();
  });

  it('opens CardSummonEngine when avatar card is clicked and cleans it up on destroy', () => {
    const openSpy = vi.spyOn(CardSummonEngine.prototype, 'open');
    const destroySpy = vi.spyOn(CardSummonEngine.prototype, 'destroy');

    const header = new ProfileHeader(mockData);
    header.mount(container);

    const avatarCard = container.querySelector<HTMLElement>('[data-avatar-card]');
    expect(avatarCard).toBeTruthy();

    avatarCard?.click();

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-card-summon-modal]')).toBeTruthy();

    header.destroy();

    expect(destroySpy).toHaveBeenCalled();
    expect(document.querySelector('[data-card-summon-modal]')).toBeNull();

    openSpy.mockRestore();
    destroySpy.mockRestore();
  });
});
