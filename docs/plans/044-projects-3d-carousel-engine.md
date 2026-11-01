# Feature 1 (Stream A): 3D WebGL Project Carousel Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance, responsive 3D WebGL Project Carousel Engine (`CarouselGLEngine`) displaying 6 native/cross-platform flagship projects on a curved cylindrical perspective track with spring-damped inertial kinematics, audio ticks, vermilion particle shockwaves, and keyboard snapping.

**Architecture:** A decoupled Clean Architecture component system where `CarouselKinematics` governs 1D-to-3D math and physics, `CarouselShader` provides cylindrical projection and Rec.601 luma desaturation, `AudioClickSynth` synthesizes mechanical audio ticks, `VermilionParticleBurst` produces kinetic particle shockwaves, `CarouselGestureController` captures unified pointer/wheel/keyboard input, and `ProjectsSection` orchestrates the DOM container lifecycle.

**Tech Stack:** Vanilla TypeScript 5+, Vite 6, Three.js 0.160+, GSAP 3.12+, Web Audio API, Vitest.

## Global Constraints
- Target worktree: `../portfolio-projects` on branch `feat/projects-carousel-engine`.
- Zero Direct File Copying: `Demos/artemii-carousel-replica/` is used strictly as an algorithmic and mathematical reference; all code is written from scratch in clean, strongly-typed TypeScript.
- Strict TDD: Write failing tests before implementation code for all kinematic math, inertial dampening, audio synthesis, and lifecycle disposal.
- Component Isolation: `CarouselGLEngine` and `ProjectsSection` must implement explicit `mount(container: HTMLElement)`, `destroy()`, and `resize?()` lifecycles with zero memory leaks (clean WebGL disposal, no lingering event listeners or rAF loops).
- Spring Damping Factor: `0.92`.
- Snap easing: `power3.out`.

---

### Task 1: Carousel Kinematics & Math Library

**Files:**
- Create: `portfolio/src/engines/carousel/CarouselKinematics.ts`
- Test: `portfolio/src/engines/carousel/__tests__/CarouselKinematics.test.ts`

**Interfaces:**
- Consumes: `Project` domain type from `src/domain/types.ts`.
- Produces: `CarouselKinematics` class with:
  - `scrollForIndex(index: number, count: number, unit: number): number`
  - `indexFromScroll(scrollX: number, count: number, unit: number): number`
  - `clampScroll(scrollX: number, count: number, unit: number): number`
  - `calculateWarp(velocity: number, currentWarp: number, isDragging: boolean): number`
  - `applyInertialDamping(velocity: number, dampingFactor?: number): number` (default `0.92`)
  - `project3DToScreen(worldPos: { x: number; y: number; z: number }, cameraFov: number, cameraZ: number, viewportWidth: number, viewportHeight: number): { x: number; y: number }`

- [ ] **Step 1: Write failing tests for CarouselKinematics**
Create `portfolio/src/engines/carousel/__tests__/CarouselKinematics.test.ts` asserting:
- `scrollForIndex` returns symmetrical coordinates centered around index 0 to N-1.
- `indexFromScroll` correctly computes nearest discrete index.
- `clampScroll` strictly confines values between min and max bounds.
- `calculateWarp` yields non-linear deformation bounded between [-1.5, 1.5] and decays toward 0.
- `applyInertialDamping` reduces velocity by factor 0.92 per step, snapping to 0 when $|v| < 0.0001$.
- `project3DToScreen` projects normalized camera coordinates to pixel coordinates.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/engines/carousel/__tests__/CarouselKinematics.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement CarouselKinematics**
Create `portfolio/src/engines/carousel/CarouselKinematics.ts` implementing the pure math and kinematics functions.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/engines/carousel/__tests__/CarouselKinematics.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
`git add src/engines/carousel/CarouselKinematics.ts src/engines/carousel/__tests__/CarouselKinematics.test.ts`
`git commit -m "feat(carousel): implement pure kinematics and projection math with 0.92 damping"`

---

### Task 2: Synthesized Mechanical Audio Tick (`AudioClickSynth`)

**Files:**
- Create: `portfolio/src/engines/carousel/AudioClickSynth.ts`
- Test: `portfolio/src/engines/carousel/__tests__/AudioClickSynth.test.ts`

**Interfaces:**
- Consumes: Native Web Audio API (`window.AudioContext` or `webkitAudioContext`).
- Produces: `AudioClickSynth` class with:
  - `playClick(pitch?: number, gain?: number): void`
  - `triggerIndexCrossing(newIndex: number): void`
  - `destroy(): void`

