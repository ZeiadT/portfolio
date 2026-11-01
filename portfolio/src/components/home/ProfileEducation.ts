import type { ProfileEducationEntry } from '@/domain/types';

/**
 * Escapes unsafe characters to prevent XSS injection.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * ProfileEducationComponent
 * Renders an isolated editorial bento card presenting educational background,
 * academic degree, and study period with graceful fallbacks.
 */
export class ProfileEducationComponent {
  private education?: ProfileEducationEntry;
  private rootEl: HTMLElement | null = null;

  constructor(education?: ProfileEducationEntry) {
    this.education = education;
  }

  public mount(container: HTMLElement): void {
    if (this.rootEl) {
      this.destroy();
    }

    const institution =
      this.education?.institution?.trim() || 'University';
    const degree =
      this.education?.degree?.trim() || 'Computer Science';
    const period =
      this.education?.period?.trim() || 'Present';

    const root = document.createElement('div');
    root.setAttribute('data-bento-education', 'true');
    root.className =
      'p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-between h-full select-text group/education transition-colors duration-200 hover:border-white/20';

    root.innerHTML = `
      <!-- Header with Graduation Cap Icon Badge -->
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-[#ff4421]/10 text-[#ff4421] flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <span class="uppercase tracking-widest text-xs font-semibold text-[#ff4421]/80">EDUCATION</span>
      </div>

      <!-- Inner Card with Institution, Degree, and Period -->
      <div class="bg-white/[0.03] border border-white/10 rounded-xl p-3.5 sm:p-4 flex flex-col justify-center">
        <div data-education-institution class="text-sm sm:text-base font-bold text-neutral-100 leading-tight">${escapeHtml(institution)}</div>
        <div data-education-degree class="text-xs text-neutral-400 mt-1">${escapeHtml(degree)}</div>
        <span data-education-period class="inline-block text-[11px] font-mono font-medium text-neutral-400 mt-2">${escapeHtml(period)}</span>
      </div>
    `;

    container.appendChild(root);
    this.rootEl = root;
  }

  public destroy(): void {
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
  }
}

export { ProfileEducationComponent as ProfileEducation };
