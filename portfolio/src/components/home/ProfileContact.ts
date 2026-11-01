import type { ProfileContact } from '@/domain/types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ProfileContactComponent
 * Renders interactive click-to-copy buttons for telephone and email
 * with an inline copy-to-check blur & fade micro-animation.
 * - Fast & responsive forward click (200ms ease-out)
 * - Slower & calmer return transition (500ms ease-in-out)
 */
export class ProfileContactComponent {
  private contact: ProfileContact;
  private resumeUrl: string;
  private rootEl: HTMLElement | null = null;
  private phoneBtn: HTMLButtonElement | null = null;
  private emailBtn: HTMLButtonElement | null = null;
  private phoneCopyIcon: SVGElement | null = null;
  private phoneCheckIcon: SVGElement | null = null;
  private emailCopyIcon: SVGElement | null = null;
  private emailCheckIcon: SVGElement | null = null;
  private phoneTimeout: ReturnType<typeof setTimeout> | null = null;
  private emailTimeout: ReturnType<typeof setTimeout> | null = null;
  private phoneClickHandler: (() => void) | null = null;
  private emailClickHandler: (() => void) | null = null;

  constructor(contact: ProfileContact, resumeUrl: string = '/resume.pdf') {
    this.contact = contact;
    this.resumeUrl = resumeUrl || '/resume.pdf';
  }

  public mount(container: HTMLElement): void {
    const root = document.createElement('div');
    root.className = 'profile-contact w-full flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono';

    root.innerHTML = `
      <!-- Phone Button with Click-to-Copy -->
      <button
        type="button"
        data-contact-phone
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:border-[#ff4421]/50 hover:bg-white/[0.08] transition-all duration-200 cursor-pointer select-none group active:scale-95"
        aria-label="Copy phone number ${this.contact.phoneFormatted}"
      >
        <svg class="w-3.5 h-3.5 text-[#ff4421] group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span>${this.contact.phoneFormatted}</span>
        <span
          data-copy-indicator
          class="relative w-3.5 h-3.5 flex items-center justify-center shrink-0 ml-1 text-[#ff4421]/70 group-hover:text-[#ff4421] transition-colors"
        >
          <svg
            data-icon-copy
            class="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out opacity-100 blur-0 scale-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <svg
            data-icon-check
            class="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out opacity-0 blur-xs scale-75 pointer-events-none text-[#ff4421]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </button>

      <!-- Email Button with Click-to-Copy -->
      <button
        type="button"
        data-contact-email
        class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:border-[#ff4421]/50 hover:bg-white/[0.08] transition-all duration-200 cursor-pointer select-none group active:scale-95"
        aria-label="Copy email address ${this.contact.email}"
      >
        <svg class="w-3.5 h-3.5 text-[#ff4421] group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>${this.contact.email}</span>
        <span
          data-copy-indicator
          class="relative w-3.5 h-3.5 flex items-center justify-center shrink-0 ml-1 text-[#ff4421]/70 group-hover:text-[#ff4421] transition-colors"
        >
          <svg
            data-icon-copy
            class="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out opacity-100 blur-0 scale-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <svg
            data-icon-check
            class="absolute inset-0 w-full h-full transition-all duration-500 ease-in-out opacity-0 blur-xs scale-75 pointer-events-none text-[#ff4421]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      </button>

      <!-- Expanding Flex Spacer -->
      <div data-contact-spacer class="flex-1"></div>

      <!-- View Resume Button -->
      <a
        href="${escapeHtml(this.resumeUrl)}"
        target="_blank"
        rel="noopener noreferrer"
        data-contact-resume
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white hover:border-[#ff4421]/50 hover:bg-white/[0.08] transition-all duration-200 cursor-pointer select-none group active:scale-95 text-xs font-mono"
        aria-label="View Resume"
      >
        <span>View Resume</span>
        <svg
          class="w-3.5 h-3.5 text-[#ff4421] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    `;

    container.appendChild(root);
    this.rootEl = root;

    this.phoneBtn = root.querySelector<HTMLButtonElement>('[data-contact-phone]');
    this.emailBtn = root.querySelector<HTMLButtonElement>('[data-contact-email]');

    if (this.phoneBtn) {
      this.phoneCopyIcon = this.phoneBtn.querySelector<SVGElement>('[data-icon-copy]');
      this.phoneCheckIcon = this.phoneBtn.querySelector<SVGElement>('[data-icon-check]');
      this.phoneClickHandler = () => this.handlePhoneClick();
      this.phoneBtn.addEventListener('click', this.phoneClickHandler);
    }

    if (this.emailBtn) {
      this.emailCopyIcon = this.emailBtn.querySelector<SVGElement>('[data-icon-copy]');
      this.emailCheckIcon = this.emailBtn.querySelector<SVGElement>('[data-icon-check]');
      this.emailClickHandler = () => this.handleEmailClick();
      this.emailBtn.addEventListener('click', this.emailClickHandler);
    }
  }

