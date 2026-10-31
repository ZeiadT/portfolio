# Luxury Golden Engraved Profile Card Redesign Spec

- **Date**: 2026-10-31
- **Status**: Approved by User
- **Topic**: Profile Card Luxury Golden Engraving, Cat Logo Crest, 20% Zoom Out & Blur-Fade Dismissal UX

---

## 1. Context & Motivation
Following the graceful animation refactoring, the user requested an aesthetic and layout refinement to elevate the card pop-up into a minimalist, opulent, fine-art digital collectible:
- Eliminate visual clutter and excessive multi-color accents (cyan, green, blue pills) in favor of cohesive **warm golden engraving on deep matte obsidian cardstock**.
- Embed the personal vector cat mask logo (`assets/logo.svg`) directly into the central crest of the golden guilloche card back.
- Enforce the optical alignment rule $\text{radius}_{\text{inner}} = \text{radius}_{\text{outer}} - \text{padding}$ across all nested card frames.
- Provide a taller portrait window with fine-art **grayscale luminance desaturation**.
- Enlarge the candidate name and RARE EDITION badge typography.
- Update skills to: **1. Hard worker (★★★)**, **2. Passionate designer (★★)**, **3. Perfection seeker (★)** with static golden engraved stars.
- Zoom out the 3D card by 20% by repositioning the camera to $Z = 10.0$.
- Remove orbital particles to focus entirely on the physical slab.
- Replace bottom action buttons with an elegant blur-fade text prompt: `"Click anywhere to close"`.

---

## 2. Requirements & Visual Design

### 2.1 Color Palette
- **Cardstock Core**: `#08080c` to `#0d0d12` (dark obsidian with subtle radial vignette).
- **Engraved Metallic Inks**: `#ffd700`, `#e5b85c`, `#d4af37`, `#c59b27`, `#fcd34d` (metallic champagne and warm gold foil gradients).
- **Eliminated**: All saturated external colors (cyan, green, blue tags).

### 2.2 Card Back with Vector Cat Mask Crest
- `CardTextureGenerator.generateGoldenCardBackSvg`:
  - Retains concentric guilloche geometry, 4-corner filigrees, and celestial halo rings.
  - Replaces generic Ace diamond with the vector cat mask path from `assets/logo.svg`:
    - Clean path: `M 74 104.38 L 461.36 369 ... Z`
    - Scaled and centered at $(525, 735)$ with width $\approx 220\text{px}$.
    - Gilded with metallic gold gradient (`url(#gold-foil-grad)`) and fine amber stroke.

### 2.3 Front Face Layout & Concentric Radii Math
- Strict optical radius formula: $\text{radius}_{\text{inner}} = \text{radius}_{\text{outer}} - \text{padding}$.
  - Outer card slab cap: $R = 48\text{px}$.
  - Inset border frame ($p = 24\text{px}$): $R_{\text{frame}} = 48 - 24 = 24\text{px}$.
  - Portrait container ($p = 8\text{px}$ inner inset): $R_{\text{portrait}} = 24 - 8 = 16\text{px}$.
- **Taller Grayscale Portrait**:
  - Expanded height: $Y = 160 \to 680$ ($520\text{px}$ tall).
  - High-contrast grayscale conversion: converts pixel colors to luminance $L = 0.299R + 0.587G + 0.114B$ with warm-toned vignette.
- **Enlarged Typography**:
  - Candidate Name: $44\text{px}$ bold in crisp gold/white foil.
  - Rare Edition Badge: $180 \times 44\text{px}$ with gilded border and warm gold typography.
- **Skills & Static Stars**:
  1. Hard worker $\to$ ★★★ (3 golden stars)
  2. Passionate designer $\to$ ★★ (2 golden stars)
  3. Perfection seeker $\to$ ★ (1 golden star)
- **Monochrome Golden Stat Tickers**:
  - PERF, ARCH, CODE score counters and progress bars rendered strictly in warm gold foil (`#ffd700` and `rgba(255, 215, 0, 0.2)` tracks).

---

## 3. Engine Orchestration & Dismissal UX

### 3.1 Camera 20% Zoom Out
- In `ThreeCardModel.ts`:
  - `camera.position.set(0, 0, 10.0);` (scaled from $Z=8$ to $Z=10.0$ for exact 20% zoom out).

### 3.2 Orbital Particles Removal
- Strip out `initCelestialParticleField()`, `particleGroup`, and `particleData` from `ThreeCardModel.ts`.

### 3.3 Blur-Fade Dismissal Prompt
- In `CardSummonEngine.ts`:
  - Remove `data-summon-controls` button bar.
  - Add `data-summon-dismiss-hint` pill centered at bottom: `"Click anywhere to close"`.
  - Entrance: starts at `opacity: 0, filter: blur(10px)`. At completion of Phase 4 ($t = 2.05\text{s}$), blur-fades in over $800\text{ms}$ with `power2.out` to `opacity: 1, filter: blur(0px)`.
  - Dismissal: Clicking anywhere on backdrop, stage, or card triggers `close()`.

---

## 4. Verification & Testing Strategy
- Update unit tests in:
  - `CardTextureGenerator.test.ts` (cat logo crest, grayscale conversion, concentric radii, 3/2/1 stars, monochrome gold stats).
  - `ThreeCardModel.test.ts` (camera $Z=10.0$, particle removal, lifecycle).
  - `CardSummonEngine.test.ts` (dismiss hint element, blur-fade entrance, click-anywhere dismissal).
- Verify full test suite passes with `npm --prefix portfolio test`.
- Verify production build succeeds with `npm --prefix portfolio run build`.
