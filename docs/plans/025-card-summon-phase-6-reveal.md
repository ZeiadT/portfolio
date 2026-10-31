# Card Summon - Phase 6: The Radiant Unblur & Flip Reveal Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline SVG, Vitest
- **Branch**: `feat/card-shine-effect`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## 1. Feature Overview & Requirements Alignment

Based on the interactive `/grill-me` alignment with the user, Phase 6 executes the climactic **Radiant Unblur & Flip Reveal** with a **Zero-UI Pure Artifact** aesthetic:

1. **Fully Automatic Gacha Climax & 3D Flip Reveal**:
   - Card ascends spinning (`-1260° -> -180°`) with the mystic back sigil facing the camera.
   - Pre-fermata 20Hz micro-vibration ($0.75\text{s} - 1.10\text{s}$).
   - The 200ms Fermata Freeze ($1.10\text{s} - 1.30\text{s}$): Spatial coordinates clamped (`x = 0`), scale expands subtly ($1.020 \to 1.025$).
   - At $1.30\text{s}$ (Apex Climax Rupture):
     - Fullscreen optical flash veil (`data-summon-flash-veil`) triggers: $0 \to 0.95 \to 0$.
     - Radial shockwave ring (`data-summon-shockwave`) expands $0.2 \to 2.8$ and fades out.
     - Card snaps with high-torque 3D flip: `rotationY: -180° -> 0°` (`power3.out`), revealing the front face.
2. **Radiant Unblur & Specular Sheen Sweep**:
   - Frosted obsidian glass veil (`data-summon-card-front-mask`) unblurs and dissolves: `opacity: 1 -> 0` ($1.35\text{s} - 1.75\text{s}$, `power2.inOut`).
   - Radiant specular sheen (`data-summon-card-front-sheen`) sweeps diagonally across the face (`xPercent: -120 -> 180`).
3. **Dynamic Staggered Element Entrance**:
   - 5 gold stars (`[data-summon-star]`) drop in with a rhythmic bounce (`scale: 2.2 -> 1, opacity: 0 -> 1, stagger: 0.04s, ease: back.out(2.5)`).
   - Stat progress bars (`[data-summon-stat-bar-fill]`) animate their width from $0\%$ to target attributes (`99%`, `98%`, `95%`).
4. **Zero-UI Pure Artifact & Settle Interaction**:
   - Bottom pill buttons (`[data-summon-controls]`) completely removed.
   - Direct click on the card flips between front face (`rotationY: 0`) and back sigil (`rotationY: 180`).
   - 3D parallax mouse/touch tilt active on modal when settled ($\pm 12^\circ$).
   - Subtle "Click anywhere to close" hint (`data-summon-hint`) appears below the card $1.2\text{s}$ after settle with a blur fade-in (`opacity: 0 -> 0.75, filter: blur(8px) -> blur(0px)`).
   - Clicking backdrop, close button, or pressing Escape dismisses the modal.
5. **Strict Accessibility (`prefers-reduced-motion: reduce`)**:
   - Instantly settles at `rotationY: 0, scale: 1, opacity: 1, yPercent: 0`.
   - Concealment veil set to `opacity: 0`, stars at `scale: 1, opacity: 1`, stat bars at target widths.
   - Hint appears immediately without blur animation.
   - 3D tilt and particle flashes bypassed.
6. **Teardown & Lifecycle Isolation**:
   - All tweens killed, DOM elements cleanly removed on `close()` and `destroy()`.
   - Zero memory leaks, backward-compatible with all existing tests.

---

## 2. Mathematical & Coordinate Architecture

- **Card Faces Coordinates**:
  - `cardFace` is mounted with `rotateY(0deg)` (`backface-visibility: hidden`).
  - `cardBack` is mounted with `rotateY(180deg)` (`backface-visibility: hidden`).
- **Ascent & Flip Math**:
  - Card `fromTo`: `rotationY: -1260 -> -180` (back sigil visible at $-180^\circ + 180^\circ = 0^\circ$).
  - Apex Climax Flip at $1.30\text{s}$: `rotationY: -180 -> 0` (front face visible at $0^\circ + 0^\circ = 0^\circ$).
  - At settle ($progress = 1$): `rotationY = 0`, `yPercent = 0`, `rotationZ = 0`, `scale = 1`.
  - All existing test assertions expecting `rotationY === 0` at settle pass 100%.

---

## 3. Implementation Tasks

