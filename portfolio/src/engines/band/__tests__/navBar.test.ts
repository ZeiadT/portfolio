import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NavBarController } from '../navBar';
import { NAV_DIMENSIONS } from '../constants';

describe('NavBarController', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'brand-bar';
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('initializes in landing mode by default', () => {
    const nav = new NavBarController({ container });
    expect(nav.getMode()).toBe('landing');
    expect(container.getAttribute('data-bar-mode')).toBe('landing');
    const anchor = container.querySelector('[data-nav-anchor]');
    expect(anchor).toBeTruthy();
    expect(anchor?.classList.contains('invisible')).toBe(true);
  });

  it('calculates correct responsive nav bar height', () => {
    const nav = new NavBarController({ container });
    expect(nav.getNavHeight(1280)).toBe(NAV_DIMENSIONS.desktopHeight);
    expect(nav.getNavHeight(800)).toBe(NAV_DIMENSIONS.mobileHeight);
  });

  it('switches to nav mode and exposes nav cluster and visible logo', () => {
    const nav = new NavBarController({ container });
    nav.setMode('nav');
    expect(nav.getMode()).toBe('nav');
    expect(container.getAttribute('data-bar-mode')).toBe('nav');

    const anchor = container.querySelector('[data-nav-anchor]');
    expect(anchor?.classList.contains('invisible')).toBe(false);

    const cluster = container.querySelector('[data-nav-cluster]');
    expect(cluster).toBeTruthy();
    expect(cluster?.textContent).not.toContain('AVAILABLE');
  });

  it('returns valid geometry for nav logo anchor', () => {
    const nav = new NavBarController({ container });
    const rect = nav.getNavLogoRect();
    expect(rect).toBeDefined();
    expect(typeof rect.top).toBe('number');
    expect(typeof rect.left).toBe('number');
    expect(typeof rect.height).toBe('number');
  });

  it('tracks selected tab with white color and unselected tabs with black color', () => {
    const nav = new NavBarController({ container });
    expect(nav.getSelectedTab()).toBe('home');

    const homeTab = container.querySelector<HTMLElement>('[data-nav-link="home"]');
    const aboutTab = container.querySelector<HTMLElement>('[data-nav-link="about"]');
    const contactTab = container.querySelector<HTMLElement>('[data-nav-link="contact"]');

    expect(homeTab).toBeTruthy();
    expect(homeTab?.textContent?.trim()).toBe('Home');
    expect(homeTab?.getAttribute('data-selected')).toBe('true');
    expect(homeTab?.classList.contains('text-white')).toBe(true);
    expect(homeTab?.classList.contains('text-[#0d0d0d]')).toBe(false);

    expect(aboutTab?.getAttribute('data-selected')).toBe('false');
    expect(aboutTab?.classList.contains('text-[#0d0d0d]')).toBe(true);
    expect(aboutTab?.classList.contains('text-white')).toBe(false);

    expect(contactTab?.getAttribute('data-selected')).toBe('false');
    expect(contactTab?.classList.contains('text-[#0d0d0d]')).toBe(true);
    expect(contactTab?.classList.contains('text-white')).toBe(false);
  });

  it('updates selected tab and colors on setSelectedTab and on click', () => {
    const onNavClick = vi.fn();
    const nav = new NavBarController({ container, onNavClick });

    const aboutTab = container.querySelector<HTMLElement>('[data-nav-link="about"]')!;
    aboutTab.click();

    expect(onNavClick).toHaveBeenCalledWith('about');
    expect(nav.getSelectedTab()).toBe('about');
    expect(aboutTab.getAttribute('data-selected')).toBe('true');
    expect(aboutTab.classList.contains('text-white')).toBe(true);

    const homeTab = container.querySelector<HTMLElement>('[data-nav-link="home"]')!;
    expect(homeTab.getAttribute('data-selected')).toBe('false');
    expect(homeTab.classList.contains('text-[#0d0d0d]')).toBe(true);

    nav.setSelectedTab('contact');
    expect(nav.getSelectedTab()).toBe('contact');
    const contactTab = container.querySelector<HTMLElement>('[data-nav-link="contact"]')!;
    expect(contactTab.getAttribute('data-selected')).toBe('true');
    expect(contactTab.classList.contains('text-white')).toBe(true);
  });

  it('cleans up DOM and listeners on destroy', () => {
    const nav = new NavBarController({ container });
    nav.destroy();
    expect(container.querySelector('[data-nav-anchor]')).toBeNull();
    expect(container.querySelector('[data-nav-cluster]')).toBeNull();
  });
});
