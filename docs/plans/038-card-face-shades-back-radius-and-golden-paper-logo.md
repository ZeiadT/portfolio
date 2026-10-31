# Card Face Darker Shades, Back Concentric Border Radius & Reflective Golden Paper Logo

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), HTML5 Canvas 2D, SVG, Vanilla TypeScript, Vitest
- **Branch**: `main`

---

## 1. Goal & Context

Refine the 3D summon card presentation according to the user's latest aesthetic and geometric directives:
1. **Front Card Face Darker Shades**: Match the background color and surface containers of the front card face to the deep obsidian darker shades of the back side (`#141419` -> `#0a0a0d` -> `#050507`), replacing the linear gradient and faint gold tint with recessed dark obsidian surfaces.
2. **Back Side Concentric Border Radius**: Synchronize the back side's outer clip and inner border frame radii using the exact optical concentricity formula established on the front face:
   $$\text{inner radius} = \max(0, \text{outer radius} - \text{gap})$$
   where $\text{outer radius} = \text{CardTextureGenerator.CARD\_CORNER\_RADIUS} = 72\text{ px}$.
3. **Center Crest Reflective Golden Paper**: Replace the neon blooming aura (`filter="url(#golden-glow)"`, `feGaussianBlur`, and `shadowBlur: 16`) with a physical, reflective golden foil/paper feel:
   - Crisp directional paper deboss/emboss shadow underneath
   - Multi-stop metallic gold foil gradient with high-specular reflective sheen
   - Razor-sharp metallic rim stroke with zero fuzzy neon blur

---

## 2. Requirements & Mathematical Specifications

### 2.1 Front Card Face Color & Surface Refinement
- **Background Gradient**:
  - In `CardTextureGenerator.drawFrontCardContent`:
    - Replace the linear vertical gradient (`#0d0d12` -> `#09090d` -> `#050508`) with a radial obsidian gradient centered at $(525, 735)$ with radius $800\text{ px}$ identical to the back side:
      - $0\%$: `#141419`
      - $65\%$: `#0a0a0d`
      - $100\%$: `#050507`
- **Internal Surfaces**:
  - **Portrait Window Duotone**: Darkened gradient from `#0b0b0f` down to `#040406`.
  - **Boxed Identity & Skills Container**: Change fill from `rgba(255, 215, 0, 0.02)` to recessed dark obsidian `rgba(7, 7, 10, 0.72)` with hairline border `rgba(255, 215, 0, 0.15)`.
  - **Attribute Stats Columns**: Change fill from `rgba(255, 215, 0, 0.02)` to matching recessed dark obsidian `rgba(7, 7, 10, 0.72)`.
  - **Rare Edition Badge**: Recessed dark obsidian fill `rgba(12, 12, 16, 0.85)` with stroke `rgba(255, 215, 0, 0.35)`.
  - **Editorial DOM Face Fallback (`EditorialCardFaceRenderer.ts`)**: Ensure deep obsidian surface styling (`bg-[#07070a]/95`).

### 2.2 Back Side Concentric Border Radius
- In `CardTextureGenerator.ts`:
  - $\text{outer radius} = \text{CardTextureGenerator.CARD\_CORNER\_RADIUS} = 72\text{ px}$ (matching $0.24 \times 300$).
  - **SVG Generator (`generateGoldenCardBackSvg`)**:
    - Base obsidian surface rect: `rx="72"`.
    - Border 1 ($x=24, y=24, w=1002, h=1422$, $\text{gap}=24$):
      $$\text{rx} = 72 - 24 = 48$$
    - Border 2 ($x=36, y=36, w=978, h=1398$, $\text{gap}=36$):
      $$\text{rx} = 72 - 36 = 36$$
    - Border 3 ($x=42, y=42, w=966, h=1386$, $\text{gap}=42$):
      $$\text{rx} = 72 - 42 = 30$$
  - **Canvas 2D Renderer (`drawGoldenCardBackContent`)**:
    - Outer clip: `drawRoundedRect(ctx, 0, 0, 1050, 1470, 72)`.
    - Border 1: `drawRoundedRect(ctx, 24, 24, 1002, 1422, 48)`.
    - Border 2: `drawRoundedRect(ctx, 36, 36, 978, 1398, 36)`.
    - Border 3: `drawRoundedRect(ctx, 42, 42, 966, 1386, 30)`.
  - **DOM Card Back (`CardSummonEngine.ts`)**:
    - Base rect in $350 \times 490$ space: `rx="24"` ($72 / 3$).
    - Border 1 at $\text{gap}=8$ ($24/3$): `rx="16"` ($24 - 8 = 16$).
    - Border 2 at $\text{gap}=12$ ($36/3$): `rx="12"` ($24 - 12 = 12$).

### 2.3 Reflective Golden Paper Crest Logo
- **No Neon Bloom**:
  - Remove `<filter id="golden-glow">` with `feGaussianBlur` from `generateGoldenCardBackSvg`.
  - Remove `shadowBlur = 16` and `shadowColor = 'rgba(255, 215, 0, 0.65)'` from `drawGoldenCardBackContent`.
- **Reflective Golden Paper Foil**:
  - High-specular reflective gold gradient:
    - Stops: `#735518` (deep antique gold) -> `#b88d2c` -> `#fdf0a6` -> `#ffffff` (specular paper sheen peak) -> `#fff4b8` -> `#cda036` -> `#8f6b1e` -> `#5a4110`.
  - Directional Emboss / Drop Shadow:
    - SVG: `<filter id="gold-paper-emboss">` with `<feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.85" />`.
    - Canvas 2D: Crisp shadow pass with `shadowColor = 'rgba(0, 0, 0, 0.85)'`, `shadowOffsetY = 3.5`, `shadowBlur = 4`.
  - Razor-sharp metallic rim stroke:
    - Width: $1.5\text{ px}$.
    - Stroke gradient with specular rim `#fff6c7` at top and `#7a5814` at bottom.
  - DOM Card Back:
    - Update `[data-summon-card-crest]` in `CardSummonEngine.ts` to use reflective gold paper gradient and drop shadow, removing `${sigilId}-energy` vermilion fill.