- [ ] **Step 1: Write failing tests for AudioClickSynth**
Create `portfolio/src/engines/carousel/__tests__/AudioClickSynth.test.ts` mocking `AudioContext` and asserting:
- Gracefully handles environments without Web Audio API (headless/SSR/node) without throwing.
- `playClick()` creates an oscillator and gain node with exponential decay envelope (10ms-15ms duration) at ~1.2kHz.
- `triggerIndexCrossing()` triggers `playClick()` only when index actually changes, not on repeated identical indices.
- Disables sound if user preferences indicate muted or context is closed.
- `destroy()` closes the AudioContext and releases all resources.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/engines/carousel/__tests__/AudioClickSynth.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement AudioClickSynth**
Create `portfolio/src/engines/carousel/AudioClickSynth.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/engines/carousel/__tests__/AudioClickSynth.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
`git add src/engines/carousel/AudioClickSynth.ts src/engines/carousel/__tests__/AudioClickSynth.test.ts`
`git commit -m "feat(carousel): implement zero-asset Web Audio mechanical click synthesizer"`

---

### Task 3: Vermilion Particle Shockwave Burst (`VermilionParticleBurst`)

**Files:**
- Create: `portfolio/src/engines/carousel/VermilionParticleBurst.ts`
- Test: `portfolio/src/engines/carousel/__tests__/VermilionParticleBurst.test.ts`

**Interfaces:**
- Consumes: Three.js `Scene`, `Vector3`.
- Produces: `VermilionParticleBurst` class with:
  - `trigger(origin: THREE.Vector3): void`
  - `update(deltaTime: number): void`
  - `destroy(): void`

- [ ] **Step 1: Write failing tests for VermilionParticleBurst**
Create `portfolio/src/engines/carousel/__tests__/VermilionParticleBurst.test.ts` asserting:
- `trigger(origin)` creates a burst of vermilion (`#ff4421`) particles (30-60 particles) with radial outwards velocities.
- `update(dt)` expands particle positions, applies drag, and reduces alpha/size.
- Completed particles are culled and active state is updated.
- `destroy()` disposes all geometries, materials, and removes meshes from scene.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/engines/carousel/__tests__/VermilionParticleBurst.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement VermilionParticleBurst**
Create `portfolio/src/engines/carousel/VermilionParticleBurst.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/engines/carousel/__tests__/VermilionParticleBurst.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
`git add src/engines/carousel/VermilionParticleBurst.ts src/engines/carousel/__tests__/VermilionParticleBurst.test.ts`
`git commit -m "feat(carousel): implement 3D vermilion particle shockwave burst"`

---

### Task 4: Card Texture Generator & Shader Pipeline

**Files:**
- Create: `portfolio/src/engines/carousel/shaders/carouselShaders.ts`
- Create: `portfolio/src/engines/carousel/ProjectCardTexture.ts`
- Test: `portfolio/src/engines/carousel/__tests__/ProjectCardTexture.test.ts`

**Interfaces:**
- Consumes: `Project` from `src/domain/types.ts`, Three.js `CanvasTexture`, `ShaderMaterial`.
- Produces:
  - `CAROUSEL_VERT_SHADER` and `CAROUSEL_FRAG_SHADER` with exponential cylinder roll, edge bend, vertical bow curve, and Rec.601 luma desaturation.
  - `ProjectCardTexture` class generating crisp 2D canvas representations for each of the 6 projects (Dusk, Cargo, Gusto, SportX, ElevatED, Wireless Mouse) with typography, accent color, tags, and category badge.

- [ ] **Step 1: Write failing tests for ProjectCardTexture**
Create `portfolio/src/engines/carousel/__tests__/ProjectCardTexture.test.ts` asserting:
- Generates 16:9 canvas with device-pixel-ratio scaling for any valid `Project`.
- Renders title, category, year, and accent pill accurately.
- Creates and updates Three.js `CanvasTexture`.
- `dispose()` cleans up canvas references and texture memory.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/engines/carousel/__tests__/ProjectCardTexture.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement ProjectCardTexture and shaders**
Create `portfolio/src/engines/carousel/shaders/carouselShaders.ts` and `portfolio/src/engines/carousel/ProjectCardTexture.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/engines/carousel/__tests__/ProjectCardTexture.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
`git add src/engines/carousel/shaders/carouselShaders.ts src/engines/carousel/ProjectCardTexture.ts src/engines/carousel/__tests__/ProjectCardTexture.test.ts`
`git commit -m "feat(carousel): add cylindrical roll shaders and card texture generator"`

---

### Task 5: Gesture, Touch, Mousewheel & Keyboard Navigation Controller

**Files:**
- Create: `portfolio/src/engines/carousel/CarouselGestureController.ts`
- Test: `portfolio/src/engines/carousel/__tests__/CarouselGestureController.test.ts`

**Interfaces:**
- Consumes: DOM container, `CarouselKinematics`, callbacks for index change, drag status, and card double-click.
- Produces: `CarouselGestureController` class with:
  - Pointer drag & touch swiping with inertial momentum.
  - Wheel scrolling with threshold debounce.
  - Keyboard arrow navigation (`←` / `→`) triggering GSAP `power3.out` snapping.
  - Card hover tilt detection ($\pm 12^\circ$).
  - Double-click detection for particle shockwave triggering.
  - `destroy()` removing all event listeners.

