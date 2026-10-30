# Continuous Clean Card Shimmer Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an ultra-clean, continuous diagonal glass sheen animation on the profile portrait card that sweeps periodically with a calm pause using GSAP, with accessibility and lifecycle safety.

**Architecture:** Embed a `data-avatar-shine` overlay layer within `data-avatar-card` styled with `mix-blend-mode: overlay` and a 115° monochrome gradient. Control its diagonal sweep via an isolated GSAP timeline (`repeat: -1, repeatDelay: 3.5, duration: 2.5`), pausing when `prefers-reduced-motion` is active and killing the timeline in `destroy()`.

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (tests written before code), component lifecycle isolation (`mount`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: No animation played when OS reduced motion is active.
- Ponytail mode: Minimal diff, no new dependencies, no canvas/WebGL overhead.

---

### Task 1: Write Unit Tests for Shimmer Animation in `ProfileAvatar.test.ts`

**Files:**
- Modify: `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts`

**Interfaces:**
- Consumes: `ProfileAvatarComponent` from `@/components/home/ProfileAvatar`
- Produces: Failing test assertions for `data-avatar-shine` DOM element, GSAP timeline creation, `prefers-reduced-motion` handling, and `destroy()` cleanup.

- [x] **Step 1: Write the failing tests**

Update `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts` to include:
1. Verification of `data-avatar-shine` element within `[data-avatar-card]` with pointer-events-none and absolute positioning.
2. Verification that GSAP timeline is instantiated with `{ repeat: -1, repeatDelay: 3.5 }`.
3. Verification that when `matchMedia('(prefers-reduced-motion: reduce)')` is true, the timeline is not run.
4. Verification that `avatar.destroy()` kills the GSAP timeline.

- [x] **Step 2: Run test to verify it fails**

Run: `npx --prefix portfolio vitest run src/components/home/__tests__/ProfileAvatar.test.ts`
Expected: FAIL (assertion for `[data-avatar-shine]` or timeline fails because it is not yet implemented)

---

### Task 2: Implement Shimmer Element & GSAP Timeline in `ProfileAvatar.ts`

**Files:**
- Modify: `portfolio/src/components/home/ProfileAvatar.ts`

**Interfaces:**
- Consumes: `gsap` from `gsap`, `ProfileAvatarConfig`, `ProfileAvatarOptions`
- Produces: `ProfileAvatarComponent` mounting `data-avatar-shine` with continuous periodic GSAP diagonal sweep and cleanup.

- [x] **Step 1: Update `ProfileAvatar.ts`**

1. Import `gsap` from `'gsap'`.
2. Add private field: `private shineTimeline: gsap.core.Timeline | null = null;`.
3. In `mount()`:
   - Inside `[data-avatar-card]`, append the shimmer overlay HTML:
     ```html
     <div
       data-avatar-shine
       aria-hidden="true"
       class="pointer-events-none absolute -inset-full w-[300%] h-[300%] opacity-0 select-none mix-blend-overlay"
       style="background: linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.03) 70%, transparent 100%);"
     ></div>
     ```
   - Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
   - If false, create the GSAP timeline:
     ```typescript
     const shineEl = root.querySelector<HTMLElement>('[data-avatar-shine]');
     if (shineEl) {
       this.shineTimeline = gsap.timeline({
         repeat: -1,
         repeatDelay: 3.5,
       });
       this.shineTimeline.fromTo(
         shineEl,
         { xPercent: -100, yPercent: -100, opacity: 0 },
         {
           xPercent: 100,
           yPercent: 100,
           opacity: 1,
           duration: 2.5,
           ease: 'power2.inOut',
         }
       );
     }
     ```
4. In `destroy()`:
   - Call `this.shineTimeline?.kill();` and set `this.shineTimeline = null;`.

- [x] **Step 2: Run test to verify it passes**

Run: `npx --prefix portfolio vitest run src/components/home/__tests__/ProfileAvatar.test.ts`
Expected: PASS (all tests in `ProfileAvatar.test.ts` pass)

---

### Task 3: Comprehensive Test Suite & Production Build Verification

**Files:**
- Test: All vitest suites
- Build: Vite production build

- [x] **Step 1: Run complete test suite**

Run: `npm --prefix portfolio test`
Expected: 19/19 test suites pass, 100% tests green.

- [x] **Step 2: Run Vite production build**

Run: `npm --prefix portfolio run build`
Expected: `tsc && vite build` succeeds with exit code 0.
