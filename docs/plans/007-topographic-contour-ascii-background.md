# 007 - Topographic Contour Fluid Wave ASCII Background Engine

- **Status**: Implemented & Verified
- **Created**: 2026-10-29
- **Last Updated**: 2026-10-29

---

## 1. Goal & Context
Transform the reactive ASCII canvas background from uniform technical glyphs into an interactive, multi-tiered topographic contour fluid wave field inspired by reference bathymetric / fluid marble artwork:
1. **Mathematical Topographic Heightfield**:
   - Continuous 2D harmonic field with domain warping and a left-aligned concentric vortex eddy $(0.18, 0.45)$, generating organic liquid marble curves and concentric contour rings.
2. **5 Quantized Elevation Strata**:
   - Stepped color and glyph mapping from Deep Oceanic Navy (`#0a2240`, $\approx 0.22\alpha$, sparse marks `·`, `+`, `:`, `0`), through Cobalt (`#0284c7`), Vibrant Cyan (`#00b4d8`), and Minty Aqua (`#7dd3fc`), up to Mountain Ridge Snow White (`#f8fafc`, $\approx 0.92\alpha$, crest marks `◈`, `⬡`, `∇`, `✦`).
3. **Isoline Ridge Highlighting**:
   - Luminous edge detection ($\Delta H < 0.024$ of tier thresholds) that illuminates boundary glyphs in radiant white/cyan to trace sharp vector contour lines across the monospace grid.
4. **Physical Shockwave & Pointer Interaction**:
   - Retained the damped spring physics (`spring: 0.12, damping: 0.88`) so cursor movement and clicks dynamically distort the grid with radiant electric cyan shockwaves.

---

## 2. Architecture & Components
- `src/engines/background/types.ts`:
  - Defined `TOPOGRAPHIC_TIERS` specifying threshold, palette RGB, base opacity, and glyph subsets for each of the 5 elevation bands.
  - Added `elevation`, `tierIndex`, and `isRidge` to `AsciiCell`.
  - Added `flowSpeed`, `warpStrength`, and `vortexCenter` configuration tokens.
- `src/engines/background/asciiGrid.ts`:
  - Implemented `evaluateTopographicElevation()` computing domain warping, 2D harmonic drift, vortex rings, elevation quantization, and isoline ridge detection.
  - In `resize()` and `update()`, mapped cells to their dynamic elevation tier, adjusting glyphs and opacity accordingly.
- `src/engines/background/index.ts`:
  - Updated `render()` to draw cells in their tier-specific palette with isoline ridge highlighting and shockwave glow.
- `src/engines/background/__tests__/asciiGrid.test.ts`:
  - Added unit test cases verifying elevation bounds $[0, 1]$, quantized tiers $[0, 4]$, and tier-specific glyph adaptation.

---

## 3. Strict TDD Verification
1. `npm --prefix portfolio/portfolio test src/engines/background/__tests__/asciiGrid.test.ts` (11/11 tests passing)
2. `npm --prefix portfolio/portfolio test` (55/55 tests passing across 8 suites)
3. `npm --prefix portfolio/portfolio run build` (Clean production bundle)
