# Luxury Golden Engraved Profile Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the 3D profile card pop-up into an opulent, minimalist, dark & gold engraved digital collectible featuring the personal vector cat mask logo crest, 20% camera zoom out, taller grayscale portrait, enlarged typography, static 3/2/1 star skills, and a blur-fade "Click anywhere to close" dismissal hint.

**Architecture:** Render the vector cat mask logo directly into the high-resolution golden guilloche canvas and SVG back textures with metallic gold foil gradients. Enforce strict concentric optical corner math ($R_{\text{inner}} = R_{\text{outer}} - \text{padding}$) across all front card frames, desaturate portrait pixels in-canvas to fine-art grayscale, scale camera distance to $Z = 10.0$, remove particle clutter, and replace DOM button bars with a serene blur-fade dismissal prompt.

**Tech Stack:** Three.js (^0.160.0), Vanilla TypeScript, HTML5 Canvas 2D, GSAP 3, Tailwind CSS v4, Inline Vector SVGs, Vitest.

---

## Global Constraints
- Strictly follow `docs/rules.md` and `AGENTS.md` (Clean Architecture, zero direct file copying, full lifecycle disposal, strict TDD).
- Enforce concentric corner radius formula: $R_{\text{inner}} = R_{\text{outer}} - \text{padding}$ for all nested rounded rectangles.
- Card color palette is strictly deep matte obsidian cardstock (`#08080c` to `#0d0d12`) with pure metallic champagne and warm gold inks (`#ffd700`, `#e5b85c`, `#d4af37`, `#c59b27`, `#fcd34d`). No external cyan/blue/green colors.
- Maintain 100% green test suite on `npm --prefix portfolio test` and clean production build on `npm --prefix portfolio run build`.

---

## Tasks

### Task 1: Vector Cat Mask Logo Integration in Golden Card Back
**Files:**
- Modify: `portfolio/src/engines/card/three/CardTextureGenerator.ts`
- Test: `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`

**Interfaces:**
- Consumes: Vector path from `assets/logo.svg` (`M 74.00 104.38 L 461.36 369.00 ... Z`).
- Produces: `CardTextureGenerator.generateGoldenCardBackSvg` and `drawGoldenCardBackContent` rendering the cat mask path in the central crest.

- [ ] **Step 1: Write failing test in `CardTextureGenerator.test.ts`**
  Add unit test verifying `generateGoldenCardBackSvg` contains the cat mask vector path and does not render the old Ace diamond shape.
- [ ] **Step 2: Run test to verify it fails**
  `npm --prefix portfolio test -- src/engines/card/three/__tests__/CardTextureGenerator.test.ts`
- [ ] **Step 3: Implement cat mask logo crest in `CardTextureGenerator.ts`**
  Incorporate the clean path `M 74.00 104.38 ...` into `generateGoldenCardBackSvg` and `drawGoldenCardBackContent`, scaled and centered with `url(#gold-foil-grad)` fill.
- [ ] **Step 4: Run test to verify it passes**
  `npm --prefix portfolio test -- src/engines/card/three/__tests__/CardTextureGenerator.test.ts`
- [ ] **Step 5: Commit**
  `git commit -m "feat(card): integrate vector cat mask crest in golden card back"`

---

### Task 2: Front Face Layout Redesign (Concentric Radii, Grayscale Portrait, Enlarged Typography, Skills with 3/2/1 Stars, Monochrome Gold Stats)
**Files:**
- Modify: `portfolio/src/engines/card/three/CardTextureGenerator.ts`
- Test: `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`

**Interfaces:**
- Consumes: `FrontCardTextureOptions` (`imageElement`, `starsProgress`, `barsProgress`, `veilOpacity`, `foilWipeProgress`).
- Produces: `CardTextureGenerator.drawFrontCardContent` rendering:
  - Concentric radii ($R_{\text{inner}} = R_{\text{outer}} - \text{padding}$).
  - Taller portrait ($520\text{px}$) with grayscale desaturated photo rendering.
  - Enlarged candidate name ($44\text{px}$) and RARE EDITION badge ($180 \times 44\text{px}$).
  - Skills: "Hard worker" (★★★), "Passionate designer" (★★), "Perfection seeker" (★).
  - Monochrome gold engraved stat counters and progress bars.

- [x] **Step 1: Write failing tests in `CardTextureGenerator.test.ts`**
  Add unit tests for concentric corner radius calculation, grayscale conversion, updated skills text, static stars (3, 2, 1), and monochrome gold palette.
- [x] **Step 2: Run tests to verify failure**
  `npm --prefix portfolio test -- src/engines/card/three/__tests__/CardTextureGenerator.test.ts`
