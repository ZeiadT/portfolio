# 002 - Portfolio Intro Curtain & Wordmark Animation (Step 1)

- **Status**: Updated with 10% Scale Reduction
- **Created**: 2026-10-28
- **Last Updated**: 2026-10-28 (Reduced initial wordmark scale by 10% per user feedback: targetRatio adjusted from 0.88 to 0.792)

---

## 1. Goal & Context
Implement Step 1 of the Boc.Studio-inspired portfolio introduction experience:
1. Fullscreen vermilion curtain (`#ff4421`, `100vh`) covering the viewport.
2. Centered brand wordmark (`"Zeiad Mohammed ®"`), dynamically scaled to fill ~79% of the viewport width (reduced 10% from original 88%).
3. Character spans (`.hero-char`) stagger into view from an offset (`opacity: 0 -> 1`, `y: 16 -> 0`) using the authentic `bocLetters` custom ease (`[0.16, 1, 0.3, 1]`, duration: 0.55s, stagger: 0.035s).
4. Brief hold pause (~0.15s), followed by an energetic overshoot zoom down to scale `1.0` with the authentic `bocOvershoot` custom ease (`[1, -0.02, 0, 1.44]`, duration: 0.95s).
5. Settle hold at scale `1.0` centered in the fullscreen curtain, pausing before curtain collapse (deferred to Step 2).
6. Floating Replay FAB for rapid previewing and testing.

---

## 2. Architecture & Components
- `src/engines/band/constants.ts`: Color tokens, timings, and cubic-bezier paths.
- `src/engines/band/wordmark.ts`: Pure HTML builder & dynamic scale calculator.
- `src/engines/band/introTimeline.ts`: GSAP CustomEase registration & intro timeline choreography.
- `src/engines/band/index.ts`: `ElasticBandEngine` adapter implementing `Engine` lifecycle (`mount`, `destroy`, `resize`, `replay`).
- `src/engines/band/__tests__/wordmark.test.ts`: Vitest unit tests for HTML generation and scale bounds math.
- `src/engines/band/__tests__/introTimeline.test.ts`: Vitest unit tests for timeline lifecycle.
- `index.html`: Intro curtain container and replay button.
- `src/main.ts`: Engine bootstrap and replay binding.

---

## 3. Strict TDD Verification
1. `npm --prefix portfolio test src/engines/band/__tests__/wordmark.test.ts`
2. `npm --prefix portfolio test src/engines/band/__tests__/introTimeline.test.ts`
3. `npm --prefix portfolio test`
4. `npm --prefix portfolio run build`
