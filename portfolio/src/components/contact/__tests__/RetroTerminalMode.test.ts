import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RetroTerminalMode } from '../RetroTerminalMode';
import { AudioHaptics } from '../AudioHaptics';

describe('RetroTerminalMode', () => {
  let container: HTMLElement;
  let terminal: RetroTerminalMode;
  let mockHaptics: AudioHaptics;
  let onSwitchToGuiMock: () => void;
  let onSubmitMock: (payload: any) => Promise<void>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockHaptics = new AudioHaptics();
    vi.spyOn(mockHaptics, 'playClick').mockImplementation(() => {});
    vi.spyOn(mockHaptics, 'playKeypress').mockImplementation(() => {});

    onSwitchToGuiMock = vi.fn();
    onSubmitMock = vi.fn().mockResolvedValue(undefined);

    terminal = new RetroTerminalMode({
      audioHaptics: mockHaptics,
      onSwitchToGui: onSwitchToGuiMock,
      onSubmit: onSubmitMock,
    });
  });

  afterEach(() => {
    terminal.destroy();
    mockHaptics.destroy();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('mounts retro CRT terminal with command prompt and banner', () => {
    terminal.mount(container);

    const termEl = container.querySelector('[data-retro-terminal]');
    const inputEl = container.querySelector('[data-terminal-input]') as HTMLInputElement;
    const outputEl = container.querySelector('[data-terminal-output]');

    expect(termEl).not.toBeNull();
    expect(inputEl).not.toBeNull();
    expect(outputEl).not.toBeNull();
    expect(outputEl?.textContent).toContain('TRANSMISSION PROTOCOL');
  });

  it('executes "help" command and renders command catalog', () => {
    terminal.mount(container);

    terminal.executeCommand('help');

    const outputEl = container.querySelector('[data-terminal-output]');
    expect(outputEl?.textContent).toContain('msg send');
    expect(outputEl?.textContent).toContain('cairo');
    expect(outputEl?.textContent).toContain('clear');
    expect(outputEl?.textContent).toContain('gui');
  });

  it('executes "cairo" command and outputs Cairo time info', () => {
    terminal.mount(container);

    terminal.executeCommand('cairo');

    const outputEl = container.querySelector('[data-terminal-output]');
    expect(outputEl?.textContent).toContain('Cairo');
    expect(outputEl?.textContent).toContain('UTC+2');
  });

  it('executes "status" command and outputs system telemetry', () => {
    terminal.mount(container);

    terminal.executeCommand('status');

    const outputEl = container.querySelector('[data-terminal-output]');
    expect(outputEl?.textContent).toContain('ONLINE');
  });

  it('executes "clear" command and wipes terminal history', () => {
    terminal.mount(container);

    terminal.executeCommand('help');
    expect(container.querySelector('[data-terminal-output]')?.textContent?.length).toBeGreaterThan(50);

    terminal.executeCommand('clear');
    const outputEl = container.querySelector('[data-terminal-output]');
    expect(outputEl?.innerHTML.trim()).toBe('');
  });

  it('executes "gui" command and triggers onSwitchToGui callback', () => {
    terminal.mount(container);

    terminal.executeCommand('gui');

    expect(onSwitchToGuiMock).toHaveBeenCalledTimes(1);
  });

  it('executes "msg send <text>" and dispatches payload via onSubmit callback', async () => {
    terminal.mount(container);

    await terminal.executeCommand('msg send "Hello Zeiad from CLI"');

    expect(onSubmitMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Terminal User',
        emailOrHandle: 'terminal@cli.local',
        channel: 'email',
        message: 'Hello Zeiad from CLI',
      })
    );
  });

  it('navigates command history with ArrowUp and ArrowDown keys', () => {
    terminal.mount(container);

    const input = container.querySelector('[data-terminal-input]') as HTMLInputElement;

    terminal.executeCommand('status');
    terminal.executeCommand('cairo');

    // Arrow Up -> should retrieve 'cairo'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(input.value).toBe('cairo');

    // Arrow Up again -> should retrieve 'status'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    expect(input.value).toBe('status');

    // Arrow Down -> should return to 'cairo'
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    expect(input.value).toBe('cairo');
  });

  it('cleans up DOM and listeners cleanly on destroy()', () => {
    terminal.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    terminal.destroy();
    expect(container.children.length).toBe(0);
  });
});
