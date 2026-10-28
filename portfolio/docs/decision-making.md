# Architectural Decisions & Decision-Making Framework

This document records the architectural decisions made for the portfolio and provides the principles governing future choices.

---

## Decision Principles (Ponytail & YAGNI)

1. **Smallest Working Diff**: Choose the solution that solves the entire problem with the least code and zero unnecessary abstractions.
2. **Web Standards Over Frameworks**: Favor native browser APIs (DOM, Canvas 2D, WebGL) and standard ES modules over heavyweight UI framework runtimes when dealing with high-performance animations and shader math.
3. **Evidence Before Assertions**: Every change must be verified with automated builds (`npm run build`) and strict TypeScript typechecking.

---

## Architecture Decision Records (ADRs)

### ADR 001: Pure Vanilla TypeScript + Vite (No React / Next.js)
- **Context**: The portfolio integrates three major interactive demos (Artemii 3D carousel, BOC elastic band, Core-A glare navigation). All three are imperative Canvas/WebGL/DOM engines.
- **Decision**: Avoid React and Next.js. Use pure TypeScript with Vite 6.
- **Rationale**:
  - Eliminates SSR hydration issues with WebGL and window objects.
  - Zero Virtual DOM diffing overhead; guarantees 60fps rendering.
  - Sub-second build and HMR times.
  - Deploys as a static bundle to any static hosting provider.

### ADR 002: GSAP as Unified Motion Core
- **Context**: The demos originally had fragmented motion approaches (GSAP in 3 demos, Framer Motion in 1 demo).
- **Decision**: Standardize entirely on GSAP 3 as the single motion library for physics, timelines, and UI transitions.
- **Rationale**: Shared ticker, precise timeline orchestration across canvas and DOM, lightweight footprint.

### ADR 003: Tailwind CSS v4 via `@tailwindcss/vite`
- **Context**: Need modern utility styling without PostCSS or redundant configuration files.
- **Decision**: Use Tailwind v4 with the first-party Vite plugin.
- **Rationale**: Zero-config `@import "tailwindcss";`, faster build times, and native CSS variables support.

### ADR 004: Standardized Engine Lifecycle Interface
- **Context**: Interactive visual components need to be modular, replaceable, and memory-safe.
- **Decision**: Every interactive engine must implement the `Engine` contract (`id`, `mount(container)`, `destroy()`, `resize()`).
- **Rationale**: Guarantees zero memory leaks (rAF loops and WebGL contexts are properly disposed) and ensures components can be copy-pasted or swapped cleanly.
