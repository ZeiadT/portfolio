# Feature Design Spec: Portrait Card Continuous Clean Shimmer

- **Date**: 2026-10-30
- **Feature**: Continuous Clean Shimmer on Profile Portrait Card
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

---

## 1. Executive Summary & Design Vision
Add an ultra-clean, continuous diagonal glass sheen animation across the profile portrait card in the home hero section. Unlike hover-triggered or heavy rainbow holographic effects, this shimmer plays continuously in a calm, periodic cycle (2.5s sweep across the card followed by a 3.5s peaceful rest), presenting an understated, high-end editorial reflection.

---

## 2. Visual & Aesthetic Architecture

### Shimmer Beam Layer
- **Container**: Anchored directly within `[data-avatar-card]`, clipped cleanly by `overflow-hidden` and rounded card borders (`rounded-2xl sm:rounded-3xl`).
- **Element**: Dedicated overlay `<div data-avatar-shine class="pointer-events-none absolute -inset-full opacity-0 ...">`.
- **Gradient Composition**:
  - Angle: `115deg`.
  - Color stops:
    - `0%`: `transparent`
    - `30%`: `rgba(255, 255, 255, 0.03)`
    - `50%`: `rgba(255, 255, 255, 0.18)` (peak gentle highlight)
    - `70%`: `rgba(255, 255, 255, 0.03)`
    - `100%`: `transparent`
  - Blend mode: `mix-blend-mode: overlay` (ensuring rich shadows and skin tones are preserved without blowing out contrast or causing milky washouts).

---

## 3. Motion & Animation Architecture (GSAP Timeline)

### Kinetic Choreography
- **Initial Setup**:
  - The sheen overlay is sized `200%` width/height and positioned offscreen diagonally at top-left (`xPercent: -100, yPercent: -100`).
- **Timeline Specs**:
  - Controlled via a dedicated GSAP timeline:
    ```typescript
    this.shineTimeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 3.5,
    });
    this.shineTimeline.fromTo(
      shineEl,
      { xPercent: -100, yPercent: -100, opacity: 0 },
      {
        xPercent: 100,
        yPercent: 100,
        opacity: 1,
        duration: 2.5,
        ease: 'power2.inOut',
      }
    );
    ```
- **Cycle Timing**:
  - Sweep duration: `2.5s`
  - Rest delay between sweeps: `3.5s`
  - Total loop period: `6.0s`
- **Accessibility & Reduced Motion**:
  - Queries `window.matchMedia('(prefers-reduced-motion: reduce)')`.
  - If enabled, the timeline is not started and the shine element remains completely hidden (`opacity: 0`), preventing vestibular strain.

---

## 4. Component Lifecycle & Teardown Protocol

- **Mount (`mount(container: HTMLElement)`)**:
  - Injects `data-avatar-shine` element inside `data-avatar-card`.
  - Initializes GSAP shimmer timeline if reduced motion is false.
- **Teardown (`destroy()`)**:
  - Calls `this.shineTimeline?.kill()`.
  - Nullifies timeline reference and removes DOM elements cleanly.
  - Zero memory leaks or dangling animation tickers.

---

## 5. Testing & Verification Strategy (Strict TDD)

### Unit Tests in `ProfileAvatar.test.ts`:
1. **Shine Element Mounting**:
   - Asserts `data-avatar-shine` element exists inside `[data-avatar-card]` with `pointer-events-none`, `absolute`, and `mix-blend-overlay`.
2. **GSAP Timeline Initialization**:
   - Asserts `gsap.timeline` is created with `{ repeat: -1, repeatDelay: 3.5 }`.
   - Asserts `fromTo` is invoked with diagonal travel (`xPercent: -100` to `100`).
3. **Accessibility (prefers-reduced-motion)**:
   - When `matchMedia('(prefers-reduced-motion: reduce)').matches` is true, asserts timeline is NOT played.
4. **Lifecycle Disposal**:
   - Asserts `shineTimeline.kill()` is called upon `avatar.destroy()`.

---

## 6. Ponytail Evaluation
- **Smallest Working Diff**: A single lightweight overlay div inside `ProfileAvatar.ts` and a 6-line GSAP timeline using already installed `gsap`.
- **Zero New Dependencies**: Reuses GSAP and Tailwind CSS.
- **Zero Bloat**: No custom physics loops, no canvas/WebGL shaders, no extra event listeners.
