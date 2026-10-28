# 002 - BOC Splash Screen & Elastic Top Navigation Implementation Plan

- **Status**: Ready for Implementation
- **Created**: 2026-10-28
- **Last Updated**: 2026-10-28

---

## 1. Goal & Context
Build a zero-flicker splash screen inspired by BOC Studio that transitions on user click into an elastic top navigation bar, featuring frosted glass cursor guidance ("Click to enter"), calibrated non-glitching rubber physics, seamless logo migration, and animated nav tab hovers.

---

## 2. Requirements & Constraints
- Primary color: `#ff4421` (vermilion), dark neutral `#0d0d0d`, background `#0a0a0c`.
- Wordmark brand name: `"Zeiad Mohammed"`.
- Zero direct file copying from reference demos; rewrite from scratch with clean TypeScript architecture.
- Strict TDD: failing tests covering boundaries, lifecycle, and teardown must pass before code is committed.
- Drop-in reusability: Engines and components must implement standard `mount(container)`, `destroy()`, `resize()`.
- **Motion Choreography & Easing Rules**:
  - **Curtain Collapse**: Starts slow, ends fast (`ease: 'power3.in'`, `duration: 0.85s`).
  - **Logo Migration**: Smooth ease-in-out (`ease: 'power2.inOut'`, `duration: 0.9s`), animating color from `#0d0d0d` to `#ffffff`.
  - **Cursor Pill**: Reveals slowly on load (`duration: 1.0s`, `ease: 'power2.out'`), hides rapidly on click (`duration: 0.2s`, `ease: 'power3.in'`).
  - **Nav Tabs Reveal**: Staggers in with a noticeable delay *after* the logo completes its prominent glide (`delay: 0.2s`, `duration: 0.4s`), ensuring undivided focus on the logo.

---

## 3. Architecture & Approach (Approach A)
- **Unified DOM Typography**: Authoritative DOM elements for splash logo, docked logo, and nav tabs eliminate rasterization mismatch, subpixel jitter, and text flicker.
- **Elastic Canvas Underlay**: WebGL canvas placed beneath typography renders calibrated vermilion (`#ff4421`) rubber ribbon deformation with gentle tension, zero tears, and velocity clamping.
- **GSAP Orchestrated Timeline**: Smoothly transitions full-screen curtain (`100vh`) into docked header (`h-16`), glides logo to left padding (`px-8`), morphs logo color to white, and reveals navigation tabs on the right.

---

## 4. Tasks & TDD Breakdown
1. **Frosted Glass Cursor Tip (`src/components/cursor/CursorTip.ts`)**:
   - `CursorTip.test.ts`: Lifecycle mounting, tracking, slow entrance, fast hiding, DOM disposal.
2. **Calibrated Band Physics Engine (`src/engines/band/bandPhysics.ts`)**:
   - `bandPhysics.test.ts`: Lattice spring dynamics, neutral texture packing, force clamping.
3. **Elastic Band WebGL Renderer (`src/engines/band/index.ts`)**:
   - `bandEngine.test.ts`: WebGL initialization, viewport resizing, event binding, `destroy()` cleanup.
4. **Splash-to-Band Orchestrator (`src/engines/band/splashTimeline.ts`)**:
   - `splashTimeline.test.ts`: Timeline generation with slow-start fast-end curtain collapse, ease-in-out logo migration, and delayed nav tab entrance.
5. **App Shell Integration (`portfolio/index.html`, `src/main.ts`, `src/style.css`)**:
   - Connect splash curtain to user click, activate band on completion, verify tab hover transitions.

---

## 5. Verification Plan
- Unit tests: `cd portfolio && npm test`
- Build & typecheck: `cd portfolio && npm run build`
- Visual checks: Zero-flicker transition, frosted glass pill tracking, subtle rubber interaction, and animated tab hovers.
