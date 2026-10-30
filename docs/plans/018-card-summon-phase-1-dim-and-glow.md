# Card Summon - Phase 1: Dim & Bottom Glow Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 1 of the Card Summoning engine: fullscreen backdrop dimming and a fast-rising curved hill-shaped energy glow at the bottom center of the viewport upon image click, with swappable color theme, accessible dismissal, and clean GSAP lifecycle teardown.

**Architecture:** Create an isolated `CardSummonEngine` in `portfolio/src/engines/card/CardSummonEngine.ts` following ADR 004 lifecycle contracts. On `open()`, it mounts a fullscreen dialog layer with a dimmed backdrop and an SVG curved hill glow powered by GSAP. Wire this into `ProfileHeader.ts` on portrait image click.

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (tests written before code), component lifecycle isolation (`mount`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: Instant transition without rapid glow scaling when OS reduced motion is active.
- Swappable theme: Accept `theme?: { primaryColor?: string, coreColor?: string }` with defaults `#ff4421` and `#ffffff`.

---

### Task 1: Write Unit Tests for `CardSummonEngine` Phase 1

**Files:**
- Create: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions covering:
  1. Engine lifecycle: `mount()`, `isOpen()`, `open()`, `close()`, `destroy()`.
  2. DOM elements: Modal container with `data-card-summon-modal`, backdrop with `data-summon-backdrop`, and curved hill glow with `data-summon-bottom-glow`.
  3. Swappable color theme: SVG / gradient styles incorporating `primaryColor` and `coreColor`.
  4. GSAP animation: Timeline creation for backdrop fade and fast 0.4s bottom glow emergence.
  5. Accessible dismissal: ESC key, backdrop click, and close button triggering `close()`.
  6. Lifecycle cleanup: `destroy()` terminates active GSAP timelines and cleans up DOM.

- [x] **Step 1: Write the failing tests**
- [x] **Step 2: Run test to verify it fails (RED phase)**

---

### Task 2: Implement `CardSummonEngine` Phase 1

**Files:**
- Create: `portfolio/src/engines/card/CardSummonEngine.ts`

**Interfaces:**
- Consumes: `gsap` from `gsap`
- Produces: `CardSummonEngine` class with `open()`, `close()`, `destroy()` implementing backdrop dim and bottom curved hill glow.

- [x] **Step 1: Implement `CardSummonEngine.ts`**
- [x] **Step 2: Run test to verify it passes (GREEN phase)**

---

### Task 3: Integrate `CardSummonEngine` into `ProfileHeader.ts`

**Files:**
- Modify: `portfolio/src/components/home/ProfileHeader.ts`
- Modify: `portfolio/src/components/home/__tests__/ProfileHeader.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` in `ProfileHeaderComponent`
- Produces: Rewired `onImageClick` in `ProfileAvatarComponent` to open `CardSummonEngine`.

- [x] **Step 1: Update `ProfileHeader.test.ts` to assert `CardSummonEngine.open()` is called on image click**
- [x] **Step 2: Run test to verify RED failure**
- [x] **Step 3: Update `ProfileHeader.ts` to instantiate and trigger `CardSummonEngine`**
- [x] **Step 4: Run test to verify GREEN pass**

---

### Task 4: Comprehensive Test Suite & Production Build Verification

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/018-card-summon-phase-1-dim-and-glow.md`

- [x] **Step 1: Run complete test suite (`npm --prefix portfolio test`)**
- [x] **Step 2: Run Vite production build (`npm --prefix portfolio run build`)**
- [x] **Step 3: Mark documentation plan Completed and commit**
