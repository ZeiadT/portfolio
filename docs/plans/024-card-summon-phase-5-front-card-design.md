# Card Summon - Phase 5: Front Card Design & Concealment Sheen Implementation Plan

- **Status**: Completed
- **Created**: 2026-10-31
- **Last Updated**: 2026-10-31
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline SVG / HTML Vectors, Vitest

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 5 of the Card Summoning engine: the Mythic Rare Holographic TCG Front Card Face (obsidian frame, gold/vermilion metallic bevels, 5 golden stars `★★★★★`, holographic arch portrait window, identity & lore block, and glowing attribute tickers `PERF: 99 / ARCH: 98 / CODE: 95`) covered by a Frosted Obsidian Glass Concealment Veil (`backdrop-blur-xl`, obsidian tint) with an active diagonal specular holographic shimmer sheen teasing the card silhouette before the Phase 6 reveal.

**Architecture:** Encapsulate card face rendering in a modular, swappable `CardFaceRenderer` interface (`portfolio/src/engines/card/renderers/CardFaceRenderer.ts`) with a concrete `MythicCardFaceRenderer` implementation (`portfolio/src/engines/card/renderers/MythicCardFaceRenderer.ts`). `CardSummonEngine` mounts `cardFaceEl` (`[data-summon-card-face]`), renders the face via the renderer, and mounts the Frosted Concealment Mask (`[data-summon-card-front-mask]`) with an animated GSAP holographic specular sheen (`[data-summon-card-front-sheen]`). `ProfileHeader` injects candidate profile avatar and lore data.

**Tech Stack:** Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Inline Vector SVGs, Vitest

---

## Global Constraints
- Must adhere to `AGENTS.md` and `docs/rules.md`: Strict TDD (failing unit test specifications committed first in RED phase), component lifecycle isolation (`mount`, `open`, `close`, `destroy`), zero DOM/memory leaks.
- Zero external graphic dependencies: 100% inline SVG and CSS vectors for instant paint, 0 network requests, and infinite Retina sharpness.
- Modular & Swappable: Card face rendering must be decoupled from `CardSummonEngine` via `CardFaceRenderer` so alternative designs (such as Minimalist Editorial Luxury) can be swapped in without modifying core engine logic.
- 100% backward compatibility: All 43 existing tests in `CardSummonEngine.test.ts` and all 171 tests across the workspace must continue to pass cleanly.
- Strict accessibility (`prefers-reduced-motion: reduce`): Specular sheen shimmer animation is static / bypassed when reduced motion is preferred.

---

### Task 1: Author Unit Tests for Front Card Face & Concealment Sheen in `CardSummonEngine.test.ts`

**Files:**
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Interfaces:**
- Consumes: `CardSummonEngine`, `CardSummonData`, `CardSummonOptions` from `@/engines/card/CardSummonEngine`
- Produces: Failing test assertions (RED phase) for:
  1. Front Card Face layout elements in `[data-summon-card-face]`:
     - Header block (`data-summon-face-header`) with rarity badge ("MYTHIC RARE"), 5 golden stars (`data-summon-face-stars`), and class badge ("Mobile & Frontend Architect").
     - Holographic arch portrait window (`data-summon-face-portrait-window`) containing portrait image (`data-summon-face-avatar`) with correct `src` and `alt`.
     - Lore block (`data-summon-face-lore`) with name ("Zeiad Mohammed"), skill title ("Engineered Precision"), and skill description.
     - Attribute stat ticker (`data-summon-face-stats`) with glowing tickers `PERF: 99`, `ARCH: 98`, `CODE: 95`.
  2. Frosted Obsidian Concealment Veil & Specular Sheen:
     - Presence of `[data-summon-card-front-mask]` with `backdrop-blur-xl`.
     - Presence of `[data-summon-card-front-sheen]` inside the mask.
     - Specular sheen animation created on `open()`.
  3. Swappable `CardFaceRenderer` support:
     - Passing a custom `faceRenderer` invokes `render(container, data, theme)`.
  4. Accessibility & Lifecycle Teardown:
     - Sheen animation does not animate when `prefers-reduced-motion: reduce` is matched.
     - All front face elements, mask, and sheen GSAP tweens cleanly killed and disposed on `close()` and `destroy()`.

