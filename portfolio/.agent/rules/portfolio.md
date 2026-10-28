---
name: portfolio-rules
description: Mandatory development guidelines, planning protocols, and component isolation rules for the portfolio.
always_on: true
---

# Portfolio Development Rules & Directives

1. **Mandatory Planning & Strict TDD**: Every feature must have an approved plan written to `docs/plans/<feature>.md` before implementation. All features must follow Test-Driven Development (TDD) with tests covering edge cases written before writing code. Any edits to an existing feature must first consult its plan/tests and update them.
2. **Rules & Decisions**: Always adhere to `docs/rules.md` and `docs/decision-making.md`.
3. **Component Isolation & Reusability**: All visual/interactive components must implement the `Engine` lifecycle (`mount`, `destroy`, `resize`), have zero global coupling, and be copy-pasteable.
4. **Zero Direct File Copying**: Never copy files directly from demo directories (`artemii-carousel-replica`, `boc-splash-band`, `corea-glare-wipe`). Rewrite all code from scratch in clean TypeScript using demos as reference only.
