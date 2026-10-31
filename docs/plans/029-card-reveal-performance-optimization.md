# Card Reveal Performance & 60FPS Optimization Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Completed**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), WebGL GLSL Shaders, Vanilla TypeScript, GSAP 3, Vitest
- **Branch**: `feat/card-shine-effect`

---

## 1. Problem Statement & Root Cause (Systematic Debugging)

### Symptom:
During the 3D profile card reveal sequence ($t = 1.30\text{s} \to 2.15\text{s}$), the animation experiences severe stutter and frame rate drops (dropping from 60 FPS down to 15-20 FPS).

### Root Cause Analysis:
1. **Per-Frame $1050 \times 1470$ Canvas Re-Rasterization**:
   - In `CardSummonEngine.ts`, two concurrent GSAP tweens run during Phase 4 & Phase 6:
     - `revealAnimState` (`foilWipe: 0 -> 1`, `veil: 1 -> 0`) at 60 FPS ($1.30\text{s} \to 1.85\text{s}$).
     - `statsAnimState` (`stars: 0 -> 1`, `bars: 0 -> 1`) at 60 FPS ($1.45\text{s} \to 2.15\text{s}$).
   - `setFoilWipeProgress`, `setVeilOpacity`, and `setStatsAnimationProgress` each synchronously called `this.redrawFrontTexture()`.
   - In overlapping frames ($1.45\text{s} \to 1.85\text{s}$), `redrawFrontTexture()` executed up to **3 times in a single frame**!
2. **Synchronous GPU-to-CPU Readback Pipeline Stall (`getImageData`)**:
   - In `CardTextureGenerator.drawFrontCardContent`, `ctx.getImageData(portraitX, portraitY, 954, 520)` was executed every time to run a CPU software desaturation loop (`desaturatePixels`) across 1.98 million bytes.
   - `getImageData` forces the browser's compositor and GPU to synchronously flush the graphics pipeline and read back pixels to CPU memory, causing an immediate 15-30ms freeze.
3. **Massive WebGL Texture Re-Allocation & Mipmap Generation (`gl.texImage2D` + `gl.generateMipmap`)**:
   - Every `redrawFrontTexture()` set `this.frontTexture.needsUpdate = true`.
   - In `ThreeCardModel.renderLoop()`, Three.js called `gl.texImage2D`, uploading 6.17 Megabytes of uncompressed RGBA pixel data to GPU VRAM every frame.
   - Because `frontTexture.generateMipmaps = true`, WebGL recalculated 10 levels of downsampled mipmaps on the GPU on every frame.
   - Moving ~490 MB/sec over the bus on the main thread completely exhausted the 16.6ms frame budget.

---

## 2. Architecture & Optimization Design

```
+--------------------------------------------------------------------------+
|                        GPU Fragment Shader Path                          |
|                                                                          |
|   Static Base Front Texture (1050x1470)  ----> Resident in VRAM (0 B/s)  |
|                                                                          |
|   GSAP Tweens (60 FPS)                   ----> Float Uniform Updates     |
|   - uVeilOpacity: 1.0 -> 0.0                   - 0.0001 ms CPU time      |
|   - uFoilWipeProgress: 0.0 -> 1.0              - 0 bytes texture upload  |
|                                                                          |
|   frontMaterial.onBeforeCompile:                                         |
|   - Evaluates -35 deg diagonal wipe projection in parallel on GPU cores  |
|   - Unrevealed side: frosted obsidian veil tint                          |
|   - Wipe cut edge: luminous champagne-gold specular gleam band          |
|   - Revealed side: full pristine crisp diffuse card face                 |
|   - Settled state (uVeilOpacity <= 0.001): 0% shader overhead            |
+--------------------------------------------------------------------------+
```

### Key Technical Decisions:
1. **Hardware-Accelerated Diagonal Foil Wipe via `frontMaterial.onBeforeCompile`**:
   - Pass float uniforms `uVeilOpacity` and `uFoilWipeProgress` to `frontMaterial`.
   - Calculate diagonal projection: $p = \vec{\text{uv}} \cdot (\cos(-35^\circ), \sin(-35^\circ))$.
   - Mix dark obsidian veil on unrevealed pixels and apply champagne-gold specular sheen band on the threshold line directly in GLSL.
   - `setVeilOpacity(o)` and `setFoilWipeProgress(p)` update the shader uniforms and material color without redrawing canvas or flagging `needsUpdate`.
