# Card Click Flip & Pure Slide-Down Dismiss Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Completed**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Three.js, Vitest
- **Branch**: `main`

---

## 1. Goal & Context

Refine card interaction and exit behavior according to user directives:
1. **Card Click Action**: When the card itself (`[data-summon-card]`) is clicked once settled, flip the card (`this.flipCard()`) instead of dismissing the modal dialog. Dismissal remains triggered by clicking the backdrop outside the card, clicking the close button, or pressing Escape.
2. **Pure Slide-Down Dismissal**: In `closeTimeline`, the card must not scale down (`scale: 0.6`) and must not fade out (`opacity: 0`). It should slide down at full size (scale 1.0) and full opacity (1.0), animating `yPercent` downward out of view while keeping ThreeCardModel synchronized.

---

## 2. Requirements & Kinematic Specifications

### 2.1 Card Click-to-Flip
- In `CardSummonEngine.ts`:
  - Update `boundOnCardClick`:
    ```ts
    this.boundOnCardClick = (e: MouseEvent) => {
      e.stopPropagation();
      if (!this.isSettled || this.isDismissing) return;
      this.flipCard();
    };
    ```
  - In `boundOnModalClick`:
    - Ensure clicks on or inside `[data-summon-card]` do not dismiss the modal dialog:
      ```ts
      if ((e.target as HTMLElement).closest('[data-summon-card]')) {
        return;
      }
      ```
  - Lifecycle: `this.boundOnCardClick` is cleanly removed in `cleanupDomAndListeners()` and `destroy()`.

### 2.2 Pure Slide-Down Exit Trajectory
- In `closeTimeline`:
  - Card descent:
    ```ts
    this.closeTimeline.to(
      this.cardEl,
      {
        yPercent: 130, // Full viewport exit downward
        duration: 0.45,
        ease: 'power2.in',
        onUpdate: () => {
          this.syncThreeCardModel();
        },
      },
      0
    );
    ```
  - **No Scale**: Do not animate `scale: 0.6`. Scale remains at its current value (1.0).
  - **No Fade**:
    - Remove `opacity: 0` tween on `this.cardEl`.
    - Remove `opacity: 0` tween on `this.cardStageEl`.
  - In `syncThreeCardModel()`:
    - Driven on every frame as `yPercent` increases, translating the Three.js card mesh down to $posY \le -5.85$, sliding completely beneath the camera viewport.
  - Backdrop undim and unblur remains smooth (`opacity: 0`, `backdropFilter: blur(0px)`).
  - When `closeTimeline` completes, `cleanupDomAndListeners()` and `threeCardModel.destroy()` dispose all DOM and WebGL resources cleanly.

### 2.3 Front Concealment Overlay / Veil Color & Radius Update
- Match the front concealment veil/overlay to the dark obsidian card updates:
  - In `ThreeCardModel.ts`:
    - `VEIL_COLOR = new THREE.Color(0x020204);`
    - In custom shader: `diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.008, 0.008, 0.015), uVeilOpacity * 0.98);`
  - In `CardTextureGenerator.ts`:
    - Shroud base fill: `rgba(2, 2, 4, ${veilOpacity * 0.98})` (was `rgba(7, 7, 11, ...)`).
    - Shrouded state outer clip: `CardTextureGenerator.CARD_CORNER_RADIUS` (72, was 48).
    - Shrouded hairline border at gap 28: concentric radius $72 - 28 = 44$ (was 20).
  - In `CardSummonEngine.ts`:
    - `frontMask` class: `bg-[#020204]/90`.

