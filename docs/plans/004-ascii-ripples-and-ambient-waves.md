# 004 - ASCII Click Ripples, Electric Cyan Palette & Ambient Waves (Step 3)

- **Status**: Implemented & Verified (Option 1: Neural Twinkle)
- **Created**: 2026-10-28
- **Last Updated**: 2026-10-28 (Replaced traveling directional waves with Option 1: Neural Twinkle & Constellation Breathing for a calm, organic, high-end backdrop)

---

## 1. Goal & Context
Implement enhancements to the background ASCII / matrix engine (`BackgroundCanvasEngine`):
1. Left-click radial shockwave ripple on mouse press.
2. Muted slate cyan palette (`#6eb9cd`) with calibrated brightness.
3. Neural Twinkle ambient animation: replaces mechanical sweeping waves with sparse, asynchronous organic cell breathing (fade in/fade out) and sporadic glyph mutation during peak illumination, strictly preserving physical cell positions (`dispX = 0, dispY = 0`).
4. 20% reduction of mouse movement displacement effect on ASCII glyphs (`maxDisplacement: 24px`, hover impulse: `4.8`).

---

## 2. Architecture & Components
- `src/engines/background/types.ts`: Extended `AsciiCell` with `ambientEnergy`, `glyphIndex`, and secondary color token.
- `src/engines/background/asciiGrid.ts`: Pure harmonic wave field calculation, glyph mutation, 20% clamped displacement.
- `src/engines/background/index.ts`: Left-click listener (`pointerdown`), Electric Cyan gradient blending, calibrated hover.
- `src/engines/background/__tests__/asciiGrid.test.ts`: Vitest unit tests for ambient waves, clamping, and click impulses.

---

## 3. Strict TDD Verification
1. `npm --prefix portfolio test src/engines/background/__tests__/asciiGrid.test.ts`
2. `npm --prefix portfolio test`
3. `npm --prefix portfolio run build`
