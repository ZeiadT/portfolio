# Design Specification: Reverse-Sink Bento Grid Reveal Animation

**Date**: 2026-11-01  
**Status**: Approved  
**Author**: Antigravity Assistant & Zeiad Mohammed  
**Context**: Portfolio Landing to Main Screen Transition  

---

## 1. Overview & Vision
When the user clicks the `#enter-pill` on the landing curtain, the splash marquee band ascends to dock into the fixed 38px top navigation bar while the ASCII background stage sinks into the distance.

This feature implements the **Reverse-Sink Bento Grid Reveal Animation**, choreographing the 5 Bento Grid cards to surface out of deep spatial perspective in exact inverse correspondence to the ASCII background sinking physics.

---

## 2. Motion Concept: Inverse Depth Elevation

### 2.1 Optical & Spatial Mapping
The background sink animation in `transitionTimeline.ts` is defined as:
```typescript
tl.to(background, {
  opacity: 0,
  filter: 'blur(24px)',
  y: 24,
  scale: 0.96,
  duration: TRANSITION_TIMINGS.upwardAscent,
  ease: TRANSITION_EASES.backgroundSink, // 'power2.inOut'
  force3D: true,
}, 'ascent');
```

The Bento Grid reveal mirrors this in reverse:
* **Initial State (Hidden)**:
  - `y: 24px` (recessed in lower spatial plane)
  - `scale: 0.96` (recessed depth perspective)
  - `filter: blur(12px)` (calibrated optical defocus, avoiding heavy shader recomputation)
  - `opacity: 0`
  - `willChange: 'transform, opacity, filter'`
* **Arrival Target (Resting)**:
  - `y: 0`
  - `scale: 1.0`
  - `filter: blur(0px)`
  - `opacity: 1`
  - `clearProps: 'filter, willChange'` upon completion for 60/120fps lock and crisp typography.

---

## 3. Choreography & Identity-First Sequencing

### 3.1 Card Order
Rather than a mechanical left-to-right grid sweep or bottom-up drop, cards emerge along an **Identity-First** visual storytelling hierarchy:

1. **Card 1 (t = 0.00s)**: `Hero Right Card` (`[data-bento-hero-right]`) — 3D Avatar & Identity Card. Locks foveal gaze first.
2. **Card 2 (t = 0.08s)**: `Hero Left Card` (`[data-bento-hero-left]`) — Socials, Quote, and Direct Contact bar.
3. **Card 3 (t = 0.16s)**: `Globe Card` (`[data-bento-globe]`) — 3D Cobe WebGL interactive dot globe.
4. **Card 4 (t = 0.24s)**: `Education Card` (`[data-bento-education]`) — Milestones & Academic credentials.
5. **Card 5 (t = 0.32s)**: `Summary Card` (`[data-bento-summary]`) — Editorial summary narrative bio.

### 3.2 Physics & Timings
* **Stagger Gap**: `0.08s` (80ms between card start times).
* **Card Tween Duration**: `0.55s` per card.
* **Easing Pairs**:
  - `y` and `scale`: `back.out(1.1)` (providing a tactile micro-spring cushion as each card docks into its magnetic cell).
  - `opacity` and `filter`: `power2.out` (de-blurring smoothly and quickly so text becomes legible right as spatial motion halts, satisfying the Saccadic Suppression Rule).

---

## 4. Master Timeline Integration (`transitionTimeline.ts`)
* **Trigger Point**: Label `'ascent'` marks the upward motion of the brand bar.
* **Handoff Offset**: `ascent + 0.40s` (`TRANSITION_TIMINGS.bentoRevealStart = 0.40s`).
* As the brand bar traverses past the vertical midpoint of the screen, the Bento cards begin emerging from deep space.
* By the time the brand bar docks into `y: 0` (duration 1.30s), all 5 cards have smoothly settled into their resting grid slots.

---

## 5. Architectural Boundaries & Component Isolation
* **`BentoRevealController` (`src/components/home/BentoRevealController.ts`)**:
  - Pure, isolated animation controller owning the initial state preparation, timeline creation, and teardown.
  - Exposes `prepareInitialState()`, `createRevealTimeline(options?: BentoRevealOptions)`, and `destroy()`.
* **Zero Layout Shift**: Initial states use GPU-composited transforms (`y`, `scale`, `opacity`, `filter`). Layout box geometry remains unchanged.
* **Accessibility**: Full support for `prefers-reduced-motion`:
  - When `reducedMotion: true` is passed, transforms and blurs are bypassed; cards fade in gently over `0.4s` via `opacity: 0 -> 1`.
* **Disposal**: `destroy()` method kills active GSAP tweens and clears all inline styles with `clearProps: 'all'`.

---

## 6. Verification & Test Strategy
* **Unit Tests (`BentoRevealController.test.ts`)**:
  - Verify initial hidden state values (`y: 24`, `scale: 0.96`, `opacity: 0`, `filter: blur(12px)`).
  - Verify sequence timeline creation, duration, and stagger order (Hero Right first $\to$ Hero Left $\to$ Globe $\to$ Education $\to$ Summary).
  - Verify `clearProps` execution after timeline completion.
  - Verify reduced motion bypasses transforms and blurs.
  - Verify `destroy()` cleans up tweens and DOM styles without leaks.
* **Integration Tests (`transitionTimeline.test.ts`)**:
  - Verify `bentoController.createRevealTimeline()` is scheduled at `ascent + 0.40s`.
