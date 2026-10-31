# Card Back Etched Pattern & Golden Glow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the vectorized doodle pattern to the card back as a faded golden etched texture with a radial fade-out around the centered logo, remove legacy background patterns (guilloche, constellations, rays, halo), and give the centered card crest logo a rich, multi-tier golden glow.

**Architecture:** 
1. Export `CardTextureGenerator.CARD_BACK_PATTERN_PATH` containing the background-free doodle pattern path.
2. In `generateGoldenCardBackSvg` (SVG generator) and `CardSummonEngine.ts` (DOM renderer):
   - Remove legacy patterns (`guilloche-sacred-pattern`, constellations, cardinal rays, diamond nodes, halo rings, and corner filigrees).
   - Add `<mask id="gold-back-pattern-radial-mask">` featuring a center-occluding radial gradient.
   - Insert the etched pattern `<path>` using metallic gold gradient with subtle deboss shadow and mask applied.
   - Upgrade the centered star crest with a multi-tier golden glow filter and gradient aura.
3. In `drawGoldenCardBackContent` (Canvas 2D):
   - Remove legacy lattice, filigree flourishes, and celestial halo lines.
   - Render dual-pass etched doodle pattern (subtle shadow offset + faded gold metallic fill/stroke).
   - Apply radial mask using `globalCompositeOperation = 'destination-out'` centered at $(525, 735)$.
   - Render multi-stage golden glow (`shadowBlur`, luminous radial gradient, and gold-foil stroke) for the central star crest.

**Tech Stack:** Three.js (^0.160.0), HTML5 Canvas 2D, SVG, Vanilla TypeScript, Vitest

## Global Constraints
- Strictly follow TDD: RED tests first, verify failure, GREEN implementation, verify pass.
- Zero residual memory leaks and zero async image decoding dependencies on texture generation.
- Exact coordinate space parity between Canvas 2D and SVG renderers ($1050 \times 1470$).
- All 26 test suites and 335+ tests must pass with zero regressions.

---

### Task 1: RED Phase - Test Specifications for Etched Pattern and Golden Glow

**Files:**
- Modify: `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts:99-230`
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts:400-470`

**Interfaces:**
- Consumes: `CardTextureGenerator.generateGoldenCardBackSvg`, `CardTextureGenerator.drawGoldenCardBackContent`, `CardTextureGenerator.CARD_BACK_PATTERN_PATH`
- Produces: Updated test suites asserting presence of etched pattern, radial mask, golden glow, and absence of legacy guilloche/constellations.

- [x] **Step 1: Write failing tests in `CardTextureGenerator.test.ts`**
  - Assert `CardTextureGenerator.CARD_BACK_PATTERN_PATH` is defined and non-empty.
  - Assert `generateGoldenCardBackSvg` contains `data-summon-card-etched-pattern` and `mask="url(#` or radial mask ID.
  - Assert `generateGoldenCardBackSvg` does NOT contain legacy `guilloche-sacred-pattern` or `data-summon-card-filigree` or constellation lines.
  - Assert `generateGoldenCardBackSvg` contains the golden glow filter or gradient aura (`gold-crest-glow` / `golden-aura`).
  - Assert `drawGoldenCardBackContent` executes without error and invokes `createRadialGradient` and `Path2D` with `CARD_BACK_PATTERN_PATH`.

- [x] **Step 2: Update `CardSummonEngine.test.ts`**
  - Update any tests checking for legacy guilloche patterns to check for the new etched pattern element.

- [x] **Step 3: Run tests to confirm RED failure**
  - Command: `npm --prefix portfolio test`
  - Expected: Failures on `CARD_BACK_PATTERN_PATH` undefined and legacy pattern assertions.

---

### Task 2: GREEN Phase - Implement Etched Pattern & Golden Glow in `CardTextureGenerator.ts`

**Files:**
- Modify: `portfolio/src/engines/card/three/CardTextureGenerator.ts`

**Interfaces:**
- Consumes: `assets/card-pattern.svg` path data
- Produces:
  - `CardTextureGenerator.CARD_BACK_PATTERN_PATH`
  - `generateGoldenCardBackSvg(theme)` with etched pattern, radial fade mask, and golden glow
  - `drawGoldenCardBackContent(target, theme)` with 2D canvas etched pattern, radial destination-out mask, and glowing crest

- [x] **Step 1: Add `CARD_BACK_PATTERN_PATH` static constant**
  - Embed the optimized vector path string from `assets/card-pattern.svg`.

