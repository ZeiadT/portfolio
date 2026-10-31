# Front Card Texture Concentric Border Radius Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Completed**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), HTML5 Canvas 2D, Vanilla TypeScript, Vitest
- **Branch**: `main`

---

## 1. Goal & Mathematical Requirements Alignment

User feedback:
> "the front card face has a texture with a border. that border radius should use this equation:
> inner radius = outer radius − gap
> where outer radius is the card corner raius itself"

### Mathematical Analysis & Geometric Synchronization
1. **Physical Card Geometry (3D Space)**:
   - In `ThreeCardModel.ts`:
     - `CARD_WIDTH = 3.5`
     - `CARD_HEIGHT = 4.9`
     - `CARD_RADIUS = 0.24` (corner radius of extruded physical slab)
2. **Texture Canvas Coordinates (2D Space)**:
   - In `CardTextureGenerator.ts`:
     - `TEXTURE_WIDTH = 1050` ($3.5 \times 300$)
     - `TEXTURE_HEIGHT = 1470` ($4.9 \times 300$)
     - Scale factor = $300$ px / unit.
   - **Outer Radius (Card Corner Radius Itself)**:
     $$\text{outer radius} = \text{ThreeCardModel.CARD\_RADIUS} \times 300 = 0.24 \times 300 = 72\text{ px}$$
3. **Inner Border Frame & Gap**:
   - The hairline border frame is positioned at $x = 24, y = 24, w = 1002, h = 1422$.
   - The margin/padding gap from the card outer boundary $(0, 0, 1050, 1470)$ is:
     $$\text{gap} = 24\text{ px}$$
4. **Target Equation**:
   $$\text{inner radius} = \max(0, \text{outer radius} - \text{gap}) = 72 - 24 = 48\text{ px}$$
5. **Root Cause of Visual Discrepancy**:
   - In the prior implementation, `drawFrontCardContent` had hardcoded `48` for the outer card clip and `24` ($48 - 24 = 24$) for the hairline border.
   - In 3D rendering, the card slab corner has radius $72\text{ px}$ ($0.24$ units), but the inner border had radius $24\text{ px}$. Because $24\text{ px}$ is significantly tighter than $72\text{ px}$, the border appeared visually non-concentric and disconnected from the physical card's corner curvature.
   - Updating `outer radius` to $72\text{ px}$ and `inner radius` to $48\text{ px}$ ensures perfect optical concentricity between the card edge and the decorative border frame.

---

## 2. Architecture & Design

1. **Expose Constant on `CardTextureGenerator`**:
   ```ts
   public static readonly CARD_CORNER_RADIUS = 72;
   ```
   Synchronized mathematically with `ThreeCardModel.CARD_RADIUS * (TEXTURE_WIDTH / CARD_WIDTH)`.
2. **Refine `computeConcentricRadius`**:
   ```ts
   /**
    * Computes concentric inner corner radius using optical math:
    * inner radius = max(0, outer radius - gap)
    */
   public static computeConcentricRadius(outerRadius: number, gap: number): number {
     return Math.max(0, outerRadius - gap);
   }
   ```
3. **Update `drawFrontCardContent`**:
   - Outer card clip:
     `CardTextureGenerator.drawRoundedRect(ctx, 0, 0, 1050, 1470, CardTextureGenerator.CARD_CORNER_RADIUS); // 72`
   - Hairline border frame:
     `const borderGap = 24;`
     `const innerRadius = CardTextureGenerator.computeConcentricRadius(CardTextureGenerator.CARD_CORNER_RADIUS, borderGap); // 48`
     `CardTextureGenerator.drawRoundedRect(ctx, borderGap, borderGap, 1002, 1422, innerRadius);`

---

## 3. Strict TDD Plan

### 3.1 RED Phase (Failing Tests)
- In `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`:
  1. Add test verifying `CardTextureGenerator.CARD_CORNER_RADIUS === 72` and matches `ThreeCardModel.CARD_RADIUS * (1050 / 3.5)`.
  2. Update `computeConcentricRadius` test to assert `computeConcentricRadius(72, 24) === 48`.
  3. Update `drawFrontCardContent` spy test:
     - Outer card clip asserted with $R = 72$.
     - Inset border frame asserted with $R = 48$.
- Run `vitest run src/engines/card/three/__tests__/CardTextureGenerator.test.ts` and confirm test failures.
- Commit RED test specifications.

### 3.2 GREEN Phase (Implementation)
- In `portfolio/src/engines/card/three/CardTextureGenerator.ts`:
  - Define `public static readonly CARD_CORNER_RADIUS = 72;`.
  - Use `CardTextureGenerator.CARD_CORNER_RADIUS` (72) for the outer clip.
  - Compute `innerRadius = CardTextureGenerator.computeConcentricRadius(outerRadius, 24)` (48) for the hairline border.
- Run `vitest run src/engines/card/three/__tests__/CardTextureGenerator.test.ts` and confirm all pass.

### 3.3 Verification & Delivery
- Run full test suite: `npm --prefix portfolio test` (all 26 suites, 332+ tests).
- Run production build: `npm --prefix portfolio run build`.
- Update plan status to `Completed`.
- Commit changes and push to `origin main`.

---

## 4. Implementation Checklist

- [x] 1. Write failing tests in `CardTextureGenerator.test.ts` (RED phase).
- [x] 2. Run tests to confirm failure.
- [x] 3. Commit test specifications (`f7be951`).
- [x] 4. Update `CardTextureGenerator.ts` with `CARD_CORNER_RADIUS = 72` and border radius = 48.
- [x] 5. Run tests to confirm GREEN phase.
- [x] 6. Run full test suite (`npm test`) and production build (`npm run build`).
- [x] 7. Mark plan as Completed, commit and push to GitHub.