### 2.4 Mouse Pointer Tilt Scoped Strictly to Card Hover
- User requirement: "card should only interact with mouse (rotation to face mouse) when mouse is hovering over it, else just hover in place animation."
- In `CardSummonEngine.ts`:
  - Attach `pointermove` and `pointerleave` directly to `this.cardEl` (or compute tilt relative to `cardEl.getBoundingClientRect()` and ignore pointer movement when outside card bounds).
  - Hovering over `cardEl`:
    - Calculates $(x, y)$ relative to `cardEl.getBoundingClientRect()`.
    - Pauses `idleFloatTween`.
    - Tweens `rotationY` and `rotationX` to face cursor.
  - Leaving `cardEl`:
    - Resets card rotation smoothly to resting orientation (`rotationY: this.isFlipped ? 180 : 0, rotationX: 0`).
    - Resumes `idleFloatTween` for continuous gentle in-place floating.
  - When pointer is over backdrop/outside `cardEl`:
    - Does NOT tilt the card; card continues in-place floating animation uninterrupted.

---

## 3. Architecture & Isolation Design

- Layer: Presentation / Engines (`portfolio/src/engines/card/CardSummonEngine.ts`).
- Public API unchanged (`flipCard()`, `close()`, `destroy()`, `isOpen()`).
- 100% isolated, clean disposal, zero residual event listeners.

---

## 4. Test-Driven Development (TDD) Plan

### 4.1 RED Phase (Failing Tests First)
In `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`:
1. **Update Card Click Test**:
   - Rename `closes the modal dialog when clicking anywhere on the card` to:
     `flips the card when clicking the card instead of dismissing the modal`.
   - Assert:
     - Dispatched click on `[data-summon-card]`.
     - `engine.isOpen()` remains `true`.
     - `onClose` is NOT called.
     - `engine.getCloseTimeline()` is `null`.
     - Card rotation / `isCardFlipped()` flips from `true` to `false`.
2. **Update Dismiss Animation Test**:
   - Update `animates card down to where it came from (yPercent: 120, scale: 0.6, opacity: 0) and syncs ThreeCardModel`:
     - Assert `yPercent` animates down ($\ge 120$).
     - Assert `scale` does NOT animate down to 0.6 (remains 1.0).
     - Assert `opacity` of cardEl remains 1.0 (does not tween to 0).
     - Assert `cardStageEl` opacity remains 1.0.
3. **Update Pointer Hover Tilt Interaction Test**:
   - In pointer interaction tests:
     - Pointermove on `modal` outside `cardEl` does NOT pause `idleFloatTween` or tilt the card.
     - Pointermove on `cardEl` rotates card to face mouse and pauses `idleFloatTween`.
     - Pointerleave from `cardEl` resumes `idleFloatTween` and resets rotation.
In `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`:
4. **Update Frosted Shroud Overlay Fill Test**:
   - Verify that frosted shroud overlay fill uses `rgba(2, 2, 4` (deep pitch obsidian) instead of outdated `rgba(7, 7, 11`.
5. Run tests to confirm RED failure.

### 4.2 GREEN Phase (Implementation)
1. In `CardSummonEngine.ts`:
   - Update `boundOnCardClick` to invoke `this.flipCard()` with `e.stopPropagation()`.
   - Add card guard in `boundOnModalClick`.
   - In `closeTimeline`, remove `scale: 0.6` and `opacity: 0` from `cardEl` and remove `cardStageEl` opacity tween.
2. Run tests to confirm all pass.

### 4.3 REFACTOR & Verification
1. Run `npm --prefix portfolio test` (verify all 26 suites, 340 tests pass).
2. Run `npm --prefix portfolio run build` (verify clean Vite build).

---

## 5. Implementation Checklist

- [x] Task 1: Write failing RED tests in `CardSummonEngine.test.ts`
- [x] Task 2: Verify RED test failure in Vitest
- [x] Task 3: Implement card click flip in `CardSummonEngine.ts`
- [x] Task 4: Implement pure slide-down dismiss animation without scale or fade in `CardSummonEngine.ts`
- [x] Task 5: Implement dark pitch-obsidian front overlay / veil color and radius update
- [x] Task 6: Implement pointer parallax rotation scoped strictly to card hover
- [x] Task 7: Run full test suite and confirm GREEN (100% pass)
- [x] Task 8: Run production build and verify 0 errors
- [x] Task 9: Update plan status to Completed
