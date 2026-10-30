# Card Summon - Phase 3: Slam Animation & Impact Aura Implementation Plan

- **Status**: In Progress (Refining to 3 Spins, Lower Overshoot, & Graceful Fall in Place)
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine Phase 3 motion dynamics to match the user's aesthetic:
1. **3 Spins Only**: Lower initial card launch spin from 4 spins (`-1440°`) to 3 spins (`-1080°`).
2. **Lower Apex Overshoot**: Lower vertical overshoot from `-6%` down to `-3%` (~10px above center) for a subtler, more controlled apex.
3. **Graceful Fall in Place**: Replace the rapid `0.14s` mechanical slam and squash compression with a slower, poised, graceful descent (`duration: 0.50s`, `ease: 'power2.out'`) that floats into position without violent rebound.
4. **Soft Aura Dissipation**: Aura swells during the apex hover and softly fades out to zero in tandem with the graceful fall (`duration: 0.55s`, `power2.out`).
5. **Receding Portal Glow**: Bottom energy portal recedes downward and fades to 0 as the card ascends.

---

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (unit test specifications committed first in RED phase), component lifecycle isolation (`mount`, `open`, `close`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: Card appears centered instantly without rapid spin, ascent, or aura flashing when OS reduced motion is active.
- Non-blocking layout: Use GSAP transform properties (`yPercent`, `rotationY`, `rotationZ`, `scale`, `opacity`) rather than layout reflow triggers.

---

### Task 1: Author Refined Unit Tests for 3 Spins, Lower Overshoot, & Graceful Fall

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions (RED phase) for:
  1. Initial launch spin of exactly 3 rotations (`Math.abs(rotationY) === 1080`).
  2. Lowered apex overshoot: `minYPercent` between `-3.5%` and `-2.0%` (not `-6%`).
  3. Graceful descent: descent duration extends over `>= 0.4s` with smooth `scaleY >= 0.98` (no violent squash).
  4. Soft aura dissipation to `<= 0.05` upon graceful landing.

- [x] **Step 1: Update unit test specifications in `CardSummonEngine.test.ts`**
- [x] **Step 2: Run test suite to verify tests fail against current 4-spin/snap baseline (RED phase)**
- [x] **Step 3: Commit refined test specifications**

---

### Task 2: Implement 3 Spins, Lowered Overshoot, & Graceful Fall in Place

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

**Interfaces:**
- Consumes: `gsap`
- Produces: `CardSummonEngine` with:
  1. Launch at `rotationY: -1080°` (3 spins) with `scale: 0.55`.
  2. Apex overshoot tuned to `yPercent: -3%`.
  3. Graceful falling descent into center (`0.50s`, `power2.out`) straight to resting `yPercent: 0`, `rotationY: 0`, `rotationZ: 0`, `scale: 1.0`.
  4. Soft aura dissipation (`0.55s`, `power2.out`).
  5. Full `prefers-reduced-motion` bypass and zero-leak teardown.

- [x] **Step 1: Implement 3-spin launch, lowered overshoot, and graceful fall in `CardSummonEngine.ts`**
- [x] **Step 2: Run test suite to verify all tests pass (GREEN phase)**
- [x] **Step 3: Commit implementation**

---

### Task 3: Comprehensive Verification & Plan Sign-off

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/020-card-summon-phase-3-slam-animation.md`

- [ ] **Step 1: Run complete test suite (`npm --prefix portfolio test`)**
- [ ] **Step 2: Run Vite production build (`npm --prefix portfolio run build`)**
- [ ] **Step 3: Mark documentation plan Completed and commit**
