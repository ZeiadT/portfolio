# Card Summon - Phase 3: Slam Animation & Impact Aura Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 3 of the Card Summoning engine: the intense card "slam" into position (a slight vertical apex overshoot past center, crisp mechanical downward snap to resting center synchronized with the completion of 3D Y-rotation) accompanied by a pre-landing radiant perimeter aura glow that flares right before impact and dissolves as the card settles.

**Architecture:** Extend `CardSummonEngine` in `portfolio/src/engines/card/CardSummonEngine.ts`. Introduce a dedicated card aura glow element (`data-summon-card-aura`) behind the card within `cardStageEl`. Upgrade the GSAP `openTimeline` card choreography from a single linear tween to an apex-overshoot-and-slam sequence with synchronized aura flaring, while keeping full `prefers-reduced-motion` bypass and zero-leak teardown.

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

---

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (unit test specifications committed first in RED phase), component lifecycle isolation (`mount`, `open`, `close`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: Card appears centered instantly without rapid apex ascent, slam impact, or aura flashing when OS reduced motion is active.
- Non-blocking layout: Use GSAP transform properties (`yPercent`, `rotationY`, `rotationZ`, `scale`, `opacity`) rather than layout reflow triggers.
- Mechanical precision: No canvas, no WebGL bloat, no whole-screen shake—just clean, punchy compositor-accelerated CSS/GSAP keyframes.

---

### Task 1: Author Unit Tests for Slam Animation & Perimeter Aura in `CardSummonEngine.test.ts`

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions for:
  1. Creation of `data-summon-card-aura` behind `data-summon-card` within `data-summon-card-stage`.
  2. Apex overshoot behavior: card reaches an apex (`yPercent < 0`) before settling down to `yPercent: 0`.
  3. Synchronized landing: `rotationY`, `rotationZ`, and `yPercent` simultaneously reach `0` at the completion of the slam.
  4. Perimeter aura dynamics: flares up before the slam and settles/fades at completion.
  5. `prefers-reduced-motion: reduce` bypass: aura and card settle immediately at resting state without animation.
  6. Lifecycle cleanup: `data-summon-card-aura` is completely removed on `close()` and `destroy()`.

- [x] **Step 1: Add Phase 3 describe block with unit test specifications**
- [x] **Step 2: Run test suite to verify tests fail against current Phase 2 code (RED phase)**
- [x] **Step 3: Commit Phase 3 test specifications**

---

### Task 2: Implement Slam Mechanics & Perimeter Aura in `CardSummonEngine.ts`

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

**Interfaces:**
- Consumes: `gsap`
- Produces: `CardSummonEngine` with:
  1. `data-summon-card-aura` element styled with radial/box-shadow glow using theme colors.
  2. Two-stage card arrival timeline:
     - Apex climb: ascends to `yPercent: -4` with rotational deceleration (`rotationY: -30`, `rotationZ: 2`).
     - Downward slam: snaps down to `yPercent: 0`, `rotationY: 0`, `rotationZ: 0` with crisp mechanical ease.
  3. Pre-impact aura flare (scales and flares to peak luminance during apex, then fades out as card lands).
  4. Memory cleanup in `cleanupDomAndListeners()` for `cardAuraEl`.

- [x] **Step 1: Implement `cardAuraEl` DOM and apex-slam GSAP sequence**
- [x] **Step 2: Run test suite to verify all Phase 3 tests pass (GREEN phase)**
- [x] **Step 3: Commit Phase 2 -> Phase 3 implementation**

---

### Task 3: Comprehensive Verification & Plan Sign-off

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/020-card-summon-phase-3-slam-animation.md`

- [x] **Step 1: Run complete test suite (`npm --prefix portfolio test`)**
- [x] **Step 2: Run Vite production build (`npm --prefix portfolio run build`)**
- [x] **Step 3: Update documentation plan to Completed and commit**
