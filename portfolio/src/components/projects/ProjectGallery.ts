function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ProjectGallery Component
 * Renders a horizontal scroll-snap thumbnail strip with Next/Prev strip navigation,
 * and an expandable full-screen Lightbox modal with keyboard and touch gesture controls.
 */
export class ProjectGallery {
  private rootEl: HTMLElement | null = null;
  private stripEl: HTMLElement | null = null;
  private lightboxEl: HTMLElement | null = null;

  private screenshots: string[] = [];
  private title: string = '';
  private activeIndex: number = 0;

  // Stored event handler references for clean disposal
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartHandler: ((e: Event) => void) | null = null;
  private touchEndHandler: ((e: Event) => void) | null = null;

  private prevScrollHandler: (() => void) | null = null;
  private nextScrollHandler: (() => void) | null = null;
  private thumbClickHandlers: Map<HTMLElement, () => void> = new Map();
  private thumbKeyHandlers: Map<HTMLElement, (e: KeyboardEvent) => void> = new Map();

  public render(screenshots: string[], title: string): HTMLElement {
    // Teardown prior instance if re-rendering
    this.destroy();

    this.screenshots = Array.isArray(screenshots) ? [...screenshots] : [];
    this.title = title || 'Project';

    const root = document.createElement('section');
    root.setAttribute('data-project-gallery', 'true');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', `Project Gallery: ${this.title}`);
    root.className = 'w-full flex flex-col gap-4 p-6 sm:p-8 select-text';
    this.rootEl = root;

    // Gallery Section Header with Title, Count badge, and Scroll Buttons
    const headerEl = document.createElement('div');
    headerEl.className = 'w-full flex items-center justify-between gap-4';

    const titleContainer = document.createElement('div');
    titleContainer.className = 'flex items-center gap-3';
    titleContainer.innerHTML = `
      <h3 class="text-sm font-mono uppercase tracking-wider text-neutral-400 font-medium">Interface & Screenshots</h3>
      <span class="px-2 py-0.5 rounded-full text-[11px] font-mono text-neutral-400 bg-white/[0.04] border border-white/10 select-none">
        ${this.screenshots.length} ${this.screenshots.length === 1 ? 'frame' : 'frames'}
      </span>
    `;
    headerEl.appendChild(titleContainer);

    // Strip scroll buttons
    const navContainer = document.createElement('div');
    navContainer.className = 'flex items-center gap-1.5';

    const prevScrollBtn = document.createElement('button');
    prevScrollBtn.type = 'button';
    prevScrollBtn.setAttribute('data-gallery-scroll-prev', 'true');
    prevScrollBtn.setAttribute('aria-label', 'Scroll gallery left');
    prevScrollBtn.className =
      'w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-neutral-400 hover:text-white border border-white/10 transition-all duration-150 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421] disabled:opacity-30 disabled:cursor-not-allowed';
    prevScrollBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    `;

    const nextScrollBtn = document.createElement('button');
    nextScrollBtn.type = 'button';
    nextScrollBtn.setAttribute('data-gallery-scroll-next', 'true');
    nextScrollBtn.setAttribute('aria-label', 'Scroll gallery right');
    nextScrollBtn.className =
      'w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 text-neutral-400 hover:text-white border border-white/10 transition-all duration-150 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421] disabled:opacity-30 disabled:cursor-not-allowed';
    nextScrollBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    `;

    navContainer.appendChild(prevScrollBtn);
    navContainer.appendChild(nextScrollBtn);
    headerEl.appendChild(navContainer);
    root.appendChild(headerEl);

    // Empty state fallback
    if (this.screenshots.length === 0) {
      const emptyNotice = document.createElement('div');
      emptyNotice.setAttribute('data-gallery-empty', 'true');
      emptyNotice.className =
        'w-full py-8 text-center text-xs font-mono text-neutral-500 bg-white/[0.02] rounded-xl border border-dashed border-white/10 select-none';
      emptyNotice.textContent = 'No screenshots available for this project.';
      root.appendChild(emptyNotice);
      return root;
    }

    // Horizontal Snap Strip
    const strip = document.createElement('div');
    strip.setAttribute('data-gallery-strip', 'true');
    strip.className =
      'w-full flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-3 px-1 select-none focus:outline-none';
    strip.style.scrollSnapType = 'x mandatory';
    this.stripEl = strip;

    // Attach scroll buttons logic
    const scrollAmount = 320;
    this.prevScrollHandler = () => {
      if (strip.scrollBy) {
        strip.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        strip.scrollLeft -= scrollAmount;
      }
    };
    this.nextScrollHandler = () => {
      if (strip.scrollBy) {
        strip.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      } else {
        strip.scrollLeft += scrollAmount;
      }
    };

    prevScrollBtn.addEventListener('click', this.prevScrollHandler);
    nextScrollBtn.addEventListener('click', this.nextScrollHandler);

    // Populate thumbnails
    this.screenshots.forEach((src, idx) => {
      const thumbItem = document.createElement('div');
      thumbItem.setAttribute('data-gallery-thumb-item', 'true');
      thumbItem.setAttribute('data-index', String(idx));
      thumbItem.setAttribute('role', 'button');
      thumbItem.setAttribute('tabindex', '0');
      thumbItem.setAttribute('aria-label', `View screenshot ${idx + 1} of ${this.screenshots.length}: ${this.title}`);
      thumbItem.className =
        'group relative flex-none w-64 sm:w-80 aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 hover:border-white/30 cursor-pointer snap-start transition-all duration-200 hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421]';

      thumbItem.innerHTML = `
        <img
          data-gallery-thumb-img
          src="${escapeHtml(src)}"
          alt="${escapeHtml(this.title)} screenshot ${idx + 1}"
          loading="lazy"
          class="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
        <div class="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm border border-white/15 text-[11px] font-mono text-neutral-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15 3h6v6"/>
            <path d="M9 21H3v-6"/>
            <path d="M21 3l-7 7"/>
            <path d="M3 21l7-7"/>
          </svg>
          <span>Expand</span>
        </div>
      `;

      const clickHandler = () => this.openLightbox(idx);
      const keyHandler = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openLightbox(idx);
        }
      };

      thumbItem.addEventListener('click', clickHandler);
      thumbItem.addEventListener('keydown', keyHandler);

      this.thumbClickHandlers.set(thumbItem, clickHandler);
      this.thumbKeyHandlers.set(thumbItem, keyHandler);

      strip.appendChild(thumbItem);
    });

    root.appendChild(strip);
    return root;
  }

  /**
   * Opens the full-screen Lightbox modal at the given screenshot index.
   */
  public openLightbox(index: number): void {
    if (this.screenshots.length === 0) return;

    this.activeIndex = (index + this.screenshots.length) % this.screenshots.length;

    if (!this.lightboxEl) {
      this.buildLightboxDOM();
      this.attachLightboxListeners();
    } else {
      this.updateLightboxContent();
    }
  }

  /**
   * Closes and unmounts the Lightbox modal.
   */
  public closeLightbox(): void {
    this.detachLightboxListeners();

    if (this.lightboxEl) {
      this.lightboxEl.remove();
      this.lightboxEl = null;
    }
  }

  private nextScreenshot(): void {
    if (this.screenshots.length === 0) return;
    this.activeIndex = (this.activeIndex + 1) % this.screenshots.length;
    this.updateLightboxContent();
  }

  private prevScreenshot(): void {
    if (this.screenshots.length === 0) return;
    this.activeIndex = (this.activeIndex - 1 + this.screenshots.length) % this.screenshots.length;
    this.updateLightboxContent();
  }

  private buildLightboxDOM(): void {
    const lightbox = document.createElement('div');
    lightbox.setAttribute('data-gallery-lightbox', 'true');
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', `${this.title} Screenshot Lightbox`);
    lightbox.className =
      'fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/92 backdrop-blur-md p-4 sm:p-6 select-none animate-fadeIn';

    // Backdrop click catcher
    const backdrop = document.createElement('div');
    backdrop.setAttribute('data-lightbox-backdrop', 'true');
    backdrop.className = 'absolute inset-0 bg-transparent cursor-pointer';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', () => this.closeLightbox());
    lightbox.appendChild(backdrop);

    // Top control bar
    const topBar = document.createElement('div');
    topBar.className = 'relative z-10 w-full flex items-center justify-between gap-4 max-w-7xl mx-auto';

    // Counter badge
    const counterBadge = document.createElement('span');
    counterBadge.setAttribute('data-lightbox-counter', 'true');
    counterBadge.className =
      'px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-neutral-300 border border-white/10 select-none';
    counterBadge.textContent = `${this.activeIndex + 1} / ${this.screenshots.length}`;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('data-lightbox-close', 'true');
    closeBtn.setAttribute('aria-label', 'Close lightbox');
    closeBtn.className =
      'w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-neutral-300 hover:text-white border border-white/15 transition-all duration-150 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421]';
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    closeBtn.addEventListener('click', () => this.closeLightbox());

    topBar.appendChild(counterBadge);
    topBar.appendChild(closeBtn);
    lightbox.appendChild(topBar);

    // Center Stage: Prev Button, Image Container, Next Button
    const stage = document.createElement('div');
    stage.className =
      'relative z-10 w-full flex-1 flex items-center justify-between max-w-7xl mx-auto px-2 sm:px-4 gap-3 sm:gap-6 my-auto';

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.setAttribute('data-lightbox-prev', 'true');
    prevBtn.setAttribute('aria-label', 'Previous screenshot');
    prevBtn.className =
      'w-11 h-11 rounded-full bg-black/60 hover:bg-white/15 active:scale-95 text-neutral-300 hover:text-white border border-white/15 transition-all duration-150 flex items-center justify-center cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421] backdrop-blur-sm';
    prevBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 18-6-6 6-6"/>
      </svg>
    `;
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevScreenshot();
    });

    // Image View Container
    const imgWrapper = document.createElement('div');
    imgWrapper.className =
      'flex items-center justify-center max-w-[85vw] max-h-[78vh] overflow-hidden rounded-xl shadow-2xl';

    const img = document.createElement('img');
    img.setAttribute('data-lightbox-img', 'true');
    img.src = this.screenshots[this.activeIndex] || '';
    img.alt = `${this.title} screenshot ${this.activeIndex + 1}`;
    img.className =
      'max-h-[78vh] max-w-full object-contain rounded-xl border border-white/10 pointer-events-auto transition-transform duration-200 select-none';
    img.addEventListener('click', (e) => {
      // Prevent click from propagating to backdrop
      e.stopPropagation();
    });

    imgWrapper.appendChild(img);

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-lightbox-next', 'true');
    nextBtn.setAttribute('aria-label', 'Next screenshot');
    nextBtn.className =
      'w-11 h-11 rounded-full bg-black/60 hover:bg-white/15 active:scale-95 text-neutral-300 hover:text-white border border-white/15 transition-all duration-150 flex items-center justify-center cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4421] backdrop-blur-sm';
    nextBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    `;
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextScreenshot();
    });

    stage.appendChild(prevBtn);
    stage.appendChild(imgWrapper);
    stage.appendChild(nextBtn);
    lightbox.appendChild(stage);

    // Bottom subtle helper / caption bar
    const bottomBar = document.createElement('div');
    bottomBar.className = 'relative z-10 w-full flex items-center justify-center py-2 text-xs font-mono text-neutral-500';
    bottomBar.innerHTML = `<span>Use <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">←</kbd> <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">→</kbd> or swipe to navigate · <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300">Esc</kbd> to exit</span>`;
    lightbox.appendChild(bottomBar);

    document.body.appendChild(lightbox);
    this.lightboxEl = lightbox;
  }

  private updateLightboxContent(): void {
    if (!this.lightboxEl || this.screenshots.length === 0) return;

    const img = this.lightboxEl.querySelector('[data-lightbox-img]') as HTMLImageElement | null;
    if (img) {
      img.src = this.screenshots[this.activeIndex] || '';
      img.alt = `${this.title} screenshot ${this.activeIndex + 1}`;
    }

    const counter = this.lightboxEl.querySelector('[data-lightbox-counter]');
    if (counter) {
      counter.textContent = `${this.activeIndex + 1} / ${this.screenshots.length}`;
    }
  }

  private attachLightboxListeners(): void {
    // Keyboard navigation
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        this.nextScreenshot();
      } else if (e.key === 'ArrowLeft') {
        this.prevScreenshot();
      } else if (e.key === 'Escape') {
        this.closeLightbox();
      }
    };
    window.addEventListener('keydown', this.keydownHandler);

    // Touch swipe navigation on lightbox container
    if (this.lightboxEl) {
      this.touchStartHandler = (e: Event) => {
        const touch = this.extractTouch(e);
        if (touch) {
          this.touchStartX = touch.clientX;
          this.touchStartY = touch.clientY;
        }
      };

      this.touchEndHandler = (e: Event) => {
        const touch = this.extractTouch(e);
        if (touch) {
          const deltaX = touch.clientX - this.touchStartX;
          const deltaY = touch.clientY - this.touchStartY;
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);

          // Horizontal swipe threshold: at least 40px and dominant over vertical
          if (absX >= 40 && absX > absY) {
            if (deltaX < 0) {
              this.nextScreenshot();
            } else {
              this.prevScreenshot();
            }
          }
        }
      };

      this.lightboxEl.addEventListener('touchstart', this.touchStartHandler, { passive: true });
      this.lightboxEl.addEventListener('touchend', this.touchEndHandler, { passive: true });
    }
  }

  private extractTouch(e: Event): { clientX: number; clientY: number } | null {
    const touchEvt = e as unknown as { touches?: Array<{ clientX: number; clientY: number }>; changedTouches?: Array<{ clientX: number; clientY: number }> };
    if (touchEvt.changedTouches && touchEvt.changedTouches.length > 0) {
      return touchEvt.changedTouches[0];
    }
    if (touchEvt.touches && touchEvt.touches.length > 0) {
      return touchEvt.touches[0];
    }
    return null;
  }

  private detachLightboxListeners(): void {
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }

    if (this.lightboxEl) {
      if (this.touchStartHandler) {
        this.lightboxEl.removeEventListener('touchstart', this.touchStartHandler);
        this.touchStartHandler = null;
      }
      if (this.touchEndHandler) {
        this.lightboxEl.removeEventListener('touchend', this.touchEndHandler);
        this.touchEndHandler = null;
      }
    }
  }

  /**
   * Destroys the component, clearing all listeners, unmounting Lightbox modal,
   * and releasing DOM references.
   */
  public destroy(): void {
    this.closeLightbox();

    if (this.stripEl) {
      const prevBtn = this.rootEl?.querySelector('[data-gallery-scroll-prev]');
      const nextBtn = this.rootEl?.querySelector('[data-gallery-scroll-next]');

      if (prevBtn && this.prevScrollHandler) {
        prevBtn.removeEventListener('click', this.prevScrollHandler);
      }
      if (nextBtn && this.nextScrollHandler) {
        nextBtn.removeEventListener('click', this.nextScrollHandler);
      }

      this.thumbClickHandlers.forEach((handler, el) => {
        el.removeEventListener('click', handler);
      });
      this.thumbKeyHandlers.forEach((handler, el) => {
        el.removeEventListener('keydown', handler);
      });

      this.thumbClickHandlers.clear();
      this.thumbKeyHandlers.clear();
    }

    this.prevScrollHandler = null;
    this.nextScrollHandler = null;
    this.stripEl = null;

    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
  }
}
