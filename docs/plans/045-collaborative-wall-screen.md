# Feature 045: The Wall Screen (Collaborative Guestbook Canvas) Implementation Plan

- **Status**: Proposed
- **Created**: 2026-11-01
- **Last Updated**: 2026-11-01
- **Target Worktree**: `../portfolio-wall` (`feat/collaborative-wall-screen`)

---

## 1. Goal & Context

Feature 2 from the portfolio architectural roadmap: **The Wall Screen (Collaborative Guestbook Canvas)**.
A dedicated, highly creative interactive full-screen canvas where visitors, recruiters, and fellow engineers leave permanent/session drawings, sticky notes, developer stickers, and reactions.

This feature must be 100% self-contained, isolated, and implemented as an `Engine` (`WallEngine`), conforming to `docs/rules.md` and `docs/decision-making.md`.

---

## 2. Requirements & Constraints

1. **Infinite/Bounded Panning Canvas Viewport**:
   - Virtual coordinate space of $4000 \times 4000\text{px}$ centered around $(0,0)$.
   - Smooth 2D panning (pointer drag) and pinch/wheel zoom ($0.25\times \to 2.0\times$) with sub-pixel hardware acceleration.
   - Constellation View: When zoom is $\le 0.50$, active items glow with neon city skyline luminescence and background turns into a starfield grid.

2. **Floating HUD Creative Toolbar**:
   - **Drawing Tools**: Pen and Marker with variable stroke width ($2\text{px} \to 24\text{px}$) and Midpoint Quadratic Bézier curve smoothing.
   - **Cyber Color Palette**: Vermilion (`#ff4421`), Electric Cyan (`#00f0ff`), Acid Lime (`#ccff00`), Gold (`#ffd700`), White (`#ffffff`), and custom native HTML5 hex picker.
   - **Sticky Note Tool**: Tap to drop editable markdown sticky notes with subtle paper tilt ($\pm 4^\circ$), drop shadows, and like counters.
   - **Sticker & Media Import**: Preset developer vector stickers (Android Bugdroid, Kotlin KMP, Tux Penguin, Coffee Mug) + client-side downscaled image upload (max $512\text{px}$).
   - **History Controls**: Stack-based Undo, Redo, and Eraser.

3. **Storage & Service Architecture (`WallService`)**:
   - Offline-first cache utilizing browser `IndexedDB` (`portfolio_wall` database, `items` store).
   - Graceful fallback to `localStorage` if IndexedDB is blocked or restricted.
   - Clean API contract (`GET /api/wall/items`, `POST /api/wall/items`) prepared for serverless sync.
   - Rich mock seed dataset in `src/data/mockWallMessages.ts` featuring witty international visitor notes and doodles.

4. **Entertaining Micro-Interactions & Easter Eggs**:
   - **Spray-Can Rattle**: Selecting the spray/brush tool and shaking the mouse cursor ($\Delta v > 800\text{px/s}$) triggers an authentic spray-can rattle sound synthesized via the native Web Audio API (`AudioContext`) with zero audio files.
   - **Secret Holographic Stamp**: Typing `egg` on the keyboard unlocks a golden holographic badge stamp with chromatic sheen.

5. **Lifecycle & Cleanliness**:
   - Implement `Engine` (`mount`, `destroy`, `resize`).
   - Clean disposal of all DOM elements, event listeners, rAF tickers, and Web Audio nodes on `destroy()`.
   - Strict TDD: Write failing tests before implementation code for coordinate transforms, stroke smoothing, history stack, storage service, and engine lifecycle.

---

## 3. Architecture & Isolation Design (Approach A: Hybrid Canvas 2D + DOM Overlay)

```
portfolio/src/
├── domain/
│   └── types.ts                    # WallItem, WallItemType, Engine, ViewState
├── data/
│   └── mockWallMessages.ts         # Initial pre-populated guestbook notes, doodles, stickers
├── services/
│   └── WallService.ts              # Offline-first IndexedDB storage with localStorage fallback
├── engines/
│   └── wall/
│       ├── WallEngine.ts           # Orchestrator implementing Engine (mount, destroy, resize)
│       ├── ViewportController.ts   # Panning (drag), Zooming (wheel/pinch 0.25x-2.0x), Constellation mode
│       ├── CanvasDrawingLayer.ts   # HTML5 2D Canvas: Bézier smoothing, brush widths, cyber colors, eraser
│       ├── DomItemOverlay.ts       # Transformed DOM container: Markdown sticky notes, stickers, badges
│       ├── AudioSynthesizer.ts     # Native Web Audio API spray-can rattle synthesis
│       ├── EasterEggController.ts  # Secret "egg" key sequence listener -> Holographic stamp unlock
│       ├── index.ts                # Public module export
│       └── utils/
│           ├── coordinateTransform.ts  # Screen <-> World matrix transforms
│           ├── strokeSmoothing.ts      # Quadratic Bézier curve interpolation
│           └── historyStack.ts         # Undo / Redo command stack
└── components/
    └── wall/
        ├── WallScreen.ts           # Full-screen modal / view shell with back navigation
        └── WallToolbar.ts          # Floating HUD toolbar
```

