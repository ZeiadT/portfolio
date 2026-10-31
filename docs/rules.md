# Project Engineering Rules & Architecture Standards

These rules and protocols are strictly enforced for all development within this repository.

---

## Core Directives & Governance

1. **Mandatory Planning & Strict TDD**: Every feature must have an approved plan written to `docs/plans/<feature-name>.md` before implementation. All features must follow Test-Driven Development (TDD) with tests covering edge cases written before writing code. Any edits to an existing feature must first consult its plan/tests and update them.
2. **Rules & Decisions**: Always adhere to this document (`docs/rules.md`) and the Architecture Decision Records in `docs/decision-making.md`.
3. **Component Isolation & Reusability**: All visual/interactive components must implement the `Engine` lifecycle (`mount(container: HTMLElement)`, `destroy()`, `resize?()`), have zero global coupling, and be copy-pasteable.
4. **Zero Direct File Copying**: Never copy files directly from demo directories (`artemii-carousel-replica`, `boc-splash-band`, `corea-glare-wipe`). Rewrite all code from scratch in clean TypeScript using demos as reference only.

---

## 1. Zero Direct File Copying (Reference-Only Rule)
- **STRICT PROHIBITION**: NEVER copy or duplicate files directly from existing demo projects (`artemii-carousel-replica`, `boc-splash-band`, `corea-glare-wipe`, etc.).
- **Rewrite From Scratch**: All code integrated into the portfolio must be rewritten from scratch in clean, modern TypeScript, tailored to the portfolio's architecture.
- **Demos As References**: Demo directories exist solely as behavioral, mathematical, and algorithmic references. Understand the math, shaders, and animations, then write clean, idiomatic code.

---

## 2. Planning-First Protocol & Mandatory TDD
- **No Code Without a Plan**: Every new feature or architectural modification must have an approved implementation plan written to `docs/plans/` before any code is written.
- **Mandatory Test-Driven Development (TDD)**: All features, utility functions, state logic, and engine adapters must follow strict TDD:
  1. Write failing tests **before** writing implementation code.
  2. Tests must comprehensively cover edge cases, boundary conditions, error states, and lifecycle teardown (e.g. verifying `destroy()` cleans up observers and listeners).
  3. Implement the minimum code required to make tests pass.
- **Modifications Must Update Prior Plans & Tests**: When editing or refactoring an existing feature, inspect the feature's original implementation plan and tests first, update the plan with new requirements and test cases, and only then proceed with code changes.

---

## 3. UI Component Isolation & Reusability
Every visual and interactive component/engine must be **100% self-contained and copy-pasteable**:
- **Zero Hidden Global Couplings**: No component may rely on implicit global variables or undeclared DOM side-effects.
- **Standard Lifecycle Interface**: Every engine or component must implement an explicit lifecycle:
  - `mount(container: HTMLElement, options?: Config): void`
  - `destroy(): void` (cleanly tears down all event listeners, rAF loops, WebGL buffers, and observers)
  - `resize?(): void`
- **Drop-In Portability**: Any component in `portfolio/src/engines/` or `portfolio/src/components/` must be able to be lifted into another project or swapped for an alternate implementation without breaking other parts of the application.

---

## 4. Clean Architecture & Layer Boundaries
- **Domain Layer (`portfolio/src/domain/`)**: Pure types and contracts. Zero external libraries, zero DOM references, zero framework dependencies (`types.ts`).
- **Data Layer (`portfolio/src/data/`)**: Central typed repository for projects, skills, and resume data. Adding or editing projects must be done exclusively in this layer (`projects.ts`).
- **Engines / Infrastructure Layer (`portfolio/src/engines/`)**: Isolated visual/interactive systems (3D WebGL Carousel, Elastic 2D Band, Glare Transition). Engines consume domain types and data, but do not depend on each other.
- **Presentation Layer (`portfolio/src/main.ts`, `portfolio/index.html`, `portfolio/src/style.css`)**: Thin application shell that orchestrates engines and binds them to DOM mount points.
