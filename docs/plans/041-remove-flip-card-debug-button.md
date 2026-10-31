# Remove Flip Card Debug Button Implementation Plan

- **Status**: Completed
- **Created**: 2026-11-01
- **Completed**: 2026-11-01
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Vitest
- **Branch**: `main`

---

## 1. Goal & Context

In Plan 036, a temporary floating debug button (`[data-summon-flip]`) was added to the top-left of the summon modal to allow quick inspection of the 3D card back during development. In Plan 040, direct card click-to-flip (`[data-summon-card]`) was implemented, rendering the temporary debug button redundant.

The user has requested:
> "remove the flip card debug button and push to remote main"

This task removes the debug button and all its associated lifecycle logic while verifying that card click flipping remains completely intact and clean.

---

## 2. Requirements & Specification

### 2.1 DOM & Engine Cleanup in `CardSummonEngine.ts`
1. Remove instance properties:
   - `private flipBtnEl: HTMLButtonElement | null = null;`
   - `private boundOnFlipClick: ((e: MouseEvent) => void) | null = null;`
2. Remove DOM creation:
   - Delete floating debug flip button creation and `modal.appendChild(flipBtn)`.
3. Remove event listeners:
   - Delete click listener assignment and registration `flipBtn.addEventListener('click', this.boundOnFlipClick)`.
   - Remove `(e.target as HTMLElement).closest('[data-summon-flip]')` guard in `boundOnModalClick`.
4. Remove dismissal animation:
   - Remove `flipBtnEl` fade-out tween from `closeTimeline`.
5. Remove cleanup logic:
   - Remove `this.flipBtnEl.removeEventListener(...)` in `detachInteractiveListeners()`.
   - Remove `this.flipBtnEl.remove()` and nulling in `cleanupDomAndListeners()`.

### 2.2 Preservation of Native Card Flip
- Clicking directly on the card (`[data-summon-card]`) continues to call `this.flipCard()` with full rotation animation and Three.js mesh synchronization.

---

## 3. Test-Driven Development (TDD) Plan

### 3.1 RED Phase
In `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`:
- Under `describe('Blur-Fade Dismissal Hint & Click-Anywhere-To-Close UX')`:
  - Assert that `[data-summon-flip]` is `null`:
    ```ts
    expect(document.querySelector('[data-summon-flip]')).toBeNull();
    ```
- Run Vitest to verify that this assertion fails (RED), because `[data-summon-flip]` is currently mounted.

### 3.2 GREEN Phase
- Remove the debug button and all its hooks from `CardSummonEngine.ts`.
- Run Vitest to verify that the test now passes (GREEN).

### 3.3 Verification & Push
- Run `npm --prefix portfolio test` across all suites (340 tests).
- Run `npm --prefix portfolio run build` to confirm clean production bundle.
- Commit changes and push directly to `origin main`.
