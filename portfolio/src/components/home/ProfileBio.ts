import type { ProfileData } from '@/domain/types';

/**
 * ProfileBio Component
 * Renders the Summary & Core Pillars Bento Card underneath the upper hero composition,
 * featuring the narrative paragraph on the left and structured engineering pillar tags on the right.
 */
export class ProfileBio {
  private data: ProfileData;
  private rootEl: HTMLElement | null = null;

  constructor(data: ProfileData) {
    this.data = data;
  }

  public mount(container: HTMLElement): void {
    const root = document.createElement('div');
    root.className =
      'profile-summary-section w-full p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start select-text';

    const pillars = this.data.pillars || [
      'Mobile & Systems Architecture',
      'Deterministic Performance',
      'Kinetic Motion & WebGL',
      'Clean Architecture & TDD',
    ];

    const pillarsHtml = pillars
      .map(
        (p) => `
        <div data-pillar-tag class="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#ff4421]/50 hover:bg-white/[0.06] transition-colors duration-200 text-xs font-mono text-neutral-300 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#ff4421] shrink-0"></span>
          <span>${p}</span>
        </div>
      `
      )
      .join('');

    root.innerHTML = `
      <!-- Left Sub-Column: Summary Narrative (8 cols) -->
      <div class="lg:col-span-8 flex flex-col gap-3">
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
        >${this.data.summary}</p>
      </div>

      <!-- Right Sub-Column: Core Pillars (4 cols) -->
      <div class="lg:col-span-4 flex flex-col gap-3">
        <h3 class="text-xs uppercase tracking-[0.25em] font-semibold text-neutral-400">
          Core Pillars
        </h3>
        <div class="flex flex-col gap-2">
          ${pillarsHtml}
        </div>
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
