# Three.js 3D Physical Card Model with Gilded Golden Edges Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Completed**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline Vector SVGs, Vitest

---

## 1. Goal Description
Transition the card summon engine from DOM/CSS 3D transforms to a true, hardware-accelerated **Three.js WebGL 3D Card Model**. This completely eliminates Chromium compositor blur bleed and coplanar Z-fighting, provides physical cardstock thickness (2.5mm bevel), adds luxury **gilded metallic golden edges** (`MeshStandardMaterial` PBR with dynamic specular reflections), renders both front and a new opulent **golden card back** as high-res 3x Retina canvas textures, and preserves the complete 5-phase reveal choreography with interactive 3D parallax tilt.

---

## 2. Architecture & Components

```
portfolio/src/engines/card/
├── CardSummonEngine.ts               # Modal orchestrator (DOM overlays + ThreeCardModel mount)
├── three/
│   ├── ThreeCardModel.ts             # Isolated Three.js WebGL Stage & 3D Card Entity
│   ├── CardTextureGenerator.ts       # 3x Retina Canvas/SVG vector texture rasterizer
│   └── __tests__/
│       └── ThreeCardModel.test.ts    # Comprehensive unit tests & lifecycle disposal
```

### Key Technical Specifications:
1. **Physical 3D Card Geometry**:
   - Aspect ratio $5:7$ with rounded corners ($R = 0.24$).
   - `THREE.ExtrudeGeometry` with physical depth $0.06$ scene units ($\approx 2.5\text{mm}$).
   - `THREE.MeshStandardMaterial` gilded gold rim (`color: 0xe5b85c`, `metalness: 0.85`, `roughness: 0.22`).
2. **Gilded Golden Back Texture**:
   - High-resolution SVG ($1050 \times 1470$, 3x Retina) with concentric guilloche geometry, 4 corner filigrees, radiating astronomical celestial rings, and Ace crest in warm metallic gold tones.
3. **Editorial Front Texture**:
   - High-DPI canvas texture ($1050 \times 1470$) with Swiss typography, golden "Mobile Developer" title, 5 stars, candidate portrait, Rare Edition badge, 3 single-row icon skills, and stat tickers.
4. **Zero Compositor Bleed & Zero Z-Fighting**:
   - The card core is a solid 3D mesh slab. The front and back textures sit on opposite exterior faces of the slab separated by physical thickness, making bleed through impossible.
5. **Lifecycle & Strict Disposal**:
   - Complete disposal of geometries, textures, materials, renderers, animation frames, and DOM canvas on `destroy()`.

---

## 3. Tasks Breakdown

- [x] **Task 1: Author Unit Tests for `ThreeCardModel` & `CardTextureGenerator`** (RED Phase)
- [x] **Task 2: Implement `CardTextureGenerator.ts` (Golden Card Back & Editorial Front)**
  - High-resolution SVG generator `generateGoldenCardBackSvg` with 3x Retina viewBox `0 0 1050 1470`, guilloche pattern, 4 symmetrical corner filigrees, celestial halo rings, cardinal diamond nodes, and central Ace crest.
  - High-DPI canvas texture `generateGoldenCardBackTexture` with linear mipmap filtering and sRGB color space.
  - Editorial luxury canvas texture `generateFrontCardTexture` featuring Swiss typography, role header, star rating, portrait window, boxed skills, stat progress bars, and accreditation footer.
  - TDD unit tests covering valid rendering, theme adaptation, fallback defaults, and happy-dom execution (13/13 unit tests passed, Suite 4 in `ThreeCardModel.test.ts` passed).