- [ ] **Step 1: Write failing tests for CarouselGestureController**
Create `portfolio/src/engines/carousel/__tests__/CarouselGestureController.test.ts` asserting:
- Listens to pointerdown, pointermove, pointerup, pointercancel with pointer capture.
- Computes drag delta and updates scroll target.
- Wheel events trigger discrete index transitions.
- Keydown ArrowRight/ArrowDown and ArrowLeft/ArrowUp advance and rewind index with bounds clamping.
- Rapid double pointerdown on active card triggers double-click callback (< 300ms window).
- `destroy()` cleans up 100% of attached listeners on container and window.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/engines/carousel/__tests__/CarouselGestureController.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement CarouselGestureController**
Create `portfolio/src/engines/carousel/CarouselGestureController.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/engines/carousel/__tests__/CarouselGestureController.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
`git add src/engines/carousel/CarouselGestureController.ts src/engines/carousel/__tests__/CarouselGestureController.test.ts`
`git commit -m "feat(carousel): implement unified gesture, wheel, touch, and keyboard controller"`

---

### Task 6: Complete 3D WebGL Carousel Engine (`CarouselGLEngine`)

**Files:**
- Modify: `portfolio/src/engines/carousel/index.ts`
- Test: `portfolio/src/engines/carousel/__tests__/CarouselGLEngine.test.ts`

**Interfaces:**
- Implements: `Engine` (`id = 'carousel-gl'`, `mount(container: HTMLElement)`, `destroy()`, `resize()`).
- Integrates:
  - Three.js WebGLRenderer, PerspectiveCamera, Scene.
  - 3-replica track geometry projecting the 6 projects.
  - `CarouselKinematics`, `AudioClickSynth`, `VermilionParticleBurst`, `CarouselGestureController`.
  - Receding cards have perspective curvature, lighting falloff, and Rec.601 luma desaturation (`uGray`).
  - Active card centered in full focus.
  - `onProjectSelect?: (project: Project, index: number) => void`.

- [ ] **Step 1: Write failing tests for CarouselGLEngine**
Create `portfolio/src/engines/carousel/__tests__/CarouselGLEngine.test.ts` asserting:
- `mount(container)` initializes Three.js scene, camera, renderer, meshes for all projects, and gesture controller.
- `setSelectedIndex(index, immediate)` smoothly navigates to target project and updates audio click.
- Active card has `uGray = 0` (color), receding cards transition toward `uGray = 1` (desaturated).
- Double clicking active card triggers `VermilionParticleBurst`.
- `resize()` recalculates camera aspect, renderer viewport, and shader uniforms.
- `destroy()` cleanly disposes renderer, scene, meshes, materials, textures, rAF loop, and audio synth.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/engines/carousel/__tests__/CarouselGLEngine.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement CarouselGLEngine in index.ts**
Refactor `portfolio/src/engines/carousel/index.ts` with complete integration.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/engines/carousel/__tests__/CarouselGLEngine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
`git add src/engines/carousel/index.ts src/engines/carousel/__tests__/CarouselGLEngine.test.ts`
`git commit -m "feat(carousel): implement complete curved 3D WebGL CarouselGLEngine"`

---

### Task 7: Projects DOM Section Component & App Shell Integration

**Files:**
- Create: `portfolio/src/components/home/ProjectsSection.ts`
- Modify: `portfolio/src/main.ts`
- Modify: `portfolio/index.html`
- Test: `portfolio/src/components/home/__tests__/ProjectsSection.test.ts`

**Interfaces:**
- Produces: `ProjectsSection` component with `mount(container: HTMLElement)` and `destroy()`.
- Renders: Section header, active project indicators, Prev/Next navigation controls, and mounts `CarouselGLEngine` into `#carousel-container`.
- Unhides `#carousel-container` in `index.html` and wires clean lifecycle in `main.ts`.

- [ ] **Step 1: Write failing tests for ProjectsSection**
Create `portfolio/src/components/home/__tests__/ProjectsSection.test.ts` asserting:
- Renders section markup, project counter (`01 / 06`), and navigation buttons.
- Mounts `CarouselGLEngine` into the carousel container.
- Prev/Next button clicks navigate the carousel and update DOM counter.
- Keydown left/right arrows sync with DOM index.
- `destroy()` unmounts engine, removes listeners, and cleans up DOM.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test src/components/home/__tests__/ProjectsSection.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement ProjectsSection and wire in main.ts and index.html**
Create `portfolio/src/components/home/ProjectsSection.ts`, update `portfolio/index.html` (unhide `#carousel-container`), and update `portfolio/src/main.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test src/components/home/__tests__/ProjectsSection.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
`git add src/components/home/ProjectsSection.ts src/components/home/__tests__/ProjectsSection.test.ts src/main.ts index.html`
`git commit -m "feat(projects): add ProjectsSection component and wire into app shell"`

---

### Task 8: Full Verification & Integration Test Suite

**Files:**
- Test all: `npm test`
- Build check: `npm run build`

- [ ] **Step 1: Run complete test suite**
Run: `npm test`
Expected: All test suites pass (baseline 29 files + all new carousel suites, 0 failures).

- [ ] **Step 2: Run production build**
Run: `npm run build`
Expected: Vite build succeeds with 0 TypeScript and bundling errors.

- [ ] **Step 3: Commit final integration milestone**
`git commit -m "chore(projects): verify full test suite and clean production build"`