### Component Boundaries & Interfaces

1. **`CoordinateTransformer` (`src/engines/wall/utils/coordinateTransform.ts`)**:
   - Pure mathematical functions:
     - `screenToWorld(screenPoint, pan, zoom, viewportSize): Point`
     - `worldToScreen(worldPoint, pan, zoom, viewportSize): Point`
     - `clampZoom(zoom): number` (range: $0.25$ to $2.0$)
     - `isConstellationView(zoom): boolean` (true if $zoom \le 0.50$)

2. **`StrokeSmoother` (`src/engines/wall/utils/strokeSmoothing.ts`)**:
   - Computes smooth quadratic Bézier curve control points and midpoints from raw sample points.
   - Serializes/deserializes path coordinates to SVG path data strings.

3. **`HistoryStack` (`src/engines/wall/utils/historyStack.ts`)**:
   - Generic command pattern: `push(command: ICommand)`, `undo()`, `redo()`, `canUndo()`, `canRedo()`, `clear()`.
   - Max depth: 50. Emits callbacks on state change.

4. **`WallService` (`src/services/WallService.ts`)**:
   - `init(): Promise<void>`
   - `getItems(): Promise<WallItem[]>`
   - `addItem(item: Omit<WallItem, 'id' | 'timestamp' | 'likes'>): Promise<WallItem>`
   - `likeItem(id: string): Promise<number>`
   - `deleteItem(id: string): Promise<boolean>`
   - `clear(): Promise<void>`

5. **`AudioSynthesizer` (`src/engines/wall/AudioSynthesizer.ts`)**:
   - Lazily instantiates `AudioContext`.
   - `playSprayCanRattle(): void`
   - `destroy(): void` (closes AudioContext and resets nodes)

6. **`EasterEggController` (`src/engines/wall/EasterEggController.ts`)**:
   - `init(onUnlock: () => void): void`
   - `destroy(): void`

7. **`WallEngine` (`src/engines/wall/WallEngine.ts`)**:
   - Implements `Engine`:
     - `readonly id: string = 'wall-engine'`
     - `mount(container: HTMLElement): void`
     - `destroy(): void`
     - `resize(): void`

---

## 4. Test-Driven Development (TDD) Plan

### Phase 1: Mathematical & Algorithmic Unit Tests (Failing First)
1. **`src/engines/wall/utils/__tests__/coordinateTransform.test.ts`**:
   - Test screen $\to$ world and world $\to$ screen transforms across various pan coordinates and zoom levels ($0.25, 0.5, 1.0, 2.0$).
   - Roundtrip invariant test: `screenToWorld(worldToScreen(p)) == p` within floating point precision.
   - Clamp zoom to $[0.25, 2.0]$.
   - Detect constellation view threshold at $zoom \le 0.50$.
2. **`src/engines/wall/utils/__tests__/strokeSmoothing.test.ts`**:
   - Compute midpoints and control points for quadratic Bézier curve.
   - Degenerate inputs: empty list, single point, two points, coincident points.
   - Path formatting: generate correct SVG path commands (`M`, `Q`).
3. **`src/engines/wall/utils/__tests__/historyStack.test.ts`**:
   - Test execute, undo, redo stack semantics.
   - Overflow handling (max size 50).
   - Redo stack cleared when new command is pushed.
   - Edge cases: calling undo on empty stack, calling redo when nothing to redo.
4. **`src/services/__tests__/WallService.test.ts`**:
   - Seeding default mock items from `mockWallMessages.ts`.
   - Creating, retrieving, liking, and deleting wall items.
   - Fallback to `localStorage` when `indexedDB` throws or is undefined.

### Phase 2: Engine Integration & Lifecycle Tests
5. **`src/engines/wall/__tests__/WallEngine.lifecycle.test.ts`**:
   - Mount creates canvas element, DOM overlay, and toolbar in container.
   - Resize updates canvas dimensions and internal viewport state.
   - Destroy tears down all DOM nodes, listeners, rAF tickers, and Web Audio contexts.
   - Rapid mount/destroy thrashing (10 iterations) cleanly passes with zero orphaned nodes or listeners.
