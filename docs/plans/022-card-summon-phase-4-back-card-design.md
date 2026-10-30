# Card Summon - Phase 4: TCG Mystic Sigil Card Back Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline SVG, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 4 of the Card Summoning engine: the double-sided 3D card structure and the intricate **TCG Mystic Sigil Card Back** (obsidian frame, ornate corner filigree, concentric geometric halo rings, and glowing central Ace crest), rendered entirely in crisp vector SVG with zero external assets.

**Architecture:** Extend `CardSummonEngine` in `portfolio/src/engines/card/CardSummonEngine.ts`. Convert the card container into a true double-sided 3D rig (`transform-style: preserve-3d`) hosting `[data-summon-card-back]` and `[data-summon-card-face]` with `backface-visibility: hidden`. Render the Card Back using high-resolution inline vector SVGs that inherit the engine's swappable theme colors (`primaryColor` vermilion and `coreColor` white-hot core).

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline SVG, Vitest

---

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (unit test specifications committed first in RED phase), component lifecycle isolation (`mount`, `open`, `close`, `destroy`), zero DOM/memory leaks.
- Zero external asset dependencies: 100% inline SVG and CSS vectors for sub-millisecond initial paint, 0 network requests, and infinite Retina resolution.
- 100% backward compatibility: All 31 existing tests in `CardSummonEngine.test.ts` must continue to pass cleanly.
- Strict accessibility (`prefers-reduced-motion: reduce`): Instant resting center render without 3D tumbling.

---

### Task 1: Author Unit Tests for Card Back Structure & Mystic Sigil SVG in `CardSummonEngine.test.ts`

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions (RED phase) for:
  1. Presence of `[data-summon-card-back]` inside `[data-summon-card]`.
  2. Proper 3D card face setup (`backface-visibility: hidden`, `absolute inset-0`).
  3. Presence of the Mystic Sigil SVG with required structural components:
     - Outer obsidian border frame (`data-summon-card-back-frame`).
     - Ornate corner filigree elements (`data-summon-card-filigree`).
     - Concentric geometric halo rings (`data-summon-card-halo`).
     - Central glowing Ace crest (`data-summon-card-crest`).
  4. Swappable theme color inheritance: Sigil uses `primaryColor` and `coreColor` gradients.
  5. Teardown & memory cleanup: All card back elements cleanly detached on `close()` and `destroy()`.

- [x] **Step 1: Add Phase 4 describe block with unit test specifications**
- [x] **Step 2: Run test suite to verify tests fail against current Phase 3 baseline (RED phase)**
- [x] **Step 3: Commit Phase 4 test specifications**

---

### Task 2: Implement Double-Sided 3D Rig & TCG Mystic Sigil Card Back in `CardSummonEngine.ts`

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

**Interfaces:**
- Consumes: `gsap`
- Produces: `CardSummonEngine` with:
  1. Double-sided card structure: `cardBackEl` (`data-summon-card-back`) and placeholder `cardFaceEl` (`data-summon-card-face`) configured with `[backface-visibility:hidden]`.
  2. Procedural SVG Card Back generator:
     - Obsidian glass background with subtle radial gradient.
     - Inset metallic hairline border.
     - 4 symmetrical corner filigree knots.
     - Concentric halo rings with radiating celestial notches.
     - Glowing central Ace crest with theme gradient glow.
  3. Clean lifecycle disposal in `cleanupDomAndListeners()` for card faces.

- [x] **Step 1: Implement double-sided DOM structure and SVG card back in `CardSummonEngine.ts`**
- [x] **Step 2: Run test suite to verify all tests pass (GREEN phase)**
- [x] **Step 3: Commit implementation**

---

### Task 3: Comprehensive Verification & Plan Sign-off

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/022-card-summon-phase-4-back-card-design.md`

- [x] **Step 1: Run complete test suite (`npm --prefix portfolio test`)**
- [x] **Step 2: Run Vite production build (`npm --prefix portfolio run build`)**
- [x] **Step 3: Mark documentation plan Completed and commit**
- [x] **Step 4: Present Phase 4 to the user for review before proceeding to Phase 5**
