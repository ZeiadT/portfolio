# Pokémon Secret Rare Holo Card Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Completed

**Goal:** Implement an authentic "Secret Rare / Legendary Pokémon Card" etched holographic effect using WebGL2 (GLSL ES 3.00) that programmatically traces image contours, line art, edges, and specular highlights in real time, mounted into the portfolio portrait card.

**Architecture:** A standalone, isolated WebGL2 engine (`src/engines/holo/HoloCardEngine.ts`) manages canvas creation, shader compilation, dynamic derivative contour detection, procedural micro-etching, cosine rainbow iridescence, lerped physics loop, and 3D perspective card tilt. `ProfileAvatarComponent` mounts this engine with seamless fallback to standard `<img>` in headless / unsupported environments.

**Tech Stack:** Vanilla TypeScript, WebGL2 (GLSL ES 3.00), Vite 6, Tailwind CSS v4, Vitest.

## Global Constraints
- Zero external library dependencies for the shader or physics (pure WebGL2 API and requestAnimationFrame).
- Strict component isolation: `HoloCardEngine` must have a self-contained lifecycle (`mount`, `resize`, `destroy`) with zero DOM or memory leaks.
- Graceful degradation: in environments without WebGL2 (e.g. JSDOM), standard `<img>` must render cleanly without errors.
- Strict TDD: all tests must be written and observed failing before implementation code is written.

---

### Task 1: Create HoloCardEngine Test Specification & Verification Fixtures

**Files:**
- Test: `portfolio/src/engines/holo/__tests__/HoloCardEngine.test.ts`

**Interfaces:**
- Produces: `HoloCardEngine` with interface:
  ```typescript
  export interface HoloCardEngineOptions {
    imageSrc: string;
    alt?: string;
    edgeSensitivity?: number;
    holoIntensity?: number;
    maxTiltDeg?: number;
    targetEl?: HTMLElement; // Element to apply 3D tilt CSS to
  }

  export class HoloCardEngine {
    constructor(options: HoloCardEngineOptions);
    public mount(container: HTMLElement): void;
    public resize(): void;
    public destroy(): void;
    public isSupported(): boolean;
  }
  ```

- [x] **Step 1: Write the unit tests for HoloCardEngine**

```typescript
// portfolio/src/engines/holo/__tests__/HoloCardEngine.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HoloCardEngine } from '../HoloCardEngine';

describe('HoloCardEngine', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('instantiates and mounts a canvas element into the container', () => {
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    const canvas = container.querySelector<HTMLCanvasElement>('canvas[data-holo-canvas]');
    expect(canvas).toBeTruthy();
    expect(canvas?.className).toContain('absolute inset-0');

    engine.destroy();
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('gracefully reports unsupported when WebGL2 context is unavailable in JSDOM', () => {
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    expect(engine.isSupported()).toBe(false);
    engine.destroy();
  });

  it('initializes mock WebGL2 context and compiles shaders without throwing', () => {
    const mockGl = {
      createShader: vi.fn().mockReturnValue({}),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      getShaderParameter: vi.fn().mockReturnValue(true),
      createProgram: vi.fn().mockReturnValue({}),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      getProgramParameter: vi.fn().mockReturnValue(true),
      useProgram: vi.fn(),
      createBuffer: vi.fn().mockReturnValue({}),
      bindBuffer: vi.fn(),
      bufferData: vi.fn(),
      getAttribLocation: vi.fn().mockReturnValue(0),
      enableVertexAttribArray: vi.fn(),
      vertexAttribPointer: vi.fn(),
      getUniformLocation: vi.fn().mockReturnValue({}),
      uniform1i: vi.fn(),
      uniform1f: vi.fn(),
      uniform2f: vi.fn(),
      createTexture: vi.fn().mockReturnValue({}),
      bindTexture: vi.fn(),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      viewport: vi.fn(),
      drawArrays: vi.fn(),
      deleteProgram: vi.fn(),
      deleteShader: vi.fn(),
      deleteBuffer: vi.fn(),
      deleteTexture: vi.fn(),
      getExtension: vi.fn().mockReturnValue({ loseContext: vi.fn() }),
    };

    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((type: string) => {
      if (type === 'webgl2') return mockGl as unknown as WebGL2RenderingContext;
      return null;
    }) as any;

    try {
      const targetCard = document.createElement('div');
      container.appendChild(targetCard);

      const engine = new HoloCardEngine({
        imageSrc: '/profile.jpg',
        targetEl: targetCard,
      });
      engine.mount(container);

      expect(engine.isSupported()).toBe(true);
      expect(mockGl.createShader).toHaveBeenCalledTimes(2);
      expect(mockGl.createProgram).toHaveBeenCalledTimes(1);

      engine.destroy();
      expect(mockGl.deleteProgram).toHaveBeenCalled();
      expect(mockGl.deleteTexture).toHaveBeenCalled();
    } finally {
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it('disposes animation frame and removes event listeners on destroy', () => {
    const cancelRafSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const engine = new HoloCardEngine({ imageSrc: '/profile.jpg' });
    engine.mount(container);

    engine.destroy();
    expect(cancelRafSpy).toHaveBeenCalled();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm --prefix portfolio test -- HoloCardEngine`
