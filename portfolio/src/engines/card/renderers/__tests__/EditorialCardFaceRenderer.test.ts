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
    expect(container.classList.contains('p-4')).toBe(true);
    expect(container.classList.contains('sm:p-5')).toBe(true);
  });

  it('renders sleek monoline hairline border frame [data-summon-face-frame] with concentric radius', () => {
    renderer.render(container, mockData, mockTheme);

    const frame = container.querySelector<HTMLElement>('[data-summon-face-frame]');
    expect(frame).not.toBeNull();
    // Concentric radius: outer (24px) - margin (6px) = 18px
    expect(frame?.className).toContain('rounded-[18px]');
  });

  it('renders header with role on left in golden font and stars on right filling position', () => {
    renderer.render(container, mockData, mockTheme);

    const header = container.querySelector<HTMLElement>('[data-summon-face-header]');
    expect(header).not.toBeNull();

    const role = header?.querySelector<HTMLElement>('[data-summon-face-role]');
    expect(role).not.toBeNull();
    expect(role?.textContent).toContain('Android Application Developer');
    expect(role?.className).toContain('text-amber-200');

    // Portfolio edition text should be replaced
    expect(header?.textContent).not.toContain('PORTFOLIO EDITION');

    // Stars should be on the right side
    const stars = header?.querySelector<HTMLElement>('[data-summon-face-stars]');
    expect(stars).not.toBeNull();
    expect(stars?.textContent).toContain('★★★★★');

    // Previous right-side class badge should be removed
    const oldClassBadge = header?.querySelector<HTMLElement>('[data-summon-face-class]');
    expect(oldClassBadge).toBeNull();
  });

  it('renders rectangular duotone portrait window [data-summon-face-portrait-window] with avatar and concentric radius, free of active cairo or kotlin/compose overlays', () => {
    renderer.render(container, mockData, mockTheme);

    const windowEl = container.querySelector<HTMLElement>('[data-summon-face-portrait-window]');
    expect(windowEl).not.toBeNull();
    // Concentric radius: outer (24px) - padding (16px) = 8px
    expect(windowEl?.className).toContain('rounded-[8px]');

    const avatar = windowEl?.querySelector<HTMLImageElement>('[data-summon-face-avatar]');
    expect(avatar).not.toBeNull();
    expect(avatar?.getAttribute('src')).toBe('/profile.jpg');
    expect(avatar?.getAttribute('alt')).toBe('Zeiad Mohammed Profile Portrait');
    expect(avatar?.className).toContain('grayscale');

    // Check overlays are removed
    expect(windowEl?.textContent).not.toContain('ACTIVE // CAIRO');
    expect(windowEl?.textContent).not.toContain('KOTLIN • COMPOSE • MVI');
  });

  it('renders grid-aligned identity with Rare Edition badge next to candidate name', () => {
    renderer.render(container, mockData, mockTheme);

    const lore = container.querySelector<HTMLElement>('[data-summon-face-lore]');
    expect(lore).not.toBeNull();

    const name = lore?.querySelector<HTMLElement>('[data-summon-face-name]');
    expect(name).not.toBeNull();
    expect(name?.textContent).toContain('Zeiad Mohammed');

    const rarityBadge = lore?.querySelector<HTMLElement>('[data-summon-face-rarity-badge]');
    expect(rarityBadge).not.toBeNull();
    expect(rarityBadge?.textContent?.toUpperCase()).toContain('RARE EDITION');

    // Clean Reactive Architecture removed from next to name
    expect(lore?.querySelector('[data-summon-face-skill-title]')).toBeNull();
  });

  it('renders creature-style unique skills related to mobile development and design [data-summon-face-skills]', () => {
    renderer.render(container, mockData, mockTheme);

    const skills = container.querySelector<HTMLElement>('[data-summon-face-skills]');
    expect(skills).not.toBeNull();

    // Creature unique skills
    expect(skills?.textContent).toContain('REACTIVE FLOW');
    expect(skills?.textContent).toContain('[PASSIVE]');
    expect(skills?.textContent).toContain('KMP SYNTHESIS');
    expect(skills?.textContent).toContain('[ACTIVE]');
    expect(skills?.textContent).toContain('KINETIC PRECISION');
    expect(skills?.textContent).toContain('[ULTIMATE]');

    // Old summary description and generic tags must be removed
    expect(container.querySelector('[data-summon-face-skill-desc]')).toBeNull();
    expect(container.querySelector('[data-summon-face-pillars]')).toBeNull();
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

  it('renders accreditation footer [data-summon-face-accreditation]', () => {
    renderer.render(container, mockData, mockTheme);

    const accreditation = container.querySelector<HTMLElement>('[data-summon-face-accreditation]');
    expect(accreditation).not.toBeNull();
    expect(accreditation?.textContent).toContain('ITI');
  });

  it('applies concentric border radius formula across nested containers (inner = outer - padding)', () => {
    renderer.render(container, mockData, mockTheme);

    // Frame: outer 24px - margin 6px = 18px
    const frame = container.querySelector<HTMLElement>('[data-summon-face-frame]');
    expect(frame?.className).toContain('rounded-[18px]');

    // Portrait: outer 24px - padding 16px = 8px
    const portrait = container.querySelector<HTMLElement>('[data-summon-face-portrait-window]');
    expect(portrait?.className).toContain('rounded-[8px]');

    // Stat cards: concentric inner radius
    const stats = container.querySelector<HTMLElement>('[data-summon-face-stats]');
    const statCard = stats?.firstElementChild as HTMLElement;
    expect(statCard?.className).toContain('rounded-[6px]');
  });
});
