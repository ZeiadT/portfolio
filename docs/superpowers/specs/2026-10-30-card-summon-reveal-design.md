# Master Feature Design Spec: Card Summon & Reveal Modal Experience

- **Date**: 2026-10-30
- **Feature**: Interactive Card Summoning, Slam Settling, & TCG Developer Card Reveal
- **Component**: `CardSummonEngine` in `portfolio/src/engines/card/CardSummonEngine.ts`
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

---

## 1. Executive Summary & Design Vision
When the user clicks the portrait card in the home hero section, rather than opening a conventional image popup, the application initiates a cinematic, interactive "Card Summoning" sequence.

A glowing hill-shaped energy portal rises from the bottom of the viewport, out of which a mystical TCG playing card ascends while spinning rapidly around its vertical 3D axis. The card decelerates as it climbs, arches slightly past the screen center, and crisply springs into its resting position with a subtle overshoot and surrounding aura glow. Finally, a radiant unblur sweep dissolves the hidden front sheen to reveal a full "MYTHIC RARE" Developer RPG Card.

---

## 2. The 6 Phased Implementation Milestones
To allow granular review at each step, development is decomposed into 6 independent, sequential phases:

```
[Phase 1: Dim & Bottom Glow] ──> [Phase 2: Card Ascent & Spin] ──> [Phase 3: Spring Overshoot & Settling]
                                                                                │
[Phase 6: Radiant Reveal & Stats] <── [Phase 5: Blurred Front Sheen] <── [Phase 4: TCG Card Back Sigil]
```

### Phase 1: The Dim & Bottom Hill Glow
- **Modal Layer**: Fullscreen fixed container (`z-[100]`), dims the background to `rgba(0,0,0,0.85)` with `backdrop-blur-xl`.
- **Hill-Shaped Energy Portal**:
  - Anchored at bottom-center of viewport.
  - Geometry: Curved hill shape (low on flanks, peak at center, height ~180px).
  - Color Palette (easily swappable via config): Primary vermilion `#ff4421` with a luminous white-hot core (`#ffffff`).
  - Animation: Rises rapidly in ~0.4s (`power3.out`).
- **Dismissal Controls**: Accessible ESC key listener, backdrop click, and sleek top-right close button.

### Phase 2: Card Ascent & 3D Y-Axis Rotation
- **Geometry & 3D Setup**: Viewport perspective (`perspective: 1200px`) container.
- **Card Sizing**: Aspect ratio 5/7 (or 4/5), width ~320px–380px.
- **Kinematics**:
  - Rises from `y: +100vh` up toward screen center.
  - Spins rapidly around vertical 3D Y-axis (`rotationY: 720deg` or `1080deg`) with an ambient 12° Z-tilt.
  - Easing curve: Fast launch with pronounced deceleration (`power2.out`).

### Phase 3: Spring Overshoot & Settling
- **Overshoot Dynamics**:
  - The card rises slightly past center (overshoot of ~15px), then crisply springs down into exact screen center (`power2.inOut` / subtle elastic-free snap).
  - Rotation decelerates synchronously to face squarely front-and-center at the exact moment of landing.
- **Pre-Landing Glow**:
  - In the second prior to landing, a radiant aura forms around the card perimeter.
  - The surrounding aura softly fades as the overshoot settling concludes.
- **No Screen Shake**: Clean, mechanical precision without screen rumble.

### Phase 4: Card Back Artwork (TCG Mystic Sigil)
- **Visual Design**:
  - Obsidian dark frame with ornate filigree corner accents.
  - Concentric geometric halo rings (Yu-Gi-Oh / Pokémon card back style).
  - Illuminated central Ace crest with vermilion energy core.
  - Rendered with crisp SVG vector shapes for infinite resolution.

### Phase 5: Card Front Hidden State (Heavy Blur & Glare)
- **Concealment**:
  - Front face is masked with heavy frosted blur (`backdrop-blur-2xl` / filter blur 20px) and a reflective high-opacity sheen.
  - In the moments before settling, the blur and sheen flare up in luminance, creating suspense before the reveal.

### Phase 6: Radiant Reveal & Developer Playing Card Face
- **Reveal Transition**:
  - A radiant unblur and specular light sweep wipes across the face, dissolving the blur to 0px.
- **Developer Card Layout**:
  - **Header**: Name `"Zeiad Mohammed"`, Rarity Badge `"MYTHIC RARE"` with 5 golden stars (★★★★★).
  - **Portrait Frame**: High-resolution portrait photograph with holographic border frame.
  - **Class & Lore**: `"Class: Mobile Developer"`.
  - **Unique Skill**: `"Fluid State Architecture"` (Special Ability description: "Eliminates render overhead and orchestrates 60fps reactive motion.").
  - **Stats**: `"ATK: 9400 / DEF: 9800"`.

---

## 3. Architecture & Engine Contract

### Interface:
```typescript
export interface CardSummonTheme {
  primaryColor?: string; // Default: '#ff4421'
  coreColor?: string;    // Default: '#ffffff'
  accentColor?: string;  // Default: '#ff7700'
}

export interface CardSummonData {
  name: string;
  rarity: string;
  stars: number;
  role: string;
  imageSrc: string;
  imageAlt: string;
  skillName: string;
  skillDescription: string;
  atk: number;
  def: number;
}

export interface CardSummonOptions {
  theme?: CardSummonTheme;
  cardData?: CardSummonData;
  onClose?: () => void;
}

export class CardSummonEngine {
  constructor(options?: CardSummonOptions);
  public mount(container: HTMLElement): void;
  public open(): void;
  public close(): void;
  public destroy(): void;
}
```

---

## 4. Testing & Verification Strategy (Strict TDD)
Each of the 6 phases will have its own dedicated test suite in `portfolio/src/engines/card/__tests__/`:
1. `CardSummonEngine.test.ts` (Core lifecycle, modal mounting, backdrop, and ESC handling).
2. Phase-by-phase test suites verifying each animation stage and visual layer.
