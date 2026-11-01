import gsap from 'gsap';
import type { ProjectDetails } from '@/domain/types';
import { ProjectHeader } from './ProjectHeader';
import { ProjectMetrics } from './ProjectMetrics';
import { ProjectArchitecture } from './ProjectArchitecture';
import { ProjectCodeScratchpad } from './ProjectCodeScratchpad';
import { ProjectGallery } from './ProjectGallery';
import { ProjectFooter } from './ProjectFooter';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ProjectDetailsModal Master Orchestrator Component
 * Orchestrates full editorial case-study modal dialog with:
 * - Desktop floating centered sheet & mobile bottom sheet
 * - Synchronized FLIP zoom kinematics from clicked source card
 * - Body scroll locking with original style restoration
 * - Keyboard Escape dismissal & Tab focus trapping
 * - Backdrop click outside sheet dismissal
 * - Mobile downward swipe gesture dismissal (dy > 100px)
 * - Coordinated sub-component lifecycles and zero-leak teardown
 */
export class ProjectDetailsModal {
  private container: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private backdropEl: HTMLElement | null = null;
  private sheetEl: HTMLElement | null = null;
  private contentEl: HTMLElement | null = null;

  // Sub-components
  private headerComponent: ProjectHeader | null = null;
  private metricsComponent: ProjectMetrics | null = null;
  private architectureComponent: ProjectArchitecture | null = null;
  private codeScratchpadComponent: ProjectCodeScratchpad | null = null;
  private galleryComponent: ProjectGallery | null = null;
  private footerComponent: ProjectFooter | null = null;

  // State
  private isOpenState: boolean = false;
  private onCloseCallback: (() => void) | null = null;
  private previousActiveElement: HTMLElement | null = null;
  private previousOverflow: string = '';
  private isScrollLocked: boolean = false;

  // Touch gesture state
  private touchStartX: number = 0;
  private touchStartY: number = 0;

  // Bound event listeners for strict parity
  private boundKeyDown: ((e: KeyboardEvent) => void) | null = null;
  private boundTouchStart: ((e: TouchEvent) => void) | null = null;
  private boundTouchEnd: ((e: TouchEvent) => void) | null = null;
  private boundBackdropClick: ((e: MouseEvent) => void) | null = null;
  private boundRootClick: ((e: MouseEvent) => void) | null = null;

  /**
   * Mounts the modal shell dialog into the designated container element.
   */
  public mount(container: HTMLElement): void {
    if (!container) return;

    // If already mounted in the same container, teardown prior DOM instance
    if (this.rootEl) {
      this.destroy();
    }

    this.container = container;

    // Root dialog shell
    const root = document.createElement('div');
    root.setAttribute('data-project-details-modal', 'true');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Project details');
    root.setAttribute('aria-hidden', 'true');
    root.className =
      'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 select-none';
    root.style.display = 'none';

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.setAttribute('data-modal-backdrop', 'true');
    backdrop.className =
      'fixed inset-0 bg-black/85 backdrop-blur-2xl transition-opacity pointer-events-auto';
    backdrop.style.opacity = '0';

    // Sheet container
    const sheet = document.createElement('div');
    sheet.setAttribute('data-modal-sheet', 'true');
    sheet.setAttribute('tabindex', '-1');
    sheet.className =
      'relative w-full max-w-5xl max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-neutral-950/95 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden z-10 pointer-events-auto outline-none';

    // Internal scrollable content container
    const content = document.createElement('div');
    content.setAttribute('data-modal-content', 'true');
    content.className =
      'flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 flex flex-col gap-8 custom-scrollbar';

    sheet.appendChild(content);
    root.appendChild(backdrop);
    root.appendChild(sheet);

    // Event listener bindings
    this.boundBackdropClick = (e: MouseEvent) => {
      if (e.target === this.backdropEl) {
        this.close();
      }
    };
    backdrop.addEventListener('click', this.boundBackdropClick);

    this.boundRootClick = (e: MouseEvent) => {
      if (e.target === this.rootEl) {
        this.close();
      }
    };
    root.addEventListener('click', this.boundRootClick);

    this.boundTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    };
    sheet.addEventListener('touchstart', this.boundTouchStart, { passive: true });

    this.boundTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dy = touchEndY - this.touchStartY;
        const dx = Math.abs(touchEndX - this.touchStartX);

