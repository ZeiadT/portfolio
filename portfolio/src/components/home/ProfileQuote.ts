/**
 * ProfileQuote Component
 * Renders the personal quote centered horizontally in the space between the image
 * and the left side of the screen, matching the wireframe composition.
 */
export class ProfileQuote {
  private quote: string;
  private rootEl: HTMLElement | null = null;

  constructor(quote: string) {
    this.quote = quote;
  }

  public mount(container: HTMLElement): void {
    const root = document.createElement('div');
    root.className =
      'profile-quote-section w-full flex-1 flex items-center justify-center py-6 sm:py-8 lg:py-4 select-text';

    root.innerHTML = `
      <blockquote
        data-profile-quote
        class="text-center font-sans font-light italic text-lg sm:text-xl md:text-2xl lg:text-[1.7rem] text-neutral-100 tracking-tight leading-relaxed sm:leading-[1.4] max-w-2xl text-balance"
      >
        ${this.quote}
      </blockquote>
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