  private handlePhoneClick(): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(this.contact.phone).catch(() => {});
    }

    if (this.phoneCopyIcon && this.phoneCheckIcon) {
      // Snappy forward transition to checkmark (200ms ease-out)
      this.phoneCopyIcon.classList.remove('duration-500', 'ease-in-out', 'opacity-100', 'blur-0', 'scale-100');
      this.phoneCopyIcon.classList.add('duration-200', 'ease-out', 'opacity-0', 'blur-xs', 'scale-75');

      this.phoneCheckIcon.classList.remove('duration-500', 'ease-in-out', 'opacity-0', 'blur-xs', 'scale-75');
      this.phoneCheckIcon.classList.add('duration-200', 'ease-out', 'opacity-100', 'blur-0', 'scale-100');

      if (this.phoneTimeout) {
        clearTimeout(this.phoneTimeout);
      }
      this.phoneTimeout = setTimeout(() => {
        if (this.phoneCopyIcon && this.phoneCheckIcon) {
          // Slower, calmer return transition back to copy icon (500ms ease-in-out)
          this.phoneCopyIcon.classList.remove('duration-200', 'ease-out', 'opacity-0', 'blur-xs', 'scale-75');
          this.phoneCopyIcon.classList.add('duration-500', 'ease-in-out', 'opacity-100', 'blur-0', 'scale-100');

          this.phoneCheckIcon.classList.remove('duration-200', 'ease-out', 'opacity-100', 'blur-0', 'scale-100');
          this.phoneCheckIcon.classList.add('duration-500', 'ease-in-out', 'opacity-0', 'blur-xs', 'scale-75');
        }
      }, 1500);
    }
  }

  private handleEmailClick(): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(this.contact.email).catch(() => {});
    }

    if (this.emailCopyIcon && this.emailCheckIcon) {
      // Snappy forward transition to checkmark (200ms ease-out)
      this.emailCopyIcon.classList.remove('duration-500', 'ease-in-out', 'opacity-100', 'blur-0', 'scale-100');
      this.emailCopyIcon.classList.add('duration-200', 'ease-out', 'opacity-0', 'blur-xs', 'scale-75');

      this.emailCheckIcon.classList.remove('duration-500', 'ease-in-out', 'opacity-0', 'blur-xs', 'scale-75');
      this.emailCheckIcon.classList.add('duration-200', 'ease-out', 'opacity-100', 'blur-0', 'scale-100');

      if (this.emailTimeout) {
        clearTimeout(this.emailTimeout);
      }
      this.emailTimeout = setTimeout(() => {
        if (this.emailCopyIcon && this.emailCheckIcon) {
          // Slower, calmer return transition back to copy icon (500ms ease-in-out)
          this.emailCopyIcon.classList.remove('duration-200', 'ease-out', 'opacity-0', 'blur-xs', 'scale-75');
          this.emailCopyIcon.classList.add('duration-500', 'ease-in-out', 'opacity-100', 'blur-0', 'scale-100');

          this.emailCheckIcon.classList.remove('duration-200', 'ease-out', 'opacity-100', 'blur-0', 'scale-100');
          this.emailCheckIcon.classList.add('duration-500', 'ease-in-out', 'opacity-0', 'blur-xs', 'scale-75');
        }
      }, 1500);
    }
  }

  public destroy(): void {
    if (this.phoneTimeout) {
      clearTimeout(this.phoneTimeout);
      this.phoneTimeout = null;
    }
    if (this.emailTimeout) {
      clearTimeout(this.emailTimeout);
      this.emailTimeout = null;
    }
    if (this.phoneBtn && this.phoneClickHandler) {
      this.phoneBtn.removeEventListener('click', this.phoneClickHandler);
      this.phoneClickHandler = null;
    }
    if (this.emailBtn && this.emailClickHandler) {
      this.emailBtn.removeEventListener('click', this.emailClickHandler);
      this.emailClickHandler = null;
    }
    if (this.rootEl && this.rootEl.parentElement) {
      this.rootEl.parentElement.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.phoneBtn = null;
    this.emailBtn = null;
    this.phoneCopyIcon = null;
    this.phoneCheckIcon = null;
    this.emailCopyIcon = null;
    this.emailCheckIcon = null;
  }
}
