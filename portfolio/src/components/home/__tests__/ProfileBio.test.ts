import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfileBio } from '../ProfileBio';
import { ProfileEducationComponent } from '../ProfileEducation';
import { ProfileGlobeComponent } from '../ProfileGlobe';
import type { ProfileData } from '@/domain/types';

// Mock cobe to avoid canvas/WebGL execution during unit testing
vi.mock('cobe', () => {
  return {
    default: vi.fn(() => ({
      update: vi.fn(),
      destroy: vi.fn(),
    })),
  };
});

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
    education: {
      institution: 'Helwan University',
      degree: "Bachelor's in Computer Science",
      period: '2022 – Present',
    },
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  describe('Grid Container Layout', () => {
    it('renders root bento grid with 12-column layout and gap-6', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);

      const root = container.querySelector<HTMLElement>('.profile-summary-section');
      expect(root).toBeTruthy();
      expect(root?.getAttribute('data-bento-bottom-row')).toBe('true');
      expect(root?.className).toContain('w-full');
      expect(root?.className).toContain('grid');
      expect(root?.className).toContain('grid-cols-1');
      expect(root?.className).toContain('md:grid-cols-6');
      expect(root?.className).toContain('lg:grid-cols-12');
      expect(root?.className).toContain('gap-6');
      expect(root?.className).toContain('items-stretch');
    });
  });

  describe('Three-Column Bento Row Architecture and LTR Ordering', () => {
    it('renders Education, Globe, and Summary cards in strict LTR order', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);

      const eduCard = container.querySelector<HTMLElement>('[data-bento-education]');
      const globeCard = container.querySelector<HTMLElement>('[data-bento-globe]');
      const summaryCard = container.querySelector<HTMLElement>('[data-bento-summary]');

      expect(eduCard).toBeTruthy();
      expect(globeCard).toBeTruthy();
      expect(summaryCard).toBeTruthy();

      // Check DOM ordering: Education comes before Globe, Globe comes before Summary
      expect(
        eduCard!.compareDocumentPosition(globeCard!) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(
        globeCard!.compareDocumentPosition(summaryCard!) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it('assigns 3 cols to Education, 3 cols to Globe, and 6 cols to Summary on lg screens', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);

      const eduCard = container.querySelector<HTMLElement>('[data-bento-education]');
      const globeCard = container.querySelector<HTMLElement>('[data-bento-globe]');
      const summaryCard = container.querySelector<HTMLElement>('[data-bento-summary]');

      // Column 1: Education card has md:col-span-6 lg:col-span-3
      expect(eduCard?.className).toContain('md:col-span-6');
      expect(eduCard?.className).toContain('lg:col-span-3');

      // Column 2: Globe card has md:col-span-6 lg:col-span-3
      expect(globeCard?.className).toContain('md:col-span-6');
      expect(globeCard?.className).toContain('lg:col-span-3');

      // Column 3: Summary card has md:col-span-12 lg:col-span-6
      expect(summaryCard?.className).toContain('md:col-span-12');
      expect(summaryCard?.className).toContain('lg:col-span-6');
    });

    it('renders education details inside Education card', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);

      const instEl = container.querySelector('[data-education-institution]');
      const degreeEl = container.querySelector('[data-education-degree]');
      const periodEl = container.querySelector('[data-education-period]');

      expect(instEl?.textContent?.trim()).toBe('Helwan University');
      expect(degreeEl?.textContent?.trim()).toBe("Bachelor's in Computer Science");
      expect(periodEl?.textContent?.trim()).toBe('2022 – Present');
    });

    it('renders globe copy and canvas inside Globe card', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);

      const globeTitle = container.querySelector('[data-globe-title]');
      expect(globeTitle?.textContent).toContain('Cairo');

      const canvas = container.querySelector('canvas[data-globe-canvas]');
      expect(canvas).toBeTruthy();
    });

    it('renders Summary heading, dot badge, and narrative copy inside Summary card', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);

      const heading = container.querySelector('[data-summary-heading]');
      expect(heading?.textContent?.trim().toUpperCase()).toBe('SUMMARY');

      const summaryText = container.querySelector('[data-profile-summary]');
      expect(summaryText?.textContent?.trim()).toBe(mockData.summary);

      // Verify styling of summary card
      const summaryCard = container.querySelector('[data-bento-summary]');
      expect(summaryCard?.className).toContain('rounded-2xl');
      expect(summaryCard?.className).toContain('border-white/10');
      expect(summaryCard?.className).toContain('backdrop-blur-sm');
    });
  });

  describe('Graceful Fallback Handling', () => {
    it('handles undefined education gracefully with fallback values', () => {
      const dataWithoutEdu: ProfileData = {
        ...mockData,
        education: undefined,
      };
      const bio = new ProfileBio(dataWithoutEdu);
      bio.mount(container);

      const instEl = container.querySelector('[data-education-institution]');
      expect(instEl?.textContent?.trim()).toBe('University');
    });
  });

  describe('Lifecycle and Cleanup', () => {
    it('destroys educationComponent, globeComponent, and removes root DOM on destroy', () => {
      const eduDestroySpy = vi.spyOn(ProfileEducationComponent.prototype, 'destroy');
      const globeDestroySpy = vi.spyOn(ProfileGlobeComponent.prototype, 'destroy');

      const bio = new ProfileBio(mockData);
      bio.mount(container);
      expect(container.children.length).toBe(1);

      bio.destroy();

      expect(eduDestroySpy).toHaveBeenCalledTimes(1);
      expect(globeDestroySpy).toHaveBeenCalledTimes(1);
      expect(container.children.length).toBe(0);
      expect(container.querySelector('[data-bento-education]')).toBeNull();
      expect(container.querySelector('[data-bento-globe]')).toBeNull();
      expect(container.querySelector('[data-bento-summary]')).toBeNull();
    });

    it('does not throw when destroy is called without mounting', () => {
      const bio = new ProfileBio(mockData);
      expect(() => bio.destroy()).not.toThrow();
    });

    it('does not throw when destroy is called multiple times', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);
      expect(() => {
        bio.destroy();
        bio.destroy();
      }).not.toThrow();
      expect(container.children.length).toBe(0);
    });

    it('supports remounting cleanly after destroy', () => {
      const bio = new ProfileBio(mockData);
      bio.mount(container);
      expect(container.children.length).toBe(1);

      bio.destroy();
      expect(container.children.length).toBe(0);

      bio.mount(container);
      expect(container.children.length).toBe(1);
      expect(container.querySelector('[data-bento-education]')).toBeTruthy();
      expect(container.querySelector('[data-bento-globe]')).toBeTruthy();
      expect(container.querySelector('[data-bento-summary]')).toBeTruthy();

      bio.destroy();
      expect(container.children.length).toBe(0);
    });
  });
});
