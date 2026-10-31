# Debug Flip Card Button Implementation Plan

- **Status**: Retired (Superseded by 040 & 041: card click-to-flip enabled, debug button removed)
- **Created**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Three.js
- **Branch**: `main`

---

## 1. Goal

User feedback:
> "add a button to flip the card (only for debugging and to see the back side, will be removed later so no need to tests)"

Provide a temporary, sleek floating debug button `[data-summon-flip]` inside the card summon modal that invokes `this.flipCard()`, allowing immediate inspection and verification of the golden star-crest card back.

---

## 2. Implementation

1. **Button Creation in `CardSummonEngine.open()`**:
   - Create floating button with `data-summon-flip` attribute.
   - Position in top-left corner (`top-6 left-6 z-50`).
   - Clean luxury styling: `bg-amber-400/20 text-amber-200 border border-amber-400/40 rounded-full font-mono text-xs uppercase px-4 py-2 backdrop-blur-md`.
   - Accessible SVG rotate/flip icon and text label "Flip Card".
2. **Event Handling & Isolation**:
   - Click handler calls `e.stopPropagation(); this.flipCard();`.
   - Prevent modal background dismissal when clicking flip button (`(e.target as HTMLElement).closest('[data-summon-flip]')`).
   - Animate `rotationY` between 180 (front) and 0 (back) and reset `rotationX: 0`.
3. **Lifecycle & Cleanup**:
   - Fade out button in `closeTimeline`.
   - Cleanly detach event listener and remove DOM element in `cleanupDomAndListeners()`.

