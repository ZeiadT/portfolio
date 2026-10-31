# Star Crest Card Back & Branding Update Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Completed**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), HTML5 Canvas 2D, SVG, Vanilla TypeScript, Vitest
- **Branch**: `main`

---

## 1. Goal & Requirements Alignment

User feedback:
> 1- remove the 4 stars on the corners of the card front side.
> 2- remove bg of the provided image, draw it in svg
> 3- use result svg as the center design of the card back side 
> 4- @[d:\tmp\Personal\CV\Current\Portfolio\assets\logo.svg] use this logo as website icon
> 5- change website name to Zeiad Mohammed.

### Requirement Breakdown & Technical Execution

#### 1. Remove 4 Stars/Crosshairs from Front Card Face Corners
- **Locations**:
  - `CardTextureGenerator.ts` (`drawFrontCardContent`): Canvas `fillText('+', ...)` calls at coordinates $(48, 48)$, $(1002, 48)$, $(48, 1422)$, and $(1002, 1422)$.
  - `EditorialCardFaceRenderer.ts` (HTML card face): Four corner `<span ...>+</span>` elements inside `[data-summon-face-frame]`.
- **Action**: Completely purge the 4 corner crosshairs from both canvas texture and HTML DOM renderers.

#### 2. Vectorize Uploaded Image to Background-Free SVG
- **Source**: `assets/card logo.jpg` (uploaded star emblem with dynamic center swirl).
- **Extraction**: Extract sub-pixel precision vector contours, optimize with RDP polygon approximation ($IoU = 0.9781$), shift center to $(300, 300)$ in a $600 \times 600$ viewBox.
- **Artifacts**:
  - `assets/card-crest.svg`
  - `portfolio/public/card-crest.svg`
  - Export `CardTextureGenerator.STAR_CREST_PATH`.

#### 3. Integrate Result SVG into Card Back Center Design
- **Locations**:
  - `CardTextureGenerator.generateGoldenCardBackSvg`: `<g data-summon-card-crest="true">` with `transform="translate(525, 735) scale(0.48) translate(-300, -300)"`.
  - `CardTextureGenerator.drawGoldenCardBackContent`: 2D canvas context Path2D fill with gold foil gradient and `#ffd700` stroke.
  - `CardSummonEngine.ts`: DOM card back `<g data-summon-card-crest>` path with `transform="scale(0.16) translate(-300, -300)"`.

#### 4. Set Website Favicon to `assets/logo.svg`
- Update `portfolio/index.html` favicon tag from `/vite.svg` to `/logo.svg`.
- Verify `portfolio/public/logo.svg` matches `assets/logo.svg`.

#### 5. Change Website Title to "Zeiad Mohammed"
- In `portfolio/index.html`: `<title>Zeiad Mohammed</title>`.

---

## 2. Test-Driven Development (TDD) Plan

### 2.1 RED Phase
1. In `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`:
   - Assert `CardTextureGenerator.STAR_CREST_PATH` is defined.
   - Update SVG back crest test to assert `STAR_CREST_PATH` is contained in `data-summon-card-crest`.
   - Assert `drawFrontCardContent` does NOT render any `'+'` text.
2. In `portfolio/src/engines/card/renderers/__tests__/EditorialCardFaceRenderer.test.ts`:
   - Assert `[data-summon-face-frame]` contains no `+` spans.
3. Run tests to confirm RED failures.
4. Commit RED test specifications.

### 2.2 GREEN Phase
1. Update `CardTextureGenerator.ts`:
   - Define `STAR_CREST_PATH`.
   - Update `generateGoldenCardBackSvg` and `drawGoldenCardBackContent` to use `STAR_CREST_PATH`.
   - Remove corner `+` crosshairs from `drawFrontCardContent`.
2. Update `EditorialCardFaceRenderer.ts`:
   - Remove corner `+` spans from `[data-summon-face-frame]`.
3. Update `CardSummonEngine.ts`:
   - Update DOM card back crest path to `STAR_CREST_PATH`.
4. Update `portfolio/index.html`:
   - Favicon: `/logo.svg`.
   - Title: `Zeiad Mohammed`.
5. Run tests to confirm GREEN passes.

### 2.3 Verification Phase
- Run all 26 test suites: `npm --prefix portfolio test`.
- Run production build: `npm --prefix portfolio run build`.
- Update plan to Completed, commit and push to GitHub `origin main`.

---

## 3. Implementation Checklist

- [x] 1. Write failing tests in `CardTextureGenerator.test.ts` and `EditorialCardFaceRenderer.test.ts` (RED phase).
- [x] 2. Run tests to confirm failure.
- [x] 3. Commit test specifications (`8119dba`).
- [x] 4. Update `CardTextureGenerator.ts`, `EditorialCardFaceRenderer.ts`, and `CardSummonEngine.ts`.
- [x] 5. Update `portfolio/index.html` favicon and title.
- [x] 6. Copy `assets/card-crest.svg` to `portfolio/public/card-crest.svg`.
- [x] 7. Run full test suite and production build.
- [x] 8. Mark plan Completed, commit and push to GitHub.
