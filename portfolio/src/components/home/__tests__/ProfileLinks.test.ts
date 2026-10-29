import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileLinksComponent } from '../ProfileLinks';
import type { ProfileLink } from '@/domain/types';

describe('ProfileLinksComponent', () => {
  let container: HTMLElement;
  const mockLinks: ProfileLink[] = [
    {
      label: 'GitHub',
      url: 'https://github.com/zeiad-mohammed',
      icon: 'github',
      ariaLabel: 'View GitHub Profile',
    },
    {
      label: 'Codewars',
      url: 'https://www.codewars.com/users/zeiad-mohammed',
      icon: 'codewars',
      ariaLabel: 'View Codewars Profile',
    },
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/zeiad-mohammed',
      icon: 'linkedin',
      ariaLabel: 'View LinkedIn Profile',
    },
  ];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders links with secure attributes and proper labels including LinkedIn', () => {
    const component = new ProfileLinksComponent(mockLinks);
    component.mount(container);

    const linkEls = container.querySelectorAll<HTMLAnchorElement>('[data-profile-link]');
    expect(linkEls.length).toBe(3);

    const githubEl = container.querySelector<HTMLAnchorElement>('[data-profile-link="github"]');
    expect(githubEl).toBeTruthy();
    expect(githubEl?.href).toBe(mockLinks[0].url);
    expect(githubEl?.target).toBe('_blank');
    expect(githubEl?.rel).toContain('noopener');

    const codewarsEl = container.querySelector<HTMLAnchorElement>('[data-profile-link="codewars"]');
    expect(codewarsEl).toBeTruthy();
    expect(codewarsEl?.href).toBe(mockLinks[1].url);
    expect(codewarsEl?.target).toBe('_blank');
    expect(codewarsEl?.rel).toContain('noopener');

    const linkedinEl = container.querySelector<HTMLAnchorElement>('[data-profile-link="linkedin"]');
    expect(linkedinEl).toBeTruthy();
    expect(linkedinEl?.href).toBe(mockLinks[2].url);
    expect(linkedinEl?.target).toBe('_blank');
    expect(linkedinEl?.rel).toContain('noopener');
    expect(linkedinEl?.querySelector('svg')).toBeTruthy();
  });

  it('cleans up elements on destroy', () => {
    const component = new ProfileLinksComponent(mockLinks);
    component.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    component.destroy();
    expect(container.children.length).toBe(0);
  });
});