Expected: FAIL because `HoloCardEngine` does not exist yet.

- [x] **Step 3: Commit test file**

```bash
git add portfolio/src/engines/holo/__tests__/HoloCardEngine.test.ts
git commit -m "test: add HoloCardEngine unit test specification"
```

---

### Task 2: Implement HoloCardEngine with GLSL ES 3.00 Shader Pipeline

**Files:**
- Create: `portfolio/src/engines/holo/HoloCardEngine.ts`

**Interfaces:**
- Consumes: `HoloCardEngineOptions`
- Produces: `HoloCardEngine` with full WebGL2 rendering pipeline, derivative contour tracing, micro-etching normal perturbation, spectral rainbow iridescence, additive glint, and lerped 3D tilt.

- [x] **Step 1: Write HoloCardEngine implementation**

Implement `portfolio/src/engines/holo/HoloCardEngine.ts`:
- Shaders:
  - `VERTEX_SHADER`: `#version 300 es\nin vec2 a_position;\nout vec2 v_uv;\nvoid main() { v_uv = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5)); gl_Position = vec4(a_position, 0.0, 1.0); }`
  - `FRAGMENT_SHADER`: Full GLSL ES 3.00 pipeline with `dFdx`/`dFdy` contour tracing, `etch`, perturbed normals, cosine palette `0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)))`, `pow(spec, 2.5) * traceMask * u_holoIntensity`, and `pow(spec, 8.0) * edge * 0.6` glint.
- Physics:
  - `requestAnimationFrame` damping loop (`lerp factor 0.1`) smoothly tracking pointer position `[-1.0, 1.0]`.
  - CSS 3D tilt on `targetEl`: `perspective(900px) rotateX(${currY * -maxTilt}deg) rotateY(${currX * maxTilt}deg) scale3d(1.03, 1.03, 1.03)`.
  - Smooth reset to `(0, 0)` on `mouseleave` and `touchend`.
- Lifecycle:
  - `mount(container)`
  - `resize()` handling `devicePixelRatio` buffer sizing.
  - `destroy()` releasing textures, buffers, program, rAF loop, event listeners, and loseContext extension.

- [x] **Step 2: Run test to verify it passes**

Run: `npm --prefix portfolio test -- HoloCardEngine`
Expected: PASS

- [x] **Step 3: Commit implementation**

```bash
git add portfolio/src/engines/holo/HoloCardEngine.ts
git commit -m "feat: implement WebGL2 Pokemon HoloCardEngine"
```

---

### Task 3: Integrate HoloCardEngine into ProfileAvatarComponent

**Files:**
- Modify: `portfolio/src/components/home/ProfileAvatar.ts`
- Modify: `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts`

**Interfaces:**
- `ProfileAvatarComponent` instantiates `HoloCardEngine` targeting `data-avatar-card`.
- Maintains fallback `<img>` and monogram fallback if image fails to load.
- Cleans up `HoloCardEngine` on `destroy()`.

- [x] **Step 1: Update ProfileAvatar tests for HoloCardEngine integration**

Update `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts` to assert:
- `data-holo-canvas` element is mounted inside card.
- Clean portrait image is retained as base texture/fallback.
- Edge-to-edge uppercase title `MOBILE DEVELOPER` remains intact.
- Destroys HoloCardEngine on `avatar.destroy()`.

- [x] **Step 2: Run test to verify failure**

