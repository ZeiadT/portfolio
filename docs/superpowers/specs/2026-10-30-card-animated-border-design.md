# Feature Design Spec: Portrait Card Animated Orbiting Border

- **Date**: 2026-10-30
- **Feature**: Continuous Orbiting Vermilion & White Hairline Border on Profile Portrait Card
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

---

## 1. Executive Summary & Design Vision
Add an elegant, continuous orbiting border beam around the portrait photo card in the home hero section. Inspired by luxury tech card aesthetics (Linear, Raycast), a sharp 1.5px border track carries a signature vermilion (`#ff4421`) comet with a bright white leading edge that smoothly orbits the rounded perimeter once every 7.0 seconds. Behind the border, a low-opacity blurred replica casts a subtle ambient halo into the dark background, giving the card dimensional depth without visual clutter.

---

## 2. Visual Architecture & Geometry

### 1. Structure & Layering
Around the `data-avatar-card` container:
- **Outer Bloom Layer (`data-avatar-border-glow`)**:
  - Position: `absolute -inset-[2px]` (matching `rounded-2xl sm:rounded-3xl`).
  - Sizing: Contains an oversized rotating square with `conic-gradient`.
  - Filter: `blur-md opacity-25 pointer-events-none`.
  - Effect: Softly illuminates the perimeter in vermilion.
- **Hairline Border Layer (`data-avatar-border-track`)**:
  - Position: `absolute -inset-[1.5px] rounded-2xl sm:rounded-3xl p-[1.5px] overflow-hidden pointer-events-none`.
  - Base Track: `border border-white/10` fallback.
  - Conic Beam Element (`data-avatar-border-beam`):
    - Sized `w-[250%] h-[250%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`.
    - Gradient: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #ff4421 335deg, rgba(255, 255, 255, 0.95) 360deg)`.
- **Inner Card (`data-avatar-card`)**:
  - `relative z-10 w-full aspect-[4/5] rounded-2xl sm:rounded-3xl bg-neutral-900/90 overflow-hidden`.
  - Contains portrait image and continuous surface shimmer.

---

## 3. Motion Architecture (GSAP Animation)

### Rotation Tween
- Controlled via a GSAP tween:
  ```typescript
  this.borderTimeline = gsap.to(
    [beamEl, glowBeamEl],
    {
      rotation: 360,
      duration: 7,
      ease: 'none',
      repeat: -1,
    }
  );
  ```
- **Pacing**: Exact 7.0s linear rotation (`ease: 'none'`), continuous loop (`repeat: -1`).
- **Accessibility & Reduced Motion**:
  - Queries `window.matchMedia('(prefers-reduced-motion: reduce)')`.
  - If active, rotation tween is not started; beam remains stationary or hidden to eliminate vestibular discomfort.

---

## 4. Component Lifecycle & Teardown Protocol

- **Mount (`mount(container: HTMLElement)`)**:
  - Defensive check: `if (this.borderTimeline) this.borderTimeline.kill();`.
  - Injects border wrapper, bloom layer, and beam elements into the DOM.
  - Starts 7s rotation tween if reduced motion is disabled.
- **Teardown (`destroy()`)**:
  - `this.borderTimeline?.kill(); this.borderTimeline = null;`.
  - Removes all event listeners and DOM nodes cleanly with zero residual animation tickers or memory leaks.

---

## 5. Strict TDD Verification Strategy

### Unit Tests in `ProfileAvatar.test.ts`:
1. **DOM Elements**: Asserts presence of border beam (`data-avatar-border-beam`) and glow elements with proper positioning, border radius, and conic-gradient.
2. **GSAP Rotation**: Asserts GSAP tween is initialized with `{ rotation: 360, duration: 7, ease: 'none', repeat: -1 }`.
3. **Accessibility**: Asserts rotation is not started when `prefers-reduced-motion: reduce` matches.
4. **Lifecycle**: Asserts `borderTimeline.kill()` is called upon `avatar.destroy()`.

---

## 6. Ponytail & Architecture Evaluation
- **Smallest Working Diff**: Self-contained within `ProfileAvatarComponent`.
- **Zero New Dependencies**: Uses existing GSAP and standard CSS `conic-gradient`.
- **Performance**: GSAP transforms `rotation` on GPU compositor layers; zero layout reflows.