---

## 3. Architecture & Isolation Design

- **Domain Layer (`portfolio/src/domain/types.ts`)**: No changes required.
- **Engines Layer (`portfolio/src/engines/card/`)**:
  - `three/CardTextureGenerator.ts`: Master texture and SVG generator updated for front surface darker tones, back concentric border radii, and reflective gold paper crest.
  - `CardSummonEngine.ts`: DOM card back markup updated for concentric radii and reflective gold crest.
- **Component Lifecycle & Isolation**:
  - All changes remain 100% synchronous, with zero asynchronous network/image dependencies.
  - Clean lifecycle, zero DOM leaks, zero WebGL resource leaks.

---

## 4. Test-Driven Development (TDD) Plan

### 4.1 RED Phase: Test Specifications (Failing Tests First)
1. **In `CardTextureGenerator.test.ts`**:
   - **Back Concentric Border Radii**:
     - Assert `generateGoldenCardBackSvg` has base rect `rx="72"` (matching `CARD_CORNER_RADIUS`).
     - Assert inner frames at gaps 24, 36, and 42 have `rx="48"`, `rx="36"`, and `rx="30"`.
     - Update old assertions that checked for legacy `rx="48"` outer and `rx="24"` inner.
     - Spy on `drawGoldenCardBackContent` and assert `drawRoundedRect` called with $72$, $48$, $36$, and $30$.
   - **Reflective Golden Paper Logo**:
     - Assert `generateGoldenCardBackSvg` does NOT contain `filter id="golden-glow"` or `feGaussianBlur`.
     - Assert `generateGoldenCardBackSvg` contains `gold-paper-emboss` or `feDropShadow` filter.
     - Assert `generateGoldenCardBackSvg` contains reflective gold paper gradient with specular peak (`#ffffff` / `#fff` stops).
     - Spy on `drawGoldenCardBackContent` and assert `ctx.shadowColor` does NOT use neon gold `'rgba(255, 215, 0, 0.65)'` and does not use `shadowBlur = 16`.
   - **Front Card Face Darker Shades**:
     - Spy on `drawFrontCardContent`:
       - Assert `createRadialGradient` is invoked for the background surface with radial coordinates matching the back face `(525, 735, 120, 525, 735, 800)`.
       - Assert background radial gradient contains obsidian stops `#141419`, `#0a0a0d`, `#050507`.
       - Assert internal surfaces (boxed identity, stats columns) use dark obsidian fills (`rgba(7, 7, 10` or `rgba(6, 6, 9` or `rgba(8, 8, 11`) rather than faint gold tint.
2. **In `CardSummonEngine.test.ts`**:
   - Assert DOM card back SVG outer rect has `rx="24"` and inner frame has concentric `rx="16"`.
   - Assert DOM card crest does not use vermilion energy fill, but reflective gold foil gradient.

### 4.2 GREEN Phase: Implementation
1. Update `CardTextureGenerator.generateGoldenCardBackSvg`:
   - Set outer rect `rx="72"`.
   - Set inner border `rx="48"`, `rx="36"`, `rx="30"`.
   - Replace `golden-glow` with `gold-paper-emboss` and define reflective gold foil gradient `#gold-paper-foil-grad`.
   - Apply `gold-paper-emboss` and `#gold-paper-foil-grad` to `STAR_CREST_PATH`.
2. Update `CardTextureGenerator.drawGoldenCardBackContent`:
   - Set clip radius to 72.
   - Set border frame radii to 48, 36, 30.
   - Restyle crest with dark paper emboss shadow (`rgba(0, 0, 0, 0.85)`), specular multi-stop reflective gradient, and zero neon blur.
3. Update `CardTextureGenerator.drawFrontCardContent`:
   - Use radial gradient `createRadialGradient(525, 735, 120, 525, 735, 800)` with obsidian stops `#141419`, `#0a0a0d`, `#050507`.
   - Update boxed identity, stats columns, and badge surfaces to dark obsidian shades.
4. Update `CardSummonEngine.ts`:
   - Synchronize DOM card back SVG border radii and reflective gold crest.

### 4.3 REFACTOR & VERIFICATION Phase
- Run `npm --prefix portfolio test` (verify all 26 test suites and 336+ tests pass).
- Run `npm --prefix portfolio run build` (verify clean Vite build with 0 warnings/errors).

---

## 5. Implementation Checklist

- [x] Task 1: Write failing RED tests in `CardTextureGenerator.test.ts` & `CardSummonEngine.test.ts`
- [x] Task 2: Verify RED test failure in Vitest
- [x] Task 3: Implement concentric radii on back face (`generateGoldenCardBackSvg` & `drawGoldenCardBackContent`)
- [x] Task 4: Implement reflective golden paper crest logo (remove neon bloom, add paper emboss shadow & specular foil)
- [x] Task 5: Implement front card face darker obsidian shades (radial background & dark surface containers)
- [x] Task 6: Synchronize DOM card back in `CardSummonEngine.ts`
- [x] Task 7: Run test suite and confirm GREEN (100% pass)
- [x] Task 8: Run production build and verify 0 errors
- [x] Task 9: Update plan status to Completed
