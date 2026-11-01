# Comprehensive Portfolio Feature Specification & Parallel Worktree Roadmap

**Document Version:** 1.0.0  
**Date:** 2026-11-01  
**Author:** Zeiad Mohammed & Antigravity Architecture Team  
**Tech Stack:** Vanilla TypeScript 5+, Vite 6, Three.js (0.160+), GSAP 3.12+, Tailwind CSS v4, Vitest  

---

## 1. Architectural Blueprint & Shared Contracts

To enable multiple AI agents and developers to work concurrently in isolated **Git worktrees** without merge conflicts, all features communicate strictly through well-defined domain contracts in `portfolio/src/domain/types.ts`.

```
                                  ┌────────────────────────┐
                                  │   Application Shell    │
                                  │  (main.ts / index.html)│
                                  └───────────┬────────────┘
                                              │
         ┌───────────────────┬────────────────┼───────────────────┬───────────────────┐
         │                   │                │                   │                   │
         ▼                   ▼                ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌───────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Stream A:       │ │ Stream B:       │ │ Stream C: │ │ Stream D:       │ │ Stream E:       │
│ Projects WebGL  │ │ Skills Matrix   │ │ The Wall  │ │ Contact Hub     │ │ Project Details │
│ Carousel Engine │ │ Bento Section   │ │ Canvas    │ │ Telegram/Email  │ │ Deep-Dive Sheet │
└─────────────────┘ └─────────────────┘ └───────────┘ └─────────────────┘ └─────────────────┘
```

### Shared Domain Interfaces (`portfolio/src/domain/types.ts`)

```typescript
// --- Shared Engine Lifecycle Contract ---
export interface Engine {
  readonly id: string;
  mount(container: HTMLElement): void;
  destroy(): void;
  resize?(): void;
}

// --- Project Domain Contract ---
export interface ProjectDetails {
  id: string;
  title: string;
  subtitle: string;
  category: 'Android' | 'Cross-Platform' | 'iOS' | 'Full-Stack';
  year: string;
  tags: string[];
  description: string;
  longDescription: string;
  architectureDiagram?: string;
  architectureHighlights: string[];
  metrics: { label: string; value: string; detail?: string }[];
  media: {
    thumbnail: string;
    screenshots: string[];
    videoDemo?: string;
  };
  links: {
    github?: string;
    liveDemo?: string;
    apkDownload?: string;
  };
  accentColor: string;
}

// --- Skills Domain Contract ---
export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  skills: SkillItem[];
}

export interface SkillItem {
  name: string;
  level?: 'Expert' | 'Advanced' | 'Proficient';
  highlight?: boolean;
  tag?: string;
}

// --- Wall (Guestbook) Domain Contract ---
export type WallItemType = 'note' | 'drawing' | 'sticker' | 'media';

export interface WallItem {
  id: string;
  type: WallItemType;
  author: string;
  timestamp: number;
  x: number; // Percentage or virtual canvas coordinate
  y: number;
  rotation?: number;
  scale?: number;
  color?: string;
  content: {
    text?: string;
    drawingDataUrl?: string; // Vector path or PNG base64
    imageUrl?: string;
  };
  likes: number;
}

// --- Contact Transmission Contract ---
export interface ContactPayload {
  name: string;
  emailOrHandle: string;
  channel: 'telegram' | 'email';
  message: string;
  timestamp: number;
}
```

---

## 2. Feature Specifications

---

### Feature 1: Main Screen Extended Sections

The main page (`#app`) seamlessly extends below the Home Profile Header to house the Projects Showcase, Skills Bento, and Portals to the Wall & Contact screens.

#### 1.1 Projects Showcase Section (`Artemii 3D WebGL Carousel`)
* **Design & Layout**:
  - Full-width interactive 3D WebGL viewport mounted into `#carousel-container`.
  - Cylindrical curved spatial projection displaying the 6 native/cross-platform projects (`Dusk`, `Cargo`, `Gusto`, `SportX`, `ElevatED`, `Wireless Mouse`).
  - Active card sits in high focal sharpness at front-center; inactive cards recede with depth-of-field blur and subtle perspective angular rotation.
* **Animation & Kinematics**:
  - Horizontal drag, touch swipe, and mouse wheel momentum with spring-damped inertial gliding (`Observer` or custom physics loop with damp factor `0.92`).
  - Hovering a card tilts the 3D plane along cursor axes ($\pm 12^\circ$) and intensifies its radial backlight.
  - Active card click initiates the **Project Details Zoom** transition.
* **Entertaining Micro-Interactions & Easter Eggs**:
  - **Flick Momentum Sound**: Soft mechanical click tick sound (synthesized via Web Audio API, no external audio files) when passing project cards.
  - **Double-Click Spark**: Rapid double clicking a project card emits a vermilion shockwave particle burst from its center.
  - **Keyboard Drive**: Arrow keys (`←` / `→`) trigger smooth snap animations with ease `power3.out`.

