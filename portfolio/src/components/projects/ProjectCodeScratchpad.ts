import type { CodeSnippet } from '@/domain/types';
import { tokenizeCode } from '@/utils/codeTokenizer';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getLanguageBadgeStyle(language: string): string {
  const lang = language ? language.toLowerCase().trim() : '';
  switch (lang) {
    case 'kotlin':
    case 'kt':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'swift':
      return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'dart':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    case 'csharp':
    case 'cs':
    case 'c#':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-white/5 text-neutral-400 border-white/10';
  }
}

let instanceCounter = 0;

/**
 * ProjectCodeScratchpad Component
 * Renders an isolated collapsible code playground card with syntax highlighting,
 * line numbers gutter, and copy-to-clipboard action with visual feedback.
 */
export class ProjectCodeScratchpad {
  private rootEl: HTMLElement | null = null;
  private copyBtn: HTMLButtonElement | null = null;
  private copyLabel: HTMLElement | null = null;
  private toggleBtn: HTMLButtonElement | null = null;
  private chevronEl: HTMLElement | null = null;
  private codeBodyEl: HTMLElement | null = null;

  private copyHandler: (() => void) | null = null;
  private toggleHandler: (() => void) | null = null;
  private copyTimeoutId: number | null = null;
  private isExpanded: boolean = true;

  public render(snippet: CodeSnippet): HTMLElement {
    this.destroy();

    const instanceId = ++instanceCounter;
    const bodyId = `code-body-${instanceId}`;
    this.isExpanded = true;

    const root = document.createElement('section');
    root.setAttribute('data-project-code-scratchpad', 'true');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', `Code snippet: ${snippet.filename || 'Snippet'}`);
    root.className =
      'w-full rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.25)] select-text';

    const rawCode = snippet.code || '';
    const lines = rawCode ? rawCode.split('\n') : [];
    const tokenizedHtml = tokenizeCode(rawCode, snippet.language);
    const badgeStyle = getLanguageBadgeStyle(snippet.language);

    const descriptionHtml = snippet.description
      ? `<div data-code-description class="px-4 py-2.5 text-xs text-neutral-400 font-sans border-b border-white/[0.06] bg-white/[0.01] leading-relaxed">${escapeHtml(
          snippet.description
        )}</div>`
      : '';

    const gutterLinesHtml = lines
      .map(
        (_, idx) =>
          `<span data-line-number="${idx + 1}" class="tabular-nums">${idx + 1}</span>`
      )
      .join('');

    root.innerHTML = `
      <!-- Header Toolbar -->
      <div class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
        <!-- File Info & Language Badge -->
        <div class="flex items-center gap-2.5 min-w-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-neutral-500 shrink-0"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>

          <span
            data-code-filename
            class="font-mono text-xs sm:text-sm font-semibold text-neutral-200 tracking-tight truncate"
          >
            ${escapeHtml(snippet.filename || 'Snippet')}
          </span>

          <span
            data-code-language
            class="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-medium tracking-wider uppercase border select-none ${badgeStyle}"
          >
            ${escapeHtml(snippet.language)}
          </span>
        </div>

        <!-- Controls (Copy & Expand/Collapse) -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Copy Button -->
          <button
            type="button"
            data-code-copy
            aria-label="Copy code to clipboard"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421]"
          >
            <svg
              data-copy-icon
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span data-copy-label>Copy</span>
          </button>

          <!-- Collapsible Toggle -->
          <button
            type="button"
            data-code-toggle
            aria-expanded="true"
            aria-controls="${bodyId}"
            aria-label="Toggle code scratchpad"
            class="inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421]"
          >
            <svg
              data-chevron-icon
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="transition-transform duration-200 rotate-180"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Optional Explanation Note -->
      ${descriptionHtml}

      <!-- Code Drawer Body -->
      <div id="${bodyId}" data-code-body class="w-full transition-all duration-200">
        <div class="flex bg-black/40 text-left font-mono text-xs leading-6 overflow-hidden">
          <!-- Line Numbers Gutter -->
          <div
            data-code-gutter
            class="flex flex-col select-none text-right py-3 pl-3 pr-3 sm:pl-4 sm:pr-4 text-neutral-600 border-r border-white/5 shrink-0"
            aria-hidden="true"
          >
            ${gutterLinesHtml}
          </div>

          <!-- Code Content Area -->
          <div
            data-code-content
            class="flex-1 py-3 px-3 sm:px-4 overflow-x-auto whitespace-pre font-mono text-xs leading-6 text-neutral-200 selection:bg-white/20"
          >
            <pre class="font-mono text-xs leading-6 p-0 m-0"><code>${tokenizedHtml}</code></pre>
          </div>
        </div>
      </div>
    `;

    this.rootEl = root;
    this.copyBtn = root.querySelector('[data-code-copy]');
    this.copyLabel = root.querySelector('[data-copy-label]');
    this.toggleBtn = root.querySelector('[data-code-toggle]');
    this.chevronEl = root.querySelector('[data-chevron-icon]');
    this.codeBodyEl = root.querySelector('[data-code-body]');

    this.setupListeners(rawCode);

    return root;
  }

