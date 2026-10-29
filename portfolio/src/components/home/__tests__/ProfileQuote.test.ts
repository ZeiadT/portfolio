import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileQuote } from '../ProfileQuote';

describe('ProfileQuote Component', () => {
  let container: HTMLElement;
  const quoteText = '“I love turning complex problems into simple, reliable systems that teams can trust.”';

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders centered quote horizontally in available space', () => {
    const component = new ProfileQuote(quoteText);
    component.mount(container);

    const quoteEl = container.querySelector('[data-profile-quote]');
    expect(quoteEl).toBeTruthy();
    expect(quoteEl?.textContent).toContain(quoteText);
    expect(quoteEl?.classList.contains('text-center')).toBe(true);
  });

  it('cleans up elements on destroy', () => {
    const component = new ProfileQuote(quoteText);
    component.mount(container);
    expect(container.children.length).toBeGreaterThan(0);

    component.destroy();
    expect(container.children.length).toBe(0);
  });
});
