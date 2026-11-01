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
      'profile-summary-section w-full grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 items-stretch select-text';

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
      'md:col-span-12 lg:col-span-6 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-center gap-3 h-full select-text transition-colors duration-200 hover:border-white/20';

    summaryCard.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#ff4421]"></span>
        <h2
          data-summary-heading
          class="text-xs uppercase tracking-[0.25em] font-semibold text-neutral-400"
        >
          Summary
        </h2>
      </div>
      <p
        data-profile-summary
        class="text-base sm:text-lg text-neutral-200 font-light leading-relaxed sm:leading-[1.75] text-pretty"
      >${escapeHtml(this.data.summary || '')}</p>
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