- [x] **Step 1: Add Phase 5 describe block with unit test specifications in `CardSummonEngine.test.ts`**
- [x] **Step 2: Run test suite to verify tests fail against current Phase 4 baseline (RED phase)**
- [x] **Step 3: Commit Phase 5 test specifications**

---

### Task 2: Implement Modular `CardFaceRenderer` & `MythicCardFaceRenderer`

**Files:**
- Create: `portfolio/src/engines/card/renderers/CardFaceRenderer.ts`
- Create: `portfolio/src/engines/card/renderers/MythicCardFaceRenderer.ts`

**Interfaces:**
- `CardFaceRenderer`:
  ```ts
  export interface CardFaceRenderer {
    readonly id: string;
    render(container: HTMLElement, data: CardSummonData, theme: CardSummonTheme): void;
  }
  ```
- `MythicCardFaceRenderer`:
  - Renders multi-layer gold/vermilion metallic bevel frame (`data-summon-face-frame`).
  - Header with "MYTHIC RARE", 5 golden stars `★★★★★`, and Class "Mobile & Frontend Architect".
  - Holographic Arch Window with metallic hairline border and orbital rings around `data-summon-face-avatar`.
  - Lore block with Name, Skill Title ("Engineered Precision"), and description.
  - Attribute ticker displaying `PERF: 99`, `ARCH: 98`, `CODE: 95` with glowing progress accents.

- [x] **Step 1: Create `CardFaceRenderer.ts` interface**
- [x] **Step 2: Implement `MythicCardFaceRenderer.ts`**
- [x] **Step 3: Verify TypeScript compiles without type errors**

---

### Task 3: Integrate Card Face & Frosted Concealment Sheen in `CardSummonEngine.ts` and `ProfileHeader.ts`

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`
- Modify: `portfolio/src/components/home/ProfileHeader.ts`

**Interfaces:**
- `CardSummonEngine`:
  - Accepts optional `faceRenderer?: CardFaceRenderer` and enhanced `cardData?: CardSummonData` (defaulting to Zeiad Mohammed / Mythic Rare / 99 PERF / 98 ARCH / 95 CODE).
  - Populates `this.cardFaceEl` via `this.faceRenderer.render()`.
  - Creates `this.cardFrontMaskEl` (`[data-summon-card-front-mask]`) with `backdrop-blur-xl bg-neutral-950/80` and `[data-summon-card-front-sheen]`.
  - Animates the specular sheen on `open()` using GSAP (suppressed under `prefers-reduced-motion`).
  - Cleanly kills sheen tweens and tears down elements in `cleanupDomAndListeners()`.
- `ProfileHeader`:
  - Passes default Mythic card data and avatar to `CardSummonEngine`.

- [x] **Step 1: Update `CardSummonEngine.ts` with renderer mounting, concealment mask, and sheen tween**
- [x] **Step 2: Update `ProfileHeader.ts` with candidate profile data injection**
- [x] **Step 3: Run test suite to verify all Phase 5 tests pass (GREEN phase)**
- [x] **Step 4: Commit Phase 5 implementation**

---

### Task 4: Comprehensive Verification, Documentation & Sign-off

**Files:**
- Test: All vitest suites (`npm --prefix portfolio test`)
- Build: Vite production build (`npm --prefix portfolio run build`)
- Docs: Update `docs/plans/024-card-summon-phase-5-front-card-design.md` to Completed

- [x] **Step 1: Run complete test suite across workspace**
- [x] **Step 2: Run Vite production build**
- [x] **Step 3: Mark documentation plan Completed and commit**
- [x] **Step 4: Present Phase 5 to the user for review along with the copy-paste prompt recipe for Option 3 (Minimalist Editorial Luxury)**

---

### Task 5: Candidate Custom Data Injection & Interactive Phase 5 Inspection

**Files:**
- Modify: `portfolio/src/components/home/ProfileHeader.ts`
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`

