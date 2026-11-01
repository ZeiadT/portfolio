import gsap from 'gsap';
import type { ArchitectureGraph, ArchitectureNode } from '@/domain/types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const NODE_WIDTH = 130;
const NODE_HEIGHT = 46;
const HALF_W = NODE_WIDTH / 2; // 65
const HALF_H = NODE_HEIGHT / 2; // 23
const DEFAULT_NODE_STROKE = '#333333';
const DEFAULT_NODE_FILL = '#171717';
const DEFAULT_FLOW_STROKE = '#404040';
const ACTIVE_COLOR = '#ff4421';
const ACTIVE_NODE_FILL = 'rgba(255, 68, 33, 0.12)';
const DIMMED_OPACITY = 0.25;
const NORMAL_OPACITY = 1;

/**
 * Computes a smooth cubic bezier S-curve path connecting two architecture nodes.
 */
function computeCubicBezierPath(from: ArchitectureNode, to: ArchitectureNode): string {
  const xA = from.x;
  const yA = from.y;
  const xB = to.x;
  const yB = to.y;

  let x1: number;
  let y1: number;
  let x2: number;
  let y2: number;
  let cp1x: number;
  let cp1y: number;
  let cp2x: number;
  let cp2y: number;

  if (xA < xB) {
    x1 = xA + HALF_W;
    y1 = yA;
    x2 = xB - HALF_W;
    y2 = yB;
    const dx = x2 - x1;
    cp1x = x1 + dx * 0.5;
    cp1y = y1;
    cp2x = x2 - dx * 0.5;
    cp2y = y2;
  } else if (xA > xB) {
    x1 = xA - HALF_W;
    y1 = yA;
    x2 = xB + HALF_W;
    y2 = yB;
    const dx = x1 - x2;
    cp1x = x1 - dx * 0.5;
    cp1y = y1;
    cp2x = x2 + dx * 0.5;
    cp2y = y2;
  } else {
    // Vertical alignment
    x1 = xA;
    x2 = xB;
    if (yA < yB) {
      y1 = yA + HALF_H;
      y2 = yB - HALF_H;
      const dy = y2 - y1;
      cp1x = x1;
      cp1y = y1 + dy * 0.5;
      cp2x = x2;
      cp2y = y2 - dy * 0.5;
    } else {
      y1 = yA - HALF_H;
      y2 = yB + HALF_H;
      const dy = y1 - y2;
      cp1x = x1;
      cp1y = y1 - dy * 0.5;
      cp2x = x2;
      cp2y = y2 + dy * 0.5;
    }
  }

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}

/**
 * ProjectArchitecture Component
 * Renders an interactive Clean Architecture SVG diagram with computed cubic bezier
 * connectors, arrowheads, telemetry highlights, and an interactive Node Inspector
 * Easter egg featuring vermilion luminescence and GSAP focal dimming.
 */
export class ProjectArchitecture {
  private rootEl: HTMLElement | null = null;
  private cleanups: Array<() => void> = [];
  private animatedElements: Set<Element> = new Set();
  private graph: ArchitectureGraph | null = null;
  private calloutEl: HTMLElement | null = null;

