# Portfolio Agent Guidelines & Engineering Protocols

These rules and protocols are strictly enforced for all AI agents working on this portfolio codebase.

---

## Core Directives

### 1. Mandatory Planning-First Protocol & Strict TDD
- **Plan Before Implementing**: No code may be written, refactored, or scaffolded until a feature implementation plan has been written and saved in `docs/plans/<feature-name>.md`.
- **Test-Driven Development (TDD) Always**: All features, controllers, and utility logic **MUST** follow strict TDD. Tests covering edge cases, invalid inputs, and lifecycle disposal must be written **BEFORE** implementation code.
- **Pre-Execution Plan Updates**: Before making any edits or improvements to an existing feature, the agent **MUST** read the feature's original implementation plan in `docs/plans/` first, update the plan and test specifications with the new modifications and reasoning, and only then proceed with the code changes.

### 2. Strict Adherence to Project Rules & Decision Making
- When designing and writing any code, the agent must consult and follow:
  - `docs/rules.md` (Coding standards, architectural boundaries, zero-copy policy)
  - `docs/decision-making.md` (Architecture decision records, YAGNI, Ponytail mode)
- Decisions must align with established standards (Vite + Vanilla TypeScript + GSAP 3 + Three.js + Tailwind v4).

### 3. Component Isolation & Drop-in Reusability
- Every UI component, engine, or animation controller must be **100% self-contained and fully isolated**.
- No hidden couplings, no implicit DOM assumptions, and no leaky abstractions.
- Every component/engine must implement an explicit lifecycle (`mount(container: HTMLElement)`, `destroy()`, `resize?()`).
- All components must be cleanly copy-pasteable into any other project or swappable with alternative implementations without side-effects or residual memory leaks (all event listeners, timers, and WebGL contexts must be cleanly disposed in `destroy()`).

### 4. Zero Direct File Copying (Rewrite From Scratch Only)
- **NEVER** copy or duplicate files directly from existing demo projects (`artemii-carousel-replica`, `boc-splash-band`, `corea-glare-wipe`, etc.).
- Existing demo folders exist **strictly as behavioral, mathematical, and algorithmic references**.
- All code for the portfolio must be rewritten from scratch in clean, modern, strongly-typed TypeScript tailored to the portfolio's Clean Architecture structure.

---

## Architecture Quick Reference
- **Domain Layer (`portfolio/src/domain/`)**: Pure types and interfaces (`types.ts`).
- **Data Layer (`portfolio/src/data/`)**: Central data records (`projects.ts`).
- **Engines Layer (`portfolio/src/engines/`)**: Isolated visual engines (`band/`, `carousel/`, `glare/`, `background/`).
- **App Shell (`portfolio/src/main.ts`, `portfolio/index.html`, `portfolio/src/style.css`)**: Bootstrap and mount orchestration.
- **Skills & Tooling (`.agents/skills/`)**: Local GSAP and interface design skills available for agent execution.
