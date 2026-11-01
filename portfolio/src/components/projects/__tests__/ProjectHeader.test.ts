import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectHeader } from '../ProjectHeader';
import type { ProjectDetails } from '@/domain/types';

describe('ProjectHeader Component', () => {
  let container: HTMLElement;
  let mockProject: ProjectDetails;
  let onCloseCalls = 0;
  const onClose = () => {
    onCloseCalls++;
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    onCloseCalls = 0;

    mockProject = {
      id: 'dusk',
      title: 'Dusk',
      subtitle: 'Weather Forecasting Application',
      category: 'Android',
      year: '2025',
      tags: ['Kotlin', 'Jetpack Compose', 'MVVM/MVI', 'Room'],
      description: 'Offline-first weather app.',
      longDescription: 'A deep-dive into Dusk architecture.',
      liveStatus: 'Active Beta',
      links: {
        github: 'https://github.com/ZeiadT/Dusk',
        apk: 'https://github.com/ZeiadT/Dusk/releases',
      },
      media: {
        thumbnail: '/assets/projects/dusk.png',
      },
      accentColor: '#4f46e5',
      metrics: [
        { label: 'Cold Start', value: '< 280ms', detail: 'Macrobenchmark profiles' },
      ],
    };
  });

  afterEach(() => {
    container.remove();
  });

  it('renders project title, subtitle, and accessible headings', () => {
    const header = new ProjectHeader();
    const el = header.render(mockProject, onClose);
    container.appendChild(el);

    const titleEl = el.querySelector('[data-project-title]');
    const subtitleEl = el.querySelector('[data-project-subtitle]');

    expect(titleEl).toBeTruthy();
    expect(titleEl?.textContent?.trim()).toBe('Dusk');
    expect(titleEl?.tagName.toLowerCase()).toMatch(/^h[1-3]$/);

    expect(subtitleEl).toBeTruthy();
    expect(subtitleEl?.textContent?.trim()).toBe('Weather Forecasting Application');
  });

  it('renders category pill with custom accent color styling', () => {
    const header = new ProjectHeader();
    const el = header.render(mockProject, onClose);
    container.appendChild(el);

    const categoryBadge = el.querySelector('[data-category-badge]') as HTMLElement;
    expect(categoryBadge).toBeTruthy();
    expect(categoryBadge.textContent?.trim()).toBe('Android');

    // Accent color should be applied via style or CSS variable
    const styleAttr = categoryBadge.getAttribute('style') || '';
    expect(
      styleAttr.includes('#4f46e5') ||
      categoryBadge.style.color === 'rgb(79, 70, 229)' ||
      categoryBadge.style.borderColor.includes('79, 70, 229')
    ).toBe(true);
  });

  it('renders fallback style for category pill when accentColor is omitted', () => {
    const header = new ProjectHeader();
    const projectWithoutAccent = { ...mockProject, accentColor: undefined };
    const el = header.render(projectWithoutAccent, onClose);
    container.appendChild(el);

    const categoryBadge = el.querySelector('[data-category-badge]');
    expect(categoryBadge).toBeTruthy();
    expect(categoryBadge?.textContent?.trim()).toBe('Android');
  });

  it('renders year badge', () => {
    const header = new ProjectHeader();
    const el = header.render(mockProject, onClose);
    container.appendChild(el);

    const yearBadge = el.querySelector('[data-year-badge]');
    expect(yearBadge).toBeTruthy();
    expect(yearBadge?.textContent?.trim()).toBe('2025');
  });

  it('renders live status beacon with pulsing dot', () => {
    const header = new ProjectHeader();
    const el = header.render(mockProject, onClose);
    container.appendChild(el);

    const beacon = el.querySelector('[data-status-beacon]');
    const dot = el.querySelector('[data-status-dot]');

    expect(beacon).toBeTruthy();
    expect(beacon?.textContent).toContain('Active Beta');
    expect(dot).toBeTruthy();
  });

  it('handles default live status if not explicitly provided', () => {
    const header = new ProjectHeader();
    const projectWithoutStatus = { ...mockProject, liveStatus: undefined };
    const el = header.render(projectWithoutStatus, onClose);
    container.appendChild(el);

    const beacon = el.querySelector('[data-status-beacon]');
    expect(beacon).toBeTruthy();
    expect(beacon?.textContent).toContain('Live');
  });

  it('renders close button with correct accessibility attributes', () => {
    const header = new ProjectHeader();
    const el = header.render(mockProject, onClose);
    container.appendChild(el);

    const closeBtn = el.querySelector('[data-close-button]') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('type')).toBe('button');
    expect(closeBtn.getAttribute('aria-label')).toBe('Close project details');
    expect(closeBtn.querySelector('svg')).toBeTruthy();
  });

  it('invokes onClose callback when close button is clicked', () => {
    const header = new ProjectHeader();
    const el = header.render(mockProject, onClose);
    container.appendChild(el);

    const closeBtn = el.querySelector('[data-close-button]') as HTMLButtonElement;
    expect(onCloseCalls).toBe(0);

    closeBtn.click();
    expect(onCloseCalls).toBe(1);
  });

  it('cleans up event listeners and references on destroy()', () => {
    const header = new ProjectHeader();
    const el = header.render(mockProject, onClose);
    container.appendChild(el);

    const closeBtn = el.querySelector('[data-close-button]') as HTMLButtonElement;

    header.destroy();

    // Clicking close button after destroy must not trigger onClose
    closeBtn.click();
    expect(onCloseCalls).toBe(0);
  });

  it('is safe to call destroy() multiple times or before render()', () => {
    const header = new ProjectHeader();
    expect(() => header.destroy()).not.toThrow();

    header.render(mockProject, onClose);
    expect(() => {
      header.destroy();
      header.destroy();
    }).not.toThrow();
  });

  it('sanitizes HTML content in project fields against XSS', () => {
    const header = new ProjectHeader();
    const maliciousProject: ProjectDetails = {
      ...mockProject,
      title: '<script>alert(1)</script>SafeTitle',
      subtitle: '<img src=x onerror=alert(2)>SafeSubtitle',
    };

    const el = header.render(maliciousProject, onClose);
    container.appendChild(el);

    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('img[onerror]')).toBeNull();
    expect(el.textContent).toContain('SafeTitle');
    expect(el.textContent).toContain('SafeSubtitle');
  });
});
