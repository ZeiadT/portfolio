import type { CardSummonData, CardSummonTheme } from '../CardSummonEngine';

/**
 * Contract for modular, swappable card face renderers.
 * Decouples visual card layout and theme rendering from the CardSummonEngine modal lifecycle.
 */
export interface CardFaceRenderer {
  /**
   * Unique identifier for the renderer strategy (e.g. 'mythic-rare-tcg', 'minimalist-editorial').
   */
  readonly id: string;

  /**
   * Renders the card face DOM structure into the specified container element.
   *
   * @param container - The DOM element destined to host the front face layout.
   * @param data - Card content attributes, titles, avatar, and stats.
   * @param theme - Visual styling theme tokens (primaryColor, coreColor, accentColor).
   */
  render(container: HTMLElement, data: CardSummonData, theme: CardSummonTheme): void;
}