        // Dismiss if vertical downward swipe > 100px and vertically dominant, and user is at top of scroll
        const isAtTop = !this.contentEl || this.contentEl.scrollTop <= 0;
        if (dy > 100 && dy > dx && isAtTop) {
          this.close();
        }
      }
    };
    sheet.addEventListener('touchend', this.boundTouchEnd, { passive: true });

    container.appendChild(root);

    this.rootEl = root;
    this.backdropEl = backdrop;
    this.sheetEl = sheet;
    this.contentEl = content;
  }

  /**
   * Opens the modal dialog for a specified project with optional FLIP transition from sourceRect.
   */
  public open(project: ProjectDetails, sourceRect?: DOMRect): void {
    if (!this.rootEl || !this.sheetEl || !this.backdropEl || !this.contentEl) {
      return;
    }

    // Tear down any previous sub-components before populating new project data
    this.clearSubComponents();

    // Kill any active GSAP animations on sheet/backdrop
    gsap.killTweensOf([this.backdropEl, this.sheetEl]);

    // Save previous active element for focus restoration
    this.previousActiveElement = document.activeElement as HTMLElement | null;

    // Reset scroll position to top
    this.contentEl.scrollTop = 0;

    // Body scroll lock
    if (!this.isScrollLocked) {
      this.previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.isScrollLocked = true;
    }

    // Set dialog attributes
    this.isOpenState = true;
    this.rootEl.style.display = 'flex';
    this.rootEl.removeAttribute('aria-hidden');
    this.rootEl.setAttribute('aria-label', `Project details for ${project.title}`);

    // 1. Render ProjectHeader
    this.headerComponent = new ProjectHeader();
    const headerEl = this.headerComponent.render(project, () => this.close());
    this.sheetEl.insertBefore(headerEl, this.contentEl);

    // 2. Render ProjectMetrics
    if (project.metrics && project.metrics.length > 0) {
      this.metricsComponent = new ProjectMetrics();
      const metricsEl = this.metricsComponent.render(project.metrics);
      this.contentEl.appendChild(metricsEl);
    }

    // 3. Render Overview / Deep-dive Description
    const descriptionText = project.longDescription || project.description;
    if (descriptionText) {
      const overviewSection = document.createElement('section');
      overviewSection.setAttribute('data-project-overview', 'true');
      overviewSection.className = 'w-full flex flex-col gap-3 select-text';
      overviewSection.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" style="background-color: ${escapeHtml(project.accentColor || '#ff4421')}"></span>
          <h3 class="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">Overview & Architecture</h3>
        </div>
        <p class="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">${escapeHtml(descriptionText)}</p>
      `;
      this.contentEl.appendChild(overviewSection);
    }

    // 4. Render ProjectArchitecture
    if (project.architectureGraph) {
      this.architectureComponent = new ProjectArchitecture();
      const archEl = this.architectureComponent.render(
        project.architectureGraph,
        project.architectureHighlights
      );
      this.contentEl.appendChild(archEl);
    }

    // 5. Render ProjectCodeScratchpad
    if (project.codeSnippet) {
      this.codeScratchpadComponent = new ProjectCodeScratchpad();
      const codeEl = this.codeScratchpadComponent.render(project.codeSnippet);
      this.contentEl.appendChild(codeEl);
    }

    // 6. Render ProjectGallery
    const screenshots = project.galleryScreenshots || project.media?.images || [];
    if (screenshots.length > 0) {
      this.galleryComponent = new ProjectGallery();
      const galleryEl = this.galleryComponent.render(screenshots, project.title);
      this.contentEl.appendChild(galleryEl);
    }

    // 7. Render ProjectFooter
    this.footerComponent = new ProjectFooter();
    const footerEl = this.footerComponent.render(project.links, project.accentColor);
    this.sheetEl.appendChild(footerEl);

    // FLIP Kinematics Animation
    gsap.fromTo(
      this.backdropEl,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power3.out' }
    );

    let startX = 0;
    let startY = 0;
    let startScale = 0.95;

    if (sourceRect && typeof sourceRect.left === 'number') {
      const sheetRect = this.sheetEl.getBoundingClientRect();
      if (sheetRect.width > 0 && sheetRect.height > 0 && sourceRect.width > 0 && sourceRect.height > 0) {
        const scaleX = sourceRect.width / sheetRect.width;
        const scaleY = sourceRect.height / sheetRect.height;
        startScale = Math.max(0.2, Math.min(scaleX, scaleY));
        startX = sourceRect.left + sourceRect.width / 2 - (sheetRect.left + sheetRect.width / 2);
        startY = sourceRect.top + sourceRect.height / 2 - (sheetRect.top + sheetRect.height / 2);
      }
    }

    gsap.fromTo(
      this.sheetEl,
      { x: startX, y: startY, scale: startScale, opacity: 0 },
      { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }
    );

    // Attach keydown listener on window
    this.attachWindowKeyDown();

    // Set focus to close button or sheet
    const closeBtn = this.sheetEl.querySelector<HTMLButtonElement>('[data-close-button]');
    if (closeBtn) {
      closeBtn.focus();
    } else {
      this.sheetEl.focus();
    }
  }

  /**
   * Closes the modal with exit animation, restoring body scroll and focus.
   */
  public close(): void {
    if (!this.isOpenState) return;

    this.isOpenState = false;

    // Detach window keydown listener immediately
    this.detachWindowKeyDown();

    // Restore body scroll immediately
    if (this.isScrollLocked) {
      document.body.style.overflow = this.previousOverflow;
      this.previousOverflow = '';
      this.isScrollLocked = false;
    }

    // Restore focus to previously active element
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      this.previousActiveElement.focus();
    }
    this.previousActiveElement = null;

    // Fire onClose callback
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }

    // GSAP Exit Animation
    if (this.sheetEl && this.backdropEl) {
      gsap.killTweensOf([this.backdropEl, this.sheetEl]);

      gsap.to(this.sheetEl, {
        y: 40,
        opacity: 0,
        duration: 0.35,
        ease: 'power3.inOut',
        onComplete: () => {
          if (!this.isOpenState && this.rootEl) {
            this.rootEl.style.display = 'none';
            this.rootEl.setAttribute('aria-hidden', 'true');
            if (this.sheetEl) {
              gsap.set(this.sheetEl, { x: 0, y: 0, scale: 1 });
            }
          }
        },
      });

      gsap.to(this.backdropEl, {
        opacity: 0,
        duration: 0.35,
        ease: 'power3.inOut',
      });
    }
  }

  /**
   * Returns whether the modal is currently open.
   */
  public isOpen(): boolean {
    return this.isOpenState;
  }

  /**
   * Returns the container element the modal is mounted to.
   */
  public getContainer(): HTMLElement | null {
    return this.container;
  }

  /**
   * Registers a callback triggered when the modal is closed.
   */
  public setOnClose(cb: () => void): void {
    this.onCloseCallback = cb;
  }

  /**
   * Completely tears down the modal, sub-components, listeners, and resets DOM.
   */
  public destroy(): void {
    // If open, ensure close side-effects (body scroll, window listener) are executed
    if (this.isOpenState) {
      this.close();
    }

    // Additional cleanup for scroll lock safety
    if (this.isScrollLocked) {
      document.body.style.overflow = this.previousOverflow;
      this.previousOverflow = '';
      this.isScrollLocked = false;
    }

    // Ensure window listener is detached
    this.detachWindowKeyDown();

    // Kill in-flight GSAP animations
    if (this.backdropEl && this.sheetEl) {
      gsap.killTweensOf([this.backdropEl, this.sheetEl]);
    }

    // Teardown sub-components
    this.clearSubComponents();

    // Detach element event listeners
    if (this.sheetEl) {
      if (this.boundTouchStart) {
        this.sheetEl.removeEventListener('touchstart', this.boundTouchStart);
      }
      if (this.boundTouchEnd) {
        this.sheetEl.removeEventListener('touchend', this.boundTouchEnd);
      }
    }
    if (this.backdropEl && this.boundBackdropClick) {
      this.backdropEl.removeEventListener('click', this.boundBackdropClick);
    }
    if (this.rootEl && this.boundRootClick) {
      this.rootEl.removeEventListener('click', this.boundRootClick);
    }

    // Remove DOM nodes
    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }

    this.container = null;
    this.backdropEl = null;
    this.sheetEl = null;
    this.contentEl = null;
    this.onCloseCallback = null;
    this.previousActiveElement = null;
  }

  /**
   * Cleans up and destroys all active sub-components and clears DOM slots.
   */
  private clearSubComponents(): void {
    if (this.headerComponent) {
      this.headerComponent.destroy();
      this.headerComponent = null;
    }
    if (this.metricsComponent) {
      this.metricsComponent.destroy();
      this.metricsComponent = null;
    }
    if (this.architectureComponent) {
      this.architectureComponent.destroy();
      this.architectureComponent = null;
    }
    if (this.codeScratchpadComponent) {
      this.codeScratchpadComponent.destroy();
      this.codeScratchpadComponent = null;
    }
    if (this.galleryComponent) {
      this.galleryComponent.destroy();
      this.galleryComponent = null;
    }
    if (this.footerComponent) {
      this.footerComponent.destroy();
      this.footerComponent = null;
    }

    if (this.contentEl) {
      this.contentEl.innerHTML = '';
    }

    // Remove any direct child headers/footers in sheetEl besides contentEl
    if (this.sheetEl) {
      const headers = this.sheetEl.querySelectorAll('[data-project-header]');
      headers.forEach((h) => h.remove());

      const footers = this.sheetEl.querySelectorAll('[data-project-footer]');
      footers.forEach((f) => f.remove());
    }
  }

  /**
   * Attaches window keydown listener for Escape and Tab trap.
   */
  private attachWindowKeyDown(): void {
    if (this.boundKeyDown) return;

    this.boundKeyDown = (e: KeyboardEvent) => {
      if (!this.isOpenState) return;

      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        this.close();
        return;
      }

      // Tab focus trap inside modal
      if (e.key === 'Tab' && this.rootEl) {
        const focusables = Array.from(
          this.rootEl.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', this.boundKeyDown);
  }

  /**
   * Detaches window keydown listener with strict 1:1 balance.
   */
  private detachWindowKeyDown(): void {
    if (!this.boundKeyDown) return;

    window.removeEventListener('keydown', this.boundKeyDown);
    this.boundKeyDown = null;
  }
}
