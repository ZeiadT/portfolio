# 003 - Elastic Curtain Collapse, Zero-Jump Marquee & Kinetic Background Canvas (Step 2)

- **Status**: Implemented & Verified
- **Created**: 2026-10-28
- **Last Updated**: 2026-10-28

---

## 1. Goal & Context
Implement Step 2 of the portfolio introduction experience:
1. Elastic collapse of the vermilion curtain from `100vh` to `clamp(3.25rem, 2.75rem + 1.2vw, 3.897rem)` at `top: 50svh, -translate-y-1/2`.
2. Zero-jump synchronous pre-alignment of the hero wordmark inside `#brand-track`.
3. Option B continuous marquee activation (`"Mobile Architecture & Motion ✦ High-Performance Systems ● View Engineering Work"`).
4. Fullscreen `#shader-background` mount revealing an interactive, elastic ASCII/technical matrix canvas animation that ripples outward on collapse.
5. Replay capability seamlessly resetting both engines.

---

## 2. Architecture & Components
- `src/engines/background/`:
  - `types.ts`: Background grid types and configuration.
  - `asciiGrid.ts`: Pure mathematical grid & elastic ripple physics.
  - `index.ts`: `BackgroundCanvasEngine` implementing `Engine` lifecycle.
  - `__tests__/asciiGrid.test.ts`: Vitest unit tests for physics & grid calculation.
- `src/engines/band/`:
  - `marqueeTrack.ts`: Track generation & zero-jump offset math.
  - `constants.ts`: `elasticCollapse` ease & timing tokens.
  - `introTimeline.ts`: Full choreographed timeline (phases 1-4).
  - `index.ts`: `ElasticBandEngine` orchestrating band & track lifecycle.
  - `__tests__/marqueeTrack.test.ts`: Vitest unit tests for track offset calculation and unit composition.
- `index.html`: Center band layout, track mount, `#shader-background` container.
- `src/style.css`: Smooth infinite marquee keyframes and GPU hints.
- `src/main.ts`: Engine bootstrap and inter-engine lifecycle triggers.

---

## 3. Strict TDD Verification
1. `npm --prefix portfolio test src/engines/background/__tests__/asciiGrid.test.ts`
2. `npm --prefix portfolio test src/engines/band/__tests__/marqueeTrack.test.ts`
3. `npm --prefix portfolio test`
4. `npm --prefix portfolio run build`
