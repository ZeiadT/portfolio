# Remove Static Shockwave Circle Implementation Plan

- **Status**: Proposed
- **Created**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Three.js, Vitest
- **Branch**: `main`

---

## 1. Goal & Context

User feedback:
> "there's a static circle that appears behind the card in the center of the screen when starting the card entry animation. remove it"

### Root Cause Analysis
In `CardSummonEngine.ts`, a `data-summon-shockwave` element was created as a `rounded-full border border-amber-300/80` element inside `cardStageEl`. In `openTimeline`, it was animated via:
```ts
this.openTimeline.fromTo(
  this.shockwaveEl,
  { scale: 0.2, opacity: 1 },
  { scale: 2.5, opacity: 0, duration: 0.24, ease: 'power3.out' },
  1.25
);
```
Because GSAP's `fromTo` defaults to `immediateRender: true`, the `{ scale: 0.2, opacity: 1 }` state was immediately evaluated and rendered at time $t = 0$. This caused a static, ~61px amber circular ring with a glowing shadow to remain visible in the center of the screen behind the card for the entire 1.25s entrance ascent until climax.

In accordance with the user request and the refined luxury aesthetic (which previously stripped out arcade particle effects and control buttons), the static shockwave circle is to be completely removed from the DOM and animation timeline.

---

## 2. Requirements & Kinematics

1. **Remove Shockwave Element**:
   - Purge `shockwaveEl` field, DOM creation (`data-summon-shockwave`), and mounting from `CardSummonEngine.ts`.
   - Remove `shockwaveEl` tween from `openTimeline` and `cleanupDomAndListeners()`.
2. **Preserve Climax Optical Impact**:
   - The climax at $t = 1.25s$ continues to be delivered by:
     - Ethereal fullscreen optical flash veil (`data-summon-flash-veil`, `opacity: 0.95` at 1.25s).
     - Card perimeter aura flare (`data-summon-card-aura`, `scale: 1.15`, `opacity: 0.95`).
     - GPU shader diagonal holographic foil sweep in `ThreeCardModel`.
3. **No Unwanted Background Artifacts**:
   - No static circle, ring, or border artifact appears in the center of the screen at $t = 0$ or during card ascent.

---

## 3. Architecture & Isolation Design

- Pure cleanup within `CardSummonEngine.ts`.
- Zero external interface changes.

---

## 4. Test-Driven Development (TDD) Plan

### 4.1 Unit Test Specifications
1. **Assertion for Absence of Shockwave**:
   - `expect(document.querySelector('[data-summon-shockwave]')).toBeNull()` on `open()`.
2. **Update Existing Test Suites**:
   - In `CardSummonEngine.test.ts`:
     - Update DOM structure test to verify `[data-summon-flash-veil]` is created and `[data-summon-shockwave]` is null.
     - Update climax animation test to verify optical flash veil peak opacity $\ge 0.9$ without referencing shockwave.
     - Update teardown test to verify clean cleanup of flash veil.
     - Update styling test for flash veil without shockwave.
     - Remove redundant shockwave dimension test.
   - In `CardSummonEmpiricalKinematics.test.ts`:
     - Update sampling snapshot helper to remove shockwave.
     - Update Phase 3 climax test to verify optical bloom opacity $\ge 0.9$.

---

## 5. Implementation Steps

1. [ ] Update test specifications in `CardSummonEngine.test.ts` and `CardSummonEmpiricalKinematics.test.ts` (RED phase).
2. [ ] Run tests to confirm failure.
3. [ ] Commit test specifications.
4. [ ] Remove `shockwaveEl` from `CardSummonEngine.ts`.
5. [ ] Run tests to confirm GREEN phase.
6. [ ] Run full test suite (`npm test`) and production build (`npm run build`).
7. [ ] Push changes to GitHub (`main`).