### Task 1: Author Strict TDD Unit Tests for Phase 6 in `CardSummonEngine.test.ts`
- **Files:** `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`
- **Test Specifications (RED Phase):**
  1. Card ascends back-facing at $-180^\circ$ and executes 3D flip at climax ($1.30\text{s}$) to $0^\circ$, revealing front face.
  2. Frosted concealment veil (`[data-summon-card-front-mask]`) animates to `opacity: 0` during timeline reveal, leaving `isMaskConcealed()` as `false` when settled.
  3. Specular sheen sweeps across card face during reveal.
  4. 5 gold stars (`[data-summon-star]`) animate into place with stagger and bounce.
  5. Stat progress bars (`[data-summon-stat-bar-fill]`) animate from $0\%$ to target widths.
  6. Zero-UI: No pill buttons (`[data-summon-controls]`) exist in the DOM; direct card click flips card to $180^\circ$ and back to $0^\circ$.
  7. "Click anywhere to close" hint (`[data-summon-hint]`) exists with initial opacity 0 and unblurs after settle.
  8. Accessibility: Under `prefers-reduced-motion: reduce`, card is immediately revealed at $0^\circ$, veil is at opacity 0, stat bars at target widths, hint is immediately visible.
  9. Teardown: Hint, card tweens, and timeline are cleanly disposed on `close()` and `destroy()`.
- [x] Step 1: Write Phase 6 test suite in `CardSummonEngine.test.ts`.
- [x] Step 2: Run test suite to verify new tests fail (RED phase).
- [x] Step 3: Git commit test specifications.

### Task 2: Update Card Face Renderers for Individual Star & Stat Fill Elements
- **Files:**
  - `portfolio/src/engines/card/renderers/EditorialCardFaceRenderer.ts`
  - `portfolio/src/engines/card/renderers/MythicCardFaceRenderer.ts`
  - Unit tests: `EditorialCardFaceRenderer.test.ts`, `MythicCardFaceRenderer.test.ts`
- **Changes:**
  1. Render individual `<span data-summon-star>★</span>` inside `[data-summon-face-stars]` preserving text content `★★★★★`.
  2. Add `data-summon-stat-bar-fill` and `data-target-width` on the stat progress bar inner fill divs with initial `width: 0%` (or target width under reduced motion).
- [x] Step 1: Update renderers.
- [x] Step 2: Run renderer test suites and verify all pass.
- [x] Step 3: Git commit renderer updates.

### Task 3: Implement Phase 6 Reveal Choreography & Zero-UI in `CardSummonEngine.ts`
- **Files:** `portfolio/src/engines/card/CardSummonEngine.ts`
- **Changes:**
  1. Update 3D card faces coordinate alignment (`cardFace` at $0^\circ$, `cardBack` at $180^\circ$).
  2. Calibrate ascent rotation (`-1260 -> -180`), apex fermata freeze at $-180^\circ$, and climax 3D flip at $1.30\text{s}$ (`-180 -> 0`).
  3. Animate front mask dissolve (`opacity: 1 -> 0`), specular sheen sweep, star bounce cascade, and stat bar fills inside `openTimeline`.
  4. Remove old pill buttons (`controlsEl`) and mount subtle "Click anywhere to close" hint (`data-summon-hint`) with blur fade-in.
  5. Calibrate click-to-flip (`rotationY: 0 <-> 180`) and 3D parallax tilt for both faces.
  6. Ensure complete teardown and disposal in `cleanupDomAndListeners()`.
- [x] Step 1: Implement Phase 6 reveal logic in `CardSummonEngine.ts`.
- [x] Step 2: Run test suite to verify all tests pass (GREEN phase).
- [x] Step 3: Git commit implementation.

### Task 4: Climax Flash Synchronization & Reverse Flip Prevention Refinement
- **Files:**
  - `portfolio/src/components/home/ProfileHeader.ts`
  - `portfolio/src/engines/card/CardSummonEngine.ts`
  - `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`
- **Changes:**
  1. Synchronized the climax optical flash veil (`data-summon-flash-veil`) and radial shockwave (`data-summon-shockwave`) to $1.32\text{s} - 1.48\text{s}$, peaking at $1.36\text{s} - 1.40\text{s}$ exactly as the card rotates through its $-90^\circ$ edge-on angle. As the flash clears ($1.40\text{s} - 1.45\text{s}$), the card is already on the front face ($0^\circ$).
  2. Removed `autoFlipToFront: true` in `ProfileHeader.ts` and removed the automatic `flipCard()` in `onComplete` in `CardSummonEngine.ts` to prevent the spurious reverse flip back to the back sigil upon settle.
  3. Updated test suite asserting that the card firmly rests at `rotationY === 0` and `isCardFlipped() === false` on timeline completion.
- [x] Step 1: Update unit tests for flip settle state.
- [x] Step 2: Implement timing synchronization and remove spurious reverse flip.
- [x] Step 3: Verify all 207 tests passing and Vite build clean.

### Task 5: Full Verification & Live Review
- **Files:** All test suites in `portfolio/src/`, Vite build.
- [x] Step 1: Run full test suite (`npm --prefix portfolio test`).
- [x] Step 2: Run Vite production build (`npm --prefix portfolio run build`).
- [x] Step 3: Mark plan Completed and present live verification to user.
