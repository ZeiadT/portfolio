# Skill Stars Ascending Order (1, 2, 3) Implementation Plan

- **Status**: Ready for Implementation
- **Created**: 2026-10-31
- **Tech Stack**: Three.js (^0.160.0), HTML5 Canvas 2D, Vanilla TypeScript, Vitest
- **Branch**: `feat/card-shine-effect`

---

## 1. Requirement Overview

The user requested:
> "the skills has stars next to them, first skill should have 1 second 2 third 3."

### Updated Specifications:
In the boxed identity & skills section of the luxury gold engraved front card face (`CardTextureGenerator.ts`):
- Skill 1 ("Hard worker"): **1 golden star** (`★`)
- Skill 2 ("Passionate designer"): **2 golden stars** (`★★`)
- Skill 3 ("Perfection seeker"): **3 golden stars** (`★★★`)

This reverses the previous 3-2-1 descending order to an ascending progression (1, 2, 3).

---

## 2. Implementation Tasks (Strict TDD)

### Task 1: Update Test Specification in `CardTextureGenerator.test.ts`
- **Files:** `portfolio/src/engines/card/three/__tests__/CardTextureGenerator.test.ts`
- **Specification:**
  - "Hard worker" expects 1 star (`★`).
  - "Passionate designer" expects 2 stars (`★★`).
  - "Perfection seeker" expects 3 stars (`★★★`).
- [ ] Step 1: Update test expectations in `CardTextureGenerator.test.ts`.
- [ ] Step 2: Run test suite to verify test failure (RED phase).
- [ ] Step 3: Git commit test specification.

### Task 2: Update Skill Stars Array in `CardTextureGenerator.ts`
- **Files:** `portfolio/src/engines/card/three/CardTextureGenerator.ts`
- **Changes:**
  - Update `skills` list definition to `{ name: 'Hard worker', stars: '★' }`, `{ name: 'Passionate designer', stars: '★★' }`, `{ name: 'Perfection seeker', stars: '★★★' }`.
- [ ] Step 1: Implement the 1, 2, 3 stars in `CardTextureGenerator.ts`.
- [ ] Step 2: Run test suite to verify all tests pass (GREEN phase).
- [ ] Step 3: Git commit implementation.

### Task 3: Full Verification & Build Check
- **Files:** Full test suite, production build.
- [ ] Step 1: Run `npm --prefix portfolio test`.
- [ ] Step 2: Run `npm --prefix portfolio run build`.
- [ ] Step 3: Verify visual accuracy in browser.