2. **GPU Canvas Filter for Portrait Desaturation (`ctx.filter`)**:
   - In `CardTextureGenerator.drawFrontCardContent`, check `typeof ctx.filter === 'string'` and apply `ctx.filter = 'grayscale(100%)'` directly before `drawImage`, eliminating `getImageData` calls in real browsers.
   - Maintain the safe fallback for headless mock contexts.
3. **Static Full-Fidelity Front Card Base**:
   - Render the front card canvas texture once on initialization (and once when user photo finishes loading).
   - `setStatsAnimationProgress` updates tracking state without per-frame texture uploads.
4. **Zero Main-Thread Bus Stalls**:
   - `frontTexture.needsUpdate` is NEVER set during reveal animation frames.
   - Texture re-upload frequency drops from 60-180 uploads/second to **0 uploads/second** during reveal!

---

## 3. Implementation Tasks (Strict TDD)

### Task 1: Author Performance & Non-Regressing Unit Tests in `ThreeCardModel.test.ts`
- **Files:** `portfolio/src/engines/card/three/__tests__/ThreeCardModel.test.ts`
- **Test Specifications:**
  1. `setVeilOpacity` and `setFoilWipeProgress` do NOT trigger canvas redraws or set `frontTexture.needsUpdate = true` on every frame call.
  2. `customUniforms.uVeilOpacity.value` and `customUniforms.uFoilWipeProgress.value` update accurately to match progress values.
  3. `frontMaterial.onBeforeCompile` registers custom uniforms and injects the diagonal wipe shader logic into the fragment shader.
  4. Portrait image loading still triggers a single texture update on `img.onload`.
  5. All existing contract methods (`getVeilOpacity`, `getFoilWipeProgress`, `getStatsAnimationProgress`, `setRotation`, `destroy`) remain 100% compliant.
- [x] Step 1: Write new unit tests in `ThreeCardModel.test.ts`.
- [x] Step 2: Run test suite to verify (RED phase).
- [x] Step 3: Git commit test specifications.

### Task 2: Implement GPU Shader Wipe & Optimize `ThreeCardModel.ts`
- **Files:** `portfolio/src/engines/card/three/ThreeCardModel.ts`
- **Changes:**
  1. Add `customUniforms` (`uVeilOpacity`, `uFoilWipeProgress`).
  2. Implement `frontMaterial.onBeforeCompile` with GLSL diagonal wipe & champagne-gold specular sweep injection.
  3. Update `setVeilOpacity`, `setFoilWipeProgress`, and `setStatsAnimationProgress` to update uniforms and state without calling `redrawFrontTexture()`.
  4. Update `redrawFrontTexture()` to render the base card face cleanly.
- [x] Step 1: Implement shader & uniform updates in `ThreeCardModel.ts`.
- [x] Step 2: Run test suite to verify (GREEN phase).
- [x] Step 3: Git commit implementation.

### Task 3: Optimize `CardTextureGenerator.ts` to Eliminate `getImageData` Pipeline Stalls
- **Files:** `portfolio/src/engines/card/three/CardTextureGenerator.ts`
- **Changes:**
  1. Use `ctx.filter = 'grayscale(100%)'` prior to `drawImage` when `ctx.filter` is available.
  2. Avoid calling `getImageData` on browser canvases with native filter support.
- [x] Step 1: Implement canvas filter optimization in `CardTextureGenerator.ts`.
- [x] Step 2: Run `CardTextureGenerator.test.ts` and verify all tests pass.
- [x] Step 3: Git commit optimization.

### Task 4: Full Verification Across All Suites & Production Build
- **Files:** Full test suite, Vite build.
- [x] Step 1: Run `npm --prefix portfolio test`.
- [x] Step 2: Run `npm --prefix portfolio run build`.
- [x] Step 3: Verify silky smooth 60 FPS reveal in browser.