  private setupListeners(code: string): void {
    if (this.copyBtn) {
      this.copyHandler = () => {
        void this.handleCopy(code);
      };
      this.copyBtn.addEventListener('click', this.copyHandler);
    }

    if (this.toggleBtn) {
      this.toggleHandler = () => {
        this.handleToggle();
      };
      this.toggleBtn.addEventListener('click', this.toggleHandler);
    }
  }

  private handleToggle(): void {
    this.isExpanded = !this.isExpanded;
    if (!this.toggleBtn || !this.codeBodyEl) return;

    this.toggleBtn.setAttribute('aria-expanded', String(this.isExpanded));
    if (this.isExpanded) {
      this.codeBodyEl.classList.remove('hidden');
      this.chevronEl?.classList.add('rotate-180');
    } else {
      this.codeBodyEl.classList.add('hidden');
      this.chevronEl?.classList.remove('rotate-180');
    }
  }

  private async handleCopy(code: string): Promise<void> {
    const success = await this.copyText(code);
    if (!success || !this.copyBtn || !this.copyLabel) return;

    if (this.copyTimeoutId !== null) {
      window.clearTimeout(this.copyTimeoutId);
      this.copyTimeoutId = null;
    }

    this.setCopyButtonState(true);

    this.copyTimeoutId = window.setTimeout(() => {
      this.setCopyButtonState(false);
      this.copyTimeoutId = null;
    }, 2000);
  }

  private setCopyButtonState(copied: boolean): void {
    if (!this.copyBtn || !this.copyLabel) return;

    if (copied) {
      this.copyLabel.textContent = 'Copied! ✓';
      this.copyBtn.classList.add('text-emerald-400', 'border-emerald-500/40', 'bg-emerald-500/10');
      this.copyBtn.classList.remove('text-neutral-400', 'hover:text-white');
    } else {
      this.copyLabel.textContent = 'Copy';
      this.copyBtn.classList.remove('text-emerald-400', 'border-emerald-500/40', 'bg-emerald-500/10');
      this.copyBtn.classList.add('text-neutral-400', 'hover:text-white');
    }
  }

  private async copyText(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back below
      }
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      textarea.remove();
      return success;
    } catch {
      return false;
    }
  }

  public destroy(): void {
    if (this.copyTimeoutId !== null) {
      window.clearTimeout(this.copyTimeoutId);
      this.copyTimeoutId = null;
    }

    if (this.copyBtn && this.copyHandler) {
      this.copyBtn.removeEventListener('click', this.copyHandler);
      this.copyHandler = null;
    }

    if (this.toggleBtn && this.toggleHandler) {
      this.toggleBtn.removeEventListener('click', this.toggleHandler);
      this.toggleHandler = null;
    }

    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }

    this.copyBtn = null;
    this.copyLabel = null;
    this.toggleBtn = null;
    this.chevronEl = null;
    this.codeBodyEl = null;
  }
}
