# Project Details Deep-Dive Screen (Feature 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully isolated, drop-in editorial case study modal (`ProjectDetailsModal`) for 6 flagship projects, featuring an interactive SVG architecture diagram with a reactive Node Inspector Easter egg, performance telemetry dials, live syntax-highlighted code scratchpad, media gallery with lightbox, and card-to-modal FLIP kinematics.

**Architecture:** Composed sub-component architecture where a master `ProjectDetailsModal` orchestrates lifecycle (`mount`, `open`, `close`, `destroy`), body scroll locking, focus trapping, and GSAP kinematics, while dedicated sub-components (`ProjectHeader`, `ProjectMetrics`, `ProjectArchitecture`, `ProjectCodeScratchpad`, `ProjectGallery`, `ProjectFooter`) handle isolated visual domains.

**Tech Stack:** Vanilla TypeScript 5+, GSAP 3.12+, Tailwind CSS v4, Lucide icons, Vitest, Happy-DOM.

## Global Constraints

- **Component Isolation**: 100% self-contained modal in `portfolio/src/components/projects/` implementing `mount(container: HTMLElement)`, `destroy()`, leaving zero memory leaks, DOM residues, or scroll locks on unmount.
- **Strict TDD**: Write failing tests before implementation code for all utilities, sub-components, modal state management, keyboard trap/escape listeners, media gallery navigation, and teardown.
- **Zero Direct File Copying**: All code must be written from scratch in clean, modern, strongly-typed TypeScript tailored to the portfolio's Clean Architecture structure.
- **Kinematics & Micro-Interactions**:
  - Open: FLIP zoom transition `scale: 0.95 -> 1`, `opacity: 0 -> 1`, duration `400ms`, ease `power3.out`.
  - Close: slide-down with backdrop blur fade-out duration `350ms`, ease `power3.inOut`.
  - Node Inspector: vermilion `#ff4421` luminescence on active and downstream nodes, dimming unrelated nodes to `0.25` opacity.
  - Code Scratchpad: zero-dependency regex tokenizer supporting Kotlin, Swift, Dart, and C# with copy-to-clipboard and 2s visual confirmation reset.
- **Browser/DOM Hygiene**: Parity check between `addEventListener` and `removeEventListener`; `document.body.style.overflow` must be cleanly restored to empty string on close and destroy.

---

## File Structure

```
portfolio/src/
├── domain/
│   └── types.ts                             # ProjectDetails, ArchitectureGraph, CodeSnippet contracts
├── data/
│   ├── projects.ts                          # Comprehensive engineering data for 6 projects
│   └── __tests__/
│       └── projects.test.ts                 # Tests for project details data completeness
├── utils/
│   ├── codeTokenizer.ts                     # Zero-dependency syntax tokenizer
│   └── __tests__/
│       └── codeTokenizer.test.ts            # Tokenizer unit tests
└── components/
    └── projects/
        ├── ProjectDetailsModal.ts           # Top-level orchestrator & FLIP kinematics
        ├── ProjectHeader.ts                 # Hero header, badges, status beacon
        ├── ProjectMetrics.ts                # Salient telemetry metric cards
        ├── ProjectArchitecture.ts           # SVG Clean Architecture diagram + Node Inspector
        ├── ProjectCodeScratchpad.ts         # Collapsible code drawer + copy action
        ├── ProjectGallery.ts                # Screenshot strip + Lightbox modal
        ├── ProjectFooter.ts                 # Sticky glass action bar (GitHub, APK, Demo)
        └── __tests__/
            ├── ProjectHeader.test.ts
            ├── ProjectMetrics.test.ts
            ├── ProjectArchitecture.test.ts
            ├── ProjectCodeScratchpad.test.ts
            ├── ProjectGallery.test.ts
            ├── ProjectFooter.test.ts
            ├── ProjectDetailsModal.test.ts
            └── ProjectDetailsModal.stress.test.ts
```

---

## Tasks

