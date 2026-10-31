---
name: choreographing-reveal-animations
description: Use when designing, building, or refining gacha, package openings, card reveals, crate unboxings, summon sequences, or milestone reward animations requiring anticipation, pacing, and visual impact
---

# Choreographing Reveal Animations

## Overview
Every memorable digital reveal is an engineered neurochemical ramp, not a simple linear transition. High-impact reveals build tension through sensory contrast and progressive information disclosure, hold it in an absolute pre-hit freeze (**the fermata**), and discharge it into a high-salience climax before settling into interactive inspection.

```
[ Phase 1: Preparation ] ──► [ Phase 2: Tension ] ──► [ Phase 3: Apex ] ──► [ Phase 4: Reveal ] ──► [ Phase 5: Settle ]
     300ms - 400ms                800ms - 1200ms           120ms - 250ms          500ms - 800ms             Continuous
  Backdrop Dimming             Multi-Axis Spin           Optical Rupture        Mask Dissolution          3D Parallax Tilt
  Portal Emergence             Vibration Sweep           Flash & Shockwave      Foil Specular Wipe        Idle Breathing
  Anticipatory Inhale          Fermata Freeze (120ms)    Bass Transient         Cascading Stars           Inspection State
```

---

## When to Use

### Use for:
- Card summon and gacha pack opening sequences (TCG cards, character pulls).
- Crate unboxing, treasure chest openings, and loot reveals.
- High-tier milestone achievement badges and level-up celebrations.
- Critical reward moments where perceived prestige and delight are paramount.

### When NOT to use:
- Standard utilitarian modals, dialogs, or confirmation sheets (keep transitions $< 250\,\text{ms}$).
- High-frequency daily actions (inventory browsing, item purchasing, repetitive clicks).
- Workflows where the user is in a hurry or task-completion efficiency takes priority over spectacle.

---

## The 5 Core Neurobiological & Motion Rules

### 1. The Saccadic Suppression Rule
The human eye moves in ballistic saccadic jumps up to $700^\circ/\text{s}$. During saccades, the visual cortex actively suppresses input to avoid motion blur.
- **Rule**: *Never reveal critical card identity, stats, or text while the object is traveling at high rotational or translational velocity.*
- **Fix**: High-detail card faces and typography must remain masked, blurred, or facing away until spatial velocity reaches near zero ($\frac{dy}{dt} \approx 0$).

### 2. The Schultz RPE & Tonic Dopamine Ramp
Neurobiological reward prediction error ($\text{RPE} = R_{\text{received}} - R_{\text{expected}}$) shows that midbrain dopamine concentration does not peak upon receiving a reward—it **climbs continuously throughout the unresolved anticipation interval**.
- **Rule**: *Anticipation is the product; the reveal is merely the resolution.*
- **Fix**: Structure the build-up with progressive information disclosure (e.g. rarity hue tells, deductive clues, silhouette previews) to prolong and heighten the tonic dopamine ramp before the reveal.

### 3. The Fermata (The 80–150ms "Dead-Air" Freeze)
In fighting game hit-stops (Street Fighter) and elite gacha reveals (Clash Royale, Genshin Impact), **all motion and audio abruptly freeze for 100–150ms immediately before the climax**.
- **Sokolov Orienting Reflex**: When high-velocity motion abruptly halts, the brain interprets the sudden stillness as an imminent state change; pupils dilate and foveal gaze locks onto the subject.
- **Fechner Contrast Amplification**: Silence and spatial stillness directly amplify the perceived explosion of the subsequent optical flash and sound.
- **Calibrated Duration**: $< 80\,\text{ms}$ registers as a dropped frame; $> 250\,\text{ms}$ feels like a browser hang. Target **$100\text{--}150\,\text{ms}$** of total spatial lock ($\frac{dx}{dt} = 0$, $\frac{dy}{dt} = 0$, $\frac{d\theta}{dt} = 0$).

### 4. Nyquist-Shannon Vibration Ceiling
Standard browser rendering occurs at $f_s = 60\,\text{FPS}$ ($16.67\,\text{ms}$ per frame), yielding a Nyquist ceiling of $f_{\text{Nyquist}} = 30\,\text{Hz}$.
- **Rule**: *Coordinate oscillations exceeding $30\,\text{Hz}$ induce stroboscopic retrograde aliasing (e.g. a $56\,\text{Hz}$ vibration appears as a sluggish $4\,\text{Hz}$ crawl).*
- **Fix**: Bandlimit all anticipation rattle and vibration sweeps to $f_{\max} \le 24\,\text{Hz}$ with an even number of half-cycles terminating cleanly at zero offset before the freeze.