6. **`src/engines/wall/__tests__/AudioSynthesizer.test.ts`**:
   - Synthetic noise generation doesn't throw in test environment.
   - AudioContext clean closure on destroy.
7. **`src/engines/wall/__tests__/EasterEggController.test.ts`**:
   - Typing 'e', 'g', 'g' triggers unlock callback.
   - Irrelevant keystrokes reset or don't trigger callback.
   - Clean removal of window `keydown` listener on `destroy()`.

---

## 5. Implementation Steps (TDD Order)

### Task 1: Domain, Mock Data & Mathematical Utilities
- Write tests in `coordinateTransform.test.ts`, `strokeSmoothing.test.ts`, `historyStack.test.ts`.
- Run tests (confirm failure).
- Implement `coordinateTransform.ts`, `strokeSmoothing.ts`, `historyStack.ts`.
- Create `src/data/mockWallMessages.ts` with 6 diverse initial guestbook items.
- Confirm all Task 1 tests pass.

### Task 2: WallService & Persistence Layer
- Write tests in `src/services/__tests__/WallService.test.ts`.
- Run tests (confirm failure).
- Implement `src/services/WallService.ts` with IndexedDB and localStorage fallback.
- Confirm all Task 2 tests pass.

### Task 3: Audio Synthesis & Easter Egg Controller
- Write tests in `src/engines/wall/__tests__/AudioSynthesizer.test.ts` and `src/engines/wall/__tests__/EasterEggController.test.ts`.
- Run tests (confirm failure).
- Implement `AudioSynthesizer.ts` (native Web Audio spray rattle) and `EasterEggController.ts` (secret 'egg' stamp unlock).
- Confirm all Task 3 tests pass.

### Task 4: Canvas Drawing Layer & Viewport Controller
- Implement `CanvasDrawingLayer.ts` (2D Canvas with Bézier paths, eraser, color palette, constellation glow).
- Implement `ViewportController.ts` (2D pan, wheel/pinch zoom, limits, constellation mode class).

### Task 5: DOM Item Overlay & Interactive Sticky Notes
- Implement `DomItemOverlay.ts`:
  - Renders and syncs sticky notes and stickers at world coordinates.
  - Sticky note editable markdown / textarea with auto-save to `WallService`.
  - Developer stickers (Bugdroid, KMP, Tux, Coffee) and downscaled custom image upload.
  - Holographic badge stamp with iridescent sheen.
  - Heart like button animation.

### Task 6: WallToolbar & HUD Controls
- Implement `WallToolbar.ts`:
  - Floating dock with tool selectors (Pan, Pen, Brush/Spray, Sticky, Sticker, Eraser).
  - Cyber color palette swatch buttons (`#ff4421`, `#00f0ff`, `#ccff00`, `#ffd700`, `#ffffff`) + native color input.
  - Undo / Redo buttons synced with `HistoryStack`.
  - Zoom controls and Reset View button.

### Task 7: WallEngine Orchestrator & Lifecycle
- Write tests in `src/engines/wall/__tests__/WallEngine.lifecycle.test.ts`.
- Run tests (confirm failure).
- Implement `src/engines/wall/WallEngine.ts` integrating Viewport, Canvas, DomOverlay, Toolbar, Service, and Audio.
- Implement `src/engines/wall/index.ts`.
- Confirm lifecycle tests pass with zero memory leaks.

### Task 8: Screen Integration & UI Navigation
- Implement `src/components/wall/WallScreen.ts` (full-screen modal with exit / back button).
- Expose Wall Screen trigger in main app (or portal entry point).
- Full suite verification: `npm test` and `npm run build`.

---

## 6. Verification & Testing

- **Automated Tests**: `npm test` in `portfolio-wall/portfolio` (all prior 411 tests + all new wall screen tests passing).
- **TypeScript & Build**: `npm run build` with zero errors or warnings.
- **Manual Verification Matrix**:
  - Pan around canvas smoothly using mouse drag or touch.
  - Zoom from $0.25\times$ to $2.0\times$ via mouse wheel; verify Constellation glow activates when $\le 0.5\times$.
  - Draw smooth curves with pen and brush in various cyber colors.
  - Shake cursor while brush is selected; hear spray-can rattle.
  - Drop a sticky note, edit text, verify persistence across page reloads.
  - Type `egg` on keyboard; verify holographic badge stamp is unlocked and placeable.
  - Click Undo / Redo; verify state updates correctly.
  - Mount and unmount screen; verify complete cleanup with zero console errors or lingering listeners.
