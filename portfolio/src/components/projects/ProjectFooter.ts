import type { ProjectLinks } from '@/domain/types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates and sanitizes link URLs to prevent XSS and malicious protocol injection.
 * Only HTTP, HTTPS, root-relative paths, and mailto schemes are permitted.
 */
function sanitizeUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  // Reject pseudo protocols like javascript: or data:
  if (/^(javascript:|data:|vbscript:)/i.test(trimmed)) {
    return null;
  }

  // Only permit safe web protocols or relative paths
  const isSafe = /^(https?:\/\/|\/|mailto:)/i.test(trimmed);
  if (!isSafe) {
    return null;
  }

  return trimmed;
}

/**
 * ProjectFooter Component
 * Renders a sticky glass action bar pinned to the bottom of the ProjectDetailsModal:
 * - Primary CTA: "View GitHub Repository ↗" with Lucide/SVG icon, target="_blank", rel="noopener noreferrer"
 * - Conditional Secondary CTA: "Download APK / Run Demo ↗", "Launch Live Demo ↗", or "Run Demo ↗"
 * - Safe URL sanitization and HTML escaping to prevent XSS injection
 * - Full lifecycle disposal with destroy()
 */
export class ProjectFooter {
  private rootEl: HTMLElement | null = null;

  public render(links: ProjectLinks = {}, accentColor: string = '#ff4421'): HTMLElement {
    // Teardown any prior rendered instance before re-rendering
    this.destroy();

    const root = document.createElement('footer');
    root.setAttribute('data-project-footer', 'true');
    root.setAttribute('role', 'contentinfo');
    root.setAttribute('aria-label', 'Project external links and actions');
    root.className =
      'sticky bottom-0 bg-neutral-950/85 backdrop-blur-xl border-t border-white/10 z-20 w-full px-6 py-4 sm:px-8 sm:py-4 flex flex-wrap items-center justify-between gap-4 select-text';

    const safeGithub = sanitizeUrl(links.github);
    const safeApk = sanitizeUrl(links.apk);
    const safeLive = sanitizeUrl(links.live);
    const safeDemo = sanitizeUrl(links.demo);
    const safeDoc = sanitizeUrl(links.doc);

    // Build secondary buttons
    const secondaryButtons: string[] = [];

    if (safeApk) {
      secondaryButtons.push(`
        <a
          data-secondary-cta="apk"
          data-apk-link="true"
          href="${escapeHtml(safeApk)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-medium text-neutral-200 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Download APK / Run Demo</span>
          <span aria-hidden="true">↗</span>
        </a>
      `);
    } else if (safeDemo) {
      secondaryButtons.push(`
        <a
          data-secondary-cta="demo"
          data-demo-link="true"
          href="${escapeHtml(safeDemo)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-medium text-neutral-200 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0"
            aria-hidden="true"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Run Demo</span>
          <span aria-hidden="true">↗</span>
        </a>
      `);
    }

    if (safeLive) {
      secondaryButtons.push(`
        <a
          data-secondary-cta="live"
          data-live-link="true"
          href="${escapeHtml(safeLive)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-medium text-neutral-200 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span>Launch Live Demo</span>
          <span aria-hidden="true">↗</span>
        </a>
      `);
    }

    if (safeDoc) {
      secondaryButtons.push(`
        <a
          data-secondary-cta="doc"
          data-doc-link="true"
          href="${escapeHtml(safeDoc)}"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-medium text-neutral-200 bg-white/[0.06] hover:bg-white/[0.12] hover:text-white border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="shrink-0"
            aria-hidden="true"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          <span>Documentation</span>
          <span aria-hidden="true">↗</span>
        </a>
      `);
    }

    // Build primary CTA button
    const primaryButtonHtml = safeGithub
      ? `
      <a
        data-primary-cta="true"
        data-github-link="true"
        href="${escapeHtml(safeGithub)}"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs sm:text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 hover:brightness-110 select-none cursor-pointer"
        style="background-color: ${escapeHtml(accentColor)}; box-shadow: 0 4px 16px ${escapeHtml(accentColor)}40;"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0"
          aria-hidden="true"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
          <path d="M9 18c-4.51 2-5-2-7-2"></path>
        </svg>
        <span>View GitHub Repository</span>
        <span aria-hidden="true">↗</span>
      </a>
    `
      : '';

    root.innerHTML = `
      <!-- Left Meta Indicator -->
      <div class="flex items-center gap-2.5 text-xs font-mono text-neutral-400 select-none">
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span class="tracking-wide">Verified Engineering Artifact</span>
      </div>

      <!-- Action Buttons Container -->
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        ${secondaryButtons.join('')}
        ${primaryButtonHtml}
      </div>
    `;

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