**Requirements:**
1. Inject Zeiad's authentic credentials from CV into `ProfileHeader.ts`:
   - Role: "Android Application Developer"
   - Skill: "Clean Reactive Architecture"
   - Description: "Engineers offline-first Android & KMP applications with Kotlin Coroutines, Jetpack Compose, and robust Clean Architecture."
   - Stats: PERF: 99 / ARCH: 98 / CODE: 96
2. Support `options.autoFlipToFront?: boolean` in `CardSummonEngine`:
   - When true, automatically animates card flip to front (`rotationY: 180`) upon summon landing, immediately showcasing the Phase 5 Front Face.
   - Interactive 3D parallax tilt dynamically adjusts base angle depending on `isFlipped`.
3. Interactive Inspection Controls:
   - Clicking card or flip control toggles between front (180deg) and back (0deg).
   - Concealment toggle allows switching between frosted obsidian shimmer and crystal-clear unblurred card face.
   - Clean teardown on `close()` and `destroy()`.
4. Unit tests in `CardSummonEngine.test.ts` verifying auto-flip, flip toggle, and concealment toggle behavior.

- [x] **Step 1: Write unit tests for interactive flip and concealment toggles in `CardSummonEngine.test.ts`**
- [x] **Step 2: Implement autoFlipToFront, interactive 3D flip, and concealment toggle in `CardSummonEngine.ts`**
- [x] **Step 3: Update `ProfileHeader.ts` with customized candidate data and `autoFlipToFront: true`**
- [x] **Step 4: Verify test suite and production build**

---

### Task 6: Implement and Swap Option 3 (Minimalist Editorial Luxury) `EditorialCardFaceRenderer`

**Files:**
- Create: `portfolio/src/engines/card/renderers/EditorialCardFaceRenderer.ts`
- Create: `portfolio/src/engines/card/renderers/__tests__/EditorialCardFaceRenderer.test.ts`
- Modify: `portfolio/src/components/home/ProfileHeader.ts`

**Requirements:**
1. Implement `EditorialCardFaceRenderer` implementing `CardFaceRenderer`:
   - `id = 'minimalist-editorial-luxury'`
   - Aesthetic: Ultra-clean Swiss typographic editorial style.
   - Frame: Sleek monoline white/15 hairline borders, frosted glass container (`bg-black/90 backdrop-blur-2xl`), restrained high-contrast typography with subtle warm gold accents.
   - Header: Minimalist typography with small uppercase serif edition title ("PORTFOLIO EDITION // 2026"), clean bullet divider, and class badge.
   - Portrait Framing: Razor-sharp rectangular cut with monochrome duotone treatment and subtle hairline framing.
   - Lore: Clean grid-aligned layout highlighting candidate core engineering pillars and statement.
   - Stats: High-contrast monospace data tickers for PERF: 99 / ARCH: 98 / CODE: 95.
2. In `ProfileHeader.ts`:
   - Supply `faceRenderer: new EditorialCardFaceRenderer()` to `CardSummonEngine`.
3. Unit tests in `EditorialCardFaceRenderer.test.ts` covering rendering, DOM structure, fallback safety, and XSS sanitization.

- [x] **Step 1: Write unit test specifications for `EditorialCardFaceRenderer.test.ts` (RED phase)**
- [x] **Step 2: Implement `EditorialCardFaceRenderer.ts` (GREEN phase)**
- [x] **Step 3: Wire into `ProfileHeader.ts` via `faceRenderer: new EditorialCardFaceRenderer()`**
- [x] **Step 4: Verify full workspace test suite and production build**

---

