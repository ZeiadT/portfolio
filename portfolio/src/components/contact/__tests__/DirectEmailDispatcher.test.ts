import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DirectEmailDispatcher } from '../DirectEmailDispatcher';
import { AudioHaptics } from '../AudioHaptics';

describe('DirectEmailDispatcher', () => {
  let container: HTMLElement;
  let dispatcher: DirectEmailDispatcher;
  let mockHaptics: AudioHaptics;
  let onSubmitMock: (payload: any) => Promise<void>;
  let onToggleTerminalMock: () => void;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockHaptics = new AudioHaptics();
    vi.spyOn(mockHaptics, 'playClick').mockImplementation(() => {});
    vi.spyOn(mockHaptics, 'playKeypress').mockImplementation(() => {});

    onSubmitMock = vi.fn().mockResolvedValue(undefined);
    onToggleTerminalMock = vi.fn();

    dispatcher = new DirectEmailDispatcher({
      audioHaptics: mockHaptics,
      onSubmit: onSubmitMock,
      onToggleTerminal: onToggleTerminalMock,
    });
  });

  afterEach(() => {
    dispatcher.destroy();
    mockHaptics.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('mounts form with name, email, message textarea, and character counter', () => {
    dispatcher.mount(container);

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[name="emailOrHandle"]') as HTMLInputElement;
    const messageInput = container.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    const charCounter = container.querySelector('[data-char-counter]');
    const submitBtn = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(nameInput).not.toBeNull();
    expect(emailInput).not.toBeNull();
    expect(messageInput).not.toBeNull();
    expect(charCounter).not.toBeNull();
    expect(charCounter?.textContent).toContain('0 / 1000');
    expect(submitBtn).not.toBeNull();
  });

  it('updates character counter dynamically as user types', () => {
    dispatcher.mount(container);

    const messageInput = container.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    const charCounter = container.querySelector('[data-char-counter]');

    messageInput.value = 'Hello Zeiad!';
    messageInput.dispatchEvent(new Event('input'));

    expect(charCounter?.textContent).toContain('12 / 1000');
    expect(mockHaptics.playKeypress).toHaveBeenCalled();
  });

  it('displays inline validation errors when submitting invalid empty form', async () => {
    dispatcher.mount(container);

    const form = container.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(onSubmitMock).not.toHaveBeenCalled();

    const nameError = container.querySelector('[data-error-name]');
    const emailError = container.querySelector('[data-error-email]');
    const messageError = container.querySelector('[data-error-message]');

    expect(nameError?.textContent?.length).toBeGreaterThan(0);
    expect(emailError?.textContent?.length).toBeGreaterThan(0);
    expect(messageError?.textContent?.length).toBeGreaterThan(0);
  });

  it('submits valid form and invokes onSubmit callback', async () => {
    dispatcher.mount(container);

    const nameInput = container.querySelector('input[name="name"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[name="emailOrHandle"]') as HTMLInputElement;
    const messageInput = container.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
    const form = container.querySelector('form') as HTMLFormElement;

    nameInput.value = 'John Doe';
    nameInput.dispatchEvent(new Event('input'));

    emailInput.value = 'john@example.com';
    emailInput.dispatchEvent(new Event('input'));

    messageInput.value = 'Great work on the mobile apps!';
    messageInput.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit', { cancelable: true }));

    expect(mockHaptics.playClick).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'John Doe',
        emailOrHandle: 'john@example.com',
        channel: 'email',
        message: 'Great work on the mobile apps!',
      })
    );
  });

  it('triggers onToggleTerminal callback when terminal toggle button is clicked', () => {
    dispatcher.mount(container);

    const terminalToggle = container.querySelector('[data-terminal-toggle]') as HTMLButtonElement;
    expect(terminalToggle).not.toBeNull();

    terminalToggle.click();

    expect(mockHaptics.playClick).toHaveBeenCalled();
    expect(onToggleTerminalMock).toHaveBeenCalledTimes(1);
  });

  it('cleans up DOM and listeners cleanly on destroy()', () => {
    dispatcher.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    dispatcher.destroy();
    expect(container.children.length).toBe(0);
  });
});