### Task 1: Domain Model & Project Data Extensions

**Files:**
- Modify: `portfolio/src/domain/types.ts`
- Modify: `portfolio/src/data/projects.ts`
- Test: `portfolio/src/data/__tests__/projects.test.ts`

**Interfaces:**
- Consumes: Existing `Project` and `ProjectMedia` in `src/domain/types.ts`
- Produces: `ArchitectureNode`, `ArchitectureFlow`, `ArchitectureGraph`, `CodeSnippet`, `ProjectMetric`, `ProjectDetails`, enriched `PROJECTS` array containing all 6 projects with deep-dive technical specs.

- [ ] **Step 1: Write failing test for extended project details**

```typescript
// portfolio/src/data/__tests__/projects.test.ts
import { describe, it, expect } from 'vitest';
import { PROJECTS } from '../projects';
import type { ProjectDetails } from '@/domain/types';

describe('Project Deep-Dive Data Suite', () => {
  it('contains exactly 6 flagship projects', () => {
    expect(PROJECTS).toHaveLength(6);
  });

  it('populates deep-dive details for each flagship project', () => {
    const requiredProjectIds = ['dusk', 'cargo', 'gusto', 'sportx', 'elevated', 'wireless-mouse'];
    const projectIds = PROJECTS.map((p) => p.id);
    expect(projectIds).toEqual(requiredProjectIds);

    PROJECTS.forEach((project) => {
      const p = project as ProjectDetails;
      expect(p.longDescription).toBeDefined();
      expect(p.longDescription!.length).toBeGreaterThan(50);
      expect(p.liveStatus).toBeDefined();

      // Architecture graph verification
      expect(p.architectureGraph).toBeDefined();
      expect(p.architectureGraph!.nodes.length).toBeGreaterThanOrEqual(3);
      expect(p.architectureGraph!.flows.length).toBeGreaterThanOrEqual(2);

      // Metrics verification
      expect(p.metrics).toBeDefined();
      expect(p.metrics!.length).toBeGreaterThanOrEqual(2);

      // Code snippet verification
      expect(p.codeSnippet).toBeDefined();
      expect(p.codeSnippet!.language).toMatch(/^(kotlin|swift|dart|csharp)$/);
      expect(p.codeSnippet!.code.length).toBeGreaterThan(20);

      // Screenshots
      expect(p.galleryScreenshots).toBeDefined();
      expect(p.galleryScreenshots!.length).toBeGreaterThanOrEqual(1);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd portfolio; npx vitest run src/data/__tests__/projects.test.ts`  
Expected: FAIL due to missing fields in `ProjectDetails` and missing data in `PROJECTS`.

- [ ] **Step 3: Update domain types and populate project deep-dive data**

Update `portfolio/src/domain/types.ts` to add `ArchitectureNode`, `ArchitectureFlow`, `ArchitectureGraph`, `CodeSnippet`, `ProjectMetric`, and update `ProjectDetails`.  
Update `portfolio/src/data/projects.ts` with authentic engineering data for Dusk, Cargo, Gusto, SportX, ElevatED, and Wireless Mouse (including realistic architectures, telemetry metrics, and code snippets).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd portfolio; npx vitest run src/data/__tests__/projects.test.ts`  
Expected: PASS (all 6 projects satisfy deep-dive contracts).

- [ ] **Step 5: Commit**

```bash
git add src/domain/types.ts src/data/projects.ts src/data/__tests__/projects.test.ts
git commit -m "feat(domain): extend project details domain types and deep-dive data"
```

---

### Task 2: Lightweight Zero-Dependency Syntax Tokenizer

**Files:**
- Create: `portfolio/src/utils/codeTokenizer.ts`
- Test: `portfolio/src/utils/__tests__/codeTokenizer.test.ts`

**Interfaces:**
- Consumes: `code: string`, `language: 'kotlin' | 'swift' | 'dart' | 'csharp'`
- Produces: `tokenizeCode(code: string, language: string): string` (safe HTML string with Tailwind-styled spans)

- [ ] **Step 1: Write failing tests for codeTokenizer**

```typescript
// portfolio/src/utils/__tests__/codeTokenizer.test.ts
import { describe, it, expect } from 'vitest';
import { tokenizeCode } from '../codeTokenizer';

