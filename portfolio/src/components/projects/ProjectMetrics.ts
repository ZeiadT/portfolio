import type { ProjectMetric } from '@/domain/types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ProjectMetrics Component
 * Renders salient telemetry and performance metric dial cards
 * in a dark-glass responsive grid.
 */
export class ProjectMetrics {
  private rootEl: HTMLElement | null = null;

  public render(metrics: ProjectMetric[] = []): HTMLElement {
    this.destroy();

    const root = document.createElement('section');
    root.setAttribute('data-project-metrics', 'true');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Key project telemetry metrics');
    root.className = 'w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 select-text';

    if (!metrics || metrics.length === 0) {
      this.rootEl = root;
      return root;
    }

    const cardsHtml = metrics
      .map((metric) => {
        const detailHtml = metric.detail
          ? `<p data-metric-detail class="text-xs text-neutral-400 font-sans mt-2.5 leading-relaxed line-clamp-2">${escapeHtml(
              metric.detail
            )}</p>`
          : '';

        return `
        <article
          data-metric-card
          class="group relative p-4 sm:p-5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.05] transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
        >
          <!-- Subtle top ambient shimmer line -->
          <div
            class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-white/25 transition-all duration-300"
            aria-hidden="true"
          ></div>

          <div>
            <span
              data-metric-label
              class="text-[11px] font-mono font-medium tracking-wider uppercase text-neutral-400 block truncate"
            >
              ${escapeHtml(metric.label)}
            </span>
            <div
              data-metric-value
              class="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white mt-1.5 tabular-nums"
            >
              ${escapeHtml(metric.value)}
            </div>
          </div>

          ${detailHtml}
        </article>
      `;
      })
      .join('');

    root.innerHTML = cardsHtml;
    this.rootEl = root;
    return root;
  }

  public destroy(): void {
    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
  }
}
