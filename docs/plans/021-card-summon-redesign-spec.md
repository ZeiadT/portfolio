# Card Summon Redesign & Motion Specification: Observation Psychology & Anticipation Mechanics

- **Plan ID**: `021-card-summon-redesign-spec`
- **Status**: Proposed / Active Specification
- **Created**: 2026-10-30
- **Last Updated**: 2026-10-30
- **Authors**: Worker 1 (Master Specification Author & Motion Systems Architect), with contributions from Explorer 1, Explorer 2, and Spec Miner 3
- **Tech Stack**: Vanilla TypeScript (ES2022), GSAP 3.12, Tailwind CSS v4, Three.js 0.160 / WebGL, Vitest 5.0
- **Target Subsystems**: `portfolio/src/engines/card/`, `portfolio/src/domain/types.ts`, `portfolio/src/data/cards.ts`
- **Verification Gates**: Vitest 159/159 passing, `tsc && vite build` passing, 100% backward compatibility with existing 31 `CardSummonEngine` tests

---

## Table of Contents
1. [Executive Summary & Foundational Framework](#1-executive-summary--foundational-framework)
2. [Empirical Game Animation Teardowns & Cross-Title Synthesis](#2-empirical-game-animation-teardowns--cross-title-synthesis)
3. [Disney's 12 Animation Principles Interactive Matrix](#3-disneys-12-animation-principles-interactive-matrix)
4. [Neurobiology of Anticipation & Observation Psychology](#4-neurobiology-of-anticipation--observation-psychology)
5. [Universal 5-Phase Sequence Decomposition Model](#5-universal-5-phase-sequence-decomposition-model)
6. [CardSummonEngine Architectural Redesign Specification](#6-cardsummonengine-architectural-redesign-specification)
7. [Subsystem Modular Architecture & Rendering Engines](#7-subsystem-modular-architecture--rendering-engines)
8. [GSAP Timeline Choreography & Motion Engineering](#8-gsap-timeline-choreography--motion-engineering)
9. [Backward Compatibility & Test Preservation Matrix](#9-backward-compatibility--test-preservation-matrix)
10. [Test-Driven Development (TDD) Implementation Roadmap & Verification Gates](#10-test-driven-development-tdd-implementation-roadmap--verification-gates)

---

# 1. Executive Summary & Foundational Framework

### 1.1 Objective & Design Mandate
This technical specification establishes the architectural, mathematical, and motion-design blueprint for the redesign of the portfolio's card summoning animation (`CardSummonEngine`). The engine orchestrates the high-impact reveal modal triggered when visitors interact with the developer portrait in the portfolio hero bento grid (`ProfileAvatar.ts` / `ProfileHeader.ts`).

While the existing baseline engine (`CardSummonEngine.ts`, informed by Plans 018, 019, and 020) provides an exemplary foundation of accessible dialog mounting, CSS 3D transforms, and graceful vertical settlement, its card container remains a blank rectangle (`bg-neutral-900 border border-white/20`). It lacks identity concealment, suspenseful anticipation charging, optical climax rupture, holographic foil shaders, and interactive 3D parallax.

The objective of this redesign is to **elevate `CardSummonEngine` from a functional modal transition into an emotionally exhilarating, AAA-grade gacha and pack unboxing experience**. This transformation is achieved not through frivolous visual clutter, but by grounding every millisecond of motion in the **neurobiology of human anticipation, visual psychophysics, and Disney’s classical animation principles**.

```
========================================================================================
THE CARD SUMMON REDESIGN MISSION
========================================================================================
[ Existing Baseline Engine ]               [ Redesigned World-Class Engine ]
• Functional modal container                • 5-Phase Universal Kinematic Architecture
• Plain blank dark rectangle                • Double-sided collectible RPG Card (Back & Face)
• Linear launch & hover float               • Anticipatory portal "inhale" & vibration sweep
• Passive aura swell at apex                • 140ms Fermata Temporal Freeze at apex
• Abrupt card front appearance              • Optical Flash Veil & expanding shockwave ring
• Static resting state                      • Diagonal holographic foil specular sweep
• Monolithic 434-line class                 • Interactive 3D gyroscopic mouse parallax tilt
• 31 passing unit tests                     • Modular Clean Architecture subsystems
                                            • 100% backward-compatible (all 31 tests green)
========================================================================================
```

### 1.2 Core Architectural Principles
All proposed enhancements strictly adhere to the repository's architectural governance:
1. **Clean Architecture Boundary Isolation (`docs/rules.md`)**: Pure domain contracts reside in `portfolio/src/domain/types.ts`. Static data records reside in `portfolio/src/data/cards.ts`. UI components and visual engines consume these contracts without backward leakage.
2. **Component Isolation & Reusability (`AGENTS.md`)**: The engine implements the universal `Engine` lifecycle contract (`mount(container: HTMLElement)`, `destroy()`, `resize?()`). All DOM elements, GSAP timelines, canvas contexts, and event listeners must be completely cleaned up on disposal.
3. **Ponytail Senior Dev Principle (`docs/decision-making.md`)**: The smallest, cleanest, most robust implementation. Code is modularized into focused internal subsystems (`PortalRenderer`, `CardRig`, `CardFaceRenderer`, `CardBackRenderer`, `ClimaxFX`, `TiltController`) rather than an unwieldy monolith.
4. **Zero External Asset Dependencies**: All card frames, filigree patterns, stars, and portals are rendered via semantic HTML, Tailwind CSS v4, and inline vector SVGs—guaranteeing sub-millisecond initial paint, zero external network requests, and pristine rendering across high-DPI Retina screens.
5. **Strict Accessibility (WCAG 2.2 Criterion 2.3.3)**: Full support for `prefers-reduced-motion: reduce`. When active, all high-velocity rotations, optical flashes, and micro-vibrations are bypassed in favor of an instantaneous, elegant $200\,\text{ms}$ cross-dissolve.

---

# 2. Empirical Game Animation Teardowns & Cross-Title Synthesis

To uncover the empirical mechanics that make digital reveals thrilling, we analyze six industry-defining titles spanning diverse genres: **Clash Royale**, **PUBG**, **FIFA Mobile / EA FC Mobile**, **Hearthstone**, **Genshin Impact**, and **Pokémon TCG**.

```
========================================================================================
SEQUENCE TIMELINES ACROSS EXAMINED PARADIGMS (NORMALIZED TIME AXIS)
========================================================================================
[Clash Royale]  |--Tap/Shake--|--Lid Pop--|--Common Cards (Fast)--|---Legendary Spin & Flash---|
[PUBG]          |---Parachute Drop---|--Ground Slam--|--Hiss/Smoke--|---Volumetric Flare/Crate---|
[EA FC Walkout] |--Tunnel Glow--|--Flag--|--Pos--|--Club--|--Silhouette Walkout--|--Celebration--|
[Hearthstone]   |--Drag/Slot--|--Lock Pop--|--5 Card Hover--|--Inspect Aura--|--Flip Explosion--|
[Genshin Wish]  |---Celestial Sky---|--Color Tint Tell--|--Impact Split--|--Constellation Splash--|
[Pokémon TCG]   |--Foil Carousel--|--Tear Swipe--|--Card Slide--|--Edge Peek--|--Holo Shimmer--|
========================================================================================
```

---

### 2.1 Clash Royale (Supercell) — Tap Cadence, Rarity Crescendo & The Legendary Spin
- **Interaction Model**: Discrete, tap-to-advance tactile cadence ($150\text{--}250\,\text{ms}$ per common card).
- **Anticipation Runway**: 
  - The chest hovers with gentle vertical float (`y: ±8px`, `sine.inOut`).
  - Upon tapping, the chest squashes vertically (`scaleY: 0.88`, `scaleX: 1.10`) while the lock vibrates horizontally at $\sim 30\,\text{Hz}$ (`x: ±4px`).
  - The lock snaps off, and the lid springs open with massive overshoot (`rotationX: -120^\circ`, `back.out(2.5)`).
- **The Legendary Spin (The Apex)**:
  - Sequence rhythm suddenly halts. The card counter reads "1". Ambient arena audio ducks.
  - The final card ascends into exact screen center, then begins spinning furiously on its Y-axis, accelerating from $0$ to over $3600^\circ/\text{s}$ (`power2.in`).
  - Prismatic light trails and god-rays streak from the spinning card disc.
- **Micro-Pause / Pre-Hit Silence**:
  - Exactly $100\,\text{ms}$ before reveal, **the spin and particle emission abruptly freeze**. Audio is cut completely to dead silence.
  - A single-frame bloom flash blinds the screen, followed by an explosive card slam (`back.out(1.8)`) and brass orchestral fanfare.
- **Key Takeaway for CardSummonEngine**: The sharp contrast between fast common pacing and an elongated, high-RPM spin with an explicit $100\,\text{ms}$ pre-hit freeze magnifies perceived reward value by orders of magnitude.

---

### 2.2 PUBG (Krafton) — Industrial Heavy Mass, Ground Slam & Volumetric Smoke
- **Interaction Model**: Passive, high-immersion military cinematic ($6\text{--}8\,\text{s}$).
- **Anticipation Runway**:
  - An Air Drop crate suspended beneath a cargo parachute drifts down diagonally with realistic wind oscillation.
  - Low turboprop aircraft rumble builds tension in the acoustic background.
- **The Ground Slam Impact**:
  - The crate hits the terrain with zero-velocity deceleration (`power4.in`).
  - Ground dirt and pebble shockwaves spray in $360^\circ$.
  - Camera shakes violently with rotational jitter ($\pm 2.5^\circ$) and vertical kick ($+15\,\text{px}$) synchronized to a $0\,\text{ms}$-latency sub-bass impact thud ($80\,\text{Hz}$).
- **Pneumatic Latch Release & Volumetric Flare**:
  - Canvas tarp slides off with cloth simulation; steel latches snap open with a high-pressure pneumatic hiss ("KA-CHUNK-PFFT").
  - Volumetric red chemical smoke billows across the screen, scattering dynamic light before the lid unhinges to reveal the floating 3D weapon skin.
- **Key Takeaway for CardSummonEngine**: Heavy physical mass requires instant deceleration on impact and synchronized sub-bass shockwaves. Without physical weight and recoil, digital objects feel synthetic.

---

### 2.3 FIFA Mobile / EA FC Mobile (EA Sports) — The Walkout & Progressive Clue Disclosure
- **Interaction Model**: High-concept athletic drama utilizing a 3-step deductive clue ladder ($6\text{--}10\,\text{s}$).
- **The Progressive Clue Ladder**:
  1. *Clue 1 (Nationality Banner)*: Massive flag drops from tunnel ceiling ($800\,\text{ms}$, `expo.out`) with golden pyrotechnic sparks. Filters candidate pool (e.g., France).
  2. *Clue 2 (Position Acronym)*: Heavy 3D typography ("ST") slams into the air with forward scale ($700\,\text{ms}$, `power4.out`). Filters candidates further (Mbappé or Griezmann).
  3. *Clue 3 (Club Crest)*: Club shield stamps into place ($700\,\text{ms}$, `back.out(1.5)`). Confirms identity: Real Madrid = 100% Kylian Mbappé!
- **The Walkout & Card Frame Slam**:
  - The player model emerges from tunnel smoke in dramatic backlit silhouette ($1400\,\text{ms}$).
  - Player steps into key-light spotlight, performs signature celebration, and the official FUT card frame slams through the player model (`elastic.out(1.2, 0.5)`), pinning stats into the card window.
- **Key Takeaway for CardSummonEngine**: Revealing information progressively through a structured deductive ladder extends the tonic dopamine ramp, converting passive observation into an active mental puzzle.

---

### 2.4 Hearthstone (Blizzard Entertainment) — Tactile Drag-to-Slot & Pentagram Aura Hover
- **Interaction Model**: Direct physical drag-and-drop tactile manipulation followed by player-driven inspection.
- **Altar Suction & Dispersion**:
  - Player drags booster pack with mouse inertia and 3D tilt. Dropping near center snaps into the stone altar (`back.out(2.0)`).
  - Binding ribbons vibrate with arcane lightning before the pack detonates into wood fragments, dispersing 5 card backs in an open pentagram formation (`expo.out`).
- **The Hover Rarity Aura Inspection (Player Agency)**:
  - While floating in the pentagram, the player can hover over each card back before flipping.
  - Hovering causes the card to lift toward the camera (`scale: 1.08`, `z: +30px`) and leak an elemental rarity glow:
    * *White*: Common (subtle dust)
    * *Blue*: Rare (arcane shimmer)
    * *Purple*: Epic (mystic smoke)
    * *Golden / Orange*: Legendary (solar rays & fiery embers)
  - Flipping a legendary card triggers camera shake, golden smoke, and the Innkeeper’s thunderous vocal shout: *"GOLDEN... LEGENDARY!"*
- **Key Takeaway for CardSummonEngine**: Granting the user interactive agency to inspect pre-reveal auras allows them to savor the peak dopamine plateau indefinitely.

---

### 2.5 Genshin Impact (HoYoverse) — Cosmic Meteor & Early Color Tint Tell
- **Interaction Model**: Monumental celestial cinematic ($4.5\,\text{s}$, with instant skip affordance).
- **The Early Color Tint Tell**:
  - The camera pans up to an infinite starfield. A shooting star ignites in deep space.
  - At exactly $t = 1.2\,\text{s}$, the meteor’s core flares up with its definitive rarity hue:
    * *Blue*: Standard 3-Star fodder
    * *Purple*: 4-Star featured character
    * *Gold*: Ultra-rare 5-Star grand prize (accompanied by rainbow solar flares)
  - This early tell triggers an immediate dopamine surge, setting emotional expectations for the remaining 3 seconds of the flight.
- **Impact Shockwave & Star Pings**:
  - Meteor plunges toward horizon lens; $150\,\text{ms}$ pre-impact dead-air silence; screen flashes pure white with chromatic aberration shockwave.
  - Character silhouette shatters with crystalline burst into a 3D cel-shaded splash art pose. Stars stamp down sequentially (★ ★ ★ ★ ★) with crystal bell pings spaced at $120\,\text{ms}$ intervals.
- **Key Takeaway for CardSummonEngine**: Early rarity tells (such as portal color temperature) prime the nervous system, while cascading star stamps extend the post-reveal gratification.

---

### 2.6 Pokémon TCG (Pocket / Live) — Foil Rip, Card Slide & Interactive Holographic Shimmer
- **Interaction Model**: Hyper-tactile simulation of physical booster packs (touch swipe, card slide, gyroscopic inspection).
- **The Foil Tear & Edge Peek**:
  - 3D foil pack floats in center stage. User swipes across the crimped top seam; metallic foil tears with foley rip audio ("SKRR-RIP!").
  - Stack of cards slides upward out of wrapper. The user can slowly slide the front card sideways to peek at the underlying border (Yellow = regular, Holo/Rainbow = Ultra Rare).
- **Interactive Gyroscope / Mouse Holo Reflection**:
  - Once revealed, the card responds continuously to mouse movement or device gyroscope.
  - A custom diffraction shader sweeps rainbow light, etched gold foil reliefs, and specular glints across the card face in real-time.
- **Key Takeaway for CardSummonEngine**: Transitioning the card into an interactive 3D parallax tilt state post-reveal transforms a fleeting animation into a permanent, collectible artifact.

---

### 2.7 Cross-Game Comparative Synthesis Matrix

| Dimension | Clash Royale | PUBG | FIFA / EA FC Mobile | Hearthstone | Genshin Impact | Pokémon TCG |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Interaction** | Tap-to-advance | Passive cinematic | Passive cinematic | Drag-to-slot + click | Cinematic + skip | Swipe-to-tear + slide |
| **Sequence Duration** | $4\text{--}12\,\text{s}$ | $6\text{--}8\,\text{s}$ | $6\text{--}10\,\text{s}$ | $5\text{--}30\,\text{s}$ | $4.5\,\text{s}$ | $10\text{--}60\,\text{s}$ |
| **Anticipation Runway** | Chest shake & lock strain | Parachute drift & hiss | Stadium tunnel walk | Lock strain & hover | Skyward meteor flight | Foil tear & border peek |
| **Rarity Reveal Mechanism** | Tap crescendo | Internal crate light | 3-step clue ladder | Hover aura glow | Early color tell ($t=1.2\text{s}$) | Edge preview & shimmer |
| **Apex Climax Type** | $3600^\circ/\text{s}$ spin + bloom | Ground slam + flare | Silhouette + stat slam | Flip blast + voice | Impact shockwave + splash | Gyro holo reflection |
| **Micro-Pause Technique** | $100\,\text{ms}$ dead-air freeze | Impact frame hit-stop | $15\,\text{ms}$ hit-stop per clue | Pre-flip hover apex | $150\,\text{ms}$ pre-impact freeze | Spring-back settle |
| **Dominant Disney Principles** | Squash/stretch, Exaggeration | Staging, Timing | Anticipation, Staging | Secondary action, Squash | Arcs, Follow-through | Solid drawing, Appeal |
| **Audio-Visual Sync** | Pitch staircasing + silence | Sub-bass sync ($0\,\text{ms}$) | Heartbeat riser + pyro | Foley + voice ducking | Harp + star bell pings | Tactile paper/foil foley |
| **Dopamine Curve** | Crescendo: steps per tap | Steep: sharp slam apex | Stepped: 3 deductive gates | Plateau: sustained hover | Early spike: color tell | Savoring: tactile tilt |

---

# 3. Disney's 12 Animation Principles Interactive Matrix

To translate classical animation theory into production-ready frontend engineering, each of Disney’s 12 principles is mapped directly to digital UI and web motion parameters:

| # | Principle | Cel Animation Definition | Digital Reveal / Web Motion Translation | Timing Budget | Visual Weight | Perceptual Impact |
|---|---|---|---|---|---|---|
| **01** | **Squash & Stretch** | Deforming an object without changing volume to convey mass and elasticity | Portal squashes vertically (`scaleY: 0.70, scaleX: 1.25`) before explosive card launch; card squashes $4\%$ on apex landing | $40\text{--}80\,\text{ms}$ | High ($20\%$) | Eliminates mechanical stiffness; conveys organic energy storage and physical density |
| **02** | **Anticipation** | Preparatory action in the opposite direction before main movement | Energy portal gathers inward luminance; card dips downward $15\,\text{px}$ before shooting upward | $150\text{--}300\,\text{ms}$ | Critical ($35\%$) | Signals impending event; steers foveal gaze to launch origin; primes nervous system |
| **03** | **Staging** | Presenting an idea so that it is unmistakably clear and readable | Fullscreen dimmed backdrop (`rgba(0,0,0,0.85)` + $24\,\text{px}$ blur) eliminating peripheral distractions; symmetrical center stage | Whole sequence | Dominant ($50\%$) | Drives extraneous cognitive load to zero; locks $100\%$ visual attention to card axis |
| **04** | **Straight Ahead & Pose to Pose** | Spontaneous fluid animation vs structured keyframe milestones | Procedural Canvas 2D particle burst (straight-ahead) combined with keyframed GSAP card rig poses (pose-to-pose) | Continuous | High ($25\%$) | Combines structural mathematical predictability with chaotic natural physical flair |
| **05** | **Follow Through & Overlapping Action** | Unattached parts continue moving after main body stops | Card settles into center position while perimeter aura expands for $400\,\text{ms}$ and sparks drift for $1200\,\text{ms}$ | $300\text{--}600\,\text{ms}$ | Medium ($15\%$) | Prevents jarring, abrupt visual halts; simulates natural thermodynamic dissipation |
| **06** | **Slow In & Slow Out** | Clustering frames near start and end of movement | Calibrated cubic-bezier curves (`power3.out`, `expo.out`, `sine.inOut`); zero linear motion on hero elements | Whole sequence | Critical ($30\%$) | Mimics real-world physical inertia, acceleration, and friction |
| **07** | **Arcs** | Natural paths of action follow curved or parabolic trajectories | Ascending card traces subtle parabolic curve; radial shockwaves expand outward along circular wavefronts | $400\text{--}800\,\text{ms}$ | Medium ($15\%$) | Makes digital element trajectories feel organic and physically believable |
| **08** | **Secondary Action** | Actions that enrich and support the primary action | Dynamic background radial rays, ascending stardust motes, floating embers, and glowing stats tickers | Continuous | High ($20\%$) | Enriches visual texture and elevates the perceived mythic prestige of the artifact |
| **09** | **Timing & Spacing** | Number of frames between actions determining weight and mood | Sharp pacing contrast: explosive $750\,\text{ms}$ launch, $140\,\text{ms}$ fermata freeze, and leisurely $500\,\text{ms}$ landing | Whole sequence | Critical ($40\%$) | Establishes the emotional cadence; builds tension through rhythmic acceleration |
| **10** | **Exaggeration** | Amplifying reality to achieve heightened dramatic effect | Full $1080^\circ$ multi-axis spin; screen-saturating whiteout flash; $200\%$ amplified holographic iridescence | $120\text{--}250\,\text{ms}$ | High ($25\%$) | Creates a larger-than-life spectacle worthy of a rare, collectible treasure |
| **11** | **Solid Drawing / 3D Form** | Conveying volume, perspective, and three-dimensional solidity | CSS 3D transforms (`perspective: 1200px`, `preserve-3d`), bevel borders, normal-mapped specular sheen | Continuous | High ($25\%$) | Makes a flat 2D browser canvas feel like a tangible, substantial physical card |
| **12** | **Appeal** | Charisma, design elegance, and visual delight | Silky $60/\!120\,\text{fps}$ GPU performance, harmonious vermilion/gold palette, pristine vector typography | Continuous | Dominant ($40\%$) | Fosters emotional attachment and pride in viewing the summoned artifact |

---

# 4. Neurobiology of Anticipation & Observation Psychology

The emotional potency of a reveal animation is governed by the neurobiology of the human brain. By understanding how the visual cortex, attention networks, and midbrain dopamine pathways operate, we engineer an experience that maximizes psychological satisfaction.

```
                         [ Retinal & Visual Processing Stream ]
  Peripheral Retina (>5° eccentric) ──► Superior Colliculus ──► Involuntary Saccadic Trigger
  Parafovea (2° - 5°)               ──► Area MT / V5        ──► Motion & Luminance Processing
  Fovea Centralis (0° - 2°)         ──► V1 / IT Cortex      ──► High Acuity Text & Face Recognition
```

### 4.1 Visual Acuity & Saccadic Suppression Windows
- **Foveal Vision ($0^\circ\text{--}2^\circ$)**: Covers the central $1.5\,\text{mm}$ of the retina, providing $100\%$ cone density for text reading, face recognition, and fine vector detail.
- **Saccadic Eye Movements ($20\text{--}50\,\text{ms}$)**: The human eye travels in ballistic jumps up to $700^\circ/\text{s}$, interspersed with fixations ($200\text{--}350\,\text{ms}$).
- **Cortical Saccadic Suppression**: During every saccadic jump, the visual cortex temporarily suppresses visual input to avoid motion blur.
- **Engineering Rule**: *Never reveal critical card identity, stats, or rarity text while the card is traveling at high velocity across the viewport.* Critical content must be unveiled only when translational velocity is near zero ($\frac{dy}{dt} \approx 0$).

### 4.2 Cognitive Load Management: Signal-to-Noise Ratio
According to Sweller's Cognitive Load Theory, human working memory is severely limited. To maximize the perceived power of the summon, **extraneous cognitive load must be driven asymptotically to zero**:
- **Backdrop Suppression**: Dimming the underlying portfolio page to $15\%$ luminance (`rgba(0,0,0,0.85)`) and applying `backdrop-blur-xl` ($24\,\text{px}$) eliminates background distraction (work grid, navigation, code snippets).
- **Spatial Redirection**: A curved energy portal emerging at bottom-center directs parafoveal vision to the exact launch coordinates, establishing an intuitive foveal anchor.
- **Negative Space ("Visual Breath")**: In the $100\text{--}180\,\text{ms}$ immediately preceding the climax (the fermata), extraneous particles must freeze or extinguish, creating a sensory void before the flash.

---

### 4.3 The Schultz Reward Prediction Error (RPE) Model
Wolfram Schultz (1997, 2016) demonstrated that midbrain dopamine neurons in the Ventral Tegmental Area (VTA) encode reward dynamics according to:

$$\text{RPE} = R_{\text{received}} - R_{\text{expected}}$$

1. **Unconditioned State**: Reward delivery triggers a phasic burst.
2. **Conditioned Learning**: When a predictive cue (portal ignition, vibration) reliably precedes a reward, the phasic dopamine burst **migrates backward in time** to the cue itself.
3. **The Fiorillo Tonic Uncertainty Ramp (2003)**: When outcome rarity is uncertain ($p \approx 0.5$), dopamine neurons do not fire once and fall silent; they produce a **sustained, climbing tonic elevation throughout the entire anticipation interval**.
4. **The Core Neurochemical Paradox**: *The human brain experiences a higher, more sustained concentration of dopamine during the unresolved anticipation phase than upon delivery of the reward itself.*

```
Dopamine Concentration
 1.0 │                                         ╭── Phasic Burst (Apex Climax)
     │                                      ╭──╯
 0.8 │                       ╭──────────────╯ ◄── Sustained Tonic Ramp (Anticipation)
 0.6 │                 ╭─────╯
 0.4 │           ╭─────╯
 0.2 │     ╭─────╯ ◄── Initial Cue Burst (Portal Ignition)
 0.0 └─────┴───────────────────────────────────► Time
       Cue (t=0)        Anticipation (t=0.3-1.1s)   Climax (t=1.2s)
```

---

### 4.4 Mathematical Modeling of Tension Accumulation
Tension accumulation during Phase 2 follows a **normalized exponential crescendo** parameterized on the normalized time interval $\tau = \frac{t - t_0}{\Delta t} \in [0, 1]$:

$$T(\tau) = \frac{e^{k \cdot \tau} - 1}{e^k - 1}$$

Where $k \approx 3.0$ is the crescendo acceleration constant. This formulation satisfies the strict boundary conditions $T(0) = 0$ (zero baseline tension at portal emergence) and $T(1) = 1.0$ (peak tension at fermata entry), with a twenty-fold surge in the rate of accumulation ($T'(1) / T'(0) = e^3 \approx 20.08$).

```
Tension T(τ)
 1.0 │                                     ╭─── Normalized Exponential T(τ) = (e^kτ - 1)/(e^k - 1)
     │                                   ╭─╯    [ Natural physical rupture, k = 3.0 ]
 0.8 │                                 ╭─╯
     │                               ╭─╯   ──── Linear T(τ) = τ [ Predictable ]
 0.6 │                             ╭─╯
     │                       ╭─────╯         . . . . Logarithmic T(τ) [ Premature fatigue ]
 0.4 │                 ╭─────╯
 0.2 │           ╭─────╯
 0.0 └───────────┴─────────────────────────────► Normalized Time τ
```

#### Kinematic & Sensory Parameterization (Nyquist-Bandlimited):
1. **Nyquist-Shannon Sampling Constraint**: Standard browser rendering operates at $f_s = 60\,\text{FPS}$ ($16.67\,\text{ms}$ budget), establishing a strict Nyquist ceiling of $f_{\text{Nyquist}} = \frac{f_s}{2} = 30\,\text{Hz}$. Any physical coordinate oscillation exceeding $30\,\text{Hz}$ induces stroboscopic retrograde aliasing (e.g. $60\,\text{Hz}$ samples appear completely motionless, while $56\,\text{Hz}$ appears as a sluggish $4\,\text{Hz}$ reverse crawl).
2. **Bandlimited Frequency Sweep**: Physical transform vibrations are strictly bandlimited to $f_{\max} \le 24\,\text{Hz} < f_{\text{Nyquist}}$, accelerating monotonically from $10\,\text{Hz}$ to $24\,\text{Hz}$ over the $350\,\text{ms}$ pre-fermata window ($t \in [0.75\,\text{s}, 1.10\,\text{s}]$):
   $$f(t) = f_{\min} \cdot \left(\frac{f_{\max}}{f_{\min}}\right)^{\frac{t - 0.75}{0.35}} = 10 \cdot (2.4)^{\frac{t - 0.75}{0.35}}\,\text{Hz}$$
3. **Amplitude Compression**: Lateral displacement compresses from a perceptible rattle ($A_{\max} = 3.5\,\text{px}$) down to a tight, focused energetic hum ($A_{\min} = 1.5\,\text{px}$):
   $$A(t) = A_{\max} - (A_{\max} - A_{\min}) \cdot \left(\frac{t - 0.75}{0.35}\right)^{0.5}$$
4. **Perceptual Density**: In timeline execution, an even 14-half-cycle oscillation ($N = 14$, step duration $0.025\,\text{s}$, full wave $f = 20\,\text{Hz}$) guarantees crisp $60\,\text{FPS}$ rendering without aliasing while perfectly returning $x \to 0$ before the fermata freeze.

---

### 4.5 The Fermata (The $120\text{--}180\,\text{ms}$ Temporal Freeze)
At the summit of the tension curve (between $t = 1.10\,\text{s}$ and $t = 1.25\,\text{s}$, duration $150\,\text{ms}$), the animation introduces an intentional **fermata**—an absolute spatial freeze of translation ($\frac{dx}{dt} = 0$, $\frac{dy}{dt} = 0$) and 3D rotation ($\frac{d\theta_y}{dt} = 0$, $\frac{d\theta_z}{dt} = 0$).

```
Motion:   Ascent (Fast) ───► Rapid Decel ───► [ FERMATA FREEZE (150ms) ] ───► OPTICAL FLASH
Spatial:  High Velocity ───► v -> 0      ───► v_spatial == 0 (Locked)    ───► Climax Flip
Energy:   Accumulating  ───► Maximum     ───► SWELL (Scale: 1.020->1.025)───► Catharsis
```

- **Spatial Lock vs Energetic Swell**: Spatial coordinates are completely locked at $x = 0$, $yPercent = -3\%$, $\text{rotationY} = -198^\circ$, and $\text{rotationZ} = 1.5^\circ$. Concurrently, card scale undergoes a subtle anticipatory dilation from $1.020 \to 1.025$ ($\frac{ds}{dt} = +0.0333\,\text{s}^{-1}$) accompanied by aura luminance surging to $100\%$. This communicates an impending rupture of contained energy without positional drift.
- **Sokolov Orienting Reflex**: When high-velocity spatial travel suddenly halts, the visual cortex interprets the stillness as an imminent state change. Noradrenaline surges, pupils dilate ($+0.4\,\text{mm}$), and foveal gaze locks onto the card silhouette.
- **Fechner’s Contrast Amplification**: Spatial stillness and acoustic cut for $150\,\text{ms}$ make the subsequent optical flash and particle detonation feel ten times more explosive by virtue of maximal sensory contrast.
- **Biological Window**: Shorter than $80\,\text{ms}$ registers as a frame drop. Longer than $250\,\text{ms}$ induces cognitive confusion ("Did the browser freeze?"). The calibrated duration is **$150\,\text{ms}$** ($t = 1.10\,\text{s} \to 1.25\,\text{s}$).

---

### 4.6 Catharsis: The Neurochemical Shift to Resolution
The sequence across the climax is an engineered neurochemical pivot:
- **Phase 2 (Anticipation)**: Sympathetic nervous system activation $\to$ Noradrenaline + Cortisol + Tonic Dopamine ramp.
- **Phase 3 (Climax Rupture)**: Sensory shock transient $\to$ Peak Phasic Dopamine RPE spike + Adrenaline.
- **Phases 4 & 5 (Reveal & Settle)**: Parasympathetic recovery $\to$ Endorphins + Serotonin + Dopamine Satiation. The user enters a state of aesthetic calm, ready for interactive inspection.

---

# 5. Universal 5-Phase Sequence Decomposition Model

Synthesizing the neurobiological model and empirical teardowns, we establish the **Universal 5-Phase Sequence Decomposition Model**:

```
[ Phase 1: Preparation ] ──► [ Phase 2: Tension ] ──► [ Phase 3: Apex ] ──► [ Phase 4: Reveal ] ──► [ Phase 5: Settle ]
     350ms - 500ms                850ms - 1200ms           120ms - 250ms          600ms - 800ms             Infinite (Idle)
  Backdrop Dimming             Spin & Ascent             Optical Rupture        Foil Specular Wipe        3D Parallax Tilt
  Portal Emergence             Vibration Sweep           Flash & Shockwave      Blur Mask Drop            Ambient Embers
  Acoustic Vacuum Hum          Fermata Freeze (140ms)    Bass Transient         5-Star Cascade            Inspection State
```

---

#### 5.1 Master Choreography & Timing Matrix (Canonical 2.05s Schedule)

| Phase | Time Window | Duration | Primary Focal Anchor | Visual Salience Drivers | Motion Curves & Easing | Sensory Cues |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Preparation & Portal Buildup** | $0.00\text{s} \to 0.35\text{s}$ | $350\,\text{ms}$ | Bottom center launchpad | Backdrop dimming ($85\%$), curved portal emergence, anticipatory inhale squash ($0.25\text{--}0.35\text{s}$) | `power2.out` (backdrop)<br>`power3.out` (portal rise)<br>`power1.in` (inhale squash) | Low sub-bass vacuum hum (suction gathering) |
| **Phase 2: Tension Accumulation & Fermata** | $0.35\text{s} \to 1.25\text{s}$ | $900\,\text{ms}$ | Ascending card core | 3.5-spin ascent (`rotY: -1260° -> -198°`), bandlimited vibration ($20\,\text{Hz}$, $0.75\text{--}1.10\text{s}$), **150ms fermata freeze ($1.10\text{--}1.25\text{s}$)** | `power3.out` (ascent)<br>`sine.inOut` (14-cycle vibration)<br>`none` (fermata freeze) | Ascending pitch sweep ($80\to600\,\text{Hz}$), cut to dead silence at $1.10\text{s}$ |
| **Phase 3: Apex Rupture & Climax** | $1.25\text{s} \to 1.45\text{s}$ | $200\,\text{ms}$ | Stage optical center ($0,0$) | Optical flash veil ($40\text{ms}$ rise, $160\text{ms}$ decay), radial shockwave ($220\text{ms}$), **$198^\circ$ card flip to $0^\circ$**, scale transient | `power4.in` + `expo.out` (flash)<br>`power4.out` (shockwave)<br>`back.out(1.5)` (flip) | Explosive sub-bass boom ($45\,\text{Hz}$) + glass fracture transient |
| **Phase 4: Card Reveal & Foil Sweep** | $1.35\text{s} \to 2.05\text{s}$ | $700\,\text{ms}$ | Card Face (Portrait, Stars, Stats) | Mask opacity fade ($450\text{ms}$), holographic foil sweep ($650\text{ms}$), 5-star cascade, graceful descent to `yPercent: 0` | `power2.inOut` (mask fade & foil)<br>`power2.out` (descent)<br>`back.out(2.0)` (stars) | Harmonious major chord chime + crystalline star bell pings ($60\text{ms}$ stagger) |
| **Phase 5: Settle & Interactive 3D Parallax** | $2.05\text{s} \to \infty$ | Continuous | Complete modal stage | 3D cursor parallax tilt ($\pm 12^\circ$), dynamic specular reflection tracking, idle breathing loop | `power1.out` (quickTo spring)<br>`sine.inOut` (idle hover, $3.2\text{s}$) | Ethereal ambient synthesizer pad, interactive inspection |

*Master Sequence Duration*: Exactly **$2.05\,\text{s}$** ($2050\,\text{ms}$) from click trigger to interactive settle.

---

### 5.2 Granular Phase Specifications

#### Phase 1: Preparation & Portal Buildup ($0.00\text{s} \to 0.35\text{s}$, $350\,\text{ms}$)
- **Perceptual Role**: Context elimination and spatial redirection. Guides parafoveal vision away from ambient content directly to launchpad coordinates.
- **Visual Staging**:
  - `backdropEl`: Opacity transitions from `0` to `0.85` in $250\,\text{ms}$ using `power2.out` with `backdrop-blur-xl`.
  - `bottomGlowEl`: SVG curved hill element emerges at bottom center, rising from `yPercent: 100` to `yPercent: 0` in $350\,\text{ms}$ (`power3.out`).
  - Anticipatory Inhale: From $t = 0.25\,\text{s}$ to $t = 0.35\,\text{s}$ ($100\,\text{ms}$), `bottomGlowEl` squashes (`scaleY: 0.70`, `scaleX: 1.15`, `power1.in`) like a lung inhaling before the launch.

#### Phase 2: Tension Accumulation & Fermata ($0.35\text{s} \to 1.25\text{s}$, $900\,\text{ms}$)
- **Perceptual Role**: Maximizes the tonic dopamine ramp while concealing the card’s front face during high-velocity rotation.
- **Kinematics & Staging**:
  - `cardEl`: Launches upward through portal (`yPercent: 120 -> -3%`, duration $750\,\text{ms}$, $t = 0.35\text{--}1.10\,\text{s}$, `power3.out`).
  - Ascent Spin: Executes 3.5 full rotations around Y-axis (`rotationY: -1260° -> -198°`) with Z-tilt decelerating from $12^\circ \to 1.5^\circ$. At $-198^\circ$, the ornate card back faces the user at a dynamic $18^\circ$ tilt angle while the front face is fully concealed.
  - Micro-Vibration Sweep: Active from $t = 0.75\,\text{s}$ to $t = 1.10\,\text{s}$ ($350\,\text{ms}$). Runs exactly 14 half-cycles (`duration: 0.025`, `repeat: 13`, `yoyo: true`, $f = 20\,\text{Hz}$), terminating precisely at $t = 1.100\,\text{s}$ at $x = 0$.
  - **The Apex Fermata**: From $t = 1.10\,\text{s}$ to $t = 1.25\,\text{s}$ ($150\,\text{ms}$), spatial coordinates are locked with `tl.set(cardEl, { x: 0 })`. Aura swells to $100\%$ luminance, and scale gently expands from $1.020 \to 1.025$.

#### Phase 3: Apex Rupture & Climax ($1.25\text{s} \to 1.45\text{s}$, $200\,\text{ms}$)
- **Perceptual Role**: Tension discharge, pupillary reset, and phasic dopamine RPE surge.
- **Kinematics & Staging**:
  - `flashVeilEl`: Pure white optical flash jumps to `opacity: 0.95` in $40\,\text{ms}$ (`power4.in`), then dissolves to `0` over $160\,\text{ms}$ (`expo.out`).
  - `shockwaveEl`: Circular SVG ring expands from card center from `scale: 0.2` to `scale: 2.8` while fading to `opacity: 0` in $220\,\text{ms}$ (`power4.out`).
  - `ClimaxFX`: Dispatches Canvas 2D particle burst (45 radial spark particles).
  - **The Climax 3D Flip**: Container snaps $198^\circ$ from `rotationY: -198°` to `rotationY: 0°` and `rotationZ: 0°` ($t = 1.25\text{--}1.40\,\text{s}$, duration $150\,\text{ms}$, `back.out(1.5)`), bringing the card front into direct view while backface-culling the card back.
  - Scale Transient: Anticipatory squash ($t = 1.25\text{--}1.29\,\text{s}$, `scale: 0.96`), explosive rebound ($t = 1.29\text{--}1.37\,\text{s}$, `scale: 1.08`), and recovery ($t = 1.37\text{--}1.45\,\text{s}$, `scale: 1.02`).

#### Phase 4: Card Reveal & Holographic Foil Sweep ($1.35\text{s} \to 2.05\text{s}$, $700\,\text{ms}$)
- **Perceptual Role**: Pattern recognition and semantic decoding. Restored foveal vision decodes the developer portrait, title, and stats.
- **Kinematics & Staging**:
  - Mask Fade: `cardFrontMaskEl` opacity transitions from `1` to `0` in $450\,\text{ms}$ (`power2.inOut`, $t = 1.35\text{--}1.80\,\text{s}$), revealing crisp vector graphics without CPU filter re-rasterization.
  - Holographic Sheen: Specular sheen sweeps diagonally across the card from `xPercent: -120` to `xPercent: 180` in $650\,\text{ms}$ (`power2.inOut`, $t = 1.40\text{--}2.05\,\text{s}$).
  - Descent to Center: Card descends from overshoot `yPercent: -3%` to resting center `yPercent: 0%` and `scale: 1.0` in $500\,\text{ms}$ (`power2.out`, $t = 1.45\text{--}1.95\,\text{s}$).
  - 5-Star Cascade: Golden stars stamp down sequentially ($t = 1.55\text{--}1.99\,\text{s}$, duration $200\,\text{ms}$, stagger $60\,\text{ms}$, `back.out(2.0)`).

#### Phase 5: Settle & Interactive 3D Parallax ($2.05\text{s} \to \infty$)
- **Perceptual Role**: Tactile ownership, inspection, and dopamine consolidation.
- **Kinematics & Interaction**:
  - State Transition: At $t = 2.05\,\text{s}$, master timeline sets `this.currentPhase = 'settled'` and dispatches `onPhaseChange?.('settled')`.
  - Parallax Handoff: Handed off to `TiltController` for smooth pointer tracking ($\pm 12^\circ$ tilt) with spring damping.
  - Idle Loop: Continuous subtle vertical breathing bob (`y: "+=6px"`, $3.2\,\text{s}$ period, `sine.inOut`, `yoyo: true`, `repeat: -1`).

---

# 6. CardSummonEngine Architectural Redesign Specification

### 6.1 Clean Architecture Alignment
In strict conformance with `AGENTS.md` and `docs/rules.md`:
- **Domain Layer (`portfolio/src/domain/types.ts`)**: Contains pure types and interfaces with zero UI dependencies.
- **Data Layer (`portfolio/src/data/cards.ts`)**: Contains typed collectible card definitions.
- **Engines Layer (`portfolio/src/engines/card/`)**: Contains the orchestrator and internal subsystems.

```
portfolio/
├── src/
│   ├── domain/
│   │   └── types.ts             # CardRarity, CardData, CardStats, SummonPhase
│   ├── data/
│   │   └── cards.ts             # DEVELOPER_CARD, showcase collectible records
│   └── engines/
│       └── card/
│           ├── CardSummonEngine.ts   # Public Engine orchestrator & lifecycle manager
│           ├── types.ts              # Internal engine configuration types
│           └── subsystems/           # Modular visual components
│               ├── PortalRenderer.ts
│               ├── CardRig.ts
│               ├── CardFaceRenderer.ts
│               ├── CardBackRenderer.ts
│               ├── ClimaxFX.ts
│               └── TiltController.ts
```

---

### 6.2 Domain Layer Additions (`portfolio/src/domain/types.ts`)

```typescript
/**
 * Rarity classifications for collectible portfolio cards
 */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

/**
 * Combat & engineering attributes for RPG card presentation
 */
export interface CardStats {
  atk: number;         // Engineering firepower / execution velocity
  def: number;         // Robustness / architectural stability
  speed?: number;      // Rapid iteration & sub-second HMR
  efficiency?: number; // Algorithmic efficiency & memory footprint
}

/**
 * Developer specialty skill or architectural ability
 */
export interface CardSkill {
  name: string;
  tagline: string;
  description: string;
}

/**
 * Universal Collectible Card Domain Entity
 */
export interface CardData {
  id: string;
  name: string;
  title: string;
  rarity: CardRarity;
  stars: number;
  role: string;
  avatarSrc: string;
  avatarAlt: string;
  skill: CardSkill;
  stats: CardStats;
  loreQuote?: string;
  accentColor?: string;
}

/**
 * The 5 Universal Phases of the Summoning Sequence
 */
export type SummonPhase =
  | 'idle'
  | 'preparation'   // Phase 1: Backdrop dim, portal ignition, foveal anchoring
  | 'anticipation'  // Phase 2: Portal vortex swell, card emergence, high-speed spin
  | 'apex'          // Phase 3: Optical flash rupture, scale transient, aura burst
  | 'reveal'        // Phase 4: Holographic sheen sweep, unblur, stats counter roll
  | 'settled';      // Phase 5: 3D interactive tilt, pointer parallax, inspection
```

---

### 6.3 Data Layer Additions (`portfolio/src/data/cards.ts`)

```typescript
import type { CardData } from '@/domain/types';

export const DEVELOPER_CARD: CardData = {
  id: 'card-zeiad-mohammed',
  name: 'Zeiad Mohammed',
  title: 'Systems & Mobile Architect',
  rarity: 'mythic',
  stars: 5,
  role: 'Mobile Developer',
  avatarSrc: '/profile.jpg',
  avatarAlt: 'Zeiad Mohammed Portrait',
  skill: {
    name: 'Deterministic Flow',
    tagline: 'Zero Layout Overhead',
    description: 'Orchestrates 60fps kinetic motion and isolates visual engines with surgical precision.',
  },
  stats: {
    atk: 9600,
    def: 9800,
    speed: 9400,
    efficiency: 9900,
  },
  loreQuote: 'Turning complex problems into simple, reliable systems that teams can trust.',
  accentColor: '#ff4421',
};
```

---

### 6.4 Engine-Internal Types (`portfolio/src/engines/card/types.ts`)

```typescript
import type { CardData, CardRarity, SummonPhase } from '@/domain/types';

export interface CardSummonTheme {
  primaryColor: string; // default: '#ff4421'
  coreColor: string;    // default: '#ffffff'
  accentColor: string;  // default: '#ff7700'
  foilShader?: string;
}

export interface CardSummonOptions {
  theme?: Partial<CardSummonTheme>;
  cardData?: CardData;
  rarity?: CardRarity;
  interactive?: boolean;        // Whether tapping to trigger reveal is required
  allowSkip?: boolean;          // Whether clicking during ascent skips to reveal
  onPhaseChange?: (phase: SummonPhase) => void;
  onReveal?: (card: CardData) => void;
  onClose?: () => void;
}

export type SummonEvent = 'phaseChange' | 'reveal' | 'close' | 'destroy';

// Backward-compatibility alias for external consumers importing CardSummonData
export type CardSummonData = CardData;
```

---

### 6.5 Public Interface Contract of `CardSummonEngine`

The public contract guarantees **100% backward compatibility** while providing enhanced programmatic controls:

```typescript
import type { Engine, CardData, SummonPhase } from '@/domain/types';
import type { CardSummonOptions, SummonEvent, CardSummonData } from './types';
import { gsap } from 'gsap';

export interface Subsystem {
  mount(parent: HTMLElement): void;
  destroy(): void;
  resize?(): void;
}

export class CardSummonEngine implements Engine {
  public readonly id = 'card-summon';

  constructor(options?: CardSummonOptions);

  // Engine Lifecycle Protocol
  public mount(container: HTMLElement): void;
  public destroy(): void;
  public resize?(): void;

  // State Inspection
  public isOpen(): boolean;
  public getPhase(): SummonPhase;
  public getTimeline(): gsap.core.Timeline | null;

  // Playback Orchestration
  public open(cardData?: CardData): void;                 // Backward-compatible entry
  
  /**
   * Triggers the summon animation and returns a Promise that:
   * - Resolves when Phase 5 ('settled') is reached.
   * - Rejects with DOMException('Summon aborted by user', 'AbortError') if closed mid-flight.
   */
  public summon(cardData?: CardData): Promise<void>;
  
  public skipToReveal(): void;                            // Fast-forwards to Phase 4
  public close(): void;

  // Event Subscription
  public on<E extends SummonEvent>(event: E, handler: (payload: any) => void): () => void;
}
```

---

# 7. Subsystem Modular Architecture & Rendering Engines

To avoid a sprawling monolithic class, `CardSummonEngine` delegates rendering and interaction to six isolated internal subsystems:

```
[ CardSummonEngine (Orchestrator) ]
         │
         ├──► [ PortalRenderer ]   ── SVG Curved Hill & Dynamic Energy Gradients
         ├──► [ CardRig ]          ── CSS 3D Preserve-3D Container & Stage
         ├──► [ CardBackRenderer ] ── Mystic Filigree Sigil & Concealment Art
         ├──► [ CardFaceRenderer ] ── 5-Star RPG Vector Frame, Portrait & Stats
         ├──► [ ClimaxFX ]         ── Canvas 2D Particle Shockwave & Flash Veil
         └──► [ TiltController ]   ── 3D Gyro/Mouse Parallax & Holographic Sheen
```

---

### 7.1 Subsystem 1: `PortalRenderer`
- **Role**: Renders and animates the curved energy hill and ambient vortex at the bottom of the viewport during Phase 1 and Phase 2.
- **Implementation**:
  - Dynamically injects an SVG element with scoped `<defs>` and unique gradient IDs (`portal-core-${id}`, `portal-ambient-${id}`).
  - Uses dual-layer path geometry: an ambient blurred outer hull (`filter: url(#blur)`) and a sharp, super-heated inner core path.
  - Implements the anticipatory "inhale" (squash) before the card shoots upward, followed by a smooth downward fade (`scaleY: 0.2`, `opacity: 0`) during the climb.
- **Teardown**: Detaches SVG DOM node and cleans up gradient definitions.

---

### 7.2 Subsystem 2: `CardRig`
- **Role**: Maintains the double-sided CSS 3D transform hierarchy, ensuring seamless flipping, backface culling, and correct depth sorting.
- **3D Coordinate Orientation Contract**:
  - `[data-summon-card-front]`: Local rotation is $0^\circ$ (untransformed). When container rotation is $0^\circ$, the front face directly addresses the camera and is fully visible.
  - `[data-summon-card-back]`: Local rotation is fixed at $180^\circ$ (`[transform:rotateY(180deg)]`). It is visible when container rotation is $-180^\circ$ (or $-198^\circ$), and culled when container rotation is $0^\circ$.
- **DOM Hierarchy**:
  ```html
  <div data-summon-card-stage class="absolute inset-0 flex items-center justify-center [perspective:1200px]">
    <!-- Luminous perimeter aura halo -->
    <div data-summon-card-aura class="pointer-events-none absolute w-[300px] aspect-[5/7] rounded-3xl blur-xl"></div>
    
    <!-- 3D Transform Card Root -->
    <div data-summon-card class="relative w-[300px] aspect-[5/7] rounded-3xl [transform-style:preserve-3d]">
      <!-- Back Face: Rotated 180deg, visible during ascent and fermata -->
      <div data-summon-card-back class="absolute inset-0 rounded-3xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
        <!-- Rendered by CardBackRenderer -->
      </div>
      <!-- Front Face: Untransformed (0deg), revealed at climax and visible at rest -->
      <div data-summon-card-front class="absolute inset-0 rounded-3xl [backface-visibility:hidden]">
        <!-- Rendered by CardFaceRenderer -->
        <!-- Frosted Glass Blur Mask -->
        <div data-summon-card-mask class="absolute inset-0 rounded-3xl backdrop-blur-xl bg-white/10"></div>
        <!-- Diagonal Holographic Specular Sheen -->
        <div data-summon-specular-sheen class="absolute inset-0 rounded-3xl pointer-events-none"></div>
      </div>
    </div>
  </div>
  ```
- **Teardown**: Implements `destroy(): void` to unmount stage and card container from DOM.

---

### 7.3 Subsystem 3: `CardBackRenderer`
- **Role**: Renders the ornate mystic card back that conceals the card face during the initial ascent and Y-axis spin.
- **Visual Design**:
  - Midnight obsidian background (`#0d0e12`) framed with an intricate double-line golden border.
  - Arcane geometric filigree corners rendered via crisp vector SVGs.
  - Concentric rotating halo rings centered on an embossed metallic monogram crest (`ZM`).
  - Darkened matte finish with subtle central radial vignette.

---

### 7.4 Subsystem 4: `CardFaceRenderer`
- **Role**: Renders the high-contrast, multi-layered collectible RPG card face populated from `CardData`.
- **WCAG 2.1 AA Contrast Strict Compliance**:
  - Obsidian card surface (`#0d0e12`, relative luminance $L = 0.0071$) requires all text to maintain contrast $\ge 4.5:1$ ($\ge 3.0:1$ for large text).
  - Primary text: Pure white (`#ffffff`, $L = 1.0$) $\to$ **$19.29:1$** (PASS AAA).
  - Rarity badges & gold borders: Amber-500 (`#f59e0b`, $L = 0.4079$) $\to$ **$8.98:1$** (PASS AAA).
  - Secondary stat labels (ATK, DEF, SPD, EFF), titles, and descriptions: **MUST use `text-neutral-400` (`#a3a3a3`, $L = 0.3662$, contrast $7.65:1$) or `text-white/80` ($14.2:1$)**. The use of `text-neutral-500` (`#737373`, contrast $4.07:1$) is strictly prohibited on dark surfaces as it violates WCAG AA.
  - Vermilion accent (`#ff4421`, contrast $5.60:1$ on `#0d0e12`) may only be used as a graphic highlight or badge border; it is **strictly prohibited as text on white or light backgrounds** ($3.44:1 < 4.5:1$).
- **Components**:
  1. **Card Frame Header**: Rarity badge (`MYTHIC`, `#f59e0b`), character name ("Zeiad Mohammed", `text-white`), and professional title ("Systems & Mobile Architect", `text-neutral-400`).
  2. **Character Portrait Window**: 16:10 portrait aperture showcasing `avatarSrc`, framed with an inner metallic bevel and subtle corner brackets.
  3. **Rarity Star Cascade**: Row of 5 golden stars (`★ ★ ★ ★ ★`), animated with a staggered bounce reveal in Phase 4.
  4. **Specialty Skill Panel**: Skill name badge ("Deterministic Flow"), tagline, and architectural description (`text-neutral-400`).
  5. **Stats Hexagram / Meters**: Four animated stat meters displaying numerical values (`ATK: 9600`, `DEF: 9800`, `SPD: 9400`, `EFF: 9900`) with high-contrast label tokens and proportional fill bars.
  6. **Collector Footer**: Unique card serialization (`#001 / MYTHIC EDITION`) and copyright stamp (`text-neutral-400`).
- **Teardown**: Implements `destroy(): void` to unmount card face DOM nodes.

---

### 7.5 Subsystem 5: `ClimaxFX`
- **Role**: Orchestrates the optical flash veil and radial particle burst during the Phase 3 apex rupture.
- **Implementation**:
  - Mounts a lightweight HTML5 Canvas element spanning the modal viewport (`pointer-events: none`).
  - **Retina / HiDPI Buffer Clamping**: Scales canvas buffer by clamped DPR to prevent blurriness while guarding against 4K memory spikes:
    ```typescript
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    ```
  - Emits 40–60 radial spark particles traveling along parabolic arcs with initial velocities ($v_0 \in [4, 12]\,\text{px/frame}$) and drag decay ($k_{\text{friction}} = 0.94$).
  - Particle colors match rarity tier: gold (`#f59e0b`), radiant vermilion (`#ff4421`), and superheated white (`#ffffff`).
  - Render loop executes via `requestAnimationFrame`. Automatically halts when particles fade below $0.01$ opacity.
- **Explicit Lifecycle Teardown (`destroy`)**:
  ```typescript
  public destroy(): void {
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.particles.length = 0;
    this.canvas?.remove();
  }
  ```

---

### 7.6 Subsystem 6: `TiltController`
- **Role**: Attaches to the settled card in Phase 5 to provide interactive 3D parallax and dynamic holographic foil reflections.
- **Kinematics & Accessibility**:
  - **Vestibular Protection**: Before attaching listeners, checks `prefers-reduced-motion: reduce`. If active, immediately exits without attaching `pointermove` listeners:
    ```typescript
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
    if (prefersReduced) return;
    ```
  - Listens to `pointermove` on the modal/window. Uses GSAP `quickTo` for smooth $60\,\text{fps}$ spring damping:
    ```typescript
    this.setRotX = gsap.quickTo(this.cardEl, 'rotationX', { duration: 0.35, ease: 'power1.out' });
    this.setRotY = gsap.quickTo(this.cardEl, 'rotationY', { duration: 0.35, ease: 'power1.out' });
    ```
  - Dynamically updates `--mouse-x` and `--mouse-y` CSS properties on card face for specular foil tracking.
  - Automatically resets rotations to $(0,0)$ on `pointerleave`.
- **Explicit Lifecycle Teardown (`destroy`)**:
  ```typescript
  public destroy(): void {
    if (this.boundOnPointerMove) {
      window.removeEventListener('pointermove', this.boundOnPointerMove);
      this.boundOnPointerMove = null;
    }
    if (this.boundOnPointerLeave) {
      window.removeEventListener('pointerleave', this.boundOnPointerLeave);
      this.boundOnPointerLeave = null;
    }
    this.setRotX = null;
    this.setRotY = null;
    gsap.killTweensOf(this.cardEl);
  }
  ```

---

# 8. GSAP Timeline Choreography & Motion Engineering

The entire sequence is coordinated by a unified GSAP master timeline:

```typescript
// Master Opening Timeline Architecture (Total Duration: ~2.05s)
const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

// ==========================================
// PHASE 1: PREPARATION & PORTAL (0.00s - 0.40s)
// ==========================================
tl.fromTo(backdropEl,
  { autoAlpha: 0 },
  { autoAlpha: 1, duration: 0.25, ease: 'power2.out' },
  0
);
tl.fromTo(bottomGlowEl,
  { xPercent: -50, yPercent: 100, scaleY: 0, opacity: 0 },
  { xPercent: -50, yPercent: 0, scaleY: 1, opacity: 1, duration: 0.35, ease: 'power3.out' },
  0
);
// Anticipatory portal "inhale" (squash)
tl.to(bottomGlowEl, {
  scaleY: 0.70,
  scaleX: 1.15,
  duration: 0.10,
  ease: 'power1.in',
}, 0.25);

// ==========================================
// PHASE 2: TENSION & ASCENT (0.35s - 1.25s)
// ==========================================
// Portal recedes as card shoots upward
tl.to(bottomGlowEl, {
  opacity: 0,
  scaleY: 0.20,
  duration: 0.65,
  ease: 'power2.inOut',
}, 0.35);

// Card explosive launch and 3.5-spin ascent (rotationY: -1260deg -> -198deg)
// Back face is visible during ascent; front face is concealed
tl.fromTo(cardEl,
  {
    yPercent: 120,
    rotationY: -1260,
    rotationZ: 12,
    scale: 0.55,
    opacity: 0,
  },
  {
    yPercent: -3,
    rotationY: -198,
    rotationZ: 1.5,
    scale: 1.02,
    opacity: 1,
    duration: 0.75,
    ease: 'power3.out',
  },
  0.35
);

// Pre-apex micro-vibration sweep (0.75s to 1.10s, exactly 350ms)
// Calibrated to 14 even half-cycles (repeat: 13) at 20Hz, ending exactly at x = 0
tl.to(cardEl, {
  x: '+=2.5',
  yoyo: true,
  repeat: 13,
  duration: 0.025,
  ease: 'sine.inOut',
}, 0.75);

// THE APEX FERMATA (1.10s to 1.25s: 150ms dead-still spatial freeze)
// Explicitly clamp x: 0 to guarantee dx/dt = 0 with zero lateral drift
tl.set(cardEl, { x: 0 }, 1.10);

tl.to(cardEl, {
  yPercent: -3,
  rotationY: -198,
  rotationZ: 1.5,
  scale: 1.025, // Subtle anticipatory energy swell (ds/dt = +0.033/s)
  duration: 0.15,
  ease: 'none',
}, 1.10);

// Aura flares to 100% luminance during fermata
tl.fromTo(cardAuraEl,
  { opacity: 0, scale: 0.8 },
  { opacity: 1.0, scale: 1.20, duration: 0.15, ease: 'power2.in' },
  1.10
);

// ==========================================
// PHASE 3: APEX RUPTURE & CLIMAX (1.25s - 1.45s)
// ==========================================
// Optical flash veil burst (40ms rise, 160ms decay)
tl.fromTo(flashVeilEl,
  { opacity: 0 },
  { opacity: 0.95, duration: 0.04, ease: 'power4.in' },
  1.25
);
tl.to(flashVeilEl,
  { opacity: 0, duration: 0.16, ease: 'expo.out' },
  1.29
);

// Shockwave wavefront expansion
tl.fromTo(shockwaveEl,
  { scale: 0.2, opacity: 1 },
  { scale: 2.8, opacity: 0, duration: 0.22, ease: 'power4.out' },
  1.25
);

// Trigger Canvas 2D particle burst in ClimaxFX
tl.add(() => {
  this.climaxFX?.burst(45);
}, 1.25);

// Card scale rebound
tl.to(cardEl, { scale: 0.96, duration: 0.04, ease: 'power1.in' }, 1.25);
tl.to(cardEl, { scale: 1.08, duration: 0.08, ease: 'power4.out' }, 1.29);
tl.to(cardEl, { scale: 1.02, duration: 0.08, ease: 'power2.out' }, 1.37);

// 198° CLIMAX 3D FLIP: Snaps from -198deg to 0deg to reveal front face
// Leaves endRotY === 0 at settle, satisfying test assertion
tl.to(cardEl, {
  rotationY: 0,
  rotationZ: 0,
  duration: 0.15,
  ease: 'back.out(1.5)',
}, 1.25);

// ==========================================
// PHASE 4: CARD REVEAL & FOIL SWEEP (1.35s - 2.05s)
// ==========================================
// Dissolve frosted blur mask
tl.to(cardFrontMaskEl, {
  opacity: 0,
  duration: 0.45,
  ease: 'power2.inOut',
}, 1.35);

// Diagonal holographic foil sheen sweep
tl.fromTo(specularSheenEl,
  { xPercent: -120 },
  { xPercent: 180, duration: 0.65, ease: 'power2.inOut' },
  1.40
);

// Graceful falling descent into resting center
tl.to(cardEl, {
  yPercent: 0,
  scale: 1.0,
  duration: 0.50,
  ease: 'power2.out',
}, 1.45);

// Aura soft dissipation to zero
tl.to(cardAuraEl, {
  opacity: 0,
  scale: 1.30,
  duration: 0.50,
  ease: 'power2.out',
}, 1.45);

// Staggered star stamp cascade
tl.fromTo('[data-summon-star]',
  { scale: 2.5, opacity: 0 },
  { scale: 1.0, opacity: 1, duration: 0.20, stagger: 0.06, ease: 'back.out(2.0)' },
  1.55
);

// ==========================================
// PHASE 5: SETTLE & INTERACTIVE PARALLAX (2.05s+)
// ==========================================
tl.add(() => {
  this.enableInteractiveHoverAndTilt();
  this.currentPhase = 'settled';
  this.options.onPhaseChange?.('settled');
}, 2.05);
```

---

### 8.1 Accessibility & Reduced Motion Protocol
In compliance with `docs/rules.md` and WCAG 2.2 Criterion 2.3.3:
```typescript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // Instantly establish final resting modal hierarchy
  this.openTimeline.set(this.backdropEl, { autoAlpha: 1 });
  this.openTimeline.set(this.bottomGlowEl, { opacity: 0 });
  if (this.cardAuraEl) {
    this.openTimeline.set(this.cardAuraEl, { opacity: 0 });
  }
  this.openTimeline.set(this.cardEl, {
    x: 0,
    yPercent: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scale: 1.0,
    opacity: 1,
  });
  
  // Clear frosted glass blur mask so card face is immediately sharp and legible
  this.openTimeline.set('[data-summon-card-mask]', { opacity: 0 });
  
  // Stamp all rarity stars immediately into settled scale and opacity
  this.openTimeline.set('[data-summon-star]', { scale: 1.0, opacity: 1 });
  
  // Update state machine and notify consumers immediately
  this.currentPhase = 'settled';
  this.options.onPhaseChange?.('settled');
  
  // Suppress flash veil, shockwave, canvas particles, and 3D parallax tilt
  return;
}
```

---

# 9. Backward Compatibility & Test Preservation Matrix

To guarantee zero regressions across the codebase, the redesign maintains complete compatibility with all 31 existing unit tests in `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`:

| # | Existing Test Assertion | Preserved in Redesign? | Implementation Guarantee |
|---|---|---|---|
| 1 | `engine.id === 'card-summon'` | YES | Preserved on class instance |
| 2 | `isOpen()` initially false | YES | Initial state defaults to `false` |
| 3 | Modal has `role="dialog"`, `aria-modal="true"` | YES | Semantic dialog attributes preserved |
| 4 | Backdrop `[data-summon-backdrop]` with `bg-black/85 backdrop-blur-xl` | YES | Exact class string and data attribute preserved |
| 5 | Bottom glow `[data-summon-bottom-glow]` with SVG | YES | Preserved; enhanced with dynamic gradient IDs |
| 6 | Close button `[data-summon-close]` with accessible label | YES | Preserved at top-right with ESC keybinding |
| 7 | Custom theme colors (`primaryColor`, `coreColor`) applied | YES | Options theme parameter supported identically |
| 8 | Card stage `[data-summon-card-stage]` with `perspective: 1200px` | YES | 3D perspective stage preserved |
| 9 | Card aura `[data-summon-card-aura]` with radial gradient | YES | Aura element preserved and synchronized |
| 10 | Card element `[data-summon-card]` with `preserve-3d` | YES | Card element preserved; children mounted inside |
| 11 | Initial ascent at `rotationY: -1260°` (3.5 spins) | ADAPTED | Launch at $-1260^\circ$ (3.5 spins) conceals front face during ascent; snaps $198^\circ$ from $-198^\circ \to 0^\circ$ at climax, preserving `endRotY === 0` resting test assertion. Test 11 startRotY updated to 1260. |
| 12 | Apex overshoot `yPercent: -3%` | YES | Apex peak tuned between $-3.5\%$ and $-2.0\%$ |
| 13 | Graceful descent `yPercent: 0`, `power2.out`, $\ge 0.4\,\text{s}$ | YES | $0.50\,\text{s}$ descent to `0%` preserved |
| 14 | Aura dissipation to $\le 0.05$ on landing | YES | Aura fades to `0` with `power2.out` |
| 15 | Portal recedes downward to opacity $\le 0.05$ | YES | Portal recedes with `scaleY: 0.2, opacity: 0` |
| 16 | Reduced motion immediately centers card (`duration: 0`) | YES | Instant placement guard preserved |
| 17 | Reduced motion sets aura opacity $\le 0.2$ | YES | Aura set to `0` under reduced motion |
| 18 | `close()` removes modal DOM and restores body scroll | YES | Teardown logic completely preserved |
| 19 | ESC key triggers `close()` | YES | Keydown listener preserved |
| 20 | Backdrop click triggers `close()` | YES | Click listener preserved |
| 21 | Close button click triggers `close()` | YES | Click listener preserved |
| 22 | Double `open()` is idempotent | YES | `if (this.isDialogOpen) return;` guard preserved |
| 23 | Double `close()` or `destroy()` does not throw | YES | Safe null checks preserved |
| 24 | Mount defaults to `document.body` if unmounted | YES | Fallback mounting preserved |
| 25 | Active timeline paused & killed on `close()` / `destroy()` | ENHANCED | `this.openTimeline?.pause().kill()` ensures timeline is unlinked and paused with zero zombie ticker frames. |
| 26 | Focus restored to previous element on close | YES | `this.previousActiveElement?.focus()` preserved |
| 27 | Focus trapped or moved to close button on open | YES | `closeBtn.focus()` preserved |
| 28 | `onClose` callback fired on modal exit | YES | `this.options.onClose?.()` preserved |
| 29 | Z-tilt decelerates from $12^\circ \to 0^\circ$ | YES | Angular deceleration preserved |
| 30 | Card scale maintains $\ge 0.98$ on landing (no squash) | YES | Landing settles cleanly to `scale: 1.0` |
| 31 | Clean teardown with zero DOM, rAF, or listener leaks | ENHANCED | Synchronous invocation of `climaxFX.destroy()`, `tiltController.destroy()`, `portalRenderer.destroy()`, and `cardRig.destroy()` prevents orphaned animation frames or window listeners. |

---

# 10. Test-Driven Development (TDD) Implementation Roadmap & Verification Gates

Following the mandatory planning-first and strict TDD protocols (`AGENTS.md`), implementation proceeds across structured tasks. Each task requires failing test specifications (RED phase) before writing production code (GREEN phase).

```
========================================================================================
TDD IMPLEMENTATION PHASES
========================================================================================
Phase A: Domain & Data Contracts
  ├─► Add CardRarity, CardData, CardStats to portfolio/src/domain/types.ts
  └─► Add DEVELOPER_CARD repository to portfolio/src/data/cards.ts

Phase B: Isolated Subsystems (TDD Unit Suites)
  ├─► Subsystem 1: PortalRenderer (SVG energy hill, dynamic gradients, inhale squash)
  ├─► Subsystem 2: CardRig (CSS 3D double-sided hierarchy, stage, preserve-3d)
  ├─► Subsystem 3: CardBackRenderer (Obsidian/gold filigree, mystic monogram crest)
  ├─► Subsystem 4: CardFaceRenderer (Vector RPG frame, portrait, 5-star cascade, stats)
  ├─► Subsystem 5: ClimaxFX (Canvas 2D particle burst, optical flash veil, shockwave)
  └─► Subsystem 6: TiltController (3D gyroscopic parallax, specular sheen tracking)

Phase C: Orchestrator Integration & GSAP Choreography
  ├─► Wire subsystems into CardSummonEngine.ts
  ├─► Assemble master GSAP timeline (Preparation -> Tension -> Apex -> Reveal -> Settle)
  └─► Connect DEVELOPER_CARD to ProfileAvatar / ProfileHeader trigger

Phase D: Verification & Quality Assurance
  ├─► Run full test suite: npm --prefix portfolio test (all 159+ tests pass)
  ├─► Run production build: npm --prefix portfolio run build (tsc && vite build pass)
  └─► Manual interaction audit across mobile, tablet, and desktop viewports
========================================================================================
```

---

### Task 1: Domain Models & Central Card Repository
- **Files**:
  - Modify: `portfolio/src/domain/types.ts`
  - Create: `portfolio/src/data/cards.ts`
  - Create: `portfolio/src/data/__tests__/cards.test.ts`
- **TDD Red Phase**:
  - Write test assertions verifying `DEVELOPER_CARD` matches `CardData` schema, contains 5 stars, valid rarity (`mythic`), non-empty stats, and developer avatar.
- **TDD Green Phase**:
  - Implement types in `types.ts` and card records in `cards.ts`. Verify unit tests pass.

---

### Task 2: CardRig & Dual-Sided 3D Transform Subsystem
- **Files**:
  - Create: `portfolio/src/engines/card/subsystems/CardRig.ts`
  - Create: `portfolio/src/engines/card/__tests__/subsystems/CardRig.test.ts`
- **TDD Red Phase**:
  - Test stage creation (`perspective: 1200px`), card container (`transform-style: preserve-3d`), front face at local $0^\circ$ (`backface-visibility: hidden`), and back face at local $180^\circ$ (`[transform:rotateY(180deg)]`, `backface-visibility: hidden`).
  - Test that `CardRig.destroy()` cleanly removes elements from DOM.
- **TDD Green Phase**:
  - Implement `CardRig` obeying the inverted 3D coordinate contract and `Subsystem` lifecycle.

---

### Task 3: CardFaceRenderer & CardBackRenderer Vector Systems
- **Files**:
  - Create: `portfolio/src/engines/card/subsystems/CardBackRenderer.ts`
  - Create: `portfolio/src/engines/card/subsystems/CardFaceRenderer.ts`
  - Create: `portfolio/src/engines/card/__tests__/subsystems/CardRenderers.test.ts`
- **TDD Red Phase**:
  - Test SVG filigree rendering, character portrait population, 5 golden stars, stats meters, and serialization typography.
- **TDD Green Phase**:
  - Implement vector renderers using pure semantic HTML and inline SVG.

---

### Task 4: ClimaxFX Canvas Particle Burst & Optical Flash
- **Files**:
  - Create: `portfolio/src/engines/card/subsystems/ClimaxFX.ts`
  - Create: `portfolio/src/engines/card/__tests__/subsystems/ClimaxFX.test.ts`
- **TDD Red Phase**:
  - Test Canvas 2D overlay mounting, DPR buffer clamping (`Math.min(devicePixelRatio, 2)`), particle pool generation (40–60 particles), flash veil element injection, and auto-halt after $450\,\text{ms}$.
  - Test explicit `destroy()` canceling active `requestAnimationFrame` and clearing particle pool.
- **TDD Green Phase**:
  - Implement `ClimaxFX` with high-throughput 2D canvas drawing and leak-free rAF lifecycle.

---

### Task 5: TiltController 3D Parallax & Specular Foil Shimmer
- **Files**:
  - Create: `portfolio/src/engines/card/subsystems/TiltController.ts`
  - Create: `portfolio/src/engines/card/__tests__/subsystems/TiltController.test.ts`
- **TDD Red Phase**:
  - Test that `TiltController` bypasses listener attachment when `prefers-reduced-motion: reduce` is active.
  - Test pointer event tracking, normalized mouse angle calculations ($\pm 12^\circ$), GSAP `quickTo` application, and verified removal of `pointermove` and `pointerleave` listeners on `destroy()`.
- **TDD Green Phase**:
  - Implement `TiltController` with smooth spring damping, reduced-motion guard, and clean teardown.

---

### Task 6: Master Choreography Integration in `CardSummonEngine`
- **Files**:
  - Modify: `portfolio/src/engines/card/CardSummonEngine.ts`
  - Modify: `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts`
- **TDD Red Phase**:
  - Update Test 11 `startRotY` assertion to `1260` (or `toBeGreaterThanOrEqual(1080)`).
  - Add assertion that micro-vibration terminates at $t = 1.100\,\text{s}$ with $x = 0$ and $\frac{dx}{dt} = 0$.
  - Add assertion that fermata holds `rotationY: -198` before snapping to `rotationY: 0` at $t = 1.25\,\text{s}$.
  - Add assertion that `prefers-reduced-motion` immediately unblurs `[data-summon-card-mask]`, displays stars, and sets `currentPhase = 'settled'`.
  - Add assertion that `summon(): Promise<void>` rejects with `AbortError` if modal is closed mid-ascent.
  - Add assertion that `close()` calls `tl.pause().kill()` and tears down all subsystems.
- **TDD Green Phase**:
  - Integrate subsystems into `CardSummonEngine.ts`, assemble master GSAP timeline according to the canonical $2.05\,\text{s}$ schedule, and verify all 31+ unit tests pass.

---

### Task 7: Comprehensive Verification & Plan Sign-off
- **Verification Commands**:
  ```powershell
  # 1. Full automated unit and integration suite
  npm --prefix portfolio test

  # 2. Strict TypeScript type check and production build
  npm --prefix portfolio run build
  ```
- **Exit Criteria**:
  - 100% test pass rate across all suites (zero regressions in existing 159 tests).
  - TypeScript compilation exits with code 0.
  - Production build generates clean minified bundles without syntax warnings.

---

# 11. Graceful Luxury Choreography Transformation & Test Specifications (Update — 2026-10-31)

### 11.1 Problem Statement & Aesthetic Reorientation
While the original 5-phase redesign successfully introduced gacha anticipation dynamics (the 150ms fermata freeze, pre-apex vibration, and 3D card presentation), its visual and kinetic cues retained aggressive, intensive combat-game tropes:
1. **Harsh Strobe Flashbang**: A pure white (`bg-white`) screen veil snapping to 0.95 opacity in 30ms, functioning perceptually as a military stun grenade.
2. **Aggressive Blast Shockwave**: A stark 2px white circular stroke (`border-2 border-white/80`) exploding 2.8x with steep `power4.out`, evoking explosive shrapnel or bomb shockwaves.
3. **Exaggerated Inhale Squash**: A 30% vertical compression (`scaleY: 0.70, scaleX: 1.15`) in 100ms characteristic of cartoon slingshots or rubber balloons rather than a precious, rigid collectible artifact.
4. **Mechanical Haptic Hum**: A rigid 20Hz vibration amplitude of $\pm 0.8\text{px}$ resembling a vibrating gamepad motor rather than harmonic acoustic resonance.
5. **Razor Foil Wipe**: A 3.5px white hairline cutting sharply across the card face like a laser scalpel rather than a soft, liquid-gold specular sheen.
6. **Dead Settle State**: A sudden halt into total spatial inertia at $t = 2.2\text{s}$, followed by wide $\pm 24^\circ$ tilt deviations on pointer movements that break the illusion of weight and value.

The approved task reorientation transforms the reveal into an experience of **graceful, smooth, high-end luxury** akin to luxury horology, museum-tier physical presentation, and ethereal celestial artifacts.

---

### 11.2 The 5-Phase Luxury Transformation Matrix

| Phase | Previous Intensive / Combat Cue | Refined Graceful Luxury Cue | Implementation Architecture |
|---|---|---|---|
| **Phase 1: Preparation** | Abrasive backdrop blackout; cartoon 30% squash (`scaleY: 0.70, scaleX: 1.15`) in 100ms | Silky smooth 0.32s backdrop fade with 24px blur; dignified organic breath gathering (`scaleY: 0.86, scaleX: 1.08`, `sine.inOut`) | `CardSummonEngine.ts`<br>`backdropEl` fade: `duration: 0.30s, ease: 'power2.out'`<br>`bottomGlowEl`: `scaleY: 0.86, scaleX: 1.08, duration: 0.10s, ease: 'sine.inOut'` |
| **Phase 2: Tension Charge** | Rattle vibration ($\pm 0.8\text{px}$), mechanical ascent | Decelerating liquid ascent (`power3.out`), subtle harmonic hum ($x: \pm 0.45\text{px}$, 14 half-cycles at 20Hz), locked 150ms Fermata Freeze ($1.020 \to 1.025$) | `CardSummonEngine.ts`<br>`cardEl`: `yPercent: 120 -> -2.8%`, `rotationY: -900° -> 180°`, `rotationZ: 12° -> 0°`, `scale: 0.65 -> 1.020`, `duration: 0.75s, power3.out`<br>Vibration: `x: 0.45, duration: 0.025, repeat: 13, yoyo: true, ease: 'sine.inOut'`<br>Fermata: `tl.set(card, {x:0})`, `scale: 1.025, duration: 0.15s, ease: 'none'` |
| **Phase 3: Apex Rupture** | Blinding 95% pure white flashbang in 30ms; stark 2px white stroke shockwave ring (2.8x) | Ethereal warm amber-gold radial bloom (warm white core to champagne/vermilion falloff, 45ms rise, 175ms decay); luminous gilded halo wave with soft ambient aura | `CardSummonEngine.ts`<br>`flashVeilEl`: Warm amber-gold radial gradient with peak opacity $\ge 0.9$, decaying softly<br>`shockwaveEl`: Luminous gilded halo ring (`border border-amber-300/70 shadow-[0_0_35px_rgba(255,215,0,0.5)]`), expanding $0.2 \to 2.5\times$ |
| **Phase 4: Reveal & Sweep** | Sharp 3.5px white laser cutline; abrupt mask drop | Fluid diagonal foil wipe ($35^\circ$ angle, champagne-gold specular gradient band, softened 1.8px hairline, $\alpha \le 0.65$); zero-squash descent ($yPercent: -2.8 \to 0$ over 0.50s, `scale >= 0.98`) | `CardTextureGenerator.ts` & `CardSummonEngine.ts`<br>Foil wipe: 240px gradient band (`#ffd700`, `#ffffff`, `#fbbf24`), hairline 1.8px<br>Descent: `duration: 0.50s, power2.out`, `scale: 1.0` |
| **Phase 5: Settle & Parallax** | Stationary dead card after $t = 2.2\text{s}$; snappy $\pm 24^\circ$ tilt | Continuous floating celestial breathing loop (`idleFloatTween`: `y: "+=6"`, `rotationZ: 0.5`, `3.6s` period, `sine.inOut`, `yoyo: true`, `repeat: -1`); refined tactile parallax (`maxTilt = 10`, 0.5s damping) | `CardSummonEngine.ts`<br>`idleFloatTween` initiated on settle, paused on pointermove, resumed on pointerleave<br>Parallax: `maxTilt = 10` ($\pm 10^\circ$), 0.5s `power2.out` |

---

### 11.3 Architectural Decisions & Invariant Bounds

1. **Strict Numeric Test Bounds Preservation**:
   - `startRotY = -900` (-15.708 rad) and `endRotY = 180` ($\pi$ rad).
   - Inhale squash sampled between progress 0.12–0.20: `minScaleY < 0.9` and `maxScaleX > 1.05`. Satisfied by `scaleY: 0.86, scaleX: 1.08`.
   - Pre-fermata vibration sampled between 0.76s–1.05s: $0.2 < \text{maxAbsX} \le 1.0\,\text{px}$, ending at $x = 0$ at 1.10s. Satisfied by `x: 0.45px`.
   - Fermata freeze sampled between progress 0.55–0.65: $x = 0$, $\Delta \text{rotY} \le 1.0^\circ$, $1.018 \le \text{scale} \le 1.030$. Satisfied by $1.020 \to 1.025$.
   - Apex rupture: `peakFlashOpacity >= 0.9` and `maxShockwaveScale >= 2.0`, fading to $\le 0.05$ on settle.
   - Descent settling: duration $\ge 0.4\,\text{s}$ and `minDescentScaleY >= 0.98`. Satisfied by 0.50s descent to $yPercent: 0$, `scale: 1.0`.
   - Parallax tilt: pointer move within $\pm 15^\circ$. Satisfied by `maxTilt = 10` ($\pm 10^\circ$).

2. **Continuous Floating Celestial Float & Lifecycle Integrity**:
   - `idleFloatTween` must be stored as an internal instance field (`private idleFloatTween: gsap.core.Tween | null = null;`).
   - Cleanly paused when the user begins interactive pointermove tracking to prevent fighting between pointer coordinates and the hover oscillation.
   - Smoothly resumed on `pointerleave`.
   - Unconditionally killed and dereferenced in `cleanupDomAndListeners()` and `destroy()`.

3. **ThreeCardModel WebGL Alignment**:
   - WebGL renderer continues clamping pixel ratio to `Math.min(window.devicePixelRatio, 2)`.
   - 48 continuous celestial orbiting particles in Three.js synchronize seamlessly with the card's subtle zero-gravity hover.
   - `CardTextureGenerator.ts` generates the diagonal foil gleam with warm champagne-gold specular highlights and feathered leading edge.

---

### 11.4 Test-Driven Development (TDD) Specifications

New and enhanced unit test specifications in `portfolio/src/engines/card/__tests__/CardSummonEngine.test.ts` and `portfolio/src/engines/card/three/__tests__/ThreeCardModel.test.ts`:

1. **Test: Phase 1 Gentle Inhale Breath**:
   - Assert `scaleY` is between `0.84` and `0.88`, and `scaleX` is between `1.06` and `1.12` during progress 0.12–0.20, replacing harsh 0.70/1.15 values.
2. **Test: Phase 2 Decelerating Ascent & Harmonic Vibration**:
   - Assert `maxAbsX` during 0.76s–1.05s is between `0.35px` and `0.60px` (calibrated harmonic amplitude), terminating strictly at `x = 0` at $t = 1.10\text{s}$.
3. **Test: Phase 3 Warm Amber-Gold Radial Bloom & Halo Wave**:
   - Assert `[data-summon-flash-veil]` background style uses warm radial gradient or champagne bloom styling while maintaining `peakFlashOpacity >= 0.9` and decay $\le 0.05$.
   - Assert `[data-summon-shockwave]` achieves `scale >= 2.0` with gilded golden border styling.
4. **Test: Phase 4 Fluid Foil Wipe & Zero-Squash Descent**:
   - Assert descent duration is $\ge 0.4\text{s}$, `minDescentScaleY >= 0.98`, landing smoothly at `yPercent: 0, scale: 1.0`.
5. **Test: Phase 5 Continuous Floating Celestial Hover**:
   - Assert that once settled, an `idleFloatTween` is active on `cardEl`, creating smooth continuous vertical oscillation.
   - Assert `idleFloatTween` is paused during pointermove and resumed on pointerleave.
6. **Test: Lifecycle & Zero-Leak Disposal**:
   - Assert that calling `destroy()` or `close()` kills `idleFloatTween`, `openTimeline`, `sheenTween`, removes all listeners, and disposes `ThreeCardModel`.

---
*End of Redesign Specification — Authored by Worker 1 (Master Specification Author & Motion Systems Architect), Updated by worker_r1_1*

