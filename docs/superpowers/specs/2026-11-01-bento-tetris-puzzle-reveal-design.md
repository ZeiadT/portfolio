# Bento Grid 2-Step Tetris Puzzle Reveal Specification

## 1. Overview & Vision
This specification defines the kinetic choreography for introducing the Bento Grid onto the viewport during the transition from the initial splash screen (the vermilion elastic band + ASCII shader background) into the main application.

Instead of a generic monolithic page slide or plain opacity fade, the Bento Grid emerges through a **2-Step Tetris Puzzle Assembly**:
1. **Step 1: Ghost Wireframe Blueprint ($t = 0.80\text{s} \to 1.20\text{s}$)**: As the elastic band ascends toward the top navigation bar and the ASCII water background blurs and sinks, delicate glowing wireframe outlines trace onto the screen, marking the empty coordinates for the 5 bento grid slots.
2. **Step 2: Foundation-Up Tetris Cascade ($t = 1.20\text{s} \to 1.95\text{s}$)**: The instant the band docks into the top nav bar, the content blocks drop down from above into their designated slots, stacking from the foundation up and locking into place with a mechanical snap and a subtle vermilion hairline flash.

---

## 2. Bento Grid Elements & Visual Hierarchy

The Bento Grid consists of 5 self-contained cards:
- **Top Row (12 cols total)**:
  - `[data-bento-hero-left="true"]` (7 cols): Hero Statement, Social Badges, Quote, Contact & Resume buttons.
  - `[data-bento-hero-right="true"]` (5 cols): Glowing 3D Portrait Identity Card with holographic border & role badge.
- **Bottom Row (12 cols total)**:
  - `[data-bento-education="true"]` (3 cols): Milestone Education list.
  - `[data-bento-globe="true"]` (3 cols): Interactive WebGL 3D Globe ("Based in Egypt, available globally").
  - `[data-bento-summary="true"]` (6 cols): Summary narrative card with icon badge.

---

## 3. Choreography & Physics Specification

### Timeline Integration
The transition timeline is built using GSAP 3 within `src/engines/band/transitionTimeline.ts` (or coordinated via `BentoRevealController` in `src/components/home/BentoRevealController.ts`).

- `ascent` begins at `t = startMotionTime` ($0.15\text{s}$) and runs for $1.30\text{s}$, docking at $t = 1.45\text{s}$.
- Wireframe tracing starts during band ascent at $t = 0.85\text{s}$ (overlapping with background water sink).
- The Tetris block drop starts at $t = 1.20\text{s}$, culminating as the band reaches its docked nav position.

```
Time:
0.00s               0.85s                    1.20s                             1.95s
  │                   │                        │                                 │
  ├─ Band Ascends ────┼─ Wireframes Trace ────►│ Band Docks into Nav Bar         │
  │  ASCII Blur/Sink  │  (Borders glow & sketch)├─ Step 2: Tetris Cascade Drops   │
  │                   │                        │  1. Education (3 cols)          │
  │                   │                        │  2. Globe (3 cols)              │
  │                   │                        │  3. Summary (6 cols)            │
  │                   │                        │  4. Hero Left Quote (7 cols)    │
  │                   │                        │  5. Hero Right Portrait (5 cols)│
  │                   │                        │  [Mechanical Snap & Glow Flash] │
  ▼                   ▼                        ▼                                 ▼
```

### Detailed Phase Parameters

#### Phase 1: Ghost Wireframes Blueprint ($t = 0.85\text{s} \to 1.20\text{s}$)
- Target: Bento card outline boundaries (`border` & pseudo-element/box shadow).
- Initial State: Wireframe opacity $0$.
- Animation:
  - `opacity`: $0 \to 1$ (`duration: 0.35s`, `ease: "power2.out"`).
  - `border-color`: `rgba(255, 68, 33, 0.3)` morphing to `rgba(255, 255, 255, 0.1)`.
- The actual card contents (text, buttons, avatar, canvas) remain elevated and hidden:
  - `y: -36px`, `opacity: 0`.

#### Phase 2: Foundation-Up Tetris Cascade ($t = 1.20\text{s} \to 1.95\text{s}$)
Cards drop from above into their designated wireframe slots, adhering to classic Tetris foundation-first logic:

