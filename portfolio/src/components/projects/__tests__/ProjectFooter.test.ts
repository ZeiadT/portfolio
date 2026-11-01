import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectFooter } from '../ProjectFooter';
import type { ProjectLinks } from '@/domain/types';

describe('ProjectFooter Component', () => {
  let container: HTMLElement;
  let footer: ProjectFooter;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    footer = new ProjectFooter();
  });

  afterEach(() => {
    footer.destroy();
    container.remove();
  });

  it('renders a sticky glass action bar container with required styling classes', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/ZeiadT/Dusk',
    };

    const el = footer.render(links);
    container.appendChild(el);

    expect(el.tagName.toLowerCase()).toBe('footer');
    expect(el.hasAttribute('data-project-footer')).toBe(true);

    // Verify key sticky glass styling classes
    expect(el.className).toContain('sticky');
    expect(el.className).toContain('bottom-0');
    expect(el.className).toContain('bg-neutral-950/85');
    expect(el.className).toContain('backdrop-blur-xl');
    expect(el.className).toContain('border-t');
    expect(el.className).toContain('border-white/10');
    expect(el.className).toContain('z-20');
  });

  it('renders primary CTA "View GitHub Repository ↗" with target="_blank" and rel="noopener noreferrer"', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/ZeiadT/Dusk',
    };

    const el = footer.render(links);
    container.appendChild(el);

    const githubBtn = el.querySelector('[data-github-link]') as HTMLAnchorElement;
    expect(githubBtn).toBeTruthy();
    expect(githubBtn.getAttribute('href')).toBe('https://github.com/ZeiadT/Dusk');
    expect(githubBtn.getAttribute('target')).toBe('_blank');
    expect(githubBtn.getAttribute('rel')).toBe('noopener noreferrer');
    expect(githubBtn.textContent).toContain('View GitHub Repository');
    expect(githubBtn.textContent).toContain('↗');

    // Should include SVG icon
    expect(githubBtn.querySelector('svg')).toBeTruthy();
  });

  it('applies custom accent color to primary CTA button when provided', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/ZeiadT/Dusk',
    };
    const accentColor = '#4f46e5';

    const el = footer.render(links, accentColor);
    container.appendChild(el);

    const primaryBtn = el.querySelector('[data-primary-cta]') as HTMLElement;
    expect(primaryBtn).toBeTruthy();
    const styleAttr = primaryBtn.getAttribute('style') || '';
    expect(
      styleAttr.includes('#4f46e5') ||
      primaryBtn.style.backgroundColor.includes('79, 70, 229')
    ).toBe(true);
  });

  it('falls back to default accent styling when accentColor is omitted', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/ZeiadT/Dusk',
    };

    const el = footer.render(links);
    container.appendChild(el);

    const primaryBtn = el.querySelector('[data-primary-cta]') as HTMLElement;
    expect(primaryBtn).toBeTruthy();
    // Should have valid styling applied even without custom accent
    expect(primaryBtn.getAttribute('style') || primaryBtn.className).toBeTruthy();
  });

  it('does not render primary GitHub CTA when links.github is omitted', () => {
    const links: ProjectLinks = {
      live: 'https://cargo-fleet.example.com',
    };

    const el = footer.render(links);
    container.appendChild(el);

    const githubBtn = el.querySelector('[data-github-link]');
    expect(githubBtn).toBeNull();
  });

  it('conditionally renders "Download APK / Run Demo" button when links.apk is present', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/ZeiadT/Dusk',
      apk: 'https://github.com/ZeiadT/Dusk/releases',
    };

    const el = footer.render(links);
    container.appendChild(el);

    const apkBtn = el.querySelector('[data-apk-link]') as HTMLAnchorElement;
    expect(apkBtn).toBeTruthy();
    expect(apkBtn.getAttribute('href')).toBe('https://github.com/ZeiadT/Dusk/releases');
    expect(apkBtn.getAttribute('target')).toBe('_blank');
    expect(apkBtn.getAttribute('rel')).toBe('noopener noreferrer');
    expect(apkBtn.textContent).toContain('Download APK / Run Demo');
    expect(apkBtn.textContent).toContain('↗');
    expect(apkBtn.querySelector('svg')).toBeTruthy();
  });

  it('conditionally renders "Launch Live Demo ↗" when links.live is present', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/Cargo-Org',
      live: 'https://cargo-fleet.azureedge.net',
    };

    const el = footer.render(links);
    container.appendChild(el);

    const liveBtn = el.querySelector('[data-live-link]') as HTMLAnchorElement;
    expect(liveBtn).toBeTruthy();
    expect(liveBtn.getAttribute('href')).toBe('https://cargo-fleet.azureedge.net');
    expect(liveBtn.getAttribute('target')).toBe('_blank');
    expect(liveBtn.getAttribute('rel')).toBe('noopener noreferrer');
    expect(liveBtn.textContent).toContain('Launch Live Demo');
    expect(liveBtn.textContent).toContain('↗');
  });

  it('conditionally renders "Run Demo ↗" when links.demo is present', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/ZeiadT/ElevateEd--Learning_APP',
      demo: 'https://elevated-learn.app',
    };

    const el = footer.render(links);
    container.appendChild(el);

    const demoBtn = el.querySelector('[data-demo-link]') as HTMLAnchorElement;
    expect(demoBtn).toBeTruthy();
    expect(demoBtn.getAttribute('href')).toBe('https://elevated-learn.app');
    expect(demoBtn.getAttribute('target')).toBe('_blank');
    expect(demoBtn.getAttribute('rel')).toBe('noopener noreferrer');
    expect(demoBtn.textContent).toContain('Run Demo');
    expect(demoBtn.textContent).toContain('↗');
  });

  it('does not render secondary CTA when no secondary links are present', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/Sporto-org/Sportx',
    };

    const el = footer.render(links);
    container.appendChild(el);

    const secondaryBtn = el.querySelector('[data-secondary-cta]');
    expect(secondaryBtn).toBeNull();
  });

  it('sanitizes and blocks unsafe URLs (e.g. javascript: pseudo-protocol) against XSS', () => {
    const links: ProjectLinks = {
      github: 'javascript:alert("hacked-github")',
      apk: 'javascript:alert("hacked-apk")',
    };

    const el = footer.render(links);
    container.appendChild(el);

    // Unsafe links must never be rendered as active href anchors
    expect(el.querySelector('a[href^="javascript:"]')).toBeNull();
  });

  it('escapes HTML special characters in link URLs to prevent attribute injection', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/safe/repo?param="><script>alert(1)</script>',
    };

    const el = footer.render(links);
    container.appendChild(el);

    expect(el.querySelector('script')).toBeNull();
  });

  it('cleans up DOM and references on destroy()', () => {
    const links: ProjectLinks = {
      github: 'https://github.com/ZeiadT/Dusk',
    };

    const el = footer.render(links);
    container.appendChild(el);

    expect(container.contains(el)).toBe(true);

    footer.destroy();

    expect(container.contains(el)).toBe(false);
  });

  it('is safe to call destroy() multiple times or before render()', () => {
    expect(() => footer.destroy()).not.toThrow();

    footer.render({ github: 'https://github.com/test' });
    expect(() => {
      footer.destroy();
      footer.destroy();
    }).not.toThrow();
  });

  it('cleans up prior instance when render() is called multiple times', () => {
    const el1 = footer.render({ github: 'https://github.com/repo1' });
    container.appendChild(el1);
    expect(container.contains(el1)).toBe(true);

    const el2 = footer.render({ github: 'https://github.com/repo2' });
    container.appendChild(el2);

    expect(container.contains(el1)).toBe(false);
    expect(container.contains(el2)).toBe(true);
  });

  it('handles empty links object without throwing', () => {
    expect(() => {
      const el = footer.render({});
      container.appendChild(el);
      expect(el).toBeTruthy();
    }).not.toThrow();
  });
});
