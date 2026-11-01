# 043: Bento Reverse-Sink Reveal Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Reverse-Sink Bento Grid Reveal Animation that choreographs the 5 Bento Grid cards to surface out of deep spatial perspective (`y: 24px`, `scale: 0.96`, `filter: blur(12px)`, `opacity: 0`) with an Identity-First staggered cascade and tactile micro-spring cushion (`back.out(1.1)`), mirroring the ASCII background sinking physics in reverse.

**Architecture:** 
- The `BentoRevealController` encapsulates the GPU-composited initial state, timeline construction, reduced motion fallback, and teardown.
- `transitionTimeline.ts` integrates the reveal at `ascent + 0.40s` as the brand bar traverses past mid-screen, settling cleanly as the bar docks into the 38px top nav bar.
- Hardware acceleration properties (`willChange`, `filter`) are automatically cleared on landing via `clearProps` to preserve crisp typography and 60/120fps lock.

**Tech Stack:** Vanilla TypeScript, GSAP 3.12+, Vitest, Tailwind CSS, Vite.

## Global Constraints
- Spec: `docs/superpowers/specs/2026-11-01-bento-reverse-sink-reveal-design.md`
- Initial Card State: `y: 24`, `scale: 0.96`, `opacity: 0`, `filter: 'blur(12px)'`, `willChange: 'transform, opacity, filter'`
- Arrival Resting State: `y: 0`, `scale: 1.0`, `opacity: 1`, `filter: 'blur(0px)'`, `clearProps: 'filter,willChange'`
- Identity-First Stagger Order: `Hero Right (Avatar)` -> `Hero Left (Quote/Contact)` -> `Globe` -> `Education` -> `Summary`
- Stagger Gap: `0.08s`
- Card Duration: `0.55s`
- Easing: `back.out(1.1)` for transforms; `power2.out` for blur/opacity
- Master Timeline Offset: `ascent + 0.40s` (`TRANSITION_TIMINGS.bentoRevealStart`)
- Strict TDD: Write failing tests first, verify RED, implement, verify GREEN, commit.

---

### Task 1: Update Transition Constants and Tokens

**Files:**
- Modify: `portfolio/src/engines/band/constants.ts`
- Modify: `portfolio/src/components/home/BentoRevealController.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - `TRANSITION_TIMINGS.bentoRevealStart: 0.40`
  - `BENTO_REVEAL_TIMINGS`: `stagger: 0.08`, `cardDuration: 0.55`, `reducedMotionDuration: 0.4`, `initialY: 24`, `initialScale: 0.96`, `initialBlur: 12`
  - `BENTO_REVEAL_EASES`: `transform: 'back.out(1.1)'`, `fade: 'power2.out'`

- [x] **Step 1: Update `TRANSITION_TIMINGS` in `constants.ts`**
  - Add `bentoRevealStart: 0.40` (and deprecate/replace `bentoWireframeStart`).

- [x] **Step 2: Update `BENTO_REVEAL_TIMINGS` and easing tokens in `BentoRevealController.ts`**
  - Replace the wireframe and drop timings with the new reverse-sink timings and constants.

---

### Task 2: Bento Initial State & Reverse-Sink Animation in `BentoRevealController`

**Files:**
- Test: `portfolio/src/components/home/__tests__/BentoRevealController.test.ts`
- Modify: `portfolio/src/components/home/BentoRevealController.ts`

**Interfaces:**
- Consumes: `BENTO_REVEAL_TIMINGS`, `BENTO_REVEAL_EASES`
- Produces: `BentoRevealController.prepareInitialState()`, `BentoRevealController.createRevealTimeline()`, `BentoRevealController.destroy()`

- [x] **Step 1: Write failing tests in `BentoRevealController.test.ts`**
  - Test that `prepareInitialState()` sets `y: 24`, `scale: 0.96`, `opacity: 0`, and `filter: blur(12px)`.
  - Test that `prepareInitialState()` sets `willChange` to include `transform`, `opacity`, and `filter`.
  - Test that `createRevealTimeline()` creates tweens with the Identity-First stagger order: `heroRight` (0.00s), `heroLeft` (0.08s), `globe` (0.16s), `education` (0.24s), `summary` (0.32s).
  - Test that tweens use `back.out(1.1)` for transforms and `power2.out` for opacity/blur, targeting `y: 0`, `scale: 1`, `opacity: 1`, `filter: blur(0px)`.
  - Test that `clearProps` clears `filter` and `willChange` upon timeline completion.
  - Test reduced motion mode: crossfades opacity only, with no transforms or blurs.
  - Test that `destroy()` clears all inline styles and transforms without leaks.

- [x] **Step 2: Run tests to verify failure (RED)**
  - Run `cd portfolio; npx vitest run src/components/home/__tests__/BentoRevealController.test.ts`.

- [x] **Step 3: Implement reverse-sink logic in `BentoRevealController.ts`**
  - Update `prepareInitialState()`:
    ```typescript
    gsap.set(allCards, {
      opacity: 0,
      y: BENTO_REVEAL_TIMINGS.initialY,
      scale: BENTO_REVEAL_TIMINGS.initialScale,
      filter: `blur(${BENTO_REVEAL_TIMINGS.initialBlur}px)`,
      force3D: true,
    });
    ```
  - Update `createRevealTimeline(options)`:
    - Sequence cards in identity-first order:
      ```typescript
      const orderedCards = [
        elements.heroRight,
        elements.heroLeft,
        elements.globe,
        elements.education,
        elements.summary,
      ];
      ```
    - For each card at offset `i * BENTO_REVEAL_TIMINGS.stagger`:
      - Tween `y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.1)'`
      - Tween `opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power2.out'`
    - At timeline completion, clear `filter` and `willChange` props.
  - Update `destroy()` to clear `filter`, `transform`, `opacity`, and `willChange`.

