# Card Inner Border Radius & Reveal Sheen Offset Refinement Implementation Plan

- **Status**: Ready for Implementation
- **Created**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), WebGL GLSL Shaders, Vanilla TypeScript, GSAP 3, Vitest
- **Branch**: `feat/card-shine-effect`

---

## 1. Feature Overview & Requirements Alignment

User feedback:
> 1- the card inner border radius = outer radius - padding between them
> 2- the sheer glow on the reveal effect is shown on the bottom left corner of the card before the animation starts, change its offset to be hidden on the bottom left corner

### Requirement 1: Optical Concentric Border Radius
Enforce strict concentric optical corner math across all inner card borders and nested frames:
$$R_{\text{inner}} = \max(0, R_{\text{outer}} - \text{padding})$$
- On the golden card back (1050x1470, $R_{\text{outer}} = 48$):
  - Primary outer gold frame ($x=24, y=24, w=1002, h=1422$, $\text{padding} = 24$):
    $R_{\text{inner}} = 48 - 24 = 24$ (aligns with front card frame).
  - Secondary inner filigree frame ($x=36, y=36, w=978, h=1398$, $\text{padding} = 36$):
    $R_{\text{inner}} = 48 - 36 = 12$.
  - Update both SVG generator (`generateGoldenCardBackSvg`) and canvas rasterizer (`drawGoldenCardBackContent`).
- On DOM card back in `CardSummonEngine.ts` ($R_{\text{outer}} = 24$):
  - Inset frame 1 at $x=12, y=12$ ($\text{padding} = 12$): $R_{\text{inner}} = 24 - 12 = 12$ (`rx="12"`).
  - Inset frame 2 at $x=18, y=18$ ($\text{padding} = 18$): $R_{\text{inner}} = 24 - 18 = 6$ (`rx="6"`).
- In card face renderers (`MythicCardFaceRenderer.ts`):
  - Inset frame 1 at $x=6, y=6$ ($\text{padding} = 6$): $R_{\text{inner}} = 24 - 6 = 18$ (`rx="18"`).
  - Inset frame 2 at $x=9, y=9$ ($\text{padding} = 9$): $R_{\text{inner}} = 24 - 9 = 15$ (`rx="15"`).

### Requirement 2: Reveal Sheen Offset Beyond Bottom-Left Corner
- The diagonal reveal wipe is oriented at $-35^\circ$ ($(\cos(-35^\circ), \sin(-35^\circ)) = (0.819, -0.574)$).
- Projected coordinate $p = \vec{\text{uv}} \cdot \vec{\text{dir}}$ achieves its minimum value `minP` at the bottom-left corner of the card ($u = 0, v = 0 \implies y = 1.4$).
- When `uFoilWipeProgress == 0.0`, `currentP` was set to `minP`, causing the center of the gleam band (`band = 0.12`) to lie directly on the bottom-left corner, illuminating a specular glow before the reveal animation begins.
- Solution:
  1. Add an offset margin `bandOffset = band * 1.5` so the wipe sweep starts at `startP = minP - bandOffset` and concludes at `endP = maxP + bandOffset`.
  2. At `progress = 0`, the gleam band is positioned completely outside the card geometry (`currentP < minP - band`), with zero pixels intersecting the card.
  3. Condition gleam rendering on `uFoilWipeProgress > 0.001 && uFoilWipeProgress < 0.999`. At progress 0, the entire card is cleanly and evenly concealed under the obsidian veil without any premature gleam hotspots.
  4. Apply matching offset math to `CardTextureGenerator.ts` canvas fallback.

---

## 2. Implementation Tasks (Strict TDD)

### Task 1: Author Strict TDD Unit Tests for Concentric Radius & Sheen Offset
- **Files:**
  - `portfolio/src/engines/card/three/__tests__/ThreeCardModel.test.ts`
  - `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`
- **Test Specifications:**
  1. Golden card back SVG and canvas use $R_{\text{inner}} = R_{\text{outer}} - \text{padding}$ for all frames ($48 - 24 = 24$, $48 - 36 = 12$).
  2. In `frontMaterial.onBeforeCompile`, shader wipe range extends beyond `minP` by at least `band * 1.5`, ensuring zero gleam on the card at `uFoilWipeProgress == 0.0`.
  3. Shader code contains guard ensuring gleam is inactive at progress 0.
- [ ] Step 1: Write unit tests in `ThreeCardModel.test.ts` and `CardTextureGenerator.test.ts`.
- [ ] Step 2: Run tests to verify failures (RED phase).
- [ ] Step 3: Git commit test specifications.

### Task 2: Implement Reveal Sheen Offset in `ThreeCardModel.ts` & `CardTextureGenerator.ts`
- **Files:**
  - `portfolio/src/engines/card/three/ThreeCardModel.ts`
  - `portfolio/src/engines/card/three/CardTextureGenerator.ts`
- **Changes:**
  1. In `ThreeCardModel.ts` shader injection:
     - Set `float bandOffset = band * 1.5;`
     - Set `float startP = minP - bandOffset; float endP = maxP + bandOffset;`
     - Interpolate `float currentP = mix(startP, endP, uFoilWipeProgress);`
     - Guard gleam with `uFoilWipeProgress > 0.001 && uFoilWipeProgress < 0.999`.
  2. In `CardTextureGenerator.ts` canvas fallback:
     - Apply matching `offset = foilBandWidth * 1.5` offset to `currentP`.
- [ ] Step 1: Implement sheen offset adjustments.
- [ ] Step 2: Run tests to verify (GREEN phase).
- [ ] Step 3: Git commit sheen offset fix.

### Task 3: Enforce Concentric Border Radius Across All Card Renders
- **Files:**
  - `portfolio/src/engines/card/three/CardTextureGenerator.ts`
  - `portfolio/src/engines/card/CardSummonEngine.ts`
  - `portfolio/src/engines/card/renderers/MythicCardFaceRenderer.ts`
- **Changes:**
  1. In `CardTextureGenerator.ts`:
     - Primary outer back frame at $p=24$ with $R=24$ ($48-24=24$).
     - Secondary filigree frame at $p=36$ with $R=12$ ($48-36=12$).
     - SVG `<rect>` attributes updated to `rx="24"` and `rx="12"`.
  2. In `CardSummonEngine.ts`:
     - Update SVG card back frame rects to `rx="12"` and `rx="6"`.
  3. In `MythicCardFaceRenderer.ts`:
     - Update SVG frame rects to `rx="18"` and `rx="15"`.
- [ ] Step 1: Implement concentric border radii across all layers.
- [ ] Step 2: Run all test suites and verify all pass.
- [ ] Step 3: Git commit concentric border updates.

### Task 4: Full Verification Across All Suites & Production Build
- **Files:** Full test suite, Vite build.
- [ ] Step 1: Run `npm --prefix portfolio test`.
- [ ] Step 2: Run `npm --prefix portfolio run build`.
- [ ] Step 3: Verify visual perfection at `http://localhost:3000/`.