### 5. Transition to Tactile Parallax
Reveals that abruptly terminate leave the user in a cognitive void.
- **Rule**: *Do not leave the revealed object as a static dead DOM node.*
- **Fix**: Transition the item into an interactive 3D parallax tilt state ($\pm 10^\circ\text{--}15^\circ$ driven by cursor/gyroscope) with real-time specular sheen tracking, allowing the user to savor and inspect their collectible.

---

## The Universal 5-Phase Choreography Matrix

| Phase | Time Window | Duration | Visual Salience Drivers | GSAP Easing Pair | Perceptual Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Preparation** | $0.00\text{s} \to 0.35\text{s}$ | $350\,\text{ms}$ | Backdrop dims to 85%; portal rises; anticipatory "inhale" squash | `power2.out` (backdrop)<br>`power3.out` (portal)<br>`power1.in` (squash) | **Orienting**: Suppresses ambient screen noise; locks gaze to launch origin. |
| **Phase 2: Tension Charge** | $0.35\text{s} \to 1.25\text{s}$ | $900\,\text{ms}$ | High-spin 3D climb (`-1080°`); 20Hz vibration; **150ms fermata freeze** | `power3.out` (ascent)<br>`sine.inOut` (vibration)<br>`none` (fermata freeze) | **Tonic Dopamine Ramp**: Sustains uncertainty. Card back faces forward. |
| **Phase 3: Apex Rupture** | $1.25\text{s} \to 1.45\text{s}$ | $200\,\text{ms}$ | Optical whiteout flash; radial shockwave ring; 3D card flip | `power4.in` + `expo.out` (flash)<br>`back.out(1.5)` (flip) | **Phasic Burst**: Sensory catharsis. Flash hides the back-to-front face flip. |
| **Phase 4: Reveal & Sweep** | $1.35\text{s} \to 2.05\text{s}$ | $700\,\text{ms}$ | Mask dissolves; diagonal foil specular wipe; cascading stars; soft descent | `power2.inOut` (mask & foil)<br>`power2.out` (descent)<br>`back.out(2.0)` (stars) | **Semantic Decoding**: Restored foveal vision reads portrait, title, and stats. |
| **Phase 5: Settle & Tilt** | $2.05\text{s} \to \infty$ | Continuous | Interactive cursor 3D parallax ($\pm 12^\circ$); idle breathing | `power1.out` (quickTo spring)<br>`sine.inOut` (hover) | **Tactile Savoring**: Elevates animation into a permanent collectible artifact. |

---

## Code Pattern: Master Timeline Architecture (GSAP 3)

```typescript
import { gsap } from 'gsap';

export function buildRevealTimeline(
  backdropEl: HTMLElement,
  portalEl: HTMLElement,
  cardEl: HTMLElement,
  cardAuraEl: HTMLElement,
  flashVeilEl: HTMLElement,
  foilSheenEl: HTMLElement
): gsap.core.Timeline {
  const tl = gsap.timeline();

  // ---------------------------------------------------------------------------
  // PHASE 1: PREPARATION & PORTAL INHALE (0.00s - 0.35s)
  // ---------------------------------------------------------------------------
  tl.fromTo(backdropEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }, 0);
  tl.fromTo(portalEl, 
    { xPercent: -50, yPercent: 100, opacity: 0, scaleY: 0, transformOrigin: 'bottom center' },
    { xPercent: -50, yPercent: 0, opacity: 1, scaleY: 1, duration: 0.35, ease: 'power3.out' }, 
    0
  );
  // Anticipatory squash (inhale) before launch
  tl.to(portalEl, { scaleY: 0.75, scaleX: 1.15, duration: 0.10, ease: 'power1.in' }, 0.25);

  // ---------------------------------------------------------------------------
  // PHASE 2: TENSION CHARGE & FERMATA FREEZE (0.35s - 1.25s)
  // ---------------------------------------------------------------------------
  // Card emerges from portal with 3D Y-rotation (card back facing forward at end)
  tl.fromTo(cardEl,
    { yPercent: 120, rotationY: -1080, rotationZ: 12, opacity: 0, scale: 0.55 },
    { yPercent: -3, rotationY: -198, rotationZ: 1.5, opacity: 1, scale: 1.02, duration: 0.75, ease: 'power3.out' },
    0.35
  );
  // Portal recedes as card ascends
  tl.to(portalEl, { opacity: 0, scaleY: 0.2, duration: 0.60, ease: 'power2.inOut' }, 0.35);

  // Bandlimited 20Hz vibration rattle right before the freeze (0.75s - 1.10s)
  tl.to(cardEl, { x: 2.5, duration: 0.025, repeat: 13, yoyo: true, ease: 'sine.inOut' }, 0.75);

  // Aura swells to peak intensity leading into the freeze
  tl.fromTo(cardAuraEl, 
    { opacity: 0, scale: 0.8 }, 
    { opacity: 0.95, scale: 1.15, duration: 0.40, ease: 'power2.out' }, 
    0.70
  );

  // THE FERMATA (1.10s - 1.25s): Absolute spatial freeze, subtle scale swell
  tl.set(cardEl, { x: 0 }, 1.10);
  tl.to(cardEl, { scale: 1.025, duration: 0.15, ease: 'none' }, 1.10);

  // ---------------------------------------------------------------------------
  // PHASE 3: APEX CLIMAX RUPTURE (1.25s - 1.45s)
  // ---------------------------------------------------------------------------
  // Blinding optical flash veil
  tl.fromTo(flashVeilEl, { opacity: 0 }, { opacity: 0.95, duration: 0.04, ease: 'power4.in' }, 1.25);
  tl.to(flashVeilEl, { opacity: 0, duration: 0.16, ease: 'expo.out' }, 1.29);

  // Card flips 198° to face front (hidden behind the optical flash)
  tl.to(cardEl, { rotationY: 0, rotationZ: 0, duration: 0.15, ease: 'back.out(1.5)' }, 1.25);

  // ---------------------------------------------------------------------------
  // PHASE 4: CARD REVEAL & FOIL SWEEP (1.35s - 2.05s)
  // ---------------------------------------------------------------------------
  // Holographic specular foil wipe sweeps across card face
  tl.fromTo(foilSheenEl,
    { xPercent: -120, opacity: 0.9 },
    { xPercent: 180, opacity: 0, duration: 0.65, ease: 'power2.inOut' },
    1.40
  );

  // Graceful settlement from apex into resting position
  tl.to(cardEl, { yPercent: 0, scale: 1.0, duration: 0.50, ease: 'power2.out' }, 1.45);
  tl.to(cardAuraEl, { opacity: 0, scale: 1.25, duration: 0.50, ease: 'power2.out' }, 1.45);

  return tl;
}
```

