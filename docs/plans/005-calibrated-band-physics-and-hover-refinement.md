# 005 - Calibrated Band Rubber Physics, Continuous Marquee & ASCII Hover Radius Reduction

- **Status**: Updating for Pixel-Perfect Band Alignment & 20% Faster Motion Acceleration Start
- **Created**: 2026-10-28
- **Last Updated**: 2026-10-29 (Zero-teleport static-to-animated band alignment & 20% faster ease-in motion start)

---

## 1. Goal & Context
1. Uninterrupted Marquee Scrolling: Remove hover-pause rule so the marquee never stops during hover or drag.
2. Calibrated Elastic WebGL Rubber Physics: Implement subdued, glitch-free rubber physics on the orange band (`strength: 1.6`, `maxDistortion: 24`, `relaxation: 0.94`, `pullX: 32`, `pullY: 24`, `air: 36`).
3. 20% Reduction of ASCII Hover Shockwave End-Effect Radius for localized responsiveness.
4. Elimination of Static Under-Band & Text Overlap:
   - When the WebGL rubber band activates, hide the underlying static `#intro-curtain` and hide DOM text in `#brand-track` (`opacity: 0` for visual rendering while keeping geometric bounding client rects active for the offscreen snapshot).
   - Fix nested query in `drawBandSnapshot()` which was selecting both outer `.satellite-item` wrapper and inner `.wordmark-label`, causing double-rendered overlapping text.
5. Horizontal Slack Extension Beyond Viewport:
   - Extend `#band-container` and `#intro-curtain` horizontally (`-left-16 -right-16`) to provide extra ribbon length outside the viewport, preventing the ends of the band from pulling into view during bending deformation.
6. Zero-Teleport Alignment between Static Band and Animated Band:
   - Eliminate visible jump/teleport when switching from static curtain to WebGL canvas:
     - Collapse `#intro-curtain` height directly to match `#brand-bar`'s exact computed pixel height.
     - Match snapshot font rendering to DOM: dynamic font size (26px on desktop), `letterSpacing` support (`-0.02em` for wordmark, `0.05em` for satellites), superscript `®` positioning, and underline styling.
     - Calculate item vertical positioning using individual DOM client rects (`r.top - barRect.top + r.height / 2 + air`).
     - Pre-render canvas frame synchronously via `renderFrame()` BEFORE hiding the curtain, avoiding single-frame visibility dropouts.
     - Re-sync track `centerOffset` at ready time using settled DOM geometry.
7. 20% Faster Motion Acceleration Start:
   - Reduce marquee acceleration duration from 2.4s to 1.92s ($2.4 \times 0.8 = 1.92\text{s}$) to transition from 0 velocity to linear speed 20% faster.

8. Font Family Synchronization Across Static & Animated Bands:
   - Ensure the static band DOM elements and the animated WebGL Canvas snapshot share the exact same typography and font family stack:
     - Enforce `--brand-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` across `.boc-marquee-track` and all descendant elements in `src/style.css`.
     - In `src/engines/band/bandPhysics.ts`, extract the element's live `style.fontFamily` from `window.getComputedStyle(item)` (with complete fallback including `"Segoe UI"`, `Roboto`, `Helvetica`, `Arial`) so both the wordmark and satellite badges render with the identical system font in DOM and Canvas.
9. Dead Code & Redundancy Cleanup:
   - Remove obsolete CSS `@keyframes boc-marquee` and unused `--marquee-offset` inline CSS property assignments since GSAP `MarqueeMotionController` directly controls transforms.
   - Remove unused `bocCollapse` ease from `constants.ts` and `introTimeline.ts`.
   - Remove unused `COLOR_TOKENS` from `constants.ts`.
   - Remove dead `smooth` parameter from `PhysicsConfig` in `bandPhysics.ts`.

---

## 2. Architecture & Components
- `src/style.css`:
  - Define `--brand-font` and enforce it with `!important` on `.boc-marquee-track, .boc-marquee-track *`.
  - Remove unused `@keyframes boc-marquee`.
- `src/engines/band/constants.ts`:
  - Prune unused `bocCollapse` and `COLOR_TOKENS`.
- `src/engines/band/introTimeline.ts`:
  - Prune `bocCollapse` registration.
- `src/engines/band/bandPhysics.ts`:
  - Remove dead `smooth` parameter from `PhysicsConfig`.
  - Dynamically pass `style.fontFamily` to all canvas font settings (`ctx.font = `${fontWeight} ${fontSize} ${fontFamily}``).
- `src/engines/band/index.ts`:
  - Remove redundant `--marquee-offset` calls.
- `src/engines/band/__tests__/bandPhysics.test.ts`:
  - Vitest test ensuring identical font-family stack resolution in snapshot rendering.
- `src/engines/band/bandPhysics.ts`:
  - Add public `renderFrame()` method for synchronous initial canvas paint before curtain handoff.
  - Refine `drawBandSnapshot()` to read computed typography (`fontSize`, `fontWeight`, `letterSpacing`), format superscript `®` cleanly, render underlines, and center text based on live element rects.
- `src/engines/band/marqueeMotion.ts`:
  - Update default `accelDuration` from 2.4s to 1.92s (20% faster start).
- `src/engines/band/introTimeline.ts`:
  - Allow curtain collapse target height to dynamically match `#brand-bar`'s computed pixel height.
- `src/engines/band/index.ts`:
  - In `onMarqueeReady`:
    - Call `updateDimensions()` on `physicsEngine`.
    - Recalculate zero-jump `centerOffset` from settled wordmark rect.
    - Synchronously execute `renderFrame()` before setting `curtainEl.style.display = 'none'` and attaching `.is-scrolling`.
- `src/engines/band/__tests__/marqueeMotion.test.ts`:
  - Update test specs for 1.92s acceleration duration.
- `src/engines/band/__tests__/bandPhysics.test.ts`:
  - Add tests for `renderFrame()` and dimensions synchronization.

---

## 3. Strict TDD Verification
1. `npm --prefix portfolio test src/engines/band/__tests__/marqueeMotion.test.ts`
2. `npm --prefix portfolio test src/engines/band/__tests__/bandPhysics.test.ts`
3. `npm --prefix portfolio test`
4. `npm --prefix portfolio run build`