describe('codeTokenizer Utility', () => {
  it('escapes raw HTML to prevent XSS injection', () => {
    const input = 'val tag = "<script>alert(1)</script>" & a < b';
    const output = tokenizeCode(input, 'kotlin');
    expect(output).not.toContain('<script>');
    expect(output).toContain('&lt;script&gt;');
    expect(output).toContain('&amp;');
  });

  it('tokenizes Kotlin keywords and annotations', () => {
    const code = '@Composable\nsuspend fun loadWeather(): Flow<Forecast> = flow { emit(data) }';
    const output = tokenizeCode(code, 'kotlin');
    expect(output).toContain('text-amber-400'); // annotation
    expect(output).toContain('text-sky-400'); // keyword
    expect(output).toContain('Flow');
  });

  it('tokenizes Swift keywords and comments', () => {
    const code = '// Fetch fixtures\nfunc fetchFixtures() async throws -> [Fixture]';
    const output = tokenizeCode(code, 'swift');
    expect(output).toContain('text-neutral-500'); // comment
    expect(output).toContain('text-sky-400'); // func, async
  });

  it('handles empty code or unknown language gracefully', () => {
    expect(tokenizeCode('', 'kotlin')).toBe('');
    expect(tokenizeCode('val x = 10', 'unknown')).toContain('val x = 10');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd portfolio; npx vitest run src/utils/__tests__/codeTokenizer.test.ts`  
Expected: FAIL ("cannot find module '../codeTokenizer'").

- [ ] **Step 3: Implement minimal codeTokenizer**

Create `portfolio/src/utils/codeTokenizer.ts` using regex pattern matching for keywords, decorators, types, string literals, and comments with strict HTML escaping.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd portfolio; npx vitest run src/utils/__tests__/codeTokenizer.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/codeTokenizer.ts src/utils/__tests__/codeTokenizer.test.ts
git commit -m "feat(utils): add zero-dependency multi-language syntax tokenizer"
```

---

### Task 3: ProjectHeader & ProjectMetrics Components

**Files:**
- Create: `portfolio/src/components/projects/ProjectHeader.ts`
- Create: `portfolio/src/components/projects/ProjectMetrics.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectHeader.test.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectMetrics.test.ts`

**Interfaces:**
- Consumes: `ProjectDetails`, `ProjectMetric`
- Produces:
  - `ProjectHeader.render(project: ProjectDetails, onClose: () => void): HTMLElement`
  - `ProjectMetrics.render(metrics: ProjectMetric[]): HTMLElement`

- [ ] **Step 1: Write failing tests for ProjectHeader and ProjectMetrics**

Write unit tests verifying:
- `ProjectHeader` renders title, subtitle, category pill with accent color, live status beacon, and close button calling `onClose`.
- `ProjectMetrics` renders metric dial cards with label, value, and detail note.
- `destroy()` cleans up event listeners.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectHeader.test.ts src/components/projects/__tests__/ProjectMetrics.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement ProjectHeader and ProjectMetrics**

Implement `ProjectHeader` and `ProjectMetrics` using clean DOM construction and Tailwind v4 classes with accessible ARIA tags.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectHeader.test.ts src/components/projects/__tests__/ProjectMetrics.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectHeader.ts src/components/projects/ProjectMetrics.ts src/components/projects/__tests__/ProjectHeader.test.ts src/components/projects/__tests__/ProjectMetrics.test.ts
git commit -m "feat(projects): add ProjectHeader and ProjectMetrics components"
```

---

### Task 4: ProjectArchitecture & Interactive Node Inspector Component

**Files:**
- Create: `portfolio/src/components/projects/ProjectArchitecture.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectArchitecture.test.ts`

**Interfaces:**
- Consumes: `ArchitectureGraph`, `architectureHighlights?: string[]`
- Produces: `ProjectArchitecture` class with `render(graph: ArchitectureGraph, highlights?: string[]): HTMLElement` and `destroy(): void`.

- [ ] **Step 1: Write failing tests for ProjectArchitecture**

Test SVG viewport (`viewBox="0 0 800 320"`), node rects, bezier connectors, and the vermilion luminescence hover/focus effect:
- Hovering node $N$ sets active styling and vermilion glow on $N$ and downstream flows.
- Unrelated nodes are dimmed (`opacity: 0.25`).
- Mouseleave resets opacities and styles.
- `destroy()` clears GSAP tweens and DOM listeners.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectArchitecture.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement ProjectArchitecture**

Construct the responsive SVG architecture diagram with computed cubic bezier curves (`d="M x1 y1 C ... x2 y2"`), arrowheads, and GSAP hover/focus luminescence bindings.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectArchitecture.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectArchitecture.ts src/components/projects/__tests__/ProjectArchitecture.test.ts
git commit -m "feat(projects): add ProjectArchitecture SVG diagram and Node Inspector"
```

---

### Task 5: ProjectCodeScratchpad Component

**Files:**
- Create: `portfolio/src/components/projects/ProjectCodeScratchpad.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectCodeScratchpad.test.ts`

**Interfaces:**
- Consumes: `CodeSnippet`, `tokenizeCode`
- Produces: `ProjectCodeScratchpad` with `render(snippet: CodeSnippet): HTMLElement` and `destroy(): void`.

- [ ] **Step 1: Write failing tests for ProjectCodeScratchpad**

Test rendering:
- Header with filename, language badge, and toggle chevron.
- Gutter with line numbers and tokenized code container.
- Collapsible toggle updating `aria-expanded` and container height.
- Copy button invoking `navigator.clipboard.writeText` and showing "Copied! ✓" with timeout.
- `destroy()` disposing timers and listeners.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectCodeScratchpad.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement ProjectCodeScratchpad**

Implement collapsible code card with copy-to-clipboard logic and fallback.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectCodeScratchpad.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectCodeScratchpad.ts src/components/projects/__tests__/ProjectCodeScratchpad.test.ts
git commit -m "feat(projects): add ProjectCodeScratchpad with syntax highlighting and copy action"
```

---

### Task 6: ProjectGallery Component with Expandable Lightbox

**Files:**
- Create: `portfolio/src/components/projects/ProjectGallery.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectGallery.test.ts`

**Interfaces:**
- Consumes: `screenshots: string[]`, `title: string`
- Produces: `ProjectGallery` with `render(screenshots: string[], title: string): HTMLElement` and `destroy(): void`.

- [ ] **Step 1: Write failing tests for ProjectGallery**

Test:
- Rendering horizontal snap strip and thumbnails.
- Next / Prev pagination buttons.
- Clicking thumbnail opens enlarged Lightbox modal.
- Lightbox keyboard controls: `ArrowRight` (next), `ArrowLeft` (prev), `Escape` (dismiss).
- Touch swipe navigation.
- `destroy()` unmounting Lightbox and disposing all listeners.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectGallery.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement ProjectGallery**

Implement horizontal snap carousel with embedded high-resolution Lightbox overlay.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectGallery.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectGallery.ts src/components/projects/__tests__/ProjectGallery.test.ts
git commit -m "feat(projects): add ProjectGallery with horizontal snap strip and Lightbox"
```

---

### Task 7: ProjectFooter & Sticky Action Bar Component

**Files:**
- Create: `portfolio/src/components/projects/ProjectFooter.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectFooter.test.ts`

**Interfaces:**
- Consumes: `links: ProjectLinks`, `accentColor?: string`
- Produces: `ProjectFooter` with `render(links: ProjectLinks, accentColor?: string): HTMLElement` and `destroy(): void`.

- [ ] **Step 1: Write failing tests for ProjectFooter**

Test:
- Sticky glass bar container (`sticky bottom-0`).
- "View GitHub Repository ↗" button with `target="_blank"` and `rel="noopener noreferrer"`.
- Conditional rendering of "Download APK / Run Demo" button when link is present.
- `destroy()` lifecycle.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectFooter.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement ProjectFooter**

Implement sticky glass action bar with verified link targets and hover styling.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectFooter.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectFooter.ts src/components/projects/__tests__/ProjectFooter.test.ts
git commit -m "feat(projects): add ProjectFooter sticky glass action bar"
```

---

### Task 8: ProjectDetailsModal Master Orchestrator & Stress Suite

**Files:**
- Create: `portfolio/src/components/projects/ProjectDetailsModal.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectDetailsModal.test.ts`
- Test: `portfolio/src/components/projects/__tests__/ProjectDetailsModal.stress.test.ts`

**Interfaces:**
- Consumes: All sub-components (`ProjectHeader`, `ProjectMetrics`, `ProjectArchitecture`, `ProjectCodeScratchpad`, `ProjectGallery`, `ProjectFooter`), `ProjectDetails`
- Produces: `ProjectDetailsModal` class with:
  - `mount(container: HTMLElement): void`
  - `open(project: ProjectDetails, sourceRect?: DOMRect): void`
  - `close(): void`
  - `isOpen(): boolean`
  - `destroy(): void`

- [ ] **Step 1: Write failing tests for ProjectDetailsModal**

Unit & Lifecycle Suite (`ProjectDetailsModal.test.ts`):
- Mounts dialog shell into container with `role="dialog"` and `aria-modal="true"`.
- `open(project)` sets `isOpen() === true`, locks body scroll (`overflow = 'hidden'`), renders sub-components.
- FLIP zoom animation executes from `sourceRect`.
- `close()` restores body scroll, fires `onClose` callback, runs exit animation.
- Dismissals verified: `Escape` key, backdrop click, close button, swipe down.

Stress & Zero-Leak Suite (`ProjectDetailsModal.stress.test.ts`):
- 50 rapid sequential `open()` and `close()` cycles without DOM leak or state corruption.
- Parity check between `window.addEventListener` and `window.removeEventListener`.
- `destroy()` unmounts all sub-components, removes all DOM nodes, and restores scroll lock.

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectDetailsModal.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement ProjectDetailsModal**

Implement the master orchestrator coordinating sub-component lifecycles, GSAP FLIP zoom transitions, scroll locks, and gesture/keyboard listeners.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd portfolio; npx vitest run src/components/projects/__tests__/ProjectDetailsModal.test.ts src/components/projects/__tests__/ProjectDetailsModal.stress.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ProjectDetailsModal.ts src/components/projects/__tests__/ProjectDetailsModal.test.ts src/components/projects/__tests__/ProjectDetailsModal.stress.test.ts
git commit -m "feat(projects): add ProjectDetailsModal orchestrator and empirical stress suite"
```

---

### Task 9: Full Suite Verification & Build Checkpoint

**Files:**
- Run all tests across the repository.

- [ ] **Step 1: Run complete Vitest suite**

Run: `cd portfolio; npm test`  
Expected: All tests pass (previous 411 + new test suites).

- [ ] **Step 2: Run TypeScript typecheck**

Run: `cd portfolio; npx tsc --noEmit`  
Expected: Zero TypeScript errors.

- [ ] **Step 3: Run Vite production build**

Run: `cd portfolio; npm run build`  
Expected: Clean production build with zero bundling errors.

- [ ] **Step 4: Commit and finalize**

```bash
git commit --allow-empty -m "chore(release): complete Feature 4 project details deep-dive modal"
```
