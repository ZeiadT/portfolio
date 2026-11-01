import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectCodeScratchpad } from '../ProjectCodeScratchpad';
import type { CodeSnippet } from '@/domain/types';

describe('ProjectCodeScratchpad Component', () => {
  let container: HTMLElement;
  let sampleSnippet: CodeSnippet;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    sampleSnippet = {
      filename: 'WeatherRepositoryImpl.kt',
      language: 'kotlin',
      code: [
        '@Singleton',
        'class WeatherRepositoryImpl @Inject constructor(',
        '    private val api: WeatherApiService,',
        '    private val cache: WeatherDao',
        ') : WeatherRepository {',
        '    override suspend fun getForecast(city: String): Flow<Resource<Forecast>> = flow {',
        '        emit(Resource.Loading)',
        '        val cached = cache.getForecast(city)',
        '        if (cached != null) emit(Resource.Success(cached))',
        '    }',
        '}',
      ].join('\n'),
      description: 'Repository implementation showcasing offline-first caching with Kotlin Flow.',
    };
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  describe('Rendering & Structure', () => {
    it('renders the root container with appropriate data attributes and role', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      expect(el).toBeTruthy();
      expect(el.getAttribute('data-project-code-scratchpad')).toBe('true');
      expect(el.getAttribute('role')).toBe('region');
      expect(el.getAttribute('aria-label')).toBe('Code snippet: WeatherRepositoryImpl.kt');
    });

    it('renders the header with filename, language badge, and description', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const filenameEl = el.querySelector('[data-code-filename]');
      expect(filenameEl).toBeTruthy();
      expect(filenameEl?.textContent?.trim()).toBe('WeatherRepositoryImpl.kt');

      const languageBadge = el.querySelector('[data-code-language]');
      expect(languageBadge).toBeTruthy();
      expect(languageBadge?.textContent?.trim().toLowerCase()).toBe('kotlin');

      const descEl = el.querySelector('[data-code-description]');
      expect(descEl).toBeTruthy();
      expect(descEl?.textContent?.trim()).toBe(
        'Repository implementation showcasing offline-first caching with Kotlin Flow.'
      );
    });

    it('omits description container when description is not provided', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render({
        filename: 'Simple.swift',
        language: 'swift',
        code: 'let answer = 42',
      });
      container.appendChild(el);

      const descEl = el.querySelector('[data-code-description]');
      expect(descEl).toBeNull();
      expect(el.textContent).not.toContain('undefined');
    });

    it('renders gutter line numbers matching the code line count', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const gutter = el.querySelector('[data-code-gutter]');
      expect(gutter).toBeTruthy();

      const lineNumbers = gutter?.querySelectorAll('[data-line-number]');
      expect(lineNumbers).toHaveLength(11);
      expect(lineNumbers?.[0].textContent?.trim()).toBe('1');
      expect(lineNumbers?.[10].textContent?.trim()).toBe('11');
    });

    it('renders tokenized code with syntax highlighting spans', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const codeContainer = el.querySelector('[data-code-content]');
      expect(codeContainer).toBeTruthy();

      // Check for syntax tokenized classes from codeTokenizer
      const keywords = codeContainer?.querySelectorAll('.text-sky-400');
      expect(keywords && keywords.length > 0).toBe(true);

      const annotations = codeContainer?.querySelectorAll('.text-amber-400');
      expect(annotations && annotations.length > 0).toBe(true);
    });

    it('escapes raw HTML in filename and description to prevent XSS', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render({
        filename: '<script>alert("hack")</script>.kt',
        language: 'kotlin',
        code: 'val x = 1',
        description: '<b>Malicious</b> note & details',
      });
      container.appendChild(el);

      expect(el.innerHTML).not.toContain('<script>alert');
      expect(el.innerHTML).toContain('&lt;script&gt;');
      expect(el.innerHTML).not.toContain('<b>Malicious</b>');
      expect(el.innerHTML).toContain('&lt;b&gt;Malicious&lt;/b&gt;');
    });

    it('handles empty code gracefully without crashing', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render({
        filename: 'Empty.kt',
        language: 'kotlin',
        code: '',
      });
      container.appendChild(el);

      const gutter = el.querySelector('[data-code-gutter]');
      const codeContent = el.querySelector('[data-code-content]');
      expect(gutter).toBeTruthy();
      expect(codeContent).toBeTruthy();
    });
  });

  describe('Collapsible Drawer', () => {
    it('is expanded by default with aria-expanded="true"', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const toggleBtn = el.querySelector('[data-code-toggle]') as HTMLButtonElement;
      const codeBody = el.querySelector('[data-code-body]') as HTMLElement;

      expect(toggleBtn).toBeTruthy();
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
      expect(codeBody.classList.contains('hidden')).toBe(false);
    });

    it('collapses code container and updates aria-expanded to "false" when clicked', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const toggleBtn = el.querySelector('[data-code-toggle]') as HTMLButtonElement;
      const codeBody = el.querySelector('[data-code-body]') as HTMLElement;

      toggleBtn.click();

      expect(toggleBtn.getAttribute('aria-expanded')).toBe('false');
      expect(codeBody.classList.contains('hidden')).toBe(true);

      // Click again to expand
      toggleBtn.click();
      expect(toggleBtn.getAttribute('aria-expanded')).toBe('true');
      expect(codeBody.classList.contains('hidden')).toBe(false);
    });

    it('toggles chevron rotation class on expand/collapse', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const toggleBtn = el.querySelector('[data-code-toggle]') as HTMLButtonElement;
      const chevron = toggleBtn.querySelector('[data-chevron-icon]') as HTMLElement;

      expect(chevron).toBeTruthy();
      expect(chevron.classList.contains('rotate-180')).toBe(true);

      toggleBtn.click();
      expect(chevron.classList.contains('rotate-180')).toBe(false);

      toggleBtn.click();
      expect(chevron.classList.contains('rotate-180')).toBe(true);
    });
  });

  describe('Copy to Clipboard Action', () => {
    let originalClipboard: PropertyDescriptor | undefined;

    const flushPromises = async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    };

    beforeEach(() => {
      vi.useFakeTimers();
      originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    });

    afterEach(() => {
      vi.useRealTimers();
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      }
    });

    it('copies raw snippet code to clipboard using navigator.clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const copyBtn = el.querySelector('[data-code-copy]') as HTMLButtonElement;
      expect(copyBtn).toBeTruthy();

      copyBtn.click();
      await flushPromises();

      expect(writeTextMock).toHaveBeenCalledWith(sampleSnippet.code);
    });

    it('displays "Copied! ✓" and emerald styling upon successful copy', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const copyBtn = el.querySelector('[data-code-copy]') as HTMLButtonElement;
      const copyLabel = copyBtn.querySelector('[data-copy-label]') as HTMLElement;

      expect(copyLabel.textContent?.trim()).toBe('Copy');

      copyBtn.click();
      await flushPromises();

      expect(copyLabel.textContent?.trim()).toBe('Copied! ✓');
      expect(copyBtn.classList.contains('text-emerald-400')).toBe(true);
    });

    it('auto-reverts to "Copy" state after 2000ms', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const copyBtn = el.querySelector('[data-code-copy]') as HTMLButtonElement;
      const copyLabel = copyBtn.querySelector('[data-copy-label]') as HTMLElement;

      copyBtn.click();
      await flushPromises();
      expect(copyLabel.textContent?.trim()).toBe('Copied! ✓');

      // Fast-forward 1999ms: still copied
      vi.advanceTimersByTime(1999);
      expect(copyLabel.textContent?.trim()).toBe('Copied! ✓');

      // Fast-forward past 2000ms: reverted
      vi.advanceTimersByTime(2);
      expect(copyLabel.textContent?.trim()).toBe('Copy');
      expect(copyBtn.classList.contains('text-emerald-400')).toBe(false);
    });

    it('resets auto-revert timer on rapid consecutive clicks', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const copyBtn = el.querySelector('[data-code-copy]') as HTMLButtonElement;
      const copyLabel = copyBtn.querySelector('[data-copy-label]') as HTMLElement;

      copyBtn.click();
      await flushPromises();
      expect(copyLabel.textContent?.trim()).toBe('Copied! ✓');

      // Advance 1500ms
      vi.advanceTimersByTime(1500);
      expect(copyLabel.textContent?.trim()).toBe('Copied! ✓');

      // Click again, resetting the timer
      copyBtn.click();
      await flushPromises();

      // Advance another 1000ms (2500ms total from start): should still be copied!
      vi.advanceTimersByTime(1000);
      expect(copyLabel.textContent?.trim()).toBe('Copied! ✓');

      // Advance remaining 1001ms: now reverted
      vi.advanceTimersByTime(1001);
      expect(copyLabel.textContent?.trim()).toBe('Copy');
    });

    it('falls back gracefully to document.execCommand if clipboard.writeText fails', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
        },
        configurable: true,
        writable: true,
      });

      const execCommandMock = vi.fn().mockReturnValue(true);
      (document as unknown as { execCommand: (cmd: string) => boolean }).execCommand = execCommandMock;

      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const copyBtn = el.querySelector('[data-code-copy]') as HTMLButtonElement;
      const copyLabel = copyBtn.querySelector('[data-copy-label]') as HTMLElement;

      copyBtn.click();
      await flushPromises();

      expect(execCommandMock).toHaveBeenCalledWith('copy');
      expect(copyLabel.textContent?.trim()).toBe('Copied! ✓');
    });
  });

  describe('Lifecycle & Cleanup', () => {
    let originalClipboard: PropertyDescriptor | undefined;

    beforeEach(() => {
      vi.useFakeTimers();
      originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    });

    afterEach(() => {
      vi.useRealTimers();
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      }
    });

    it('clears active copy timer on destroy()', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      const copyBtn = el.querySelector('[data-code-copy]') as HTMLButtonElement;
      await copyBtn.click();

      // Call destroy while timer is active
      scratchpad.destroy();

      // Advancing timer should not throw or cause errors
      expect(() => {
        vi.advanceTimersByTime(2500);
      }).not.toThrow();
    });

    it('removes DOM elements and event listeners on destroy()', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el = scratchpad.render(sampleSnippet);
      container.appendChild(el);

      expect(container.contains(el)).toBe(true);

      scratchpad.destroy();

      expect(container.contains(el)).toBe(false);
    });

    it('supports multiple sequential calls to destroy() without error', () => {
      const scratchpad = new ProjectCodeScratchpad();
      scratchpad.render(sampleSnippet);

      expect(() => {
        scratchpad.destroy();
        scratchpad.destroy();
      }).not.toThrow();
    });

    it('cleans up previous instance when render() is called again', () => {
      const scratchpad = new ProjectCodeScratchpad();
      const el1 = scratchpad.render(sampleSnippet);
      container.appendChild(el1);

      const secondSnippet: CodeSnippet = {
        filename: 'Second.swift',
        language: 'swift',
        code: 'let b = 2',
      };

      const el2 = scratchpad.render(secondSnippet);
      container.appendChild(el2);

      // el1 should have been removed from DOM in render's internal destroy()
      expect(container.contains(el1)).toBe(false);
      expect(container.contains(el2)).toBe(true);
      expect(el2.querySelector('[data-code-filename]')?.textContent?.trim()).toBe('Second.swift');
    });
  });
});