  public render(graph?: ArchitectureGraph | null, highlights?: string[]): HTMLElement {
    this.destroy();

    const root = document.createElement('section');
    root.setAttribute('data-project-architecture', 'true');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'System architecture and component topology');
    root.className = 'w-full flex flex-col gap-5 select-text';

    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      this.rootEl = root;
      return root;
    }

    this.graph = graph;
    const nodes = graph.nodes;
    const flows = graph.flows || [];
    const nodeMap = new Map<string, ArchitectureNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    // 1. Section Header
    const headerHtml = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-[#ff4421] animate-pulse" aria-hidden="true"></span>
          <h3 class="text-sm font-mono uppercase tracking-wider text-neutral-300 font-semibold">
            System Architecture
          </h3>
        </div>
        <span class="text-xs font-mono text-neutral-500 hidden sm:inline-block">Interactive Inspector</span>
      </div>
    `;

    // 2. Flows SVG markup
    const flowsSvg = flows
      .map((flow) => {
        const fromNode = nodeMap.get(flow.from);
        const toNode = nodeMap.get(flow.to);
        if (!fromNode || !toNode) return '';

        const d = computeCubicBezierPath(fromNode, toNode);
        return `
          <g data-flow-group data-from="${escapeHtml(flow.from)}" data-to="${escapeHtml(flow.to)}">
            <path
              data-architecture-flow
              data-flow-from="${escapeHtml(flow.from)}"
              data-flow-to="${escapeHtml(flow.to)}"
              d="${d}"
              fill="none"
              stroke="${DEFAULT_FLOW_STROKE}"
              stroke-width="1.5"
              marker-end="url(#arrow)"
              ${flow.bidirectional ? 'marker-start="url(#arrow)"' : ''}
              class="transition-colors duration-150"
            />
          </g>
        `;
      })
      .join('');

    // 3. Nodes SVG markup
    const nodesSvg = nodes
      .map((node) => {
        const x = node.x - HALF_W;
        const y = node.y - HALF_H;
        const layerText = node.layer
          ? `<text
              data-node-layer
              x="${x + 12}"
              y="${y + 16}"
              font-size="9"
              font-family="monospace"
              font-weight="600"
              letter-spacing="0.05em"
              fill="#a3a3a3"
              class="select-none pointer-events-none uppercase"
            >${escapeHtml(node.layer.toUpperCase())}</text>`
          : '';

        const titleText = `${node.label}${node.description ? `: ${node.description}` : ''}`;

        return `
          <g
            data-node-id="${escapeHtml(node.id)}"
            tabindex="0"
            role="button"
            aria-label="${escapeHtml(titleText)}"
            class="cursor-pointer focus:outline-none"
          >
            <title>${escapeHtml(titleText)}</title>
            <rect
              data-node-rect
              x="${x}"
              y="${y}"
              width="${NODE_WIDTH}"
              height="${NODE_HEIGHT}"
              rx="8"
              fill="${DEFAULT_NODE_FILL}"
              stroke="${DEFAULT_NODE_STROKE}"
              stroke-width="1.5"
              class="transition-colors duration-150"
            />
            ${layerText}
            <text
              data-node-label
              x="${x + 12}"
              y="${node.layer ? y + 32 : y + 27}"
              font-size="11.5"
              font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
              font-weight="500"
              fill="#f5f5f5"
              class="select-none pointer-events-none"
            >${escapeHtml(node.label)}</text>
          </g>
        `;
      })
      .join('');

    // 4. Highlights Section
    const highlightsHtml =
      highlights && highlights.length > 0
        ? `
        <div data-architecture-highlights class="w-full grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          ${highlights
            .map(
              (h) => `
            <div
              data-highlight-card
              class="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-start gap-3 backdrop-blur-sm"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[#ff4421] mt-1.5 shrink-0" aria-hidden="true"></span>
              <p class="text-xs text-neutral-300 font-sans leading-relaxed select-text">${escapeHtml(h)}</p>
            </div>
          `
            )
            .join('')}
        </div>
      `
        : '';

    // Assembly
    root.innerHTML = `
      ${headerHtml}

      <div class="relative w-full rounded-2xl bg-neutral-950/80 border border-white/10 p-4 sm:p-6 overflow-hidden backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col gap-4">
        <!-- SVG Canvas -->
        <svg
          data-architecture-canvas
          viewBox="0 0 800 320"
          class="w-full h-auto select-none block overflow-visible"
          role="region"
          aria-label="System architecture interactive graph"
        >
          <defs>
            <!-- Vermilion luminescence glow filter -->
            <filter id="vermilion-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <!-- Arrowhead marker: standard default -->
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#737373" />
            </marker>

            <!-- Arrowhead marker: active vermilion -->
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${ACTIVE_COLOR}" />
            </marker>
          </defs>

          <!-- Flows Group -->
          <g data-flows-layer>
            ${flowsSvg}
          </g>

          <!-- Nodes Group -->
          <g data-nodes-layer>
            ${nodesSvg}
          </g>
        </svg>

        <!-- Interactive Node Inspector Telemetry Bar -->
        <div
          data-node-inspector-callout
          class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono text-neutral-400 select-none transition-all duration-200"
        >
          <span data-callout-text class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-neutral-600" aria-hidden="true"></span>
            Hover or focus nodes to trace data flows
          </span>
          <span class="text-[10px] uppercase tracking-wider text-neutral-600 hidden sm:inline-block">Node Inspector</span>
        </div>
      </div>

      ${highlightsHtml}
    `;

    this.rootEl = root;
    this.calloutEl = root.querySelector('[data-node-inspector-callout]');

    this.bindInteractions(root, graph);

    return root;
  }

  private bindInteractions(root: HTMLElement, graph: ArchitectureGraph): void {
    const nodes = graph.nodes;
    const flows = graph.flows || [];

    nodes.forEach((node) => {
      const nodeEl = root.querySelector(`[data-node-id="${node.id}"]`);
      if (!nodeEl) return;

      const onEnter = () => this.highlightNode(node.id, graph);
      const onLeave = () => this.resetHighlight(graph);

      nodeEl.addEventListener('mouseenter', onEnter);
      nodeEl.addEventListener('mouseleave', onLeave);
      nodeEl.addEventListener('focus', onEnter);
      nodeEl.addEventListener('blur', onLeave);

      this.cleanups.push(() => {
        nodeEl.removeEventListener('mouseenter', onEnter);
        nodeEl.removeEventListener('mouseleave', onLeave);
        nodeEl.removeEventListener('focus', onEnter);
        nodeEl.removeEventListener('blur', onLeave);
      });
    });
  }

  private highlightNode(nodeId: string, graph: ArchitectureGraph): void {
    if (!this.rootEl) return;

    const nodes = graph.nodes;
    const flows = graph.flows || [];
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    // Identify connected nodes and flows
    const connectedNodeIds = new Set<string>([nodeId]);
    const connectedFlowKeys = new Set<string>();

    flows.forEach((flow) => {
      if (flow.from === nodeId || flow.to === nodeId) {
        connectedNodeIds.add(flow.from);
        connectedNodeIds.add(flow.to);
        connectedFlowKeys.add(`${flow.from}->${flow.to}`);
      }
    });

    // 1. Update Nodes
    nodes.forEach((node) => {
      const nodeEl = this.rootEl?.querySelector(`[data-node-id="${node.id}"]`) as SVGGElement | null;
      if (!nodeEl) return;

      this.animatedElements.add(nodeEl);
      const rect = nodeEl.querySelector('rect[data-node-rect]');

      if (node.id === nodeId) {
        rect?.setAttribute('stroke', ACTIVE_COLOR);
        rect?.setAttribute('stroke-width', '2');
        rect?.setAttribute('filter', 'url(#vermilion-glow)');
        rect?.setAttribute('fill', ACTIVE_NODE_FILL);
        gsap.to(nodeEl, { opacity: NORMAL_OPACITY, duration: 0.25, overwrite: 'auto' });
      } else if (connectedNodeIds.has(node.id)) {
        rect?.setAttribute('stroke', '#525252');
        rect?.setAttribute('stroke-width', '1.5');
        rect?.removeAttribute('filter');
        rect?.setAttribute('fill', DEFAULT_NODE_FILL);
        gsap.to(nodeEl, { opacity: NORMAL_OPACITY, duration: 0.25, overwrite: 'auto' });
      } else {
        rect?.setAttribute('stroke', DEFAULT_NODE_STROKE);
        rect?.setAttribute('stroke-width', '1.5');
        rect?.removeAttribute('filter');
        rect?.setAttribute('fill', DEFAULT_NODE_FILL);
        gsap.to(nodeEl, { opacity: DIMMED_OPACITY, duration: 0.25, overwrite: 'auto' });
      }
    });

    // 2. Update Flows
    flows.forEach((flow) => {
      const flowPath = this.rootEl?.querySelector(
        `path[data-flow-from="${flow.from}"][data-flow-to="${flow.to}"]`
      ) as SVGPathElement | null;
      if (!flowPath) return;

      this.animatedElements.add(flowPath);
      const isConnected = connectedFlowKeys.has(`${flow.from}->${flow.to}`);

      if (isConnected) {
        flowPath.setAttribute('stroke', ACTIVE_COLOR);
        flowPath.setAttribute('stroke-width', '2');
        flowPath.setAttribute('filter', 'url(#vermilion-glow)');
        flowPath.setAttribute('marker-end', 'url(#arrow-active)');
        gsap.to(flowPath, { opacity: NORMAL_OPACITY, duration: 0.25, overwrite: 'auto' });
      } else {
        flowPath.setAttribute('stroke', DEFAULT_FLOW_STROKE);
        flowPath.setAttribute('stroke-width', '1.5');
        flowPath.removeAttribute('filter');
        flowPath.setAttribute('marker-end', 'url(#arrow)');
        gsap.to(flowPath, { opacity: DIMMED_OPACITY, duration: 0.25, overwrite: 'auto' });
      }
    });

    // 3. Update Callout Bar
    if (this.calloutEl) {
      const calloutText = this.calloutEl.querySelector('[data-callout-text]');
      if (calloutText) {
        const layerBadge = targetNode.layer ? `[${targetNode.layer}] ` : '';
        const descText = targetNode.description ? `: ${targetNode.description}` : '';
        calloutText.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-[#ff4421] animate-pulse" aria-hidden="true"></span>
          <span class="text-neutral-200 font-semibold">${escapeHtml(layerBadge)}${escapeHtml(targetNode.label)}</span>
          <span class="text-neutral-400 font-normal">${escapeHtml(descText)}</span>
        `;
      }
    }
  }

  private resetHighlight(graph: ArchitectureGraph): void {
    if (!this.rootEl) return;

    const nodes = graph.nodes;
    const flows = graph.flows || [];

    // Reset Nodes
    nodes.forEach((node) => {
      const nodeEl = this.rootEl?.querySelector(`[data-node-id="${node.id}"]`) as SVGGElement | null;
      if (!nodeEl) return;

      this.animatedElements.add(nodeEl);
      const rect = nodeEl.querySelector('rect[data-node-rect]');
      rect?.setAttribute('stroke', DEFAULT_NODE_STROKE);
      rect?.setAttribute('stroke-width', '1.5');
      rect?.removeAttribute('filter');
      rect?.setAttribute('fill', DEFAULT_NODE_FILL);
      gsap.to(nodeEl, { opacity: NORMAL_OPACITY, duration: 0.25, overwrite: 'auto' });
    });

    // Reset Flows
    flows.forEach((flow) => {
      const flowPath = this.rootEl?.querySelector(
        `path[data-flow-from="${flow.from}"][data-flow-to="${flow.to}"]`
      ) as SVGPathElement | null;
      if (!flowPath) return;

      this.animatedElements.add(flowPath);
      flowPath.setAttribute('stroke', DEFAULT_FLOW_STROKE);
      flowPath.setAttribute('stroke-width', '1.5');
      flowPath.removeAttribute('filter');
      flowPath.setAttribute('marker-end', 'url(#arrow)');
      gsap.to(flowPath, { opacity: NORMAL_OPACITY, duration: 0.25, overwrite: 'auto' });
    });

    // Reset Callout Bar
    if (this.calloutEl) {
      const calloutText = this.calloutEl.querySelector('[data-callout-text]');
      if (calloutText) {
        calloutText.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-neutral-600" aria-hidden="true"></span>
          Hover or focus nodes to trace data flows
        `;
      }
    }
  }

  public destroy(): void {
    // 1. Detach event listeners
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];

    // 2. Kill all active GSAP tweens
    this.animatedElements.forEach((el) => {
      gsap.killTweensOf(el);
    });
    this.animatedElements.clear();

    // 3. Remove DOM elements
    if (this.rootEl) {
      this.rootEl.remove();
      this.rootEl = null;
    }
    this.calloutEl = null;
    this.graph = null;
  }
}
