# 012 - Canvas 2D Text Resolution & Font Normalization

- **Status**: Implemented & Verified (87/87 tests passing, clean production build)
- **Created**: 2026-10-29
- **Last Updated**: 2026-10-29
- **Tech Stack**: Vanilla TypeScript, Canvas 2D, WebGL 1.0, Tailwind CSS v4

---

## 1. Goal Description
During the opening intro sequence, the vermilion curtain collapses into the center marquee band displaying native DOM text. Upon marquee activation, the band switches to the WebGL canvas texture. Currently, this handoff exhibits a visual mismatch:
1. **Resolution & Pixelation**: Native DOM text renders with OS subpixel ClearType antialiasing, whereas Canvas 2D renders with grayscale antialiasing, which softens further when bilinearly sampled through the WebGL fragment shader.
2. **Font Weight & Sizing Discrepancy**: The DOM wordmark uses `font-black` (`font-weight: 900`). On Windows (`Segoe UI`), no native 900 cut exists. The DOM engine clamps to Bold (`700`), but the Canvas 2D Skia rasterizer applies synthetic font dilation (faux-bolding), artificially fattening glyph outlines by ~1–2px.

---

## 2. Proposed Architectural Solution (Option 1)
- **Super-Sampled Antialiasing (SSAA)**:
  - Allocate `this.offscreen` canvas buffer at `textureScale = Math.max(2, this.dpr * 1.5)` while keeping WebGL viewport at native `this.dpr`.
  - Bilinear hardware downsampling in the WebGL fragment shader serves as a high-quality box filter, producing smooth, high-resolution glyph edges matching subpixel text.
- **Font Normalization Helpers**:
  - Implement `normalizeFontWeight(weight)` to clamp weights $\ge 800$ to `700` when rendering system sans-serif fonts, eliminating Skia synthetic stroke dilation.
  - Update `.wordmark-label` class from `font-black` (`900`) to `font-bold` (`700`) so both DOM DirectWrite and Canvas 2D Skia target the exact same native bold typeface cut.
- **Subpixel Optical Snapping**:
  - Round coordinate offsets in `drawBandSnapshot()` to prevent fractional-pixel blurring along vertical font stems.

---

## 3. Strict TDD Plan
1. Add tests in `bandPhysics.test.ts` for `normalizeFontWeight` and SSAA buffer sizing.
2. Update `wordmark.test.ts` for `font-bold`.
3. Implement `bandPhysics.ts` and `wordmark.ts`.
4. Run full test suite and verify clean production build.
