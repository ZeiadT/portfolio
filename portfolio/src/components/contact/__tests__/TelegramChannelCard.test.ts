import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TelegramChannelCard, TELEGRAM_PROMPT_CHIPS } from '../TelegramChannelCard';
import { AudioHaptics } from '../AudioHaptics';

describe('TelegramChannelCard', () => {
  let container: HTMLElement;
  let card: TelegramChannelCard;
  let mockHaptics: AudioHaptics;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockHaptics = new AudioHaptics();
    vi.spyOn(mockHaptics, 'playClick').mockImplementation(() => {});

    card = new TelegramChannelCard({
      telegramHandle: 'zeiad_mohammed',
      audioHaptics: mockHaptics,
    });
  });

  afterEach(() => {
    card.destroy();
    mockHaptics.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('renders Telegram handle and direct link button', () => {
    card.mount(container);

    const handleEl = container.querySelector('[data-telegram-handle]');
    const directLink = container.querySelector('a[data-telegram-direct-link]') as HTMLAnchorElement;

    expect(handleEl).not.toBeNull();
    expect(handleEl?.textContent).toContain('@zeiad_mohammed');
    expect(directLink).not.toBeNull();
    expect(directLink.href).toContain('https://t.me/zeiad_mohammed');
    expect(directLink.target).toBe('_blank');
  });

  it('renders preset inquiry chips', () => {
    card.mount(container);

    const chips = container.querySelectorAll('[data-prompt-chip]');
    expect(chips.length).toBe(TELEGRAM_PROMPT_CHIPS.length);

    const labels = Array.from(chips).map((c) => c.textContent?.trim());
    expect(labels.some((l) => l?.includes('Project Inquiry'))).toBe(true);
    expect(labels.some((l) => l?.includes('Job Opportunity'))).toBe(true);
    expect(labels.some((l) => l?.includes('Say Hello'))).toBe(true);
  });

  it('clicking a prompt chip triggers window.open with URL-encoded query and audio click', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    card.mount(container);

    const firstChip = container.querySelector('[data-prompt-chip]') as HTMLButtonElement;
    expect(firstChip).not.toBeNull();

    firstChip.click();

    expect(mockHaptics.playClick).toHaveBeenCalled();
    expect(windowOpenSpy).toHaveBeenCalledTimes(1);

    const [openedUrl, target] = windowOpenSpy.mock.calls[0];
    expect(openedUrl).toContain('https://t.me/zeiad_mohammed?text=');
    expect(target).toBe('_blank');
  });

  it('notifies onChipSelected callback if configured', () => {
    const onSelect = vi.fn();
    const customCard = new TelegramChannelCard({
      telegramHandle: 'zeiad_mohammed',
      onChipSelected: onSelect,
    });

    customCard.mount(container);
    const chip = container.querySelector('[data-prompt-chip]') as HTMLButtonElement;
    chip.click();

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        label: expect.any(String),
        text: expect.any(String),
      })
    );

    customCard.destroy();
  });

  it('cleans up DOM and listeners cleanly on destroy()', () => {
    card.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    card.destroy();
    expect(container.children.length).toBe(0);
  });
});