#### 1.2 Skills Matrix Section (`Kinetic Bento Grid`)
* **Design & Layout**:
  - 12-column Bento Grid categorized by domain strengths from Zeiad's CV:
    1. **Mobile SDK & Core**: Kotlin, Jetpack Compose, Coroutines, Flow, Java, Android Modularization.
    2. **Architecture & Patterns**: Clean Architecture, MVI/MVVM/MVP, Vertical Slice, Repository Pattern.
    3. **Cross-Platform & Distributed**: Kotlin Multiplatform (KMP), Compose Multiplatform (CMP), Flutter, C#, .NET WebAPI, Microservices, SignalR.
    4. **Storage & Networking**: Room, Retrofit, Ktor, RESTful, SQLite, GraphQL, WebSockets.
    5. **Testing & Tools**: Unit Testing, MockK, JUnit, Git, Figma, Postman, SonarQube.
* **Animation & Kinematics**:
  - Scroll-triggered reveal: Cards glide upward ($y: 32\text{px} \to 0$) with staggered glass border luminescence.
  - Chip Hover: Hovering a skill pill creates a liquid bubble spring expansion with glowing text and micro-elevation ($z: 8\text{px}$).
* **Micro-Interactions & Easter Eggs**:
  - **Category Filter Pin**: Clicking a category badge dims unrelated skills across all cards, highlighting full-stack synergy lines connecting Kotlin $\to$ .NET $\to$ Clean Architecture.
  - **Konami Code ("KOTLIN")**: Typing `kotlin` on keyboard ignites all Jetpack Compose and KMP badges into a multi-colored animated gradient shimmer for 5 seconds.

#### 1.3 Wall Navigation Portal Card
* **Design & Layout**:
  - Glassmorphic portal card with live preview snippet: displays a dynamic miniature canvas showing recent real visitor doodles or a glowing neon neon spray-can illustration.
  - Title: *"THE WALL"* | Subtitle: *"Leave your mark on the interactive guestbook canvas"*.
  - Floating CTA pill: *"ENTER THE CANVAS ↗"* with animated pulsing beacon.
* **Animation**:
  - Hovering causes miniature doodles on the preview thumbnail to animate and float in 3D parallax.

#### 1.4 Contact Navigation Portal Card
* **Design & Layout**:
  - High-energy telemetry card with animated live status: *"SIGNAL: ONLINE (CAIRO UTC+2)"*.
  - Direct routing buttons: *"TELEGRAM DIRECT"* and *"WRITE AN EMAIL"*.
* **Animation**:
  - Radar sweep circle continuously rotates in the background. Hovering intensifies sweep speed and border glow.

---

### Feature 2: The Wall Screen (Collaborative Guestbook Canvas)

A dedicated, highly creative interactive screen where visitors and fellow developers leave permanent/session drawings, stickers, and notes.

#### 2.1 Viewport & Canvas Architecture
* **Canvas Mechanics**:
  - Full-screen infinite or bounded panning canvas with smooth 2D pan and zoom controls (drag to navigate, pinch/wheel to zoom).
  - Floating HUD toolbar:
    - **Pencil / Marker**: Variable line width ($2\text{px} \to 24\text{px}$) with smoothing (Hermite / Bézier curves).
    - **Color Palette**: Preset cyber palette (Vermilion `#ff4421`, Electric Cyan `#00f0ff`, Acid Lime `#ccff00`, Gold `#ffd700`, Monochrome White `#ffffff`) + Custom Hex Picker.
    - **Sticky Note Tool**: Tap anywhere to drop an editable markdown sticky note with custom pastel/neon paper backgrounds.
    - **Sticker / Image Import**: File upload (max 1MB, client-side downscaled to 512px) or preset developer stickers (Android Bugdroid, KMP logo, Tux, Coffee mug).
    - **Eraser & Undo/Redo**: Fast stack-based history.

#### 2.2 Storage & Persistence Strategy
* **Local & Network Architecture**:
  - **Client-Side**: IndexedDB for offline-first caching of canvas elements and active drafts.
  - **Network Layer**: Pure REST / WebSocket contract designed to interface with Firebase, Supabase, or a serverless Cloudflare Worker:
    - `GET /api/wall/items`
    - `POST /api/wall/items` (rate-limited, with basic content moderation/sanitization)
    - Fallback: Pre-populated rich mock database with witty developer messages from around the globe.

#### 2.3 Animations, Micro-Interactions & Easter Eggs
* **Kinematics**:
  - Dropping a sticky note produces a soft gravitational bounce (`back.out(1.4)`) with an authentic drop-shadow and slight random rotation ($\pm 4^\circ$).
  - Zooming out beyond 50% renders an aerial "Constellation View" where all messages glow like neon city lights.
