# Card Summon - Phase 3: Slam Animation & Impact Aura Implementation Plan

- **Status**: In Progress (Refining Motion Dynamics & Glow Dissipation)
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement and refine Phase 3 of the Card Summoning engine:
1. **Explosive Launch & Slow-Motion Apex**: Card launches with fast initial spin (~1440° / 4 rotations, `power4.out`), then enters a dramatic ~0.4s slow-motion hover at the apex (~-20px / `yPercent: -6`) so the user can clearly track the card before the slam.
2. **Punchy Mechanical Slam with Micro-Compression**: Card drops fast and hard into position (`power3.in` / `power4.in`), locks simultaneously on all axes (`yPercent: 0`, `rotationY: 0`, `rotationZ: 0`), and exhibits a brief physical micro-compression (`scaleY: 0.96`, `scaleX: 1.02` for ~0.12s) before snapping to `1.0`.
3. **Bottom Energy Portal Receding**: As the card ascends out of the portal, the bottom curved hill glow recedes downward and fades out (`opacity: 1 -> 0`, `scaleY: 1 -> 0.2` over ~0.6s), focusing all visual attention onto the floating card.
4. **Perimeter Aura Swell, Flash, & Decay**: Aura swells to an intense halo during the slow-mo apex, emits a bright shockwave flash at the exact instant of impact (`opacity: 1.0`, `scale: 1.25`), and smoothly dissipates over ~0.4s into darkness as the card settles.

---

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (unit test specifications committed first in RED phase), component lifecycle isolation (`mount`, `open`, `close`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: Card appears centered instantly without rapid apex ascent, slam impact, or aura flashing when OS reduced motion is active.
- Non-blocking layout: Use GSAP transform properties (`yPercent`, `rotationY`, `rotationZ`, `scale`, `scaleX`, `scaleY`, `opacity`) rather than layout reflow triggers.
- Mechanical precision: No canvas, no WebGL bloat, no whole-screen shake—just clean, punchy compositor-accelerated CSS/GSAP keyframes.

---

### Task 1: Author Refined Unit Tests for Motion Curves, Timings, & Glow Fading

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions (RED phase) for:
  1. Bottom portal glow receding and fading to 0 as the card ascends.
  2. Explosive launch with initial spin (`rotationY <= -1440` or `>= 1440°`) and slow-motion apex hover.
  3. Slam impact micro-compression (`scaleY < 1` during impact settling, returning to `1.0` at completion).
  4. Shockwave flash and subsequent smooth dissipation of the perimeter aura (`final opacity <= 0.05` or `0`).
  5. All transforms locked at resting state (`yPercent: 0`, `rotationY: 0`, `rotationZ: 0`, `scale: 1`, `scaleY: 1`, `scaleX: 1`) at timeline completion.

- [x] **Step 1: Update unit test specifications in `CardSummonEngine.test.ts`**
- [x] **Step 2: Run test suite to verify tests fail against previous Phase 3 baseline (RED phase)**
- [x] **Step 3: Commit refined test specifications**

---

### Task 2: Implement Refined Motion Curves, Micro-Compression Slam, & Glow Fading

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

**Interfaces:**
- Consumes: `gsap`
- Produces: `CardSummonEngine` with:
  1. Bottom portal glow recession animation (`opacity: 1 -> 0`, `scaleY: 1 -> 0.2`) timed with card launch.
  2. Upgraded card climb choreography:
     - Explosive launch from `yPercent: 120`, `rotationY: -1440`, `rotationZ: 14`, `scale: 0.5`.
     - Apex slow-mo hover (`yPercent: -6`, `rotationY: -15`, `rotationZ: 1`, `duration: 0.4s`).
     - Hard downward slam (`yPercent: 0`, `rotationY: 0`, `rotationZ: 0`, `power4.in`).
     - Micro-compression impact settling (`scaleY: 0.96`, `scaleX: 1.02` -> `scale: 1.0`).
  3. Pre-impact aura swell, impact shockwave flash (`opacity: 1.0`, `scale: 1.25`), and smooth ~0.4s exponential dissipation (`power2.out` -> `opacity: 0`).
  4. Full `prefers-reduced-motion` bypass and zero-leak teardown.

- [ ] **Step 1: Implement refined GSAP choreography and glow fading in `CardSummonEngine.ts`**
- [ ] **Step 2: Run test suite to verify all tests pass (GREEN phase)**
- [ ] **Step 3: Commit implementation**

---

### Task 3: Comprehensive Verification & Plan Sign-off

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/020-card-summon-phase-3-slam-animation.md`

- [ ] **Step 1: Run complete test suite (`npm --prefix portfolio test`)**
- [ ] **Step 2: Run Vite production build (`npm --prefix portfolio run build`)**
- [ ] **Step 3: Mark documentation plan Completed and commit**
