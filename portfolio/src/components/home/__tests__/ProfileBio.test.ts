import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileBio } from '../ProfileBio';
import type { ProfileData } from '@/domain/types';

describe('ProfileBio Component', () => {
  let container: HTMLElement;
  const mockData: ProfileData = {
    title: 'Software Developer',
    quote: '“I love turning complex problems into simple, reliable systems that teams can trust.”',
    summary:
      'Dedicated software developer building deterministic, high-performance applications and reliable systems.',
    location: 'Cairo, Egypt',
    contact: {
      phone: '+201019880091',
      phoneFormatted: '+20 1019880091',
      email: 'contact@zeiad.dev',
    },
    links: [],
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

  it('renders Summary heading, narrative paragraph, and core pillars in Bento card', () => {
    const bio = new ProfileBio(mockData);
    bio.mount(container);

    const headingEl = container.querySelector('[data-summary-heading]');
    expect(headingEl).toBeTruthy();
    expect(headingEl?.textContent?.trim()).toBe('Summary');

    const summaryEl = container.querySelector('[data-profile-summary]');
    expect(summaryEl).toBeTruthy();
    expect(summaryEl?.textContent?.trim()).toBe(mockData.summary);

    const pillarEls = container.querySelectorAll('[data-pillar-tag]');
    expect(pillarEls.length).toBe(4);
    expect(pillarEls[0].textContent).toContain('Mobile & Systems Architecture');
    expect(pillarEls[1].textContent).toContain('Deterministic Performance');
  });

  it('cleans up elements on destroy', () => {
    const bio = new ProfileBio(mockData);
    bio.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    bio.destroy();
    expect(container.children.length).toBe(0);
  });
});