- [x] **Step 2: Update `generateGoldenCardBackSvg`**
  - Remove `<pattern id="guilloche-sacred-pattern">`, filigrees, constellation arcs/rays/nodes, and halo rings.
  - Add `<radialGradient id="pattern-radial-fade-grad">` and `<mask id="card-pattern-radial-mask">`.
  - Add etched pattern group `<g data-summon-card-etched-pattern="true" mask="url(#card-pattern-radial-mask)">` scaled and centered to cover the card surface.
  - Enhance centered `<g data-summon-card-crest="true">` with multi-tier radial glow aura (`#ffffff` -> `#ffd700` -> `#e5b85c` -> transparent) and drop-shadow filter.

- [x] **Step 3: Update `drawGoldenCardBackContent`**
  - Remove Section 2 (Guilloche Geometric Lattice), Section 4 (Corner Filigrees), and Section 5 (Halo Rings & Radiating Lines).
  - Add etched pattern rendering with subtle dual-pass gold gradient (`rgba(212, 175, 55, 0.22)`).
  - Apply radial mask using `destination-out` composite operation centered at $(525, 735)$.
  - Render enhanced golden glow behind the crest and render the star crest with gold foil fill and golden stroke.

- [x] **Step 4: Run unit tests to confirm GREEN passes**
  - Command: `npm --prefix portfolio test`
  - Expected: All test suites pass.

---

### Task 3: GREEN Phase - Update `CardSummonEngine.ts` DOM Card Back

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts:480-560`

**Interfaces:**
- Consumes: `CardTextureGenerator.CARD_BACK_PATTERN_PATH`
- Produces: HTML DOM card back markup synchronized with the new etched pattern and golden glow.

- [x] **Step 1: Clean legacy patterns from DOM card back SVG**
  - Remove `${sigilId}-guilloche`, filigree flourishes, and constellation rays.
  - Add radial mask and etched pattern element `<path d="${CardTextureGenerator.CARD_BACK_PATTERN_PATH}" ... />`.
  - Add multi-tier golden glow to `<g data-summon-card-crest>`.

- [x] **Step 2: Run all tests to verify synchronization**
  - Command: `npm --prefix portfolio test`

---

### Task 4: Verification, Previews & Polish

**Files:**
- Create preview render of the updated card back (both SVG and Canvas 2D).
- Save preview images to artifact directory for user review.

- [x] **Step 1: Generate high-resolution render of the updated card back**
  - Compare visually against design requirements.
- [x] **Step 2: Run production build**
  - Command: `npm --prefix portfolio run build`
- [x] **Step 3: Mark plan completed and present for final review**

---

### Task 5: Iteration 2 - Black-on-Black Obsidian Engraving & Smooth Inward Radial Fade

**User Feedback Alignment:**
1. Remove bright circle under the card logo (`gold-crest-glow` disk).
2. Fade pattern inwards using a smooth continuous radial fade instead of a hard circular crop.
3. Use dark colors in the pattern (Option A: deep obsidian debossed charcoal `#040407` with subtle shadow) instead of white, giving a tactile, mysterious etched finish.

**Files:**
- Modify: `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`
- Modify: `portfolio/src/engines/card/three/CardTextureGenerator.ts`
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`

- [x] **Step 1 (RED): Update test assertions in `CardTextureGenerator.test.ts`**
  - Assert SVG does NOT contain the bright circular glow disk `<circle ... fill="url(#gold-crest-glow)"`.
  - Assert SVG contains the dark etched gradient/colors (`#020204` / `#050508`).
  - Run tests to confirm RED failure.
- [x] **Step 2 (GREEN): Update `CardTextureGenerator.ts`**
  - Remove bright glow circles under the crest in both `generateGoldenCardBackSvg` and `drawGoldenCardBackContent`.
  - Update `pattern-radial-fade-grad` with continuous, wide radial falloff (no steep cutoff).
  - Update pattern fill from bright gold/white to dark obsidian charcoal `#030305` / `#06060a` with deboss depth.
- [x] **Step 3 (GREEN): Synchronize `CardSummonEngine.ts` DOM card back**
  - Match the dark etched pattern and smooth inward radial mask.
- [x] **Step 4: Verify test suite and build**
  - `npm test`: all 26 suites pass (336/336 tests).
  - `npm run build`: production build passes.
- [x] **Step 5: Generate updated preview render and present to user**
