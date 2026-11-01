import type { ProjectDetails } from '@/domain/types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ProjectHeader Component
 * Renders the top hero zone of the ProjectDetailsModal:
 * - Top metadata row: Category badge with accent tint, year badge, live status beacon dot
 * - Accessible close button with keyboard and click handlers
 * - Project title (large tracking-tight heading) and explanatory subtitle
 * - Clean teardown lifecycle via destroy()
 */
export class ProjectHeader {
  private rootEl: HTMLElement | null = null;
  private closeBtn: HTMLButtonElement | null = null;
  private closeHandler: (() => void) | null = null;

  public render(project: ProjectDetails, onClose: () => void): HTMLElement {
    // Teardown any prior rendered instance before re-rendering
    this.destroy();

    const root = document.createElement('header');
    root.setAttribute('data-project-header', 'true');
    root.className = 'w-full flex flex-col gap-4 p-6 sm:p-8 pb-5 border-b border-white/[0.08] select-text';

    const accentColor = project.accentColor || '#6366f1';
    const isArchived = project.liveStatus?.toLowerCase() === 'archived';
    const statusText = project.liveStatus || 'Live';

    // Status beacon color scheme
    const beaconDotColor = isArchived ? 'bg-amber-400' : 'bg-emerald-400';
    const beaconPulseColor = isArchived ? 'bg-amber-400' : 'bg-emerald-400';
    const beaconBgColor = isArchived ? 'bg-amber-500/[0.08]' : 'bg-emerald-500/[0.08]';
    const beaconBorderColor = isArchived ? 'border-amber-500/20' : 'border-emerald-500/20';
    const beaconTextColor = isArchived ? 'text-amber-400' : 'text-emerald-400';

    root.innerHTML = `
      <!-- Top Meta Bar: Badges + Close Button -->
      <div class="w-full flex items-center justify-between gap-3">
        <!-- Badges & Status Indicators -->
        <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <!-- Category Badge -->
          <span
            data-category-badge
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium tracking-wide border transition-colors select-none"
            style="color: ${escapeHtml(accentColor)}; border-color: ${escapeHtml(accentColor)}40; background-color: ${escapeHtml(accentColor)}18;"
          >
            ${escapeHtml(project.category)}
          </span>

          <!-- Year Badge -->
          <span
            data-year-badge
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono text-neutral-400 bg-white/[0.04] border border-white/10 select-none"
          >
            ${escapeHtml(project.year)}
          </span>

          <!-- Live Status Beacon -->
          <span
            data-status-beacon
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono ${beaconBgColor} border ${beaconBorderColor} ${beaconTextColor} select-none"
          >
            <span class="relative flex h-2 w-2" data-status-dot aria-hidden="true">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${beaconPulseColor} opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 ${beaconDotColor}"></span>
            </span>
            <span>${escapeHtml(statusText)}</span>
          </span>
        </div>

        <!-- Accessible Close Button -->
        <button
          type="button"
          data-close-button
          class="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-neutral-400 hover:text-white border border-white/10 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421] shrink-0"
          aria-label="Close project details"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Typography Zone: Large Title & Subtitle -->
      <div class="flex flex-col gap-1.5">
        <h2
          data-project-title
          class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight"
        >
          ${escapeHtml(project.title)}
        </h2>
        <p
          data-project-subtitle
          class="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed"
        >
          ${escapeHtml(project.subtitle)}
        </p>
      </div>
    `;

    this.rootEl = root;
    this.closeBtn = root.querySelector<HTMLButtonElement>('[data-close-button]');

    if (this.closeBtn) {
      this.closeHandler = () => {
        onClose();
      };
      this.closeBtn.addEventListener('click', this.closeHandler);
    }

    return root;
  }

  public destroy(): void {
    if (this.closeBtn && this.closeHandler) {
      this.closeBtn.removeEventListener('click', this.closeHandler);
    }
    this.closeBtn = null;
    this.closeHandler = null;

    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
  }
}
