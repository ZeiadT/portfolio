# 002 - Authentic BOC Splash-to-Band Animation Implementation Plan

- **Status**: Ready for Implementation
- **Created**: 2026-10-28
- **Last Updated**: 2026-10-28

---

## 1. Goal & Context
Replicate the authentic animation choreography from [boc.studio](https://boc.studio/) on page load: staggered letter reveal for "Zeiad Mohammed", energetic overshoot zoom down, automatic curtain collapse into a center elastic marquee band, background shader container reveal, and circle-to-pill expanding cursor guidance with blur + fade-in.

---

## 2. Requirements & Constraints
- Primary color: `#ff4421` (vermilion), dark neutral `#0d0d0d`, background `#09090b`.
- Wordmark brand name: `"Zeiad Mohammed"`.
- Band location: Fixed across the vertical center of the screen (`top: 50%`, `-translate-y-1/2`, height `clamp(3.25rem, 2.75rem + 1.2vw, 3.897rem)`), matching authentic BOC design.
- Background container: `#shader-background` occupying full viewport behind the band, ready for custom shader injection.
- Zero direct file copying; clean architectural rewrite.
- Strict TDD: failing tests written and verified before implementation code.

---

## 3. Choreography & Architecture
1. **Logo Stagger In**: Letters of "Zeiad Mohammed" stagger in with `bocLetters` custom ease (`M0,0 C0.16,1 0.3,1 1,1`).
2. **Overshoot Zoom Down**: Hero wrapper scales down with `bocOvershoot` custom ease (`M0,0 C1,-0.02 0,1.44 1,1`).
3. **Curtain Collapse**: Curtain collapses automatically into horizontal center band with `bocCollapse` (`M0,0 C1,0 0.99,0.21 1,1`).
4. **Shader Background Reveal**: `#shader-background` container fades in as curtain collapses.
5. **Continuous Marquee & Satellites**: Satellites stagger in; marquee track scrolls infinitely.
6. **Circle-to-Pill Cursor Guidance**: Starts as a compact circle, expands horizontally into a frosted glass pill, with content fading in from blur.
7. **Calibrated Rubber Physics**: Subtle, non-glitching rubber elasticity on cursor interaction.

---

## 4. Tasks & TDD Breakdown
1. **Wordmark Generator (`src/engines/band/wordmark.ts`)**: Generates `.hero-char` spans for letter-by-letter staggering and satellite units.
2. **Circle-to-Pill Cursor Tip (`src/components/cursor/CursorTip.ts`)**: Circle expansion into pill with blur-to-sharp content fade-in and smooth tracking.
3. **Authentic BOC Splash Timeline (`src/engines/band/splashTimeline.ts`)**: Implements `bocLetters`, `bocOvershoot`, `bocCollapse` sequence.
4. **Center Marquee Engine Adapter (`src/engines/band/index.ts`)**: Center alignment, track pre-positioning, continuous scrolling, calibrated physics.
5. **App Shell Integration (`portfolio/index.html`, `src/main.ts`, `src/style.css`)**: Wire auto-play splash, shader background viewport, and pill trigger.

---

## 5. Verification Plan
- Vitest suite: `cd portfolio && npm test`
- Build & typecheck: `cd portfolio && npm run build`
- Visual checks: Letter stagger on load, overshoot bounce, center band collapse, background fade-in, circle-to-pill expansion, and gentle rubber physics.
