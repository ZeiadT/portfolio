# 006 - Curtain Collapse Overshoot Calibration & Font/Casing Synchronization

- **Status**: Implemented & Verified
- **Created**: 2026-10-29
- **Last Updated**: 2026-10-29

---

## 1. Goal & Context
1. **Reduce Curtain Collapse Overshoot**:
   - The opening curtain collapsed from `100vh` into the horizontal band, but previously overshot significantly ($1.14$ progress multiplier), causing the vermilion curtain height to plunge down to $0\text{px}$ / negative height and shrink narrower than the centered brand logo and band height.
   - Calibrated the cubic-bezier ease `CUSTOM_EASES.elasticCollapse.path` to `M0,0 C0.25,1 0.35,1.006 1,1` and enforced an explicit physical `curtain.style.minHeight` floor matching `#brand-bar`'s computed height to guarantee the curtain never shrinks smaller than the logo or band.
2. **Synchronize Band Font & Uppercase Casing**:
   - The static view prior to scrolling activation rendered all uppercase text via CSS, but when switching to the continuous animated WebGL band, satellite items rendered in Title Case (`"Mobile Architecture & Motion"`) because the 2D canvas snapshot took raw `item.textContent` without CSS text-transform.
   - Standardized all brand strings and marquee satellites in `wordmark.ts` (`BRAND_NAME = 'ZEIAD MOHAMMED'`) and `marqueeTrack.ts` (`MARQUEE_SATELLITES`) directly in uppercase.
   - Hardened `bandPhysics.ts` (`drawBandSnapshot`) with defensive `.toUpperCase()` on all satellite items and unified the system sans font stack between DOM and Canvas 2D.

3. **Eliminate 1px Vertical Shift on Static-to-Animated Handoff**:
   - Because Canvas 2D's `textBaseline = 'middle'` aligns the font em-box midpoint rather than optical cap-height centering, all-caps text on the Canvas snapshot was drawn ~1px higher than the DOM's flexbox `align-items: center` layout.
   - Added a `+ 1` pixel optical calibration offset in `bandPhysics.ts` (`drawBandSnapshot`) so the snapshot text aligns down to the exact subpixel with the settled DOM text prior to scrolling.
4. **Trademark (®) Position Lock**:
   - In `wordmark.ts`, wrap `®` in a dedicated superscript container with `.trademark-char` so GSAP's `y: 0` letter stagger animation does not wipe out its vertical superscript placement down to the midline.
   - In `bandPhysics.ts`, dynamically read `.trademark-char`'s live `getBoundingClientRect()` for both `x` and `y` coordinates instead of guessing with `nameWidth + 4` and hardcoded vertical offsets.
5. **Smooth Static Band Fast Fade-Out (Replacing Instant Transparent Cut)**:
   - In `src/style.css`, remove `color: transparent !important` from `.boc-marquee-track.is-scrolling`.
   - In `src/engines/band/index.ts` (`onMarqueeReady`), instantly activate the WebGL canvas and marquee motion, and trigger a fast GSAP fade-out (`opacity: 0`, duration: 0.18s) on the static DOM track and curtain, resetting opacity on `replay()`.

---

## 2. Architecture & Components
- `src/engines/band/constants.ts`:
  - Calibrated `elasticCollapse` cubic-bezier path from `M0,0 C0.25,1 0.35,1.14 1,1` to `M0,0 C0.25,1 0.35,1.006 1,1`.
- `src/engines/band/introTimeline.ts`:
  - Assigned protective physical floor `curtain.style.minHeight` matching `#brand-bar`'s computed pixel height.
- `src/engines/band/wordmark.ts`:
  - Set `BRAND_NAME = 'ZEIAD MOHAMMED'` with uppercase character spans.
  - Wrap `®` in `.trademark-char` superscript wrapper.
- `src/engines/band/marqueeTrack.ts`:
  - Defined all `MARQUEE_SATELLITES` constants in full uppercase.
- `src/engines/band/bandPhysics.ts`:
  - Applied defensive `.toUpperCase()` on `item.textContent` in `drawBandSnapshot()` to guarantee matching typography on Canvas 2D.
  - Added `+ 1` pixel optical baseline offset to `y = r.top - barRect.top + r.height / 2 + air + 1` to eliminate the 1px upward pop during handoff.
  - Query `.trademark-char`'s live bounding rect to place `®` precisely at the DOM coordinate in Canvas.
- `src/style.css`:
  - Removed `color: transparent !important` from `.boc-marquee-track.is-scrolling`.
- `src/engines/band/index.ts`:
  - Orchestrate smooth 0.18s fade-out of static DOM band upon marquee activation, and restore opacity on `replay()`.
- `src/engines/band/__tests__/`:
  - `wordmark.test.ts`: Verified uppercase wordmark generation and `.trademark-char` structure.
  - `marqueeTrack.test.ts`: Verified uppercase marquee satellites.
  - `bandPhysics.test.ts`: Added tests verifying uppercase satellite rendering, 1px optical baseline vertical alignment, and dynamic `.trademark-char` positioning.
  - `introTimeline.test.ts`: Added test verifying protective `minHeight` assignment on the curtain.
  - `engine.test.ts`: Verified smooth handoff and replay lifecycle.

---

## 3. Strict TDD Verification
1. `npm --prefix portfolio test src/engines/band/__tests__/wordmark.test.ts`
2. `npm --prefix portfolio test src/engines/band/__tests__/marqueeTrack.test.ts`
3. `npm --prefix portfolio test src/engines/band/__tests__/bandPhysics.test.ts`
4. `npm --prefix portfolio test src/engines/band/__tests__/introTimeline.test.ts`
5. `npm --prefix portfolio test` (49/49 tests passing)
6. `npm --prefix portfolio run build` (Clean production bundle)
