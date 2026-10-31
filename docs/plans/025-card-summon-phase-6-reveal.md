# Card Summon - Phase 6: The Radiant Unblur & Flip Reveal Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline SVG, Vitest
- **Branch**: `feat/card-shine-effect`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

---

## 1. Feature Overview & Requirements Alignment

Based on user feedback on the initial Phase 6 animation:
> "card spins in blured side on both front and back, stops then snaps to back side, animation finish flash light plays and it snaps to front again"

### Root Cause Analysis:
1. **Multi-turn Y-axis Spin**:
   - The card had `rotationY: -1260 -> -180`, causing it to spin 3.5 times on Y.
   - This exposed both front and back faces repeatedly before the reveal, ruining the sense of mystery.
2. **Backdrop-Blur 3D Bleed in Chromium**:
   - `frontMaskEl` used `backdrop-blur-xl`.
   - In Chromium / WebKit, `backdrop-filter` creates an unclipped compositor surface that ignores `backface-visibility: hidden` in 3D transforms, causing the blur to bleed through onto the card back, making BOTH sides look blurry during the spin.
3. **Disjointed Settle & Flash Snapping**:
   - The card stopped spinning on the back face at $1.10\text{s}$, sat frozen on the back face, and only then fired a flash veil at $1.32\text{s}$ with a disjointed snap to the front.
   - The flash and flip were separated rather than acting as one unified climax rupture.

### Corrected Motion Architecture:
1. **Face-Down Ascent (Tension Charge)**:
   - The card ascends **strictly face-down** (`rotationY: -180` constant) showing only the crisp, unblurred mystic card back.
   - Zero Y-axis spinning during ascent.
   - Subtle dynamic 3D entrance pitch and roll (`rotationX: 18 -> 0`, `rotationZ: -8 -> 1.5`, `scale: 0.55 -> 1.02`, `yPercent: 120 -> -4`).
2. **Elimination of Blur Bleed**:
   - `cardFace` is kept hidden (`visibility: hidden`) during ascent ($0.0\text{s} - 1.30\text{s}$) so `backdrop-filter` cannot bleed through to `cardBack`.
3. **Unified Apex Climax Rupture ($1.30\text{s} - 1.60\text{s}$)**:
   - At $1.30\text{s}$ (after the 200ms fermata freeze from $1.10\text{s} - 1.30\text{s}$):
     - `cardFace` becomes visible.
     - Blinding whiteout flash veil surges ($0 \to 0.95$ in $0.04\text{s}$, $1.30\text{s} - 1.34\text{s}$).
     - Shockwave ring bursts outward ($1.30\text{s} - 1.50\text{s}$).
     - Card flips smoothly in 3D: `rotationY: -180° -> 0°` ($0.30\text{s}$ duration, $1.30\text{s} - 1.60\text{s}$, `power3.out`).
     - As the flash clears ($1.38\text{s} - 1.48\text{s}$), the card is already past $-90^\circ$ edge-on and reveals the front face.
4. **Reveal & Settle ($1.35\text{s} - 2.00\text{s}$)**:
   - Obsidian mask dissolves (`opacity: 1 -> 0`).
   - Radiant specular sheen sweeps across the face.
   - 5 gold stars drop with bounce (`scale: 2.2 -> 1.0`, `stagger: 0.04s`, `back.out(2.5)`).
   - Stat bars animate to target widths.
   - Card floats gracefully to centered rest (`yPercent: 0, scale: 1.0`).

---

## 2. Mathematical & Coordinate Architecture

- **Card Faces**:
  - `cardFace`: `rotateY(0deg)` (`backface-visibility: hidden`).
  - `cardBack`: `rotateY(180deg)` (`backface-visibility: hidden`).
- **Ascent**:
  - `rotationY: -180` (back sigil facing camera: $-180^\circ + 180^\circ = 0^\circ$).
  - `rotationX: 18 -> 0`, `rotationZ: -8 -> 1.5`, `yPercent: 120 -> -4`, `scale: 0.55 -> 1.02`.
- **Apex Climax Flip**:
  - At $1.30\text{s}$: `rotationY: -180 -> 0` (`duration: 0.30s`, `power3.out`).
  - Edge-on crossing occurs at $t \approx 1.36\text{s}$, fully concealed by flash veil ($t = 1.30\text{s} - 1.48\text{s}$).
  - Settle at $progress = 1$: `rotationY: 0`, `yPercent: 0`, `scale: 1.0`.

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

### Task 5: Eliminate Propeller Y-Spin During Ascent, Prevent Blur Bleed, and Unify Climax Rupture
- **Files:**
  - `portfolio/src/engines/card/CardSummonEngine.ts`
  - `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`
- **Changes:**
  1. Fix ascent rotation: Card emerges and ascends facing back towards camera (`rotationY: -180` constant) with natural 3D pitch/roll (`rotationX: 18 -> 0`, `rotationZ: -8 -> 1.5`), eliminating the 3.5 multi-turn Y-spin that was exposing the front face repeatedly.
  2. Prevent compositor blur bleed onto card back: Keep `cardFace` hidden (`visibility: hidden` / `opacity: 0`) during ascent ($0.0\text{s} - 1.20\text{s}$) and remove `backdrop-blur-xl` from `frontMask` to prevent Chromium's compositor from bleeding blur onto `cardBack`.
  3. Unify climax rupture: At $1.20\text{s}$ (after 150ms fermata freeze), trigger flash veil ($1.20\text{s} - 1.45\text{s}$), radial shockwave ($1.20\text{s} - 1.42\text{s}$), and 3D card flip from $-180^\circ \to 0^\circ$ ($1.20\text{s} - 1.55\text{s}$, $0.35\text{s}$ duration, `power3.out`). Make `cardFace` visible at $1.20\text{s}$.
  4. Ensure smooth reveal of front mask dissolve, stars drop-in, stat bar fills, and settle into center rest position.
- [x] Step 1: Update unit test specifications in `CardSummonEngine.test.ts`.
- [x] Step 2: Implement motion & blur isolation refinements in `CardSummonEngine.ts`.
- [x] Step 3: Run Vitest test suite and verify all tests pass.
- [x] Step 4: Run Vite build and verify clean build.

### Task 6: Full Verification & Live Review
- **Files:** All test suites in `portfolio/src/`, Vite build.
- [x] Step 1: Run full test suite (`npm --prefix portfolio test`).
- [x] Step 2: Run Vite production build (`npm --prefix portfolio run build`).
- [x] Step 3: Mark plan Completed and present live verification to user.
