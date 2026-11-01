import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioClickSynth } from '../AudioClickSynth';

describe('AudioClickSynth', () => {
  let originalAudioContext: unknown;
  let originalWebkitAudioContext: unknown;

  beforeEach(() => {
    originalAudioContext = (window as unknown as { AudioContext?: unknown }).AudioContext;
    originalWebkitAudioContext = (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;
  });

  afterEach(() => {
    (window as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext;
    (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext = originalWebkitAudioContext;
    vi.restoreAllMocks();
  });

  describe('Fallback & Headless/SSR Safety', () => {
    it('initializes without throwing when window.AudioContext is undefined', () => {
      delete (window as unknown as { AudioContext?: unknown }).AudioContext;
      delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;

      expect(() => new AudioClickSynth()).not.toThrow();
    });

    it('gracefully no-ops playClick() when AudioContext is absent', () => {
      delete (window as unknown as { AudioContext?: unknown }).AudioContext;
      delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;

      const synth = new AudioClickSynth();
      expect(() => synth.playClick()).not.toThrow();
    });

    it('gracefully handles triggerIndexCrossing() when AudioContext is absent', () => {
      delete (window as unknown as { AudioContext?: unknown }).AudioContext;
      delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;

      const synth = new AudioClickSynth();
      expect(() => synth.triggerIndexCrossing(0)).not.toThrow();
      expect(synth.lastIndex).toBe(0);
      expect(() => synth.triggerIndexCrossing(1)).not.toThrow();
      expect(synth.lastIndex).toBe(1);
    });

    it('gracefully handles destroy() when AudioContext is absent', () => {
      delete (window as unknown as { AudioContext?: unknown }).AudioContext;
      delete (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext;

      const synth = new AudioClickSynth();
      expect(() => synth.destroy()).not.toThrow();
    });

    it('handles AudioContext constructor throwing error without uncaught exceptions', () => {
      (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(function () {
        throw new Error('NotAllowedError: AudioContext not allowed to start');
      });

      expect(() => new AudioClickSynth()).not.toThrow();
      const synth = new AudioClickSynth();
      expect(() => synth.playClick()).not.toThrow();
    });
  });

  describe('Web Audio Graph & Synthesis', () => {
    let mockGainParam: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
      value: number;
    };
    let mockFreqParam: {
      setValueAtTime: ReturnType<typeof vi.fn>;
      value: number;
    };
    let mockGainNode: {
      gain: typeof mockGainParam;
      connect: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
    };
    let mockOscillatorNode: {
      type: string;
      frequency: typeof mockFreqParam;
      connect: ReturnType<typeof vi.fn>;
      disconnect: ReturnType<typeof vi.fn>;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
      onended: (() => void) | null;
    };
    let mockContext: {
      state: 'suspended' | 'running' | 'closed';
      currentTime: number;
      destination: object;
      resume: ReturnType<typeof vi.fn>;
      close: ReturnType<typeof vi.fn>;
      createOscillator: ReturnType<typeof vi.fn>;
      createGain: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockGainParam = {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        value: 1,
      };
      mockFreqParam = {
        setValueAtTime: vi.fn(),
        value: 440,
      };
      mockGainNode = {
        gain: mockGainParam,
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      mockOscillatorNode = {
        type: 'sine',
        frequency: mockFreqParam,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        onended: null,
      };
      mockContext = {
        state: 'running',
        currentTime: 10.5,
        destination: {},
        resume: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
        createOscillator: vi.fn().mockReturnValue(mockOscillatorNode),
        createGain: vi.fn().mockReturnValue(mockGainNode),
      };

      (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(function () {
        return mockContext;
      });
    });

    it('synthesizes short oscillator tick with default pitch 1200Hz and exponential decay', () => {
      const synth = new AudioClickSynth();
      synth.playClick();

      expect(mockContext.createOscillator).toHaveBeenCalledTimes(1);
      expect(mockContext.createGain).toHaveBeenCalledTimes(1);

      // Pitch configuration
      expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(1200, 10.5);

      // Gain impulse and exponential decay
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(expect.any(Number), 10.5);
      expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(
        0.001,
        expect.closeTo(10.5 + 0.015, 0.005)
      );

      // Routing
      expect(mockOscillatorNode.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockContext.destination);

      // Timing
      expect(mockOscillatorNode.start).toHaveBeenCalledWith(10.5);
      const stopCallArg = mockOscillatorNode.stop.mock.calls[0][0];
      expect(stopCallArg).toBeGreaterThan(10.5);
    });

    it('respects custom pitch and gain parameters', () => {
      const synth = new AudioClickSynth();
      synth.playClick(850, 0.2);

      expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(850, 10.5);
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.2, 10.5);
    });

    it('safely resumes suspended AudioContext when playing a click', () => {
      mockContext.state = 'suspended';
      const synth = new AudioClickSynth();
      synth.playClick();

      expect(mockContext.resume).toHaveBeenCalledTimes(1);
    });

    it('does not resume context if already running', () => {
      mockContext.state = 'running';
      const synth = new AudioClickSynth();
      synth.playClick();

      expect(mockContext.resume).not.toHaveBeenCalled();
    });

    it('cleans up oscillator and gain nodes on oscillator end', () => {
      const synth = new AudioClickSynth();
      synth.playClick();

      expect(mockOscillatorNode.onended).toBeDefined();
      if (mockOscillatorNode.onended) {
        mockOscillatorNode.onended();
      }

      expect(mockOscillatorNode.disconnect).toHaveBeenCalled();
      expect(mockGainNode.disconnect).toHaveBeenCalled();
    });
  });

  describe('triggerIndexCrossing Logic', () => {
    let playClickSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      playClickSpy = vi.spyOn(AudioClickSynth.prototype, 'playClick');
    });

    it('suppresses audio click on initial mount (when lastIndex === -1)', () => {
      const synth = new AudioClickSynth();
      expect(synth.lastIndex).toBe(-1);

      synth.triggerIndexCrossing(0);
      expect(synth.lastIndex).toBe(0);
      expect(playClickSpy).not.toHaveBeenCalled();
    });

    it('plays click when crossing to a new index after initialization', () => {
      const synth = new AudioClickSynth();
      synth.triggerIndexCrossing(0); // initial setup
      expect(playClickSpy).not.toHaveBeenCalled();

      synth.triggerIndexCrossing(1); // crossing to next
      expect(synth.lastIndex).toBe(1);
      expect(playClickSpy).toHaveBeenCalledTimes(1);

      synth.triggerIndexCrossing(2); // crossing to next again
      expect(synth.lastIndex).toBe(2);
      expect(playClickSpy).toHaveBeenCalledTimes(2);
    });

    it('does not play click if newIndex is identical to lastIndex', () => {
      const synth = new AudioClickSynth();
      synth.triggerIndexCrossing(3); // initial
      expect(playClickSpy).not.toHaveBeenCalled();

      synth.triggerIndexCrossing(3);
      synth.triggerIndexCrossing(3);
      expect(playClickSpy).not.toHaveBeenCalled();
    });

    it('works backwards when scrolling across descending indices', () => {
      const synth = new AudioClickSynth();
      synth.triggerIndexCrossing(5); // initial
      expect(playClickSpy).not.toHaveBeenCalled();

      synth.triggerIndexCrossing(4);
      expect(playClickSpy).toHaveBeenCalledTimes(1);

      synth.triggerIndexCrossing(3);
      expect(playClickSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Enable / Disable State', () => {
    let mockContext: {
      state: string;
      currentTime: number;
      destination: object;
      createOscillator: ReturnType<typeof vi.fn>;
      createGain: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockContext = {
        state: 'running',
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn(),
        createGain: vi.fn(),
      };
      (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(function () {
        return mockContext;
      });
    });

    it('can be initialized as disabled via options', () => {
      const synth = new AudioClickSynth({ enabled: false });
      expect(synth.isEnabled).toBe(false);

      synth.triggerIndexCrossing(0);
      synth.triggerIndexCrossing(1);
      synth.playClick();

      expect(mockContext.createOscillator).not.toHaveBeenCalled();
    });

    it('toggles playback via setEnabled', () => {
      const synth = new AudioClickSynth({ enabled: true });
      expect(synth.isEnabled).toBe(true);

      synth.setEnabled(false);
      expect(synth.isEnabled).toBe(false);

      synth.playClick();
      expect(mockContext.createOscillator).not.toHaveBeenCalled();

      synth.setEnabled(true);
      expect(synth.isEnabled).toBe(true);
    });
  });

  describe('Lifecycle & Teardown (destroy)', () => {
    let mockContext: {
      state: 'running' | 'closed';
      currentTime: number;
      destination: object;
      close: ReturnType<typeof vi.fn>;
      createOscillator: ReturnType<typeof vi.fn>;
      createGain: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockContext = {
        state: 'running',
        currentTime: 0,
        destination: {},
        close: vi.fn().mockResolvedValue(undefined),
        createOscillator: vi.fn(),
        createGain: vi.fn(),
      };
      (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(function () {
        return mockContext;
      });
    });

    it('closes AudioContext on destroy()', () => {
      const synth = new AudioClickSynth();
      synth.destroy();

      expect(mockContext.close).toHaveBeenCalledTimes(1);
    });

    it('disables subsequent clicks and index crossings after destroy()', () => {
      const synth = new AudioClickSynth();
      synth.destroy();

      synth.playClick();
      synth.triggerIndexCrossing(1);

      expect(mockContext.createOscillator).not.toHaveBeenCalled();
    });

    it('handles multiple destroy() calls idempotently without errors', () => {
      const synth = new AudioClickSynth();
      expect(() => {
        synth.destroy();
        synth.destroy();
      }).not.toThrow();

      expect(mockContext.close).toHaveBeenCalledTimes(1);
    });
  });
});