- [x] **Step 3: Implement front face redesign in `CardTextureGenerator.ts`**
  Update `drawFrontCardContent`:
  - Calculate `innerRadius = Math.max(0, outerRadius - padding)`.
  - Draw grayscale portrait via pixel luminance or canvas filter `grayscale(100%)`.
  - Scale up name font to `bold 44px sans-serif`.
  - Render static golden 5-point stars (★★★, ★★, ★) for the 3 skills.
  - Render stat progress bars in warm gold (`#ffd700` and `#ffd70033`).
- [x] **Step 4: Run tests to verify pass**
  `npm --prefix portfolio test -- src/engines/card/three/__tests__/CardTextureGenerator.test.ts`
- [x] **Step 5: Commit**
  `git commit -m "feat(card): front face luxury golden engraving, taller grayscale portrait, and 3/2/1 star skills"`

---

### Task 3: ThreeCardModel 20% Zoom Out & Particle System Removal
**Files:**
- Modify: `portfolio/src/engines/card/three/ThreeCardModel.ts`
- Test: `portfolio/src/engines/card/three/__tests__/ThreeCardModel.test.ts`

**Interfaces:**
- Consumes: `ThreeCardModelOptions`.
- Produces: `ThreeCardModel` with camera positioned at $Z = 10.0$ and clean removal of orbital particle group.

- [ ] **Step 1: Write failing tests in `ThreeCardModel.test.ts`**
  Verify camera is mounted at $Z = 10.0$ and `celestial-particles` group is not created in the scene.
- [ ] **Step 2: Run tests to verify failure**
  `npm --prefix portfolio test -- src/engines/card/three/__tests__/ThreeCardModel.test.ts`
- [ ] **Step 3: Update `ThreeCardModel.ts`**
  - Set `camera.position.set(0, 0, 10.0);` in `mount()`.
  - Remove `initCelestialParticleField()`, `particleGroup`, and `particleData`.
- [ ] **Step 4: Run tests to verify pass**
  `npm --prefix portfolio test -- src/engines/card/three/__tests__/ThreeCardModel.test.ts`
- [ ] **Step 5: Commit**
  `git commit -m "feat(card): zoom out card by 20% and remove orbital particle system"`

---

### Task 4: Blur-Fade Dismissal Prompt & Click-Anywhere-To-Close
**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`
- Test: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: Modal DOM elements and GSAP timeline.
- Produces: `data-summon-dismiss-hint` element that blur-fades in after Phase 4, with click-anywhere dismissal.

- [x] **Step 1: Write failing tests in `CardSummonEngine.test.ts`**
  Verify `data-summon-controls` is removed, `data-summon-dismiss-hint` is created with text `"Click anywhere to close"`, blur-fades in after reveal, and clicking on modal or card closes the dialog.
- [x] **Step 2: Run tests to verify failure**
  `npm --prefix portfolio test -- src/engines/card/__tests__/CardSummonEngine.test.ts`
- [x] **Step 3: Implement dismissal prompt & click-anywhere in `CardSummonEngine.ts`**
  - Remove `controlsEl` button bar.
  - Create `dismissHintEl` with classes `text-xs font-mono tracking-widest uppercase text-amber-200/60 backdrop-blur-md px-4 py-2 rounded-full`.
  - Add GSAP tween to `openTimeline` at $t = 2.05\text{s}$: `fromTo(dismissHintEl, { opacity: 0, filter: 'blur(10px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' })`.
  - Wire click on modal container and card directly to `this.close()`.
  - Clean up `dismissHintEl` on `destroy()` and `close()`.
- [x] **Step 4: Run tests to verify pass**
  `npm --prefix portfolio test -- src/engines/card/__tests__/CardSummonEngine.test.ts`
- [x] **Step 5: Commit**
  `git commit -m "feat(card): blur-fade dismissal hint and click-anywhere-to-close UX"`

---

### Task 5: End-to-End Test Suite, Production Build & Visual Verification
**Files:**
- All modified files

- [ ] **Step 1: Run full Vitest test suite**
  `npm --prefix portfolio test` (verify all tests pass with 0 failures).
- [ ] **Step 2: Run production build**
  `npm --prefix portfolio run build` (verify clean build in under 3s with 0 type errors).
- [ ] **Step 3: Visual inspection**
  Inspect `http://localhost:3000/` to verify the card appearance, cat logo crest, grayscale portrait, 20% zoom out, and blur-fade prompt.
- [ ] **Step 4: Final commit**
  `git commit -m "chore(card): verify full test suite and clean production build"`

