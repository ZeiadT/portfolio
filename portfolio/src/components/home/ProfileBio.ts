import type { ProfileData } from '@/domain/types';
import { ProfileEducationComponent } from './ProfileEducation';
import { ProfileGlobeComponent } from './ProfileGlobe';

/**
 * Escapes unsafe HTML characters to prevent XSS injection.
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
 * ProfileBio Component
 * Orchestrates the bottom Bento Grid row arranged strictly LTR:
 * 1. Column 1: Education Card (3 cols)
 * 2. Column 2: Globe Card (3 cols)
 * 3. Column 3: Summary Narrative Card (6 cols)
 */
export class ProfileBio {
  private data: ProfileData;
  private rootEl: HTMLElement | null = null;
  private educationComponent: ProfileEducationComponent | null = null;
  private globeComponent: ProfileGlobeComponent | null = null;

  constructor(data: ProfileData) {
    this.data = data;
  }

  public mount(container: HTMLElement): void {
    if (this.rootEl) {
      this.destroy();
    }

    const root = document.createElement('div');
    root.setAttribute('data-bento-bottom-row', 'true');
    root.className =
      'profile-summary-section w-full grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6 items-stretch select-text';

    // 1. Column 1: Education Card (md: 6 cols, lg: 3 cols)
    this.educationComponent = new ProfileEducationComponent(this.data.education);
    this.educationComponent.mount(root);
    const eduEl = root.querySelector<HTMLElement>('[data-bento-education="true"]');
    if (eduEl) {
      eduEl.classList.add('md:col-span-6', 'lg:col-span-3');
    }

    // 2. Column 2: Globe Card (md: 6 cols, lg: 3 cols)
    this.globeComponent = new ProfileGlobeComponent(this.data.location);
    this.globeComponent.mount(root);
    const globeEl = root.querySelector<HTMLElement>('[data-bento-globe="true"]');
    if (globeEl) {
      globeEl.classList.add('md:col-span-6', 'lg:col-span-3');
    }

    // 3. Column 3: Summary Narrative Card (md: 12 cols, lg: 6 cols)
    const summaryCard = document.createElement('div');
    summaryCard.setAttribute('data-bento-summary', 'true');
    summaryCard.className =
      'md:col-span-12 lg:col-span-6 p-5 sm:p-6 lg:p-7 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-between h-full select-text transition-colors duration-200 hover:border-white/20';

    summaryCard.innerHTML = `
      <!-- Header with User/Bio Icon Badge on top left -->
      <div class="flex items-center gap-2.5 mb-2.5 sm:mb-3">
        <div class="w-7 h-7 rounded-lg bg-[#ff4421]/10 text-[#ff4421] flex items-center justify-center shrink-0">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2
          data-summary-heading
          class="uppercase tracking-widest text-xs font-semibold text-[#ff4421]/80"
        >
          SUMMARY
        </h2>
      </div>

      <!-- Narrative Body -->
      <div class="flex-1 flex items-center">
        <p
          data-profile-summary
          class="text-base sm:text-lg text-neutral-200 font-light leading-relaxed sm:leading-[1.75] text-pretty"
        >${escapeHtml(this.data.summary || '')}</p>
      </div>
    `;

    root.appendChild(summaryCard);

    container.appendChild(root);
    this.rootEl = root;
  }

  public destroy(): void {
    if (this.educationComponent) {
      this.educationComponent.destroy();
      this.educationComponent = null;
    }

    if (this.globeComponent) {
      this.globeComponent.destroy();
      this.globeComponent = null;
    }

    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
  }
}

export { ProfileBio as ProfileBioComponent };
