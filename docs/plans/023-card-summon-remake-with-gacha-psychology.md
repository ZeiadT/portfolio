# Card Summon - Gacha Psychology & Motion Redesign Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline SVG, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remake the `CardSummonEngine` animation sequence based on the newly acquired research and skill (`choreographing-reveal-animations`):
1. **Phase 1: Inhale / Preparation**: Portal emergence with anticipatory squash ("inhale" `scaleY: 0.75, scaleX: 1.15`) before launch.
2. **Phase 2: Tension Charge & The Fermata**: 3-spin ascent (`-1080° -> 0°`), Nyquist-bandlimited 20Hz micro-vibration, and the **150ms Fermata (dead-air spatial freeze)** at apex with subtle scale dilation (`1.020 -> 1.025`).
3. **Phase 3: Climax Rupture & Optical Flash**: Fullscreen optical flash veil (`data-summon-flash-veil`, 40ms rise, 160ms decay), expanding radial shockwave ring (`data-summon-shockwave`), and synchronized aura burst.
4. **Phase 4: Saccadic Settle**: Poised gravitational descent into resting center (`yPercent: 0`, `power2.out`, 0.45s).
5. **Phase 5: Interactive 3D Parallax Tilt**: Spring-damped pointer tracking ($\pm 12^\circ$ tilt matrix) using `gsap.quickTo` when settled, transforming the summoned card into a tactile, inspectable artifact.

**Architecture:** Extend `CardSummonEngine` in `portfolio/src/engines/card/CardSummonEngine.ts`. Integrate `data-summon-flash-veil` and `data-summon-shockwave` into the DOM. Wire pointer event listeners on the modal for 3D card tilt with graceful teardown. Retain 100% backward compatibility with all 36 existing unit tests.

---

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (unit test specifications committed first in RED phase), component lifecycle isolation (`mount`, `open`, `close`, `destroy`), zero DOM/memory leaks.
- Zero external asset dependencies: 100% inline SVG and CSS vectors.
- Backward compatibility: All 36 existing tests in `CardSummonEngine.test.ts` must pass.
- Strict accessibility (`prefers-reduced-motion: reduce`): Instantly places card at resting center without spins, flashes, vibrations, or parallax tilt.

---

### Task 1: Author Unit Tests for Gacha Psychology Motion in `CardSummonEngine.test.ts`

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions (RED phase) for:
  1. Anticipatory inhale squash on `[data-summon-bottom-glow]` prior to card launch.
  2. The 150ms Fermata dead-air freeze: spatial coordinates remain locked (`x === 0`) while scale undergoes subtle dilation.
  3. Flash veil (`[data-summon-flash-veil]`) and shockwave ring (`[data-summon-shockwave]`) DOM presence and climax burst animation.
  4. Interactive 3D mouse parallax tilt: `pointermove` on modal updates card `rotationY` and `rotationX` within $\pm 12^\circ$ when settled.
  5. Teardown: `flashVeil`, `shockwave`, and `pointermove` listeners are fully disposed on `close()` and `destroy()`.

- [x] **Step 1: Add Gacha Psychology Motion describe block with unit test specifications**
- [x] **Step 2: Run test suite to verify tests fail against current baseline (RED phase)**
- [x] **Step 3: Commit test specifications**

---

### Task 2: Implement Gacha Psychology Motion Choreography & 3D Tilt in `CardSummonEngine.ts`

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

**Interfaces:**
- Consumes: `gsap`
- Produces: `CardSummonEngine` with:
  1. Flash veil and shockwave DOM elements with proper ARIA attributes.
  2. Anticipatory portal inhale squash in `openTimeline`.
  3. Pre-fermata 20Hz micro-vibration and 150ms spatial freeze at apex.
  4. Optical flash veil burst (40ms rise, 160ms decay) and radial shockwave expansion.
  5. Settle transition triggering interactive 3D pointer parallax tilt (`rotationX` & `rotationY` via `gsap.quickTo`).
  6. Memory cleanup in `cleanupDomAndListeners()` for flash veil, shockwave, and pointer listeners.

- [x] **Step 1: Implement Gacha Psychology Motion choreography & 3D tilt in `CardSummonEngine.ts`**
- [x] **Step 2: Run test suite to verify all tests pass (GREEN phase)**
- [x] **Step 3: Commit implementation**

---

### Task 3: Code Review Refinements (Reduced Motion & In-flight Tween Cleanup)

**Findings Addressed:**
1. Parallax Tilt Reduced Motion Bypass: Ensure `pointermove` early-exits when `prefers-reduced-motion: reduce` is detected.
2. In-flight Tween Cleanup: Explicitly kill active tweens on `this.cardEl` before DOM detachment in `cleanupDomAndListeners()`.

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

- [x] **Step 1: Add unit test in `CardSummonEngine.test.ts` verifying reduced-motion disables 3D parallax tilt (RED phase)**
- [x] **Step 2: Update `CardSummonEngine.ts` to bypass tilt on reduced motion and kill card tweens in `cleanupDomAndListeners()` (GREEN phase)**
- [x] **Step 3: Run Vitest test suite to verify all tests pass**
- [x] **Step 4: Commit changes with message `fix(card): disable 3D tilt under reduced motion and kill in-flight card tweens`**

---

### Task 4: Comprehensive Verification & Plan Sign-off

**Files:**
- Test: All vitest suites in `portfolio/src/`
- Build: Vite production build (`portfolio/`)
- Docs: `docs/plans/023-card-summon-remake-with-gacha-psychology.md`

- [x] **Step 1: Run complete test suite (`npm --prefix portfolio test`)**
- [x] **Step 2: Run Vite production build (`npm --prefix portfolio run build`)**
- [x] **Step 3: Mark documentation plan Completed and commit**
- [x] **Step 4: Present the remade animation experience to the user for review**
