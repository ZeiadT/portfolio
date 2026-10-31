# Card Dismiss Exit Animation & Backdrop Undim/Unblur Implementation Plan

- **Status**: Proposed
- **Created**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Three.js, Vitest, Tailwind CSS
- **Branch**: `feat/card-shine-effect`

---

## 1. Goal & Context

When the summon modal dialog is dismissed (via clicking the backdrop, clicking anywhere on the stage, clicking the close button, or pressing Escape), the card currently disappears abruptly because `close()` immediately tears down the DOM and Three.js WebGL model synchronously.

The user has requested:
> "on dismiss, animate the card to the bottom where it came from then dispose it. animate unblur and undimm the background"

This plan specifies the choreographed exit animation and resource disposal sequence for `CardSummonEngine`:
1. Symmetrical downward descent of the card back to where it emerged from (`yPercent: 120`, `scale: 0.6`, `opacity: 0`) synchronized with the Three.js 3D WebGL mesh in real time.
2. Concurrent unblurring (`backdrop-filter: blur(24px) -> blur(0px)`) and undimming (`opacity: 1 -> 0`) of the backdrop.
3. Blur-fade departure of the dismissal prompt and close button.
4. Clean lifecycle disposal only upon completion of the dismiss animation (with immediate bypass for `prefers-reduced-motion` and explicit `destroy()`).

---

## 2. Requirements & Kinematic Specifications

### 2.1 Card Exit Kinematics
- **Origin**: During `open()`, the card emerged from the bottom edge at `yPercent: 120, scale: 0.55, opacity: 0`.
- **Exit Trajectory**:
  - `cardEl`: Animates from its current settled transform to:
    - `yPercent: 120` (or `130` for full viewport clearance)
    - `scale: 0.6`
    - `opacity: 0`
    - `duration: 0.45s`
    - `ease: 'power2.in'` (natural downward gravitational acceleration into the staging threshold)
  - `onUpdate`: Executes `this.syncThreeCardModel()` on every frame, translating the Three.js 3D model down into negative world space ($Y \approx -5.4$) in lockstep.
  - `cardStageEl`: Fades `opacity: 0` over `0.45s` (`ease: 'power2.in'`) ensuring complete visual departure of the WebGL canvas.

### 2.2 Background Undim & Unblur
- **Target**: `backdropEl` (initially styled with `bg-black/75 backdrop-blur-xl`, i.e., `opacity: 1`, `backdrop-filter: blur(24px)`).
- **Exit Tweens**:
  - `opacity: 0` (undim)
  - `backdropFilter: 'blur(0px)'` and `WebkitBackdropFilter: 'blur(0px)'` (unblur)
  - `duration: 0.40s`
  - `ease: 'power2.out'` (smooth reveal of the underlying page)

### 2.3 UI Controls Exit
- `dismissHintEl`: Animates `opacity: 0, filter: 'blur(8px)', duration: 0.25s, ease: 'power2.in'`.
- `closeBtnEl`: Animates `opacity: 0, duration: 0.20s, ease: 'power2.in'`.
- `bottomGlowEl` / `cardAuraEl`: Fades to `opacity: 0` over `0.20s` if active.

### 2.4 State & Lifecycle Guards
- **Idempotency Guard**: `isDismissing: boolean = false`. If already dismissing, subsequent clicks or triggers are ignored.
- **Immediate Disconnect of Listeners**: Click listeners and keydown listeners are detached immediately upon dismiss initiation to prevent double triggers during animation.
- **Tween Cancellation**: Active `idleFloatTween` and `sheenTween` are killed immediately when dismissal begins.
- **Post-Animation Cleanup**: Only in `closeTimeline.onComplete`:
  - `cleanupDomAndListeners()`
  - `threeCardModel.destroy()`
  - `document.body.style.overflow = ''`
  - `options.onClose?.()`
  - `isDialogOpen = false`
  - `isDismissing = false`
- **Accessibility & Direct Disposal**:
  - Under `prefers-reduced-motion: reduce` or `close(immediate = true)`: Bypasses the timeline and executes cleanup immediately.
  - On `destroy()`: Kills `closeTimeline` and tears down synchronously.

---

## 3. Architecture & Isolation Design

- **Engine Isolation**: All logic is fully encapsulated within `portfolio/src/engines/card/CardSummonEngine.ts`.
- **Public API**:
  - `close(immediate?: boolean): void`
  - `getCloseTimeline(): gsap.core.Timeline | null`
  - `isDismissingState(): boolean`
- Zero coupling to external framework state or global window leakage.

---

## 4. Test-Driven Development (TDD) Plan

### 4.1 New Unit Test Specifications (`CardSummonEngine.test.ts`)
1. **Dismiss Timeline Creation**: Calling `close()` when open creates `closeTimeline` with duration $\approx 0.45s$.
2. **Card Downward Kinematics**:
   - `cardEl` animates `yPercent` towards $\ge 120$ and `scale` to $0.6$.
   - `onUpdate` drives `syncThreeCardModel()`, updating 3D model $Y$ position downward.
3. **Backdrop Undim & Unblur**:
   - `backdropEl` animates `opacity` to 0 and `backdropFilter` to `blur(0px)`.
4. **Deferred Disposal**:
   - Before `closeTimeline` completes, DOM elements (`data-summon-card`, `data-card-summon-modal`) are still present and `isDismissingState()` is true.
   - Upon `closeTimeline.progress(1)` / `onComplete`, DOM elements are removed, WebGL model is destroyed, and `onClose()` is called.
5. **Reduced Motion**:
   - When `prefers-reduced-motion: reduce` is active, `close()` performs immediate synchronous disposal without creating an animation timeline.
6. **Double Dismiss Guard**:
   - Calling `close()` repeatedly during dismissal does not re-instantiate `closeTimeline` or invoke `onClose` multiple times.
7. **Immediate Teardown via `destroy()`**:
   - Calling `destroy()` during dismissal halts `closeTimeline` and cleans up immediately.

---

## 5. Implementation Steps

1. [ ] Write unit tests in `CardSummonEngine.test.ts` covering dismiss animation kinematics, backdrop unblur/undim, idempotency, and deferred disposal.
2. [ ] Run tests to confirm failure (RED phase).
3. [ ] Commit test specifications to git.
4. [ ] Implement `closeTimeline`, `close(immediate = false)`, `getCloseTimeline()`, and `isDismissingState()` in `CardSummonEngine.ts`.
5. [ ] Update existing synchronous cleanup tests in `CardSummonEngine.test.ts` to advance `getCloseTimeline()?.progress(1)` or invoke `close(true)`.
6. [ ] Run full test suite (`npm test`) and production build (`npm run build`).
7. [ ] Update documentation and walkthrough.
