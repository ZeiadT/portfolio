import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProjectGallery } from '../ProjectGallery';

describe('ProjectGallery Component', () => {
  let container: HTMLElement;
  const sampleScreenshots = [
    '/assets/projects/dusk-1.png',
    '/assets/projects/dusk-2.png',
    '/assets/projects/dusk-3.png',
    '/assets/projects/dusk-4.png',
  ];
  const projectTitle = 'Dusk Weather App';

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    // Clean up any stray lightboxes attached to body
    document.querySelectorAll('[data-gallery-lightbox]').forEach((el) => el.remove());
    vi.restoreAllMocks();
  });

  describe('Rendering & Snap Strip Structure', () => {
    it('renders the gallery root with appropriate data attribute, role, and aria-label', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      expect(el).toBeTruthy();
      expect(el.getAttribute('data-project-gallery')).toBe('true');
      expect(el.getAttribute('role')).toBe('region');
      expect(el.getAttribute('aria-label')).toContain(projectTitle);
    });

    it('renders horizontal snap strip container with snap-x snap-mandatory classes', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const strip = el.querySelector('[data-gallery-strip]') as HTMLElement;
      expect(strip).toBeTruthy();
      expect(strip.className).toContain('snap-x');
      expect(strip.className).toContain('snap-mandatory');
      expect(strip.className).toContain('overflow-x-auto');
    });

    it('renders correct number of thumbnail items with images and alt attributes', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      expect(items).toHaveLength(4);

      items.forEach((item, idx) => {
        const img = item.querySelector('img') as HTMLImageElement;
        expect(img).toBeTruthy();
        expect(img.getAttribute('src')).toBe(sampleScreenshots[idx]);
        expect(img.getAttribute('alt')).toContain(projectTitle);
        expect(img.getAttribute('loading')).toBe('lazy');
        expect(item.getAttribute('data-index')).toBe(String(idx));
      });
    });

    it('renders strip Next and Prev scroll buttons with accessible labels', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const prevBtn = el.querySelector('[data-gallery-scroll-prev]') as HTMLButtonElement;
      const nextBtn = el.querySelector('[data-gallery-scroll-next]') as HTMLButtonElement;

      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
      expect(prevBtn.getAttribute('aria-label')).toBeTruthy();
      expect(nextBtn.getAttribute('aria-label')).toBeTruthy();
    });

    it('triggers scroll on strip Next/Prev button clicks', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const strip = el.querySelector('[data-gallery-strip]') as HTMLElement;
      const scrollBySpy = vi.fn();
      strip.scrollBy = scrollBySpy;

      const nextBtn = el.querySelector('[data-gallery-scroll-next]') as HTMLButtonElement;
      nextBtn.click();
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          left: expect.any(Number),
          behavior: 'smooth',
        })
      );

      const prevBtn = el.querySelector('[data-gallery-scroll-prev]') as HTMLButtonElement;
      prevBtn.click();
      expect(scrollBySpy).toHaveBeenCalledTimes(2);
    });

    it('renders gracefully when screenshots array is empty', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render([], projectTitle);
      container.appendChild(el);

      expect(el).toBeTruthy();
      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      expect(items).toHaveLength(0);

      const emptyNotice = el.querySelector('[data-gallery-empty]');
      expect(emptyNotice).toBeTruthy();
    });
  });

  describe('Lightbox Modal Interaction', () => {
    it('opens lightbox when a thumbnail item is clicked', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      expect(document.querySelector('[data-gallery-lightbox]')).toBeNull();

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[1] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      expect(lightbox).toBeTruthy();
      expect(lightbox.getAttribute('role')).toBe('dialog');
      expect(lightbox.getAttribute('aria-modal')).toBe('true');

      const img = lightbox.querySelector('[data-lightbox-img]') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.getAttribute('src')).toBe(sampleScreenshots[1]);

      const counter = lightbox.querySelector('[data-lightbox-counter]');
      expect(counter?.textContent?.trim()).toBe('2 / 4');
    });

    it('opens lightbox on keyboard Enter on thumbnail item', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      items[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      expect(lightbox).toBeTruthy();

      const counter = lightbox.querySelector('[data-lightbox-counter]');
      expect(counter?.textContent?.trim()).toBe('3 / 4');
    });

    it('navigates to next screenshot when Lightbox Next button is clicked', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const nextBtn = lightbox.querySelector('[data-lightbox-next]') as HTMLButtonElement;
      nextBtn.click();

      const img = lightbox.querySelector('[data-lightbox-img]') as HTMLImageElement;
      expect(img.getAttribute('src')).toBe(sampleScreenshots[1]);
      const counter = lightbox.querySelector('[data-lightbox-counter]');
      expect(counter?.textContent?.trim()).toBe('2 / 4');
    });

    it('wraps around to first screenshot when clicking Next at the end', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[3] as HTMLElement).click(); // last image

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const nextBtn = lightbox.querySelector('[data-lightbox-next]') as HTMLButtonElement;
      nextBtn.click();

      const img = lightbox.querySelector('[data-lightbox-img]') as HTMLImageElement;
      expect(img.getAttribute('src')).toBe(sampleScreenshots[0]);
      const counter = lightbox.querySelector('[data-lightbox-counter]');
      expect(counter?.textContent?.trim()).toBe('1 / 4');
    });

    it('navigates to previous screenshot when Lightbox Prev button is clicked', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[2] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const prevBtn = lightbox.querySelector('[data-lightbox-prev]') as HTMLButtonElement;
      prevBtn.click();

      const img = lightbox.querySelector('[data-lightbox-img]') as HTMLImageElement;
      expect(img.getAttribute('src')).toBe(sampleScreenshots[1]);
      const counter = lightbox.querySelector('[data-lightbox-counter]');
      expect(counter?.textContent?.trim()).toBe('2 / 4');
    });

    it('wraps around to last screenshot when clicking Prev on first image', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const prevBtn = lightbox.querySelector('[data-lightbox-prev]') as HTMLButtonElement;
      prevBtn.click();

      const img = lightbox.querySelector('[data-lightbox-img]') as HTMLImageElement;
      expect(img.getAttribute('src')).toBe(sampleScreenshots[3]);
      const counter = lightbox.querySelector('[data-lightbox-counter]');
      expect(counter?.textContent?.trim()).toBe('4 / 4');
    });

    it('closes lightbox when close button is clicked', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const closeBtn = lightbox.querySelector('[data-lightbox-close]') as HTMLButtonElement;
      closeBtn.click();

      expect(document.querySelector('[data-gallery-lightbox]')).toBeNull();
    });

    it('closes lightbox when backdrop is clicked', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const backdrop = document.querySelector('[data-lightbox-backdrop]') as HTMLElement;
      backdrop.click();

      expect(document.querySelector('[data-gallery-lightbox]')).toBeNull();
    });

    it('does not close lightbox when clicking the image directly', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const img = document.querySelector('[data-lightbox-img]') as HTMLElement;
      img.click();

      expect(document.querySelector('[data-gallery-lightbox]')).not.toBeNull();
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates with ArrowRight and ArrowLeft keys', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const counter = lightbox.querySelector('[data-lightbox-counter]');

      // Press ArrowRight
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(counter?.textContent?.trim()).toBe('2 / 4');

      // Press ArrowLeft
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(counter?.textContent?.trim()).toBe('1 / 4');
    });

    it('closes lightbox on Escape key', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      expect(document.querySelector('[data-gallery-lightbox]')).not.toBeNull();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(document.querySelector('[data-gallery-lightbox]')).toBeNull();
    });

    it('does not respond to key events when lightbox is closed', () => {
      const gallery = new ProjectGallery();
      gallery.render(sampleScreenshots, projectTitle);

      expect(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      }).not.toThrow();

      expect(document.querySelector('[data-gallery-lightbox]')).toBeNull();
    });
  });

  describe('Touch Swipe Navigation', () => {
    function createTouchEvent(type: string, clientX: number, clientY: number): Event {
      const evt = new CustomEvent(type, { bubbles: true, cancelable: true });
      Object.assign(evt, {
        touches: [{ clientX, clientY }],
        changedTouches: [{ clientX, clientY }],
      });
      return evt;
    }

    it('swipes left to navigate to next screenshot', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const counter = lightbox.querySelector('[data-lightbox-counter]');

      // Swipe Left: Start at 200, end at 100 (deltaX = -100)
      lightbox.dispatchEvent(createTouchEvent('touchstart', 200, 100));
      lightbox.dispatchEvent(createTouchEvent('touchend', 100, 100));

      expect(counter?.textContent?.trim()).toBe('2 / 4');
    });

    it('swipes right to navigate to previous screenshot', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[1] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const counter = lightbox.querySelector('[data-lightbox-counter]');

      // Swipe Right: Start at 100, end at 200 (deltaX = +100)
      lightbox.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      lightbox.dispatchEvent(createTouchEvent('touchend', 200, 100));

      expect(counter?.textContent?.trim()).toBe('1 / 4');
    });

    it('ignores small swipes below threshold (< 40px)', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const counter = lightbox.querySelector('[data-lightbox-counter]');

      // Minor swipe: deltaX = -20
      lightbox.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      lightbox.dispatchEvent(createTouchEvent('touchend', 80, 100));

      expect(counter?.textContent?.trim()).toBe('1 / 4');
    });

    it('ignores vertical-dominant swipes (deltaY > deltaX)', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      const lightbox = document.querySelector('[data-gallery-lightbox]') as HTMLElement;
      const counter = lightbox.querySelector('[data-lightbox-counter]');

      // Vertical swipe: deltaY = 150, deltaX = 45
      lightbox.dispatchEvent(createTouchEvent('touchstart', 100, 100));
      lightbox.dispatchEvent(createTouchEvent('touchend', 55, 250));

      expect(counter?.textContent?.trim()).toBe('1 / 4');
    });
  });

  describe('Lifecycle & Cleanup (destroy)', () => {
    it('unmounts lightbox from DOM on destroy()', () => {
      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      expect(document.querySelector('[data-gallery-lightbox]')).not.toBeNull();

      gallery.destroy();

      expect(document.querySelector('[data-gallery-lightbox]')).toBeNull();
    });

    it('removes window keydown listener on destroy()', () => {
      const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

      const gallery = new ProjectGallery();
      const el = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el);

      const items = el.querySelectorAll('[data-gallery-thumb-item]');
      (items[0] as HTMLElement).click();

      gallery.destroy();

      expect(removeListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('can be called multiple times safely without error', () => {
      const gallery = new ProjectGallery();
      gallery.render(sampleScreenshots, projectTitle);

      expect(() => {
        gallery.destroy();
        gallery.destroy();
      }).not.toThrow();
    });

    it('re-rendering tears down prior instance without leak', () => {
      const gallery = new ProjectGallery();
      const el1 = gallery.render(sampleScreenshots, projectTitle);
      container.appendChild(el1);

      const el2 = gallery.render(['/assets/single.png'], projectTitle);
      container.appendChild(el2);

      const thumbs = el2.querySelectorAll('[data-gallery-thumb-item]');
      expect(thumbs).toHaveLength(1);

      gallery.destroy();
      expect(document.querySelector('[data-gallery-lightbox]')).toBeNull();
    });
  });
});
