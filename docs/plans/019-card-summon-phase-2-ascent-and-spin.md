# Card Summon - Phase 2: Plain Card Ascent & 3D Rotation Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 2 of the Card Summoning engine: a 3D perspective stage with a plain card rising out of the bottom energy portal and rotating rapidly on its vertical 3D Y-axis (720°-1080°) with a subtle 12° Z-tilt and decelerating into screen center.

**Architecture:** Extend `CardSummonEngine` in `portfolio/src/engines/card/CardSummonEngine.ts` with a 3D perspective viewport container (`data-summon-card-stage`, `perspective: 1200px`) and card wrapper (`data-summon-card`, `transform-style: preserve-3d`). Integrate the ascent and 3D rotation into the GSAP `openTimeline`, orchestrating the climb from the bottom glow with `power2.out` deceleration.

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (tests written before code), component lifecycle isolation (`mount`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: Card appears centered instantly without rapid vertical ascent or 3D tumbling when OS reduced motion is active.
- Non-blocking layout: Use GSAP transform properties (`xPercent`, `yPercent`, `rotationY`, `rotationZ`, `scale`) rather than layout triggers (`top`, `left`, `margin`).

---

### Task 1: Write Unit Tests for 3D Card Ascent & Spin in `CardSummonEngine.test.ts`

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions for `data-summon-card-stage` and `data-summon-card` DOM elements, GSAP 3D rotation (`rotationY: 720` or `-1080`) and ascent (`yPercent`), `prefers-reduced-motion` bypass, and teardown cleanup.

- [x] **Step 1: Write the failing tests**
- [x] **Step 2: Run test to verify it fails (RED phase)**

---

### Task 2: Implement 3D Card Ascent & Spin in `CardSummonEngine.ts`

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

**Interfaces:**
- Consumes: `gsap` from `gsap`
- Produces: `CardSummonEngine` with 3D card stage DOM nodes, animated ascent from bottom glow, and 3D Y-axis deceleration spin.

- [x] **Step 1: Implement 3D stage and ascent animation in `CardSummonEngine.ts`**
- [x] **Step 2: Run test to verify it passes (GREEN phase)**

---

### Task 3: Comprehensive Test Suite & Production Build Verification

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/019-card-summon-phase-2-ascent-and-spin.md`

- [x] **Step 1: Run complete test suite (`npm --prefix portfolio test`)**
- [x] **Step 2: Run Vite production build (`npm --prefix portfolio run build`)**
- [x] **Step 3: Mark documentation plan Completed and commit**
