# Continuous Animated Card Border Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an elegant, continuous orbiting vermilion and white hairline border with an ambient soft bloom around the profile portrait card using GSAP and CSS conic gradients.

**Architecture:** Wrap the card with an ambient bloom layer (`data-avatar-border-glow`) and a 1.5px hairline mask container (`data-avatar-border-track`) containing an oversized rotating element (`data-avatar-border-beam`) with a vermilion-to-white `conic-gradient`. Drive continuous 7.0s linear rotation with a GSAP tween, pausing when `prefers-reduced-motion` is active and disposing cleanly in `destroy()`.

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (tests written before code), component lifecycle isolation (`mount`, `destroy`), zero DOM/memory leaks.
- Respect `prefers-reduced-motion: reduce`: No rotation played when OS reduced motion is active.
- Ponytail mode: Minimal diff, no new dependencies, GPU compositor transforms (`rotation`), zero layout thrashing.

---

### Task 1: Write Unit Tests for Animated Border in `ProfileAvatar.test.ts`

**Files:**
- Modify: `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts`

**Interfaces:**
- Consumes: `ProfileAvatarComponent` from `@/components/home/ProfileAvatar`
- Produces: Failing test assertions for `data-avatar-border-track`, `data-avatar-border-beam`, `data-avatar-border-glow` DOM elements, GSAP 7s rotation tween creation, `prefers-reduced-motion` suppression, and `destroy()` cleanup.

- [x] **Step 1: Write the failing tests**

Add a dedicated `describe('continuous animated card border', ...)` block to `ProfileAvatar.test.ts` with tests:
1. Asserts `data-avatar-border-track`, `data-avatar-border-beam`, and `data-avatar-border-glow` elements are rendered.
2. Asserts `data-avatar-border-beam` has `conic-gradient` background with `#ff4421` and `rgba(255, 255, 255, 0.95)`.
3. Asserts GSAP tween is initialized targeting the beam elements with `{ rotation: 360, duration: 7, ease: 'none', repeat: -1 }`.
4. Asserts when `matchMedia('(prefers-reduced-motion: reduce)')` is true, the border rotation tween is not started.
5. Asserts `avatar.destroy()` terminates and kills the border rotation tween.

- [x] **Step 2: Run test to verify it fails**

Run: `npm --prefix portfolio test -- ProfileAvatar.test.ts`
Expected: FAIL (RED phase)

---

### Task 2: Implement Animated Border in `ProfileAvatar.ts`

**Files:**
- Modify: `portfolio/src/components/home/ProfileAvatar.ts`

**Interfaces:**
- Consumes: `gsap` from `gsap`, `ProfileAvatarConfig`, `ProfileAvatarOptions`
- Produces: `ProfileAvatarComponent` rendering animated border layers and managing GSAP 7s rotation tween with clean teardown.

- [x] **Step 1: Update `ProfileAvatar.ts`**

1. Add private field: `private borderTween: gsap.core.Tween | null = null;`.
2. In `mount()`:
   - Defensive guard: `if (this.borderTween) { this.borderTween.kill(); this.borderTween = null; }`.
   - Wrap the card container structure:
     - Ambient outer bloom:
       ```html
       <div
         data-avatar-border-glow
         aria-hidden="true"
         class="pointer-events-none absolute -inset-[2px] rounded-2xl sm:rounded-3xl overflow-hidden blur-md opacity-25"
       >
         <div
           data-avatar-border-glow-beam
           class="w-[250%] h-[250%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
           style="background: conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #ff4421 335deg, rgba(255, 255, 255, 0.95) 360deg);"
         ></div>
       </div>
       ```
     - 1.5px Hairline track:
       ```html
       <div
         data-avatar-border-track
         aria-hidden="true"
         class="pointer-events-none absolute -inset-[1.5px] rounded-2xl sm:rounded-3xl overflow-hidden p-[1.5px]"
       >
         <div
           data-avatar-border-beam
           class="w-[250%] h-[250%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
           style="background: conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #ff4421 335deg, rgba(255, 255, 255, 0.95) 360deg);"
         ></div>
       </div>
       ```
   - In GSAP initialization:
     ```typescript
     const borderBeams = root.querySelectorAll<HTMLElement>(
       '[data-avatar-border-beam], [data-avatar-border-glow-beam]'
     );
     if (borderBeams.length > 0 && !prefersReducedMotion) {
       this.borderTween = gsap.to(borderBeams, {
         rotation: 360,
         duration: 7,
         ease: 'none',
         repeat: -1,
       });
     }
     ```
3. In `destroy()`:
   - Call `this.borderTween?.kill(); this.borderTween = null;`.

- [x] **Step 2: Run test to verify it passes**

Run: `npm --prefix portfolio test -- ProfileAvatar.test.ts`
Expected: PASS (GREEN phase)

---

### Task 3: Comprehensive Test Suite & Production Build Verification

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/017-card-animated-border.md`

- [x] **Step 1: Run complete test suite**

Run: `npm --prefix portfolio test`
Expected: 19/19 test suites pass, 100% tests green.

- [x] **Step 2: Run Vite production build**

Run: `npm --prefix portfolio run build`
Expected: `tsc && vite build` succeeds with exit code 0.

- [x] **Step 3: Update documentation plan**

Update `docs/plans/017-card-animated-border.md` to check all task checkboxes and set status to Completed. Commit documentation.
