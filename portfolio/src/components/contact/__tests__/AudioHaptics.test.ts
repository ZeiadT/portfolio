import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioHaptics } from '../AudioHaptics';

describe('AudioHaptics', () => {
  let audioHaptics: AudioHaptics;

  beforeEach(() => {
    audioHaptics = new AudioHaptics();
  });

  afterEach(() => {
    audioHaptics.destroy();
  });

  it('instantiates cleanly without throwing in environments without AudioContext', () => {
    expect(audioHaptics).toBeDefined();
    expect(audioHaptics.isEnabled()).toBe(true);
  });

  it('allows toggling enabled / muted state', () => {
    audioHaptics.setEnabled(false);
    expect(audioHaptics.isEnabled()).toBe(false);

    audioHaptics.setEnabled(true);
    expect(audioHaptics.isEnabled()).toBe(true);
  });

  it('safely handles playClick without crashing when AudioContext is mocked or absent', () => {
    expect(() => audioHaptics.playClick()).not.toThrow();
  });

  it('safely handles playKeypress without crashing', () => {
    expect(() => audioHaptics.playKeypress()).not.toThrow();
  });

  it('safely handles playSwoosh without crashing', () => {
    expect(() => audioHaptics.playSwoosh()).not.toThrow();
  });

  it('safely handles playSuccess without crashing', () => {
    expect(() => audioHaptics.playSuccess()).not.toThrow();
  });

  it('calls AudioContext oscillator and gain nodes when web audio is available', () => {
    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockOscillatorNode = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockAudioContext = {
      state: 'running',
      currentTime: 10,
      destination: {},
      createGain: vi.fn().mockReturnValue(mockGainNode),
      createOscillator: vi.fn().mockReturnValue(mockOscillatorNode),
      createBuffer: vi.fn().mockReturnValue({
        getChannelData: vi.fn().mockReturnValue(new Float32Array(100)),
      }),
      createBufferSource: vi.fn().mockReturnValue({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
      }),
      createBiquadFilter: vi.fn().mockReturnValue({
        type: 'bandpass',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
      resume: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    // Inject mock AudioContext constructor
    (window as any).AudioContext = vi.fn(function () {
      return mockAudioContext;
    });

    const haptics = new AudioHaptics();
    haptics.playClick();

    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockOscillatorNode.start).toHaveBeenCalled();
    expect(mockOscillatorNode.stop).toHaveBeenCalled();

    haptics.playSuccess();
    expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3); // 1 from click, 2 from dual-tone success

    haptics.destroy();
    expect(mockAudioContext.close).toHaveBeenCalled();

    delete (window as any).AudioContext;
  });

  it('does not trigger audio nodes when disabled', () => {
    const mockAudioContext = {
      state: 'running',
      currentTime: 10,
      destination: {},
      createGain: vi.fn(),
      createOscillator: vi.fn(),
      close: vi.fn(),
    };

    (window as any).AudioContext = vi.fn(function () {
      return mockAudioContext;
    });

    const haptics = new AudioHaptics();
    haptics.setEnabled(false);
    haptics.playClick();
    haptics.playSuccess();

    expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();

    haptics.destroy();
    delete (window as any).AudioContext;
  });
});
