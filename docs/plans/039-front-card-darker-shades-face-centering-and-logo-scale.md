# Front Card Darker Shades, Face Centering & Back Logo Scale Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), HTML5 Canvas 2D, SVG, Vanilla TypeScript, Vitest
- **Branch**: `main`

---

## 1. Goal Description

Address user feedback across three specific visual presentation aspects of the 3D card experience:
1. **Darker Front Colors**: Eliminate the dull/milky appearance on the front face by deepening the canvas obsidian gradient to rich pitch-black velvet (`#08080b` $\to$ `#040406` $\to$ `#010102`), recessing internal surface containers into dark obsidian glass (`rgba(2, 2, 4, 0.88)`), and tuning Three.js material roughness (`0.88` $\to$ `0.35`) and ambient lighting (`1.4` $\to$ `0.85`) to preserve deep, contrast-rich blacks under WebGL studio lighting.
2. **Face-Centered Portrait Cropping**: Prevent top and bottom face chopping by replacing generic 50% canvas center cropping with face-aware top-third anchoring ($f_y = 0.20$), placing the user's face and eyes directly at the vertical center of the landscape portrait frame and preserving the head and hair.
3. **10% Larger Back Logo with Unaltered Thickness**: Increase the central star crest emblem on the card back by 10% (scale $0.48 \to 0.528$ in texture space; $0.16 \to 0.176$ in DOM space) while calibrating stroke width ($1.5 \to 1.364\text{ px}$) so its physical rendered line thickness remains strictly unchanged.

---

## 2. Requirements & Constraints

- Strictly follow TDD: RED tests first, verify failure, GREEN implementation, verify pass.
- Zero residual memory leaks and zero async image decoding dependencies on texture generation.
- Full parity between Canvas 2D and SVG renderers ($1050 \times 1470$).
- All 26 test suites and 339+ tests must pass with zero regressions.

---

## 3. Proposed Changes

### Component 1: 3D Texture & Card Face Generator
Layer: `portfolio/src/engines/card/three/CardTextureGenerator.ts`

- **Deep Pitch-Obsidian Background**:
  - Replace radial gradient stops in `drawFrontCardContent`:
    - $0\%$: `#08080b`
    - $50\%$: `#040406`
    - $100\%$: `#010102`
- **Recessed Dark Surface Containers**:
  - Boxed identity & skills container fill: `rgba(2, 2, 4, 0.88)` with hairline rim `rgba(255, 215, 0, 0.20)`.
  - Attribute stat ticker columns fill: `rgba(2, 2, 4, 0.88)`.
  - Portrait window duotone base: `#040406` $\to$ `#010102`.
  - Portrait photo vignette: Deepen to `rgba(1, 1, 2, 0.85)` at bottom.
- **Face-Centered Portrait Cropping**:
  - Update `dy` calculation in `drawFrontCardContent`:
    ```ts
    const faceOffsetY = (portraitH - dh) * 0.20;
    dy = portraitY + faceOffsetY;
    ```
- **10% Larger Back Logo with Unaltered Thickness**:
  - In `generateGoldenCardBackSvg`:
    - Scale: `scale(0.528)` (was `0.48`).
    - Calibrated stroke-width: `stroke-width="1.3636"`.
  - In `drawGoldenCardBackContent`:
    - `ctx.scale(0.528, 0.528)`.
    - `ctx.lineWidth = 1.3636`.

### Component 2: 3D Model Lighting & Material Calibration
Layer: `portfolio/src/engines/card/three/ThreeCardModel.ts`

- In `ThreeCardModel.ts`:
  - `frontMaterial`: `roughness: 0.35`, `metalness: 0.15`.
  - `AmbientLight`: `0.85` (was `1.4`).
  - `keyLight`: `0.80` (was `0.9`).
  - `bounceLight`: `0.40` (was `0.5`).

### Component 3: DOM Fallback Renderers
Layer: `portfolio/src/engines/card/renderers/EditorialCardFaceRenderer.ts` & `portfolio/src/engines/card/CardSummonEngine.ts`

- `EditorialCardFaceRenderer.ts`: `<img>` with `object-[center_20%]`.
- `CardSummonEngine.ts`: DOM star crest `scale(0.176)` and `stroke-width="0.91"`.

---

## 4. Verification Plan

### Automated Tests
1. RED phase:
   - `CardTextureGenerator.test.ts`
   - `CardSummonEngine.test.ts`
2. GREEN phase:
   - Run tests and confirm passes.
3. Full verification:
   - `npm --prefix portfolio test`
   - `npm --prefix portfolio run build`
