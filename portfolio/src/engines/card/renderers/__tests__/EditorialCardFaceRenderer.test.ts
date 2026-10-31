import { describe, it, expect, beforeEach } from 'vitest';
import { EditorialCardFaceRenderer } from '../EditorialCardFaceRenderer';
import type { CardSummonData, CardSummonTheme } from '../../CardSummonEngine';

describe('EditorialCardFaceRenderer', () => {
  let renderer: EditorialCardFaceRenderer;
  let container: HTMLElement;

  const mockData: CardSummonData = {
    name: 'Zeiad Mohammed',
    rarity: 'PORTFOLIO EDITION // 2026',
    stars: 5,
    role: 'Android Application Developer',
    imageSrc: '/profile.jpg',
    imageAlt: 'Zeiad Mohammed Profile Portrait',
    skillName: 'Clean Reactive Architecture',
    skillDescription: 'Engineers offline-first Android & KMP platforms with Kotlin Coroutines and Clean Architecture.',
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
    renderer = new EditorialCardFaceRenderer();
    container = document.createElement('div');
  });

  it('has contract identifier "minimalist-editorial-luxury"', () => {
    expect(renderer.id).toBe('minimalist-editorial-luxury');
  });

  it('renders frosted glass luxury container classes on the container', () => {
    renderer.render(container, mockData, mockTheme);

    expect(container.classList.contains('bg-black/90')).toBe(true);
    expect(container.classList.contains('backdrop-blur-2xl')).toBe(true);
    expect(container.classList.contains('border-white/15') || container.classList.contains('border')).toBe(true);
    expect(container.classList.contains('relative')).toBe(true);
    expect(container.classList.contains('flex')).toBe(true);
    expect(container.classList.contains('flex-col')).toBe(true);
    expect(container.classList.contains('justify-between')).toBe(true);
    expect(container.classList.contains('p-3')).toBe(true);
    expect(container.classList.contains('sm:p-3.5')).toBe(true);
  });

  it('renders sleek monoline hairline border frame [data-summon-face-frame]', () => {
    renderer.render(container, mockData, mockTheme);

    const frame = container.querySelector<HTMLElement>('[data-summon-face-frame]');
    expect(frame).not.toBeNull();
    expect(frame?.querySelector('svg') || frame?.className.includes('border')).toBeTruthy();
  });

  it('renders header with edition title, bullet divider, and class badge inside [data-summon-face-header]', () => {
    renderer.render(container, mockData, mockTheme);

    const header = container.querySelector<HTMLElement>('[data-summon-face-header]');
    expect(header).not.toBeNull();

    const rarity = header?.querySelector<HTMLElement>('[data-summon-face-rarity]');
    expect(rarity).not.toBeNull();
    expect(rarity?.textContent).toContain('PORTFOLIO EDITION // 2026');

    const classBadge = header?.querySelector<HTMLElement>('[data-summon-face-class]');
    expect(classBadge).not.toBeNull();
    expect(classBadge?.textContent).toContain('Android Application Developer');
  });

  it('renders rectangular duotone portrait window [data-summon-face-portrait-window] with avatar', () => {
    renderer.render(container, mockData, mockTheme);

    const windowEl = container.querySelector<HTMLElement>('[data-summon-face-portrait-window]');
    expect(windowEl).not.toBeNull();
    expect(windowEl?.className).toContain('aspect-[16/10]');

    const avatar = windowEl?.querySelector<HTMLImageElement>('[data-summon-face-avatar]');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('src')).toBe('/profile.jpg');
    expect(avatar?.getAttribute('alt')).toBe('Zeiad Mohammed Profile Portrait');
    expect(avatar?.className).toContain('grayscale');
  });

  it('renders grid-aligned identity and lore block inside [data-summon-face-lore]', () => {
    renderer.render(container, mockData, mockTheme);

    const lore = container.querySelector<HTMLElement>('[data-summon-face-lore]');
    expect(lore).not.toBeNull();

    const name = lore?.querySelector<HTMLElement>('[data-summon-face-name]');
    expect(name).not.toBeNull();
    expect(name?.textContent).toContain('Zeiad Mohammed');

    const skillTitle = lore?.querySelector<HTMLElement>('[data-summon-face-skill-title]');
    expect(skillTitle).not.toBeNull();
    expect(skillTitle?.textContent).toContain('Clean Reactive Architecture');

    const skillDesc = lore?.querySelector<HTMLElement>('[data-summon-face-skill-desc]');
    expect(skillDesc).not.toBeNull();
    expect(skillDesc?.textContent).toContain('Engineers offline-first Android & KMP');
  });

  it('renders high-contrast monospace attribute stats tickers inside [data-summon-face-stats]', () => {
    renderer.render(container, mockData, mockTheme);

    const stats = container.querySelector<HTMLElement>('[data-summon-face-stats]');
    expect(stats).not.toBeNull();

    const perf = stats?.querySelector<HTMLElement>('[data-summon-stat-perf]');
    expect(perf).not.toBeNull();
    expect(perf?.textContent).toContain('99');

    const arch = stats?.querySelector<HTMLElement>('[data-summon-stat-arch]');
    expect(arch).not.toBeNull();
    expect(arch?.textContent).toContain('98');

    const code = stats?.querySelector<HTMLElement>('[data-summon-stat-code]');
    expect(code).not.toBeNull();
    expect(code?.textContent).toContain('95');
  });

  it('escapes user input strings to prevent XSS injection', () => {
    const maliciousData: CardSummonData = {
      name: '<script>alert("xss")</script>',
      rarity: '<img src=x onerror=alert(1)>',
      stars: 5,
      role: '<b>Hacker</b>',
      imageSrc: 'https://example.com/malicious.jpg',
      imageAlt: '" onmouseover="alert(1)',
      skillName: '<style>body{color:red}</style>',
      skillDescription: '<iframe src="evil.com"></iframe>',
    };

    renderer.render(container, maliciousData, mockTheme);

    expect(container.innerHTML).not.toContain('<script>');
    expect(container.innerHTML).not.toContain('<iframe');
    expect(container.innerHTML).toContain('&lt;script&gt;');
  });

  it('renders core engineering pillar tags [data-summon-face-pillars] and accreditation footer [data-summon-face-accreditation]', () => {
    renderer.render(container, mockData, mockTheme);

    const pillars = container.querySelector<HTMLElement>('[data-summon-face-pillars]');
    expect(pillars).not.toBeNull();
    expect(pillars?.textContent).toContain('Native Android & KMP');

    const accreditation = container.querySelector<HTMLElement>('[data-summon-face-accreditation]');
    expect(accreditation).not.toBeNull();
    expect(accreditation?.textContent).toContain('ITI');
  });

  it('proportionally scales typography and components to fit normal 280-340px dimensions', () => {
    renderer.render(container, mockData, mockTheme);

    const name = container.querySelector<HTMLElement>('[data-summon-face-name]');
    expect(name?.className).toContain('text-sm');
    expect(name?.className).toContain('sm:text-base');

    const pillars = container.querySelector<HTMLElement>('[data-summon-face-pillars]');
    const pillarTags = pillars?.querySelectorAll('span');
    expect(pillarTags && pillarTags.length > 0).toBe(true);
    expect(pillarTags?.[0].className).toContain('text-[7px]');

    const stats = container.querySelector<HTMLElement>('[data-summon-face-stats]');
    const statCards = stats?.children;
    expect(statCards && statCards.length === 3).toBe(true);
    expect(statCards?.[0].className).toContain('p-1');

    const accreditation = container.querySelector<HTMLElement>('[data-summon-face-accreditation]');
    expect(accreditation?.className).toContain('text-[6.5px]');
  });
});