* **Easter Eggs**:
  - **Spray Can Shake**: Selecting the spray brush and shaking the mouse cursor triggers an authentic spray-can rattle sound effect.
  - **Secret Stamp**: Typing `egg` on the canvas unlocks a golden holographic badge stamp that only appears for observant visitors.

---

### Feature 3: The Contact Screen (Telegram & Direct Messaging Hub)

A frictionless, tactile transmission hub designed for recruiters, clients, and collaborators to initiate conversations instantly.

#### 3.1 Dual-Channel Transmission
1. **Telegram Direct Transmission**:
   - Primary channel prominently styled with Telegram's iconic aesthetic refined in dark glassmorphism.
   - One-click instant direct message opening `@zeiad_mohammed` (or configured bot).
   - "Pre-filled Prompt Generator": Chips for *"💼 Project Inquiry"*, *"🚀 Job Opportunity"*, *"☕ Say Hello"*, which automatically pre-fill the message when jumping to Telegram.
2. **Direct In-App Email Dispatcher**:
   - Clean fields: Name, Email / Handle, and Message textarea with character counter.
   - Direct integration with Formspree, EmailJS, or serverless endpoint with client-side regex validation and zero page reloads.

#### 3.2 Animation Decisions & Tactile Kinematics
* **Screen Transition**:
  - Glides in from right or emerges with the Core-A white glare wipe.
* **Form Inputs**:
  - Inputs feature floating laser hairlines that illuminate when focused (`border-[#ff4421]` with a soft $12\text{px}$ glow).
* **The Send Action**:
  - Clicking Send collapses the submit button into a spinning progress orb, morphs into a paper airplane that shoots upward off-screen (`y: -200px`, `scale: 0.2`, `ease: power4.in`), followed by an explosion of vermilion and white confetti.
  - Success message arrives with tactile checkmark spring.

#### 3.3 Micro-Interactions & Easter Eggs
* **Interactive Timezone Clock**:
  - Live digital neon clock displaying Zeiad's current local time in Cairo, Egypt (`Africa/Cairo`) with an indicator (*"Available for chats"* vs *"Recharging"*).
* **Terminal Command Line Mode**:
  - Clicking a tiny terminal toggle icon `>_` morphs the standard form into a retro green-on-black monospace terminal where users can send messages via `msg send "Hello"`.

---

### Feature 4: Project Details Deep-Dive Screen

An editorial case-study modal or drawer that presents deep engineering breakdowns for the 6 flagship projects.