### Task 7: Rescale Card Proportions & Enrich Editorial Luxury Card Face UI

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`
- Modify: `portfolio/src/engines/card/renderers/EditorialCardFaceRenderer.ts`
- Modify: `portfolio/src/engines/card/renderers/MythicCardFaceRenderer.ts`
- Modify: `portfolio/src/engines/card/renderers/__tests__/EditorialCardFaceRenderer.test.ts`
- Modify: `portfolio/src/engines/card/renderers/__tests__/MythicCardFaceRenderer.test.ts`

**Requirements:**
1. Upgrade card dimensions in `CardSummonEngine.ts`:
   - `cardEl` and `cardAuraEl`: `w-[320px] sm:w-[370px] md:w-[410px] lg:w-[440px] max-w-[90vw] max-h-[84vh] aspect-[5/7]`
   - `shockwaveEl`: `w-[340px] sm:w-[400px] md:w-[450px] h-[340px] sm:h-[400px] md:h-[450px]`
   - Both `cardBack` and `cardFace` are `absolute inset-0 rounded-3xl overflow-hidden`, exactly matching the $5:7$ aspect ratio.
2. Fill the expanded canvas in `EditorialCardFaceRenderer.ts`:
   - Header: Edition stamp, gold bullet, 5 golden stars, class badge, and serial code sub-header (`SERIAL: ZM-2026-ARCH // NATIVE & KMP`).
   - Portrait Window: Majestic `aspect-[4/3]` rectangular duotone portrait with double hairline framing, corner crosshairs (`+`), status chip (`● ACTIVE // CAIRO, EG`), catalog index (`INDEX: 01 // CV ARCHIVE`), and technical stack stamp.
   - Lore & Identity: Name in prominent typography (`text-xl sm:text-2xl`), skill title badge, full clean architecture narrative statement, and candidate core engineering pillar chips (`[Native Android & KMP]`, `[Clean Architecture & MVI]`, `[Deterministic Performance]`, `[Flow & Coroutines]`).
   - Stats Matrix: High-contrast monospace metric cards with label, score (`PERF: 99 / ARCH: 98 / CODE: 95`), and hairline progress bars, with a bottom academic & ITI accreditation stamp (`BENHA UNIVERSITY B.SC. • ITI SMART VILLAGE 9-MONTH DIPLOMA`).
3. Enrich `MythicCardFaceRenderer.ts`:
   - Upgrade portrait arch to `aspect-[4/3]`, add richer lore layout and progress bars filling the $5:7$ canvas with zero awkward dead space.
4. Verify all tests in `EditorialCardFaceRenderer.test.ts`, `MythicCardFaceRenderer.test.ts`, `CardSummonEngine.test.ts`, and production build.

- [x] **Step 1: Update unit tests for expanded layout and components**
- [x] **Step 2: Update `CardSummonEngine.ts` dimensions**
- [x] **Step 3: Enrich `EditorialCardFaceRenderer.ts` and `MythicCardFaceRenderer.ts`**
- [x] **Step 4: Verify test suite and production build**

---

### Task 8: Restore Normal Card Dimensions & Add Intricate Arcane Patterns to Card Back

**Files:**
- Modify: `portfolio/src/engines/card/CardSummonEngine.ts`
- Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`
- Modify: `portfolio/src/engines/card/renderers/EditorialCardFaceRenderer.ts`

**Requirements:**
1. Restore normal card dimensions while preserving the $5:7$ aspect ratio:
   - `cardEl` & `cardAuraEl`: `w-[280px] sm:w-[320px] md:w-[340px] aspect-[5/7]`
   - `shockwaveEl`: `w-[280px] h-[280px]`
   - Both card back and front face maintain strict $5:7$ aspect ratio.
2. Fill empty space on card back with intricate arcane patterns:
   - Pattern Guilloché mesh watermark (`<pattern id="...">`) with micro-diamonds and diagonal texture across obsidian cardstock.
   - Sacred geometry celestial star constellations & glyphs (`[data-summon-card-pattern]`):
     - Celestial 4-point diamond sparkles (`✦`) in the negative space quadrants and lateral flanks.
     - Arcane constellation connection lines and planetary orbit arcs bridging the corners to the central halo.
     - Radiating celestial energy rays extending from the central crest outward toward the outer frame.
3. Unit test in `CardSummonEngine.test.ts` verifying presence of `[data-summon-card-pattern]`.
4. Ensure all 197+ tests pass and build compiles cleanly.

- [x] **Step 1: Add unit test specification for card back patterns in `CardSummonEngine.test.ts` (RED phase)**
- [x] **Step 2: Restore normal card dimensions and implement card back patterns in `CardSummonEngine.ts` (GREEN phase)**
- [x] **Step 3: Tune `EditorialCardFaceRenderer.ts` padding to match normal dimensions perfectly**
- [x] **Step 4: Verify test suite and production build**
