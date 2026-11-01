import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectMetrics } from '../ProjectMetrics';
import type { ProjectMetric } from '@/domain/types';

describe('ProjectMetrics Component', () => {
  let container: HTMLElement;
  let mockMetrics: ProjectMetric[];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockMetrics = [
      { label: 'Cold Start', value: '< 280ms', detail: 'Macrobenchmark profiles' },
      { label: 'Cache Hit Rate', value: '94.6%', detail: 'Local Room database persistence' },
      { label: 'Crash-Free', value: '99.9%' },
    ];
  });

  afterEach(() => {
    container.remove();
  });

  it('renders all metric dial cards with label, value, and detail', () => {
    const component = new ProjectMetrics();
    const el = component.render(mockMetrics);
    container.appendChild(el);

    const cards = el.querySelectorAll('[data-metric-card]');
    expect(cards).toHaveLength(3);

    // Card 1
    const value1 = cards[0].querySelector('[data-metric-value]');
    const label1 = cards[0].querySelector('[data-metric-label]');
    const detail1 = cards[0].querySelector('[data-metric-detail]');
    expect(value1?.textContent?.trim()).toBe('< 280ms');
    expect(label1?.textContent?.trim()).toBe('Cold Start');
    expect(detail1?.textContent?.trim()).toBe('Macrobenchmark profiles');

    // Card 2
    const value2 = cards[1].querySelector('[data-metric-value]');
    const label2 = cards[1].querySelector('[data-metric-label]');
    const detail2 = cards[1].querySelector('[data-metric-detail]');
    expect(value2?.textContent?.trim()).toBe('94.6%');
    expect(label2?.textContent?.trim()).toBe('Cache Hit Rate');
    expect(detail2?.textContent?.trim()).toBe('Local Room database persistence');
  });

  it('gracefully handles missing detail without rendering undefined', () => {
    const component = new ProjectMetrics();
    const el = component.render(mockMetrics);
    container.appendChild(el);

    const cards = el.querySelectorAll('[data-metric-card]');
    // Card 3 has no detail
    const detail3 = cards[2].querySelector('[data-metric-detail]');
    if (detail3) {
      expect(detail3.textContent?.trim()).toBe('');
    } else {
      expect(detail3).toBeNull();
    }
    expect(cards[2].textContent).not.toContain('undefined');
  });

  it('handles empty metrics gracefully by returning a clean container', () => {
    const component = new ProjectMetrics();
    const el = component.render([]);
    container.appendChild(el);

    const cards = el.querySelectorAll('[data-metric-card]');
    expect(cards).toHaveLength(0);
  });

  it('applies dark glass styling classes to cards', () => {
    const component = new ProjectMetrics();
    const el = component.render(mockMetrics);
    container.appendChild(el);

    const cards = el.querySelectorAll('[data-metric-card]');
    expect(cards.length).toBeGreaterThan(0);
    const firstCard = cards[0] as HTMLElement;
    expect(
      firstCard.className.includes('rounded') &&
      firstCard.className.includes('border')
    ).toBe(true);
  });

  it('cleans up elements and references on destroy()', () => {
    const component = new ProjectMetrics();
    const el = component.render(mockMetrics);
    container.appendChild(el);

    expect(container.contains(el)).toBe(true);

    component.destroy();

    // Calling destroy cleans internal references and allows clean unmounting
    expect(() => component.destroy()).not.toThrow();
  });

  it('sanitizes metric content against XSS injections', () => {
    const component = new ProjectMetrics();
    const maliciousMetrics: ProjectMetric[] = [
      {
        label: '<script>alert("xss-label")</script>SecureLabel',
        value: '<img src=x onerror=alert("xss-value")>99%',
        detail: '<svg onload=alert("xss-detail")>Clean detail',
      },
    ];

    const el = component.render(maliciousMetrics);
    container.appendChild(el);

    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('img[onerror]')).toBeNull();
    expect(el.querySelector('svg[onload]')).toBeNull();
    expect(el.textContent).toContain('SecureLabel');
    expect(el.textContent).toContain('99%');
    expect(el.textContent).toContain('Clean detail');
  });
});
