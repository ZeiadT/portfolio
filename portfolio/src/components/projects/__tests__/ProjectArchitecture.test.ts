import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import gsap from 'gsap';
import { ProjectArchitecture } from '../ProjectArchitecture';
import type { ArchitectureGraph } from '@/domain/types';

describe('ProjectArchitecture Component', () => {
  let container: HTMLElement;
  let mockGraph: ArchitectureGraph;
  let mockHighlights: string[];

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    mockGraph = {
      nodes: [
        { id: 'node-ui', label: 'Jetpack UI', layer: 'Presentation', x: 90, y: 160, description: 'UI layer' },
        { id: 'node-vm', label: 'ViewModel', layer: 'Domain', x: 290, y: 160, description: 'StateFlow processing' },
        { id: 'node-repo', label: 'Repository', layer: 'Data', x: 490, y: 160, description: 'Single source of truth' },
        { id: 'node-db', label: 'Database', layer: 'Data', x: 690, y: 90, description: 'Local Room cache' },
        { id: 'node-api', label: 'Remote API', layer: 'Network', x: 690, y: 230, description: 'Retrofit client' },
      ],
      flows: [
        { from: 'node-ui', to: 'node-vm', label: 'Intents' },
        { from: 'node-vm', to: 'node-repo', label: 'Observe' },
        { from: 'node-repo', to: 'node-db', label: 'Cache' },
        { from: 'node-repo', to: 'node-api', label: 'Fetch' },
      ],
    };

    mockHighlights = [
      'Clean Architecture separation across presentation, domain, and data layers',
      'Offline-first synchronization with TTL cache invalidation',
      'Reactive state emissions via Kotlin Flow & Coroutines',
    ];
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  describe('1. SVG Canvas & Viewport Rendering', () => {
    it('renders a root section element with data-project-architecture', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph, mockHighlights);
      container.appendChild(el);

      expect(el).toBeTruthy();
      expect(el.getAttribute('data-project-architecture')).toBe('true');
      expect(el.tagName.toLowerCase()).toMatch(/^(section|div)$/);
    });

    it('renders responsive SVG canvas with viewBox 0 0 800 320', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph, mockHighlights);
      container.appendChild(el);

      const svg = el.querySelector('svg[data-architecture-canvas]');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 800 320');
      expect(svg?.getAttribute('role')).toBe('region');
    });

    it('defines arrow markers and vermilion glow filter inside <defs>', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const defs = el.querySelector('defs');
      expect(defs).toBeTruthy();

      const marker = defs?.querySelector('marker#arrow');
      expect(marker).toBeTruthy();

      const filter = defs?.querySelector('filter#vermilion-glow');
      expect(filter).toBeTruthy();
    });

    it('renders all node rectangles centered at specified coordinates with layer and label', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const nodeGroups = el.querySelectorAll('[data-node-id]');
      expect(nodeGroups).toHaveLength(5);

      const uiNode = el.querySelector('[data-node-id="node-ui"]');
      expect(uiNode).toBeTruthy();

      const rect = uiNode?.querySelector('rect[data-node-rect]');
      expect(rect).toBeTruthy();

      // Node width = 130, height = 46. With center x=90, y=160 -> x=25, y=137
      const width = Number(rect?.getAttribute('width'));
      const height = Number(rect?.getAttribute('height'));
      const x = Number(rect?.getAttribute('x'));
      const y = Number(rect?.getAttribute('y'));

      expect(width).toBe(130);
      expect(height).toBe(46);
      expect(x).toBe(90 - 130 / 2);
      expect(y).toBe(160 - 46 / 2);

      const layerText = uiNode?.querySelector('[data-node-layer]');
      expect(layerText?.textContent?.trim()).toBe('PRESENTATION');

      const labelText = uiNode?.querySelector('[data-node-label]');
      expect(labelText?.textContent?.trim()).toBe('Jetpack UI');
    });

    it('renders cubic bezier curve paths for all data flows with arrowheads', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const flowPaths = el.querySelectorAll('path[data-architecture-flow]');
      expect(flowPaths).toHaveLength(4);

      // Verify repo -> db flow: from x=490,y=160 to x=690,y=90
      const repoDbFlow = el.querySelector('path[data-flow-from="node-repo"][data-flow-to="node-db"]');
      expect(repoDbFlow).toBeTruthy();
      const d = repoDbFlow?.getAttribute('d');
      expect(d).toBeTruthy();
      expect(d).toMatch(/^M\s*555\s+160\s+C\s*590\s+160,\s*590\s+90,\s*625\s+90$/);
      expect(repoDbFlow?.getAttribute('marker-end')).toBe('url(#arrow)');
    });
  });

  describe('2. Accessibility & Semantics', () => {
    it('sets keyboard focus attributes tabindex="0" and role="button" on all nodes', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const nodes = el.querySelectorAll('[data-node-id]');
      nodes.forEach((node) => {
        expect(node.getAttribute('tabindex')).toBe('0');
        expect(node.getAttribute('role')).toBe('button');
        expect(node.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('includes SVG <title> inside node groups for native accessibility', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const uiNode = el.querySelector('[data-node-id="node-ui"]');
      const titleEl = uiNode?.querySelector('title');
      expect(titleEl).toBeTruthy();
      expect(titleEl?.textContent).toContain('Jetpack UI');
      expect(titleEl?.textContent).toContain('UI layer');
    });
  });

  describe('3. Architecture Highlights List', () => {
    it('renders bulleted highlight cards when highlights array is provided', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph, mockHighlights);
      container.appendChild(el);

      const highlightsSection = el.querySelector('[data-architecture-highlights]');
      expect(highlightsSection).toBeTruthy();

      const cards = el.querySelectorAll('[data-highlight-card]');
      expect(cards).toHaveLength(3);
      expect(cards[0].textContent).toContain('Clean Architecture separation');
      expect(cards[1].textContent).toContain('Offline-first synchronization');
      expect(cards[2].textContent).toContain('Reactive state emissions');
    });

    it('omits highlights container gracefully when highlights is empty or not provided', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const cards = el.querySelectorAll('[data-highlight-card]');
      expect(cards).toHaveLength(0);
    });
  });

  describe('4. Interactive Node Inspector Easter Egg', () => {
    it('lights up hovered node in vermilion and dims unrelated nodes to 0.25 opacity', () => {
      const toSpy = vi.spyOn(gsap, 'to');
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const repoNode = el.querySelector('[data-node-id="node-repo"]') as SVGGElement;
      expect(repoNode).toBeTruthy();

      // Trigger hover
      repoNode.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      // Repo node rect should have vermilion stroke and glow filter
      const rect = repoNode.querySelector('rect[data-node-rect]');
      expect(rect?.getAttribute('stroke')).toBe('#ff4421');
      expect(rect?.getAttribute('filter')).toBe('url(#vermilion-glow)');

      // Check GSAP call for dimming unrelated node (e.g. node-ui is unrelated to node-db/api from repo perspective, or node-ui if not connected)
      // Actually node-ui is connected to vm, which connects to repo. Unrelated nodes would be dimmed.
      // In this test, let's verify that gsap.to was called with opacity: 0.25
      const dimCalls = toSpy.mock.calls.filter((call) => call[1]?.opacity === 0.25);
      expect(dimCalls.length).toBeGreaterThan(0);

      // Connected flows should have vermilion stroke
      const connectedFlow = el.querySelector('path[data-flow-from="node-repo"][data-flow-to="node-db"]');
      expect(connectedFlow?.getAttribute('stroke')).toBe('#ff4421');
      expect(connectedFlow?.getAttribute('filter')).toBe('url(#vermilion-glow)');
    });

    it('lights up node and flows identically on keyboard focus', () => {
      const toSpy = vi.spyOn(gsap, 'to');
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const vmNode = el.querySelector('[data-node-id="node-vm"]') as SVGGElement;
      expect(vmNode).toBeTruthy();

      // Trigger keyboard focus
      vmNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

      const rect = vmNode.querySelector('rect[data-node-rect]');
      expect(rect?.getAttribute('stroke')).toBe('#ff4421');
      expect(rect?.getAttribute('filter')).toBe('url(#vermilion-glow)');

      const highlightCalls = toSpy.mock.calls.filter((call) => call[1]?.opacity === 1);
      expect(highlightCalls.length).toBeGreaterThan(0);
    });

    it('resets all styles and opacities on mouseleave', () => {
      const toSpy = vi.spyOn(gsap, 'to');
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const repoNode = el.querySelector('[data-node-id="node-repo"]') as SVGGElement;
      repoNode.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      // Clear spy to inspect reset calls
      toSpy.mockClear();

      // Trigger mouseleave
      repoNode.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

      const rect = repoNode.querySelector('rect[data-node-rect]');
      expect(rect?.getAttribute('stroke')).toBe('#333333');
      expect(rect?.getAttribute('filter')).toBeFalsy();

      // GSAP called to reset all nodes and flows back to opacity 1
      const resetCalls = toSpy.mock.calls.filter((call) => call[1]?.opacity === 1);
      expect(resetCalls.length).toBeGreaterThanOrEqual(mockGraph.nodes.length);
    });

    it('resets all styles and opacities on blur', () => {
      const toSpy = vi.spyOn(gsap, 'to');
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const vmNode = el.querySelector('[data-node-id="node-vm"]') as SVGGElement;
      vmNode.dispatchEvent(new FocusEvent('focus', { bubbles: true }));

      toSpy.mockClear();

      vmNode.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

      const rect = vmNode.querySelector('rect[data-node-rect]');
      expect(rect?.getAttribute('stroke')).toBe('#333333');

      const resetCalls = toSpy.mock.calls.filter((call) => call[1]?.opacity === 1);
      expect(resetCalls.length).toBeGreaterThanOrEqual(mockGraph.nodes.length);
    });

    it('updates interactive inspector telemetry callout text when a node is inspected', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const callout = el.querySelector('[data-node-inspector-callout]');
      expect(callout).toBeTruthy();

      const repoNode = el.querySelector('[data-node-id="node-repo"]') as SVGGElement;
      repoNode.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      expect(callout?.textContent).toContain('Repository');
      expect(callout?.textContent).toContain('Single source of truth');

      repoNode.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      expect(callout?.textContent).toContain('Hover or focus');
    });
  });

  describe('5. Teardown Lifecycle & Edge Cases', () => {
    it('kills active GSAP tweens and detaches event listeners on destroy()', () => {
      const killTweensSpy = vi.spyOn(gsap, 'killTweensOf');
      const arch = new ProjectArchitecture();
      const el = arch.render(mockGraph);
      container.appendChild(el);

      const repoNode = el.querySelector('[data-node-id="node-repo"]') as SVGGElement;
      repoNode.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

      arch.destroy();

      expect(killTweensSpy).toHaveBeenCalled();
      expect(container.contains(el)).toBe(false);

      // Subsequent hover after destroy should have no effect
      killTweensSpy.mockClear();
      repoNode.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      expect(killTweensSpy).not.toHaveBeenCalled();
    });

    it('can be destroyed multiple times safely without error', () => {
      const arch = new ProjectArchitecture();
      arch.render(mockGraph);
      expect(() => {
        arch.destroy();
        arch.destroy();
      }).not.toThrow();
    });

    it('handles empty or missing architecture graph gracefully without crashing', () => {
      const arch = new ProjectArchitecture();
      expect(() => {
        const el1 = arch.render({ nodes: [], flows: [] });
        expect(el1).toBeTruthy();

        const el2 = arch.render(undefined as any);
        expect(el2).toBeTruthy();
      }).not.toThrow();
    });

    it('handles graph with nodes but no flows cleanly', () => {
      const arch = new ProjectArchitecture();
      const el = arch.render({
        nodes: [{ id: 'n1', label: 'Solo Node', x: 400, y: 160 }],
        flows: [],
      });
      container.appendChild(el);

      const nodes = el.querySelectorAll('[data-node-id]');
      expect(nodes).toHaveLength(1);

      const flows = el.querySelectorAll('[data-architecture-flow]');
      expect(flows).toHaveLength(0);
    });
  });
});
