# Continuous Clean Card Shimmer Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Calibrate the continuous diagonal glass sheen animation on the profile portrait card for balanced luminosity (softened by 20% to 0.30 peak opacity) and optical symmetry.

**Architecture:** Embed a `data-avatar-shine` overlay layer within `data-avatar-card` styled with standard alpha translucency (transparent → 6% → 30% → 6% → transparent, no overlay blend mode). Control its diagonal sweep via an isolated GSAP timeline (`repeat: -1, repeatDelay: 3.5, duration: 2.5`), with constant `opacity: 1` throughout the sweep to ensure symmetrical entry and exit.

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (tests written before code), component lifecycle isolation (`mount`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: No animation played when OS reduced motion is active.
- Ponytail mode: Minimal diff, no new dependencies, no canvas/WebGL overhead.

---

### Task 1: Update Unit Tests for Luminous Shimmer in `ProfileAvatar.test.ts`

**Files:**
- Modify: `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts`

**Interfaces:**
- Consumes: `ProfileAvatarComponent` from `@/components/home/ProfileAvatar`
- Produces: Failing test assertions for updated gradient (0.38 peak), normal blend mode (absence of `mix-blend-overlay`), and symmetrical `fromTo` opacity (opacity: 1).

- [x] **Step 1: Write the failing tests**

Update `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts` to:
1. Assert `data-avatar-shine` does NOT have class `mix-blend-overlay` (uses standard clean alpha blending).
2. Assert background style contains `rgba(255, 255, 255, 0.38)` and `0.08`.
3. Assert GSAP `fromTo` sets `{ xPercent: -100, yPercent: -100, opacity: 1 }` to `{ xPercent: 100, yPercent: 100, opacity: 1 }`.

- [x] **Step 2: Run test to verify it fails**

Run: `npx --prefix portfolio vitest run src/components/home/__tests__/ProfileAvatar.test.ts`
Expected: FAIL (RED phase)

---

### Task 2: Implement Luminous Shimmer in `ProfileAvatar.ts`

**Files:**
- Modify: `portfolio/src/components/home/ProfileAvatar.ts`

**Interfaces:**
- Consumes: `gsap` from `gsap`, `ProfileAvatarConfig`, `ProfileAvatarOptions`
- Produces: `ProfileAvatarComponent` mounting luminous shimmer with normal blend mode and symmetrical GSAP sweep.

- [x] **Step 1: Update `ProfileAvatar.ts`**

1. Remove `mix-blend-overlay` from `data-avatar-shine` class.
2. Update gradient style:
   `linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.38) 50%, rgba(255, 255, 255, 0.08) 70%, transparent 100%)`
3. Update `shineTimeline.fromTo`:
   Start: `{ xPercent: -100, yPercent: -100, opacity: 1 }`
   End: `{ xPercent: 100, yPercent: 100, opacity: 1, duration: 2.5, ease: 'power2.inOut' }`

- [x] **Step 2: Run test to verify it passes**

Run: `npx --prefix portfolio vitest run src/components/home/__tests__/ProfileAvatar.test.ts`
Expected: PASS (GREEN phase)

---

### Task 3: Comprehensive Test Suite & Production Build Verification

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)

- [x] **Step 1: Run complete test suite**

Run: `npm --prefix portfolio test`
Expected: 19/19 test suites pass, 100% tests green.

- [x] **Step 2: Run Vite production build**

Run: `npm --prefix portfolio run build`
Expected: `tsc && vite build` succeeds with exit code 0.
