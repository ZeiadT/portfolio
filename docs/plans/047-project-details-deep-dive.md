# Feature Specification: Project Details Deep-Dive Screen (Feature 4)

**Document Version:** 1.0.0  
**Date:** 2026-11-01  
**Status:** Approved  
**Worktree:** `../portfolio-details`  
**Branch:** `feat/project-details-modal`  
**Tech Stack:** Vanilla TypeScript 5+, Vite 6, GSAP 3.12+, Tailwind CSS v4, Vitest, Happy-DOM  

---

## 1. Executive Summary & Purpose

The **Project Details Deep-Dive Screen** is an editorial case-study modal/sheet presenting deep engineering breakdowns for Zeiad's 6 flagship projects (`Dusk`, `Cargo`, `Gusto`, `SportX`, `ElevatED`, `Wireless Mouse`).

It elevates standard project cards into a comprehensive technical showcase featuring:
1. **Interactive Visual Architecture Diagrams**: Semantic SVG layer flows with a reactive **Node Inspector** Easter egg (illuminating dependency trees and data streams in vermilion `#ff4421` luminescence).
2. **Performance Telemetry Dials**: High-salience metric cards (e.g. *"< 16ms render"*, *"100% offline-ready"*, *"Clean Architecture"*).
3. **Live Code Scratchpad**: Collapsible drawer presenting authentic Kotlin Coroutine, KMP, Swift, Dart, and C# source snippets with zero-dependency syntax highlighting and instant copy-to-clipboard.
4. **Media Walkthrough Gallery**: Horizontal device screenshot snap-strip with click-to-expand keyboard-accessible Lightbox.
5. **Sticky Glass Action Footer**: Anchored action bar with direct GitHub repository routing, live demo, and APK download links.
6. **Card-to-Modal Kinematics**: Synchronized FLIP zoom transition from the 3D carousel card into the full-screen case study sheet (`scale: 0.95 -> 1`, `opacity: 0 -> 1`, `400ms`), with smooth slide-down and backdrop blur fade-out dismissal.

---

## 2. Component Hierarchy & Architectural Boundaries

In compliance with `AGENTS.md` (100% self-contained, drop-in reusability, zero memory leaks), the feature is decomposed into focused sub-components orchestrated by `ProjectDetailsModal`:

```
portfolio/src/
├── domain/
│   └── types.ts                    # Enriched ProjectDetails, ArchitectureGraph, CodeSnippet contracts
├── data/
│   └── projects.ts                 # Full technical records for 6 flagship projects
├── utils/
│   └── codeTokenizer.ts            # Zero-dependency syntax tokenizer (Kotlin, Swift, Dart, C#)
└── components/
    └── projects/
        ├── ProjectDetailsModal.ts  # Master orchestrator (lifecycle, FLIP kinematics, keyboard/swipe)
        ├── ProjectHeader.ts        # Hero header, category badge, live beacon, close CTA
        ├── ProjectArchitecture.ts  # Semantic SVG diagram + Interactive Node Inspector
        ├── ProjectMetrics.ts       # Telemetry metric dials & performance cards
        ├── ProjectCodeScratchpad.ts# Collapsible code drawer + syntax tokenizer + copy button
        ├── ProjectGallery.ts       # Horizontal snap strip + expandable full-res Lightbox
        └── ProjectFooter.ts        # Sticky glass action bar (GitHub, APK, Live Demo)
```

---

## 3. Detailed Component Specifications

### 3.1 Domain Contracts (`src/domain/types.ts`)

```typescript
export interface ArchitectureNode {
  id: string;
  label: string;
  layer: 'presentation' | 'domain' | 'data' | 'platform';
  description: string;
  dependsOn?: string[]; // IDs of downstream layers/nodes highlighted during inspection
}

export interface ArchitectureFlow {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureGraph {
  summary: string;
  nodes: ArchitectureNode[];
  flows: ArchitectureFlow[];
}

export interface CodeSnippet {
  language: 'kotlin' | 'swift' | 'dart' | 'csharp';
  title: string;
  code: string;
  explanation?: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface ProjectDetails extends Project {
  longDescription?: string;
  liveStatus?: 'Live' | 'Production' | 'Open Source' | 'Archived';
  architectureGraph?: ArchitectureGraph;
  architectureHighlights?: string[];
  metrics?: ProjectMetric[];
  codeSnippet?: CodeSnippet;
  galleryScreenshots?: string[];
}
```

### 3.2 Lightweight Syntax Tokenizer (`src/utils/codeTokenizer.ts`)

A zero-dependency regex tokenizer mapping tokens to Tailwind classes:
- Keywords (`val`, `var`, `fun`, `suspend`, `override`, `class`, `interface`, `async`, `await`, `struct`, `import`): `text-sky-400 font-semibold`
- Annotations/Decorators (`@Composable`, `@Inject`, `@Entity`, `@Dao`): `text-amber-400 font-medium`
- Types & Interfaces (`Flow`, `StateFlow`, `Result`, `CoroutineScope`, `Repository`): `text-emerald-400`
- String Literals (`"..."`): `text-lime-300`
- Comments (`//...`, `/*...*/`): `text-neutral-500 italic`
- Numeric Literals: `text-orange-300`
- Raw HTML characters (`<`, `>`, `&`, `"`) are escaped before tokenization to prevent XSS.

### 3.3 Modal Orchestrator (`src/components/projects/ProjectDetailsModal.ts`)

