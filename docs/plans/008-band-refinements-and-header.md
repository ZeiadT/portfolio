# Implementation Plan: Band Refinements, Editorial Header & Replay Removal

## Overview
This plan addresses four targeted refinements for the portfolio splash and band interaction:
1. **Letter Spacing Synchronization**: Eliminate the horizontal letter-spacing discrepancy between the static DOM wordmark and the interactive canvas snapshot.
2. **Vertical Pop (1px Upward Shift)**: Calibrate the canvas vertical baseline offset so the wordmark and satellites remain visually motionless during the handoff from static DOM to interactive WebGL.
3. **Editorial Header Text Below the Band**: Introduce an editorial statement block positioned below the vermilion band featuring a catchy phrase on design, animated into view during the curtain collapse.
4. **Replay Button Removal**: Remove the floating replay button UI and its event binding logic.

---

## Root Causes & Technical Details

### 1. Letter Spacing Discrepancy
- **DOM**: The brand wordmark in `wordmark.ts` renders each character as a separate `<span class="hero-char inline-block ...">`. CSS Text Level 3 specifications dictate that `letter-spacing` does not apply across atomic inline-block boundaries. In addition, `tracking-[-0.02em]` was present on the container.
- **Canvas**: In `bandPhysics.ts`, `drawBandSnapshot()` previously rendered `'ZEIAD MOHAMMED'` as a single unbroken string with `ctx.letterSpacing = style.letterSpacing`, shrinking the total text width by ~2.5px.
- **Fix**:
  1. Remove `tracking-[-0.02em]` from `createWordmarkHtml()`.
  2. In `drawBandSnapshot()`, detect `.hero-char` and `.static-char` child spans and render each glyph at its exact `span.getBoundingClientRect().left - barRect.left` coordinate. Each letter in canvas will match its DOM counterpart down to the exact subpixel.

### 2. Vertical Pop (1px Upward Shift)
- **Cause**: Canvas 2D's `textBaseline = 'middle'` aligns the font em-box midpoint, whereas DOM `display: flex; align-items: center` centers the glyph bounding box (influenced by font ascender/descender ratios). The previous offset of `+ 1` left the canvas rendering 1px higher than the settled DOM position.
- **Fix**: Update the baseline calibration offset in `bandPhysics.ts` to `+ 2` (`y = r.top - barRect.top + r.height / 2 + air + 2`), shifting the canvas text down by 1px to lock seamlessly onto the DOM element.

### 3. Editorial Header Text Below the Band
- **Placement**: Directly below the vermilion band in `portfolio/portfolio/index.html` (`top-[calc(50svh+2.75rem)] md:top-[calc(50svh+3.25rem)]`).
- **Typography & Copy**:
  - Subtitle: `Architecture & Interactive Design` (uppercase, tracking-widest, neutral-400).
  - Headline: `Crafting high-performance digital architectures, expressive typography, and <span class="text-[#ff4421] font-normal">kinetic interactive systems</span>.`
- **Animation**: In `introTimeline.ts`, smoothly fade and slide in `#hero-header` (`opacity: 0 -> 1`, `y: 16 -> 0`) as the curtain collapses into the band.

### 4. Remove Replay Button
- Remove `<aside>` containing `#replay-btn` from `index.html`.
- Remove `#replay-btn` listener from `main.ts`.

---

## Proposed Changes

### engines/band/wordmark.ts
- Remove `tracking-[-0.02em]` from `createWordmarkHtml`.

### engines/band/bandPhysics.ts
- In `drawBandSnapshot()`:
  - Query `.hero-char:not(.trademark-char), .static-char:not(.trademark-char)`. If present, render each letter at `charRect.left - barRect.left` and `charRect.top - barRect.top + charRect.height / 2 + air + 2`.
  - Fall back to full text if spans are unavailable.
  - Set vertical offset to `+ 2` for all rendered items.

### engines/band/introTimeline.ts
- Accept optional `heroHeader?: HTMLElement | null`.
- Animate `heroHeader` into view on curtain collapse start (`opacity: 1`, `y: 0`, duration 0.8s, ease `'power2.out'`).

### portfolio/index.html
- Add `<header id="hero-header">` below `#band-container`.
- Remove `#replay-btn` `<aside>`.

### src/main.ts
- Remove replay button query and click handler.

---

## Verification Plan

### Automated Tests
1. **`bandPhysics.test.ts`**:
   - Verify character-by-character snapshot rendering matches individual span horizontal coordinates.
   - Verify calibrated `+ 2` vertical offset (`expect(capturedY).toBeCloseTo(65.5, 2)`).
2. **`wordmark.test.ts`**:
   - Verify HTML output does not include `tracking-[-0.02em]`.
3. **`introTimeline.test.ts`**:
   - Verify `heroHeader` animation timeline setup.
4. **Full Test Suite**:
   - `npm --prefix portfolio/portfolio test -- --run` (all 55+ tests must pass).
5. **Production Build**:
   - `npm --prefix portfolio/portfolio run build` (clean build without warnings or type errors).