- [x] **Step 4: Run tests to verify passing (GREEN)**
  - Run `cd portfolio; npx vitest run src/components/home/__tests__/BentoRevealController.test.ts`.

- [x] **Step 5: Commit changes**
  - Run `git add` and `git commit -m "feat(home): implement reverse-sink bento reveal animation"`.

---

### Task 3: Integrate Reverse-Sink Reveal into `transitionTimeline`

**Files:**
- Test: `portfolio/src/engines/band/__tests__/transitionTimeline.test.ts`
- Modify: `portfolio/src/engines/band/transitionTimeline.ts`

**Interfaces:**
- Consumes: `bentoController.createRevealTimeline()`, `TRANSITION_TIMINGS.bentoRevealStart`
- Produces: `buildBandToNavTimeline()`

- [ ] **Step 1: Write failing tests in `transitionTimeline.test.ts`**
  - Update test assertion to verify `bentoController.createRevealTimeline()` is nested at `ascent + 0.40s` (`TRANSITION_TIMINGS.bentoRevealStart`).

- [ ] **Step 2: Run tests to verify failure (RED)**
  - Run `cd portfolio; npx vitest run src/engines/band/__tests__/transitionTimeline.test.ts`.

- [ ] **Step 3: Update `transitionTimeline.ts`**
  - Update timeline attachment:
    ```typescript
    if (bentoController) {
      tl.add(
        bentoController.createRevealTimeline(),
        `ascent+=${TRANSITION_TIMINGS.bentoRevealStart}`
      );
    }
    ```

- [ ] **Step 4: Run tests to verify passing (GREEN)**
  - Run `cd portfolio; npx vitest run src/engines/band/__tests__/transitionTimeline.test.ts`.

- [ ] **Step 5: Commit changes**
  - Run `git add` and `git commit -m "feat(band): sync bento reverse-sink reveal at mid-ascent"`.

---

### Task 4: Full Suite Verification & Build

**Files:**
- None (verification phase)

- [ ] **Step 1: Run all Vitest test suites**
  - Run `cd portfolio; npm test`. Verify all 28 test suites pass cleanly.

- [ ] **Step 2: Run TypeScript check and production build**
  - Run `cd portfolio; npm run build`. Verify 0 errors.

- [ ] **Step 3: Commit and summarize**
  - Final git status check and verification report.
