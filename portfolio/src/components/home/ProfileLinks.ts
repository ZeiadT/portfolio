import type { ProfileLink } from '@/domain/types';

/**
 * ProfileLinksComponent
 * Renders high-contrast action icon buttons for GitHub, Codewars, LinkedIn, and other links
 * tailored for top-left positioning matching the wireframe specification.
 */
export class ProfileLinksComponent {
  private links: ProfileLink[];
  private rootEl: HTMLElement | null = null;

  constructor(links: ProfileLink[]) {
    this.links = links;
  }

  public mount(container: HTMLElement): void {
    const root = document.createElement('div');
    root.className = 'profile-links flex items-center gap-3';

    this.links.forEach((link) => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('data-profile-link', link.icon);
      const ariaLabel = link.ariaLabel || `Visit ${link.label}`;
      a.setAttribute('aria-label', ariaLabel);
      a.setAttribute('title', link.label);

      // Vermilion solid icon button matching the wireframe's orange square buttons
      a.className =
        'w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-[#ff4421] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_rgba(255,68,33,0.55)] active:scale-95 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white';

      const iconSvg = this.getIconSvg(link.icon);
      a.innerHTML = iconSvg;

      root.appendChild(a);
    });

    container.appendChild(root);
    this.rootEl = root;
  }

  private getIconSvg(icon: string): string {
    if (icon === 'github') {
      return `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      `;
    }
    if (icon === 'codewars') {
      return `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L2 7.5v9L12 22l10-5.5v-9L12 2zm0 2.311l7.85 4.318-2.584 1.421-5.266-2.896v2.311l3.056 1.68-2.27 1.248L12 11.968l-5.65 3.107v-6.215L12 4.311z"/>
        </svg>
      `;
    }
    if (icon === 'linkedin') {
      return `
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
        </svg>
      `;
    }
    return `
      <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0 group-hover:scale-105 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    `;
  }

  public destroy(): void {
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
  }
}