Run: `npm --prefix portfolio test -- ProfileAvatar`
Expected: FAIL asserting canvas exists.

- [x] **Step 3: Update ProfileAvatar.ts implementation**

Integrate `HoloCardEngine` into `ProfileAvatarComponent`:
- Import `HoloCardEngine`.
- In `mount()`, instantiate `HoloCardEngine` with `imageSrc: this.config.src`, `targetEl: this.cardEl`, and mount it into `this.cardEl`.
- In `destroy()`, call `this.holoEngine?.destroy()`.

- [x] **Step 4: Run test to verify it passes**

Run: `npm --prefix portfolio test -- ProfileAvatar`
Expected: PASS

- [x] **Step 5: Commit integration**

```bash
git add portfolio/src/components/home/ProfileAvatar.ts portfolio/src/components/home/__tests__/ProfileAvatar.test.ts
git commit -m "feat: integrate WebGL2 HoloCardEngine into ProfileAvatarComponent"
```

---

### Task 4: Full Suite Verification & Build

**Files:**
- All touched files

- [x] **Step 1: Run all unit tests**

Run: `npm --prefix portfolio test`
Expected: PASS across all test suites (120+ tests).

- [x] **Step 2: Run Vite production build**

Run: `npm --prefix portfolio run build`
Expected: Build succeeds with code 0 (`tsc && vite build`).

- [x] **Step 3: Commit completed feature documentation**

```bash
git add docs/plans/015-pokemon-holo-card-engine.md
git commit -m "docs: complete pokemon holo card engine plan"
```

---

### Task 5: Code Review Refinements (UV Aspect Ratio, Idle Loop Suspension, CSS Cleanup, Canvas Cleanup)

**Files:**
- Modify: `portfolio/src/engines/holo/HoloCardEngine.ts`
- Modify: `portfolio/src/engines/holo/__tests__/HoloCardEngine.test.ts`
- Modify: `portfolio/src/components/home/ProfileAvatar.ts`
- Modify: `portfolio/src/components/home/__tests__/ProfileAvatar.test.ts`

**Issues to Resolve:**
1. **Aspect Ratio UV Correction (`object-cover object-top`)**:
   - Shaders currently sample `texture(u_image, v_uv)` directly, which distorts images whose aspect ratio differs from the canvas aspect ratio.
   - Add `u_uvScale` (`vec2`) and `u_uvOffset` (`vec2`) uniforms to fragment shader.
   - Texture lookup becomes `vec2 texUV = v_uv * u_uvScale + u_uvOffset; vec4 base = texture(u_image, texUV);`.
   - Procedural etching and cosine rainbow math continue to operate on screen `v_uv` coordinates.
   - Implement `updateUvTransform()` to compute `scaleX`, `scaleY`, `offsetX`, `offsetY` matching CSS `object-cover object-top`. Call it on image load and `resize()`.
2. **CSS Transition Conflict on Avatar Card**:
   - Remove `transition-transform duration-200 hover:scale-[1.02]` from `ProfileAvatar.ts` `data-avatar-card`.
   - The rAF physics loop already smoothly interpolates 3D tilt and `scale3d(1.03, 1.03, 1.03)` with damped lerp; CSS transition causes stutter and frame fighting.
3. **Idle Loop Suspension (Battery & GPU efficiency)**:
   - Suspend rAF loop when card returns to neutral rest (`targetX === 0 && targetY === 0 && |currX| < 0.0005 && |currY| < 0.0005`).
   - Reset transform to `''`, render final neutral frame, set `rafId = null`.
   - Restart loop via `startLoop()` on pointer interaction.
   - Render static frame on image load and resize if loop is suspended.
4. **Orphaned Canvas Cleanup on Unsupported WebGL2**:
   - In `HoloCardEngine.ts`: If `getContext('webgl2')` fails or returns null, or shader compilation fails, remove `<canvas>` from DOM and null reference (`this.canvas?.remove(); this.canvas = null;`).
   - Clean portrait `<img>` remains completely unobstructed without a transparent canvas overlying it.

- [x] **Step 1: Update unit tests for new behavior and edge cases**
- [x] **Step 2: Run tests to verify expected failures**
- [x] **Step 3: Implement engine and component refinements**
- [x] **Step 4: Run all tests and verify PASS**
- [x] **Step 5: Run production build and commit**

