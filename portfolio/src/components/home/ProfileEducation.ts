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
  private educationList: ProfileEducationEntry[];
  private rootEl: HTMLElement | null = null;

  constructor(education?: ProfileEducationEntry | ProfileEducationEntry[]) {
    if (!education) {
      this.educationList = [
        {
          institution: 'University',
          degree: 'Computer Science',
          period: 'Present',
        },
      ];
    } else if (Array.isArray(education)) {
      if (education.length === 0) {
        this.educationList = [
          {
            institution: 'University',
            degree: 'Computer Science',
            period: 'Present',
          },
        ];
      } else {
        this.educationList = education;
      }
    } else {
      this.educationList = [education];
    }
  }

  public mount(container: HTMLElement): void {
    if (this.rootEl) {
      this.destroy();
    }

    const root = document.createElement('div');
    root.setAttribute('data-bento-education', 'true');
    root.className =
      'p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-between h-full select-text group/education transition-colors duration-200 hover:border-white/20';

    const itemsHtml = this.educationList
      .map((entry) => {
        const institution =
          (entry.location || entry.institution)?.trim() || 'University';
        const degree =
          (entry.title || entry.degree)?.trim() || 'Computer Science';
        const period = entry.period?.trim() || 'Present';
        const field = (entry.track || entry.field)?.trim();
        const details = entry.details?.filter((d) => d && d.trim().length > 0);

        return `
          <div data-education-item class="bg-white/[0.03] border border-white/10 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex flex-col justify-center">
            <div class="flex items-start justify-between gap-2">
              <div data-education-degree class="text-[11px] sm:text-xs font-bold text-neutral-100 leading-snug">${escapeHtml(degree)}</div>
              <span data-education-period class="text-right text-[9px] sm:text-[10px] font-mono font-medium text-neutral-400 shrink-0 whitespace-nowrap">${escapeHtml(period)}</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-[11px] mt-0.5">
              ${field ? `<span data-education-field class="text-[#ff4421] font-medium leading-tight">${escapeHtml(field)}</span>` : ''}
              ${field && institution ? `<span class="text-neutral-600 hidden sm:inline select-none" aria-hidden="true">•</span>` : ''}
              <span data-education-institution class="text-neutral-400 leading-tight">${escapeHtml(institution)}</span>
            </div>
            ${
              details && details.length > 0
                ? `<ul data-education-details class="mt-0.5 space-y-0.5 text-[10px] text-neutral-400/90 list-disc list-inside">
                    ${details.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                   </ul>`
                : ''
            }
          </div>
        `;
      })
      .join('');

    root.innerHTML = `
      <!-- Header with Graduation Cap Icon Badge -->
      <div class="flex items-center gap-2 mb-2 sm:mb-2.5">
        <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#ff4421]/10 text-[#ff4421] flex items-center justify-center shrink-0">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <span class="uppercase tracking-widest text-[11px] sm:text-xs font-semibold text-[#ff4421]/80">EDUCATION</span>
      </div>

      <!-- Inner Cards List (Compact, Non-Scrollable) -->
      <div data-education-list class="flex-1 flex flex-col justify-between gap-1.5 sm:gap-2 select-text">
        ${itemsHtml}
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