1. **Bottom Row Foundation ($t = 1.20\text{s}$ start)**:
   - **Education Card (Left 3 cols)**:
     - Start: `y: -32px`, `opacity: 0`.
     - End: `y: 0`, `opacity: 1`.
     - Duration: $0.45\text{s}$, `ease: "back.out(1.4)"`.
   - **Globe Card (Middle 3 cols)**:
     - Start time: $t = 1.28\text{s}$ ($+80\text{ms}$ stagger).
     - Start: `y: -32px`, `opacity: 0`, `scale: 0.94`.
     - End: `y: 0`, `opacity: 1`, `scale: 1.0`.
     - Duration: $0.45\text{s}$, `ease: "back.out(1.4)"`.
   - **Summary Card (Right 6 cols)**:
     - Start time: $t = 1.36\text{s}$ ($+80\text{ms}$ stagger).
     - Start: `y: -32px`, `opacity: 0`.
     - End: `y: 0`, `opacity: 1`.
     - Duration: $0.45\text{s}$, `ease: "back.out(1.4)"`.

2. **Top Row Hero Slam ($t = 1.48\text{s}$ start)**:
   - **Hero Card 1 (Left 7 cols - Quote & Contact)**:
     - Start time: $t = 1.48\text{s}$.
     - Start: `y: -40px`, `opacity: 0`.
     - End: `y: 0`, `opacity: 1`.
     - Duration: $0.50\text{s}$, `ease: "back.out(1.3)"` (heavier mass).
   - **Hero Card 2 (Right 5 cols - 3D Identity Card)**:
     - Start time: $t = 1.56\text{s}$ ($+80\text{ms}$ stagger).
     - Start: `y: -40px`, `rotationX: -6deg`, `opacity: 0`.
     - End: `y: 0`, `rotationX: 0deg`, `opacity: 1`.
     - Duration: $0.50\text{s}$, `ease: "back.out(1.3)"`.

#### The Mechanical Snap & Hairline Glow Flash
- At the exact moment each card hits $y = 0$, its hairline border flashes:
  - `box-shadow`: pulse to `0 0 16px rgba(255, 68, 33, 0.4)` for $80\text{ms}$, transitioning back to `0 8px 32px rgba(0, 0, 0, 0.37)`.
  - The mechanical snap uses `back.out` overshoot of $\sim 2\text{--}3\text{px}$ before locking securely into place.

---

## 4. Architecture & Component Boundaries

### Separation of Concerns
1. **`BentoRevealController` (`src/components/home/BentoRevealController.ts`)**:
   - Manages the bento grid's DOM state and GSAP reveal timelines.
   - Provides methods:
     - `prepareInitialState()`: Sets up the initial hidden/elevated transforms and wireframe opacity without causing layout thrashing.
     - `createRevealTimeline()`: Builds and returns the GSAP timeline instance for the 2-step wireframe + Tetris drop animation.
     - `destroy()`: Disposes of active tweens, clears inline transform properties, and restores neutral styles.
2. **`transitionTimeline.ts`**:
   - Coordinates the overarching page transition.
   - Receives the `bentoController` or triggers `createRevealTimeline()` alongside band ascent and background sink.
   - Replaces the generic single-block `#app` translation with the orchestrated card reveal.

---

## 5. Non-Functional Requirements & Performance

- **Zero Layout Thrashing**: Animations are strictly bound to CSS `transform` (`translateY`, `scale`, `rotateX`) and `opacity`.
- **GPU Acceleration**: `will-change: transform, opacity` is applied only during tween playback and stripped on completion via GSAP `clearProps: "willChange"`.
- **Memory Management**: All GSAP timelines and tweens are cleanly killed and references dereferenced in `destroy()`.
- **Accessibility (`prefers-reduced-motion`)**:
  - If `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true:
    - Skip physical drops, overshoots, and rotation.
    - Perform a simple, elegant simultaneous cross-fade ($0.4\text{s}$, `opacity: 0 -> 1`).

---

## 6. Testing Strategy (Strict TDD)

Tests will be implemented before production code:
- **`BentoRevealController.test.ts`**:
  - Verify `prepareInitialState()` sets `opacity: 0` and appropriate `translateY` on all 5 bento elements.
  - Verify `createRevealTimeline()` returns a valid GSAP timeline with correct stagger order (Education -> Globe -> Summary -> Hero Left -> Hero Right).
  - Verify reduced motion check bypasses `translateY` drops.
  - Verify `destroy()` kills timeline and cleans up inline styles.
- **`transitionTimeline.test.ts`**:
  - Verify that the bento reveal animation is correctly invoked within the master band transition timeline.