#### 4.1 Content Architecture per Project
* **Header**: Large typography, project category badge, year, and live status.
* **Architecture Section**:
  - Interactive architecture diagram (e.g., Clean Architecture layer flows: Presentation $\to$ Domain $\to$ Data, or KMP shared engine pipeline).
  - Key technical decisions and solutions to hard problems (e.g. Dusk's offline-first synchronization, Cargo's live SignalR tracking, ElevatED's audio analysis pipeline).
* **Technical Metrics**:
  - Performance cards (e.g. *"< 16ms frame render"*, *"100% offline-ready"*, *"Clean Architecture"*).
* **Media Walkthrough**:
  - High-resolution screenshot gallery with zoom lightbox.
* **Action Footer**:
  - Sticky bottom action bar with *"View GitHub Repository ↗"* and *"Download APK / Run Demo"*.

#### 4.2 Animation Decisions
* **Card-to-Modal Morph**:
  - Clicking a project in the 3D carousel expands its card dimensions into the fullscreen modal using FLIP-style geometry transitions or synchronized depth elevation (`scale: 0.95 $\to$ 1`, `opacity: 0 $\to$ 1`, duration `400ms`).
* **Close / Dismissal**:
  - Smooth slide-down with backdrop blur fade-out (`power3.inOut`, `350ms`), supporting `Escape` key, click outside, and swipe down on mobile.

#### 4.3 Easter Eggs
* **Architecture Node Inspector**: Hovering any layer in the architecture diagram highlights all dependent components and technologies in vermilion luminescence.

---

## 3. Parallel Execution Streams & Git Worktree Breakdown

To develop these 5 major subsystems concurrently with AI agents across isolated git worktrees, the work is strictly partitioned into **5 independent streams**. No stream edits files owned by another stream.

```
                          main (Clean Base @ 1a137c1)
                                      │
     ┌──────────────────┬─────────────┼─────────────┬──────────────────┐
     ▼                  ▼             ▼             ▼                  ▼
Worktree A         Worktree B    Worktree C    Worktree D         Worktree E
[Projects Engine]  [Skills]      [The Wall]    [Contact Hub]      [Project Details]
```

### Stream Matrix

| Stream | Branch Name | Worktree Path | Primary Files Owned | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **Stream A: Projects 3D Engine** | `feat/projects-carousel-engine` | `../portfolio-projects` | `src/engines/carousel/**`<br>`src/components/home/ProjectsSection.ts` | `src/data/projects.ts` (Read-only) |
| **Stream B: Skills Matrix Bento** | `feat/skills-matrix-section` | `../portfolio-skills` | `src/data/skills.ts`<br>`src/components/home/SkillsSection.ts`<br>`src/components/home/SkillPill.ts` | `src/domain/types.ts` |
| **Stream C: Collaborative Wall** | `feat/collaborative-wall-screen` | `../portfolio-wall` | `src/engines/wall/**`<br>`src/components/wall/**`<br>`src/data/mockWallMessages.ts` | `src/domain/types.ts` |
| **Stream D: Contact & Telegram** | `feat/contact-telegram-screen` | `../portfolio-contact` | `src/components/contact/**`<br>`src/services/contactService.ts` | `src/data/profile.ts` (Read-only) |
| **Stream E: Project Details Sheet** | `feat/project-details-modal` | `../portfolio-details` | `src/components/projects/**`<br>`src/components/common/Modal.ts` | `src/data/projects.ts` (Read-only) |

---

### Step-by-Step Worktree Execution Commands

#### 1. Setup Base Shared Interfaces (On `main`)
Ensure `src/domain/types.ts` contains the shared contracts defined in Section 1 and is committed to `main`.

#### 2. Spawning the Parallel Worktrees
Run these commands from the repository root:

```bash
# Stream A: Projects Carousel Engine
git worktree add ../portfolio-projects -b feat/projects-carousel-engine main

# Stream B: Skills Matrix Section
git worktree add ../portfolio-skills -b feat/skills-matrix-section main

# Stream C: Collaborative Wall Screen
git worktree add ../portfolio-wall -b feat/collaborative-wall-screen main

# Stream D: Contact & Telegram Hub
git worktree add ../portfolio-contact -b feat/contact-telegram-screen main

# Stream E: Project Details Sheet
git worktree add ../portfolio-details -b feat/project-details-modal main
```

#### 3. Agent Task Assignment Guidelines for Each Worktree

* **Worker for Worktree A (`portfolio-projects`)**:
  - Focus: Implement `CarouselGLEngine` with curved cylinder geometry, drag/momentum physics, project texture rendering, and mouse wheel navigation.
  - TDD: Test card calculations, inertial dampening, and resize/destruction lifecycles.
* **Worker for Worktree B (`portfolio-skills`)**:
  - Focus: Build `SkillsSection` and `src/data/skills.ts` mapping full CV technical stack with interactive category filtering and hover physics.
  - TDD: Test DOM mounting, category filter state, and clean teardown.
* **Worker for Worktree C (`portfolio-wall`)**:
  - Focus: Build `WallEngine` with HTML5 2D drawing canvas (brush, color picker, eraser), sticker drop, sticky note creator, and panning/zoom viewport.
  - TDD: Test drawing history stack, undo/redo, item coordinate bounds, and lifecycle disposal.
* **Worker for Worktree D (`portfolio-contact`)**:
  - Focus: Build `ContactScreen` with Telegram quick-action prompts, animated email form, Cairo timezone live clock, and confetti send animation.
  - TDD: Test form validation, submission states, and copy-to-clipboard interactions.
* **Worker for Worktree E (`portfolio-details`)**:
  - Focus: Build `ProjectDetailsModal` with architecture diagrams, metric badges, image gallery lightbox, and smooth FLIP/zoom transitions.
  - TDD: Test modal mount, escape key listeners, project data population, and memory cleanup.

#### 4. Clean Re-Integration & Merge Sequence
Once any stream finishes and passes its tests (`npm test` and `npm run build`):

```bash
# In the main repository
git merge --no-ff feat/projects-carousel-engine
git merge --no-ff feat/skills-matrix-section
git merge --no-ff feat/collaborative-wall-screen
git merge --no-ff feat/contact-telegram-screen
git merge --no-ff feat/project-details-modal

# Clean up linked worktrees when finished
git worktree remove ../portfolio-projects
git worktree remove ../portfolio-skills
git worktree remove ../portfolio-wall
git worktree remove ../portfolio-contact
git worktree remove ../portfolio-details
```

---

## 4. Verification & Quality Gates

Every parallel stream must satisfy:
1. **Zero Memory Leaks**: Explicit implementation of `destroy()` clearing all canvas loops, event listeners, and timers.
2. **Strict TDD**: Vitest unit and integration suites testing normal, edge-case, and unmount behaviors.
3. **TypeScript & Bundling**: 100% clean typecheck (`npx tsc --noEmit`) and production build (`npm run build`).
4. **Performance Floor**: Consistent 60+ FPS animation on modern viewports with full support for `prefers-reduced-motion`.