- [x] **Task 3: Implement `ThreeCardModel.ts` (Extruded Geometry, Gilded Gold Edges, WebGL Stage)**
  - Construct physical 3D card assembly within `cardGroup`:
    - Rounded rectangle path (width = 3.5, height = 4.9, corner radius = 0.24, centered at origin).
    - `card-slab` (`THREE.ExtrudeGeometry` with depth 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, centered on Z) using `THREE.MeshStandardMaterial` (`color: 0xe5b85c`, `metalness: 0.85`, `roughness: 0.22`, `name: 'gilded-gold'`).
    - `card-front` (`THREE.ShapeGeometry` centered with normalized UVs) with `MeshStandardMaterial` displaying `frontTexture` (`position.z = 0.031`, `name: 'card-front'`).
    - `card-back` (`THREE.ShapeGeometry` centered with normalized UVs) with `MeshStandardMaterial` displaying `backTexture` (`position.z = -0.031`, `rotation.y = Math.PI`, `name: 'card-back'`).
    - `card-veil` (`THREE.ShapeGeometry` centered with normalized UVs) with frosted obsidian `MeshBasicMaterial` (`color: 0x050508`, `transparent: true`, `opacity: 1.0`, `position.z = 0.032`, `name: 'card-veil'`).
  - WebGL Lifecycle Management:
    - `mount(container)`: creates `WebGLRenderer` (antialias, alpha, high-performance with headless fallback), sets up `PerspectiveCamera` (fov 45, aspect, z=7), ambient + key directional + rim lights, attaches domElement, starts safe RAF loop.
    - `resize(width, height)`: guards `w <= 0 || h <= 0`, updates camera aspect and projection matrix, calls `renderer.setSize(w, h, false)`.
    - `destroy()`: cancels RAF, unmounts canvas from container, disposes all geometries, materials, textures, and renderer safely and idempotently.
  - Dynamic transform & visual controls:
    - `setRotation`, `setPosition`, `setScale` for card orientation/translation/scale.
    - `setVeilOpacity(o)` / `getVeilOpacity()` with [0, 1] clamping and visibility toggling.
    - `setSheenProgress(p)` / `getSheenProgress()` for specular highlights.
  - All 20 tests in `ThreeCardModel.test.ts` passing; 234/234 tests across portfolio green; production build verified.
- [x] **Task 4: Integrate `ThreeCardModel` into `CardSummonEngine.ts` & Wire GSAP Timelines**
  - Integrated `ThreeCardModel` into `CardSummonEngine`:
    - Instantiated and mounted inside `cardStage` (`[data-summon-card-stage]`) on `open()`.
    - Added public getter `getThreeCardModel(): ThreeCardModel | null`.
    - Synchronized 3D card transforms (`setRotation`, `setPosition`, `setScale`) with GSAP `openTimeline` via `syncThreeCardModel()` and `onUpdate`.
    - Wired `flipCard()` to smoothly animate between front (180° / `Math.PI` rad) and golden back (0 rad).
    - Wired `toggleConcealment()` to smoothly animate frosted obsidian veil opacity via `setVeilOpacity()`.
    - Connected `pointermove` and `pointerleave` parallax tilt to 3D rotation.
    - Added continuous `sheenTween` progress forwarding to `setSheenProgress()`.
    - Hidden DOM card faces (`opacity: 0`) to eliminate compositor blur bleed while keeping semantic DOM structure for accessibility and automated testing.
    - Idempotent disposal of `ThreeCardModel` in `cleanupDomAndListeners()` on modal close and engine destruction.
  - Added 5 TDD unit tests in `CardSummonEngine.test.ts` covering mounting, GSAP sync, flipCard, toggleConcealment, and teardown (58/58 tests passing).
- [x] **Task 5: Comprehensive Verification (Vitest 200+ tests, build, manual inspection)**
  - Vitest test suite: 239/239 passing across 24 test suites in portfolio (`npm --prefix portfolio test`).
  - Production build: `npm --prefix portfolio run build` succeeds cleanly (`tsc && vite build`) in ~3.0s with zero errors.
  - Integration verified: Three.js 3D physical card model fully replaces CSS DOM blur bleed during 3D rotations, accurately preserves 5-phase summon choreography, interactive parallax tilt, smooth flip transitions, and gilded champagne-gold edges.
