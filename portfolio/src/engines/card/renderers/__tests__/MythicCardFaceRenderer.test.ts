import { describe, it, expect, beforeEach } from 'vitest';
import { MythicCardFaceRenderer } from '../MythicCardFaceRenderer';
import type { CardSummonData, CardSummonTheme } from '../../CardSummonEngine';

describe('MythicCardFaceRenderer', () => {
  let renderer: MythicCardFaceRenderer;
  let container: HTMLElement;

  const mockData: CardSummonData = {
    name: 'Zeiad Mohammed',
    rarity: 'MYTHIC RARE',
    stars: 5,
    role: 'Mobile & Frontend Architect',
    imageSrc: '/profile.jpg',
    imageAlt: 'Zeiad Mohammed Profile Portrait',
    skillName: 'Engineered Precision',
    skillDescription: 'Orchestrates zero-overhead 60fps reactive motion',
    stats: {
      perf: 99,
      arch: 98,
      code: 95,
    },
  };

  const mockTheme: CardSummonTheme = {
    primaryColor: '#ff4421',
    coreColor: '#ffffff',
    accentColor: '#ff7700',
  };

  beforeEach(() => {
    renderer = new MythicCardFaceRenderer();
    container = document.createElement('div');
  });

  it('has contract identifier "mythic-rare-tcg"', () => {
    expect(renderer.id).toBe('mythic-rare-tcg');
  });

  it('renders obsidian dark gradient and flex layout classes on the container', () => {
    renderer.render(container, mockData, mockTheme);

    expect(container.classList.contains('bg-gradient-to-b')).toBe(true);
    expect(container.classList.contains('from-[#141419]')).toBe(true);
    expect(container.classList.contains('via-[#0c0c10]')).toBe(true);
    expect(container.classList.contains('to-[#070709]')).toBe(true);
    expect(container.classList.contains('relative')).toBe(true);
    expect(container.classList.contains('flex')).toBe(true);
    expect(container.classList.contains('flex-col')).toBe(true);
    expect(container.classList.contains('justify-between')).toBe(true);
  });

  it('renders multi-layer metallic bevel frame [data-summon-face-frame]', () => {
    renderer.render(container, mockData, mockTheme);

    const frame = container.querySelector<HTMLElement>('[data-summon-face-frame]');
    expect(frame).not.toBeNull();
    expect(frame?.querySelector('svg')).not.toBeNull();
  });

  it('renders header with rarity, stars, and class badge inside [data-summon-face-header]', () => {
    renderer.render(container, mockData, mockTheme);

    const header = container.querySelector<HTMLElement>('[data-summon-face-header]');
    expect(header).not.toBeNull();

    const rarity = header?.querySelector<HTMLElement>('[data-summon-face-rarity]');
    expect(rarity).not.toBeNull();
    expect(rarity?.textContent).toContain('MYTHIC RARE');

    const stars = header?.querySelector<HTMLElement>('[data-summon-face-stars]');
    expect(stars).not.toBeNull();
    expect(stars?.textContent).toContain('★★★★★');

    const classBadge = header?.querySelector<HTMLElement>('[data-summon-face-class]');
    expect(classBadge).not.toBeNull();
    expect(classBadge?.textContent).toContain('Mobile & Frontend Architect');
  });

  it('renders holographic arch portrait window [data-summon-face-portrait-window] with avatar', () => {
    renderer.render(container, mockData, mockTheme);

    const windowEl = container.querySelector<HTMLElement>('[data-summon-face-portrait-window]');
    expect(windowEl).not.toBeNull();
    expect(windowEl?.className).toContain('rounded-t-[40px]');
    expect(windowEl?.className).toContain('rounded-b-xl');

    const avatar = windowEl?.querySelector<HTMLImageElement>('[data-summon-face-avatar]');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('src')).toBe('/profile.jpg');
    expect(avatar?.getAttribute('alt')).toBe('Zeiad Mohammed Profile Portrait');
  });

  it('renders identity and lore block inside [data-summon-face-lore]', () => {
    renderer.render(container, mockData, mockTheme);

    const lore = container.querySelector<HTMLElement>('[data-summon-face-lore]');
    expect(lore).not.toBeNull();

    const name = lore?.querySelector<HTMLElement>('[data-summon-face-name]');
    expect(name).not.toBeNull();
    expect(name?.textContent).toContain('Zeiad Mohammed');

    const skillTitle = lore?.querySelector<HTMLElement>('[data-summon-face-skill-title]');
    expect(skillTitle).not.toBeNull();
    expect(skillTitle?.textContent).toContain('Engineered Precision');

    const skillDesc = lore?.querySelector<HTMLElement>('[data-summon-face-skill-desc]');
    expect(skillDesc).not.toBeNull();
    expect(skillDesc?.textContent).toContain('Orchestrates zero-overhead 60fps reactive motion');
  });

  it('renders attribute tickers for perf, arch, and code inside [data-summon-face-stats]', () => {
    renderer.render(container, mockData, mockTheme);

    const stats = container.querySelector<HTMLElement>('[data-summon-face-stats]');
    expect(stats).not.toBeNull();

    const statPerf = stats?.querySelector<HTMLElement>('[data-summon-stat-perf]');
    expect(statPerf).not.toBeNull();
    expect(statPerf?.textContent).toContain('99');

    const statArch = stats?.querySelector<HTMLElement>('[data-summon-stat-arch]');
    expect(statArch).not.toBeNull();
    expect(statArch?.textContent).toContain('98');

    const statCode = stats?.querySelector<HTMLElement>('[data-summon-stat-code]');
    expect(statCode).not.toBeNull();
    expect(statCode?.textContent).toContain('95');
  });

  it('handles custom data and fallback defaults gracefully', () => {
    const customData: CardSummonData = {
      name: 'Elena Rostova',
      rarity: 'ANCIENT SECRET',
      stars: 3,
      role: 'Core Engine Architect',
      imageSrc: '/custom-avatar.webp',
      imageAlt: 'Custom Avatar',
      skillName: 'Quantum Shaders',
      skillDescription: 'Procedural generation with compute shaders',
    };

    renderer.render(container, customData, {} as CardSummonTheme);

    const rarity = container.querySelector<HTMLElement>('[data-summon-face-rarity]');
    expect(rarity?.textContent).toContain('ANCIENT SECRET');

    const stars = container.querySelector<HTMLElement>('[data-summon-face-stars]');
    expect(stars?.textContent).toContain('★★★');

    const statPerf = container.querySelector<HTMLElement>('[data-summon-stat-perf]');
    expect(statPerf?.textContent).toContain('99'); // fallback default

    const statArch = container.querySelector<HTMLElement>('[data-summon-stat-arch]');
    expect(statArch?.textContent).toContain('98'); // fallback default

    const statCode = container.querySelector<HTMLElement>('[data-summon-stat-code]');
    expect(statCode?.textContent).toContain('95'); // fallback default
  });

  it('cleans up and replaces previous container content upon re-render', () => {
    renderer.render(container, mockData, mockTheme);
    expect(container.querySelectorAll('[data-summon-face-header]').length).toBe(1);

    renderer.render(container, mockData, mockTheme);
    expect(container.querySelectorAll('[data-summon-face-header]').length).toBe(1);
  });
});