---

## Interactive 3D Parallax Tilt (Phase 5 Pattern)

When Phase 4 completes, attach pointer listeners to convert cursor movement into smooth, spring-damped 3D tilt:

```typescript
export class TiltController {
  private quickRotateX: (val: number) => void;
  private quickRotateY: (val: number) => void;

  constructor(private cardEl: HTMLElement) {
    this.quickRotateX = gsap.quickTo(cardEl, 'rotationX', { duration: 0.4, ease: 'power1.out' });
    this.quickRotateY = gsap.quickTo(cardEl, 'rotationY', { duration: 0.4, ease: 'power1.out' });
  }

  public onPointerMove(e: MouseEvent, bounds: DOMRect): void {
    const normX = (e.clientX - bounds.left) / bounds.width - 0.5;   // [-0.5, 0.5]
    const normY = (e.clientY - bounds.top) / bounds.height - 0.5;  // [-0.5, 0.5]

    this.quickRotateY(normX * 24);   // ±12° tilt
    this.quickRotateX(-normY * 24);  // ±12° tilt
  }

  public reset(): void {
    this.quickRotateX(0);
    this.quickRotateY(0);
  }
}
```

---

## Common Anti-Patterns & Solutions

| Anti-Pattern | Root Cause | Symptom | Engineering Solution |
| :--- | :--- | :--- | :--- |
| **The Linear Elevator** | Constant velocity (`ease: 'none'`) during ascent | Feels robotic, floaty, like a webpage scrolling | Use steep deceleration (`power3.out` / `expo.out`) so the card erupts fast and glides smoothly into apex. |
| **Premature Reveal** | Unveiling card face while rotating at 1000°/s | Saccadic suppression blurs text; reveals look messy and accidental | Keep card back facing forward until the apex fermata; flip card behind a 40ms optical flash veil. |
| **Missing Fermata** | Card climbs and drops immediately without a pause | Zero tension; feels like standard bouncy UI rather than a dramatic summon | Insert an intentional 100–150ms dead-air freeze at the apex where translational velocity drops to zero before the flip. |
| **The Dead Artifact** | Animation finishes and element becomes a flat, unmoving DOM node | Disconnects the user emotionally; excitement instantly dies | Transition into Phase 5: continuous subtle idle breathing + interactive 3D mouse parallax tilt. |
| **Aliased Rattle** | High-frequency transform shake exceeding 30Hz | Jittery reverse-motion artifacts on 60Hz displays | Bandlimit vibration frequency to $\le 24\,\text{Hz}$ with an exact integer of half-cycles returning to zero offset. |
| **Aggressive Squash Overkill** | Applying 20%+ squash/stretch deformation to rigid card collectibles | Card looks like floppy rubber/jelly rather than a premium foil card | Limit physical squash on rigid cards to $\le 4\%$ (`scaleY: 0.96`), reserving heavy squash ($25\%$) strictly for energy portals or chests. |