- **Lifecycle Implementation**:
  - `mount(container: HTMLElement)`: Injects outer backdrop and sheet container into `#app` or root container.
  - `open(project: ProjectDetails, sourceRect?: DOMRect)`: Sets `isOpen = true`, locks background scroll (`document.body.style.overflow = 'hidden'`), renders sub-components, initiates FLIP card zoom transition, and traps focus.
  - `close()`: Executes exit animation, restores previous focus, unlocks background scroll, and fires optional `onClose` callback.
  - `destroy()`: Unconditionally unmounts all sub-components, removes all global event listeners (`keydown`, `click`, `touch`, `resize`), restores `body.style.overflow`, and removes DOM nodes.
- **Kinematics (GSAP)**:
  - Open: `gsap.fromTo(modalSheet, { scale: 0.95, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" })`
  - Backdrop: `gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3 })`
  - Close: `gsap.to(modalSheet, { scale: 0.96, opacity: 0, y: 20, duration: 0.3, ease: "power3.in" })`
- **Dismissal Triggers**:
  - `Escape` keypress
  - Click on backdrop overlay
  - Close button in header
  - Mobile swipe-down gesture ($dy > 100\text{px}$)

### 3.4 Interactive Visual Architecture Diagram (`src/components/projects/ProjectArchitecture.ts`)

- **Responsive SVG Canvas**:
  - Rendered with `viewBox="0 0 800 320"`, `w-full h-auto`.
  - Layers: Presentation, Domain, Data, Platform/Infrastructure.
  - Directional cubic Bézier `<path>` connectors with SVG arrowhead markers (`marker-end="url(#arrow)"`).
- **Interactive Node Inspector (Easter Egg)**:
  - On `mouseenter` or keyboard `focus` of Node $N$:
    - Node $N$'s `<rect>` and border illuminate in glowing vermilion (`stroke: #ff4421`, `fill: rgba(255,68,33,0.12)`, `filter: drop-shadow(0 0 12px rgba(255,68,33,0.8))`).
    - Connected Bézier flow lines highlight with vermilion stroke and active `stroke-dashoffset` pulse animation.
    - Connected downstream nodes receive a secondary amber/vermilion accent.
    - Unrelated nodes and paths dim to `opacity: 0.25` via GSAP ($200\text{ms}$).
  - On `mouseleave` or `blur`:
    - GSAP restores all nodes and connectors to default styling ($250\text{ms}$).

### 3.5 Live Code Scratchpad (`src/components/projects/ProjectCodeScratchpad.ts`)

- **Collapsible Drawer**:
  - High-tech header with code file tag, language badge, and toggle chevron icon.
  - **Copy-to-Clipboard Action**: Copies code to `navigator.clipboard.writeText`, changes button to green checkmark pill *"Copied to clipboard!"*, and reverts after $2\text{s}$.
- **Monospace Code View**:
  - Line-numbered gutter.
  - Formatted and color-tokenized code lines using `codeTokenizer.ts`.

### 3.6 Media Gallery & Expandable Lightbox (`src/components/projects/ProjectGallery.ts`)

- **Horizontal Snap Strip**:
  - Scrollable container with `scroll-snap-type: x mandatory` and screenshot thumbnails.
  - Previous / Next navigation buttons with disabled edge bounds.
- **Expandable Lightbox**:
  - Clicking any screenshot opens full-screen overlay.
  - Keyboard navigation: `ArrowRight` (next), `ArrowLeft` (previous), and `Escape` (dismiss).
  - Mobile swipe navigation.

### 3.7 Sticky Glass Action Footer (`src/components/projects/ProjectFooter.ts`)

- Fixed sticky bar at bottom of modal viewport (`sticky bottom-0 bg-neutral-950/85 backdrop-blur-xl border-t border-white/10`).
- CTA buttons: *"View GitHub Repository ↗"* and *"Download APK / Run Demo"* with secure target attributes.

---

## 4. Test-Driven Development (TDD) Specifications

### Test Suite Structure
1. `src/utils/__tests__/codeTokenizer.test.ts`:
   - Tokenizes Kotlin, Swift, Dart, and C# keywords, annotations, types, strings, comments.
   - HTML entity escaping tests (`<script>`, `&amp;`, etc.).
   - Edge cases: empty code, unclosed strings, multiline comments.
2. `src/components/projects/__tests__/ProjectArchitecture.test.ts`:
   - Node and connector SVG DOM generation.
   - Node Inspector hover and focus states (vermilion luminescence, dimming of non-connected nodes).
   - Mouseleave / blur reset.
   - Teardown: `destroy()` disposes GSAP tweens and listeners.
3. `src/components/projects/__tests__/ProjectCodeScratchpad.test.ts`:
   - Header, file tag, line numbers, and token rendering.
   - Collapsible expand/collapse toggle and `aria-expanded` attributes.
   - Copy to clipboard interaction and visual state timeout.
   - Teardown: `destroy()` disposes timeouts and click listeners.
4. `src/components/projects/__tests__/ProjectGallery.test.ts`:
   - Thumbnail rendering and navigation button states.
   - Lightbox open on thumbnail click.
   - Lightbox keyboard controls (`ArrowRight`, `ArrowLeft`, `Escape`).
   - Touch swipe navigation.
   - Teardown: `destroy()` removes lightbox DOM and listeners.
5. `src/components/projects/__tests__/ProjectDetailsModal.test.ts`:
   - Shell mounting with `role="dialog"` and `aria-modal="true"`.
   - `open(project)` scroll lock, data population, sub-component mounting.
   - `close()` scroll restoration, exit animation, `onClose` callback.
   - Dismissal triggers: `Escape`, backdrop click, close button, swipe down.
   - **Empirical Stress & Zero-Leak Verification**:
     - 50 rapid open/close cycles without DOM corruption or state drift.
     - Parity check for `window.addEventListener` vs `window.removeEventListener`.
     - `destroy()` unmounts cleanly with zero orphaned elements.
