# 001 - Portfolio Base Architecture & Scaffolding Plan

- **Status**: Completed
- **Created**: 2026-10-28
- **Last Updated**: 2026-10-28

---

## 1. Goal & Context
Scaffold a lean, clean-architecture portfolio foundation in `./portfolio` using Vite 6, TypeScript 5.7, GSAP 3, Three.js, and Tailwind CSS v4, establishing domain contracts, central data management, and isolated visual engine adapters.

---

## 2. Requirements & Constraints
- Zero UI framework (Vanilla TS with native DOM/Canvas/WebGL).
- Strict separation between project domain data and rendering engines.
- Strict Ponytail discipline: minimum code that solves the problem.
- Isolated engine lifecycles (`mount`, `destroy`, `resize`) for zero memory leaks and drop-in reusability.

---

## 3. Architecture & Components
- `src/domain/types.ts`: Domain models (`Project`, `ProjectMedia`, `Engine`, `ViewState`).
- `src/data/projects.ts`: Central project data repository containing real project records.
- `src/engines/band/index.ts`: BOC Elastic Marquee engine adapter.
- `src/engines/carousel/index.ts`: Artemii 3D WebGL Carousel engine adapter.
- `src/engines/glare/index.ts`: Core-A Glare & Dial navigation adapter.
- `src/main.ts`: Thin orchestrator mounting engines to standard DOM nodes.

---

## 4. Verification Results
- `npm install`: Added 43 packages, 0 vulnerabilities.
- `npm run build`: Strict typecheck & production bundle generated cleanly in 1.43s.
