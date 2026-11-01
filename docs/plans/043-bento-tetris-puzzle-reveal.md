# Bento Grid 2-Step Tetris Puzzle Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- **Status**: Completed
- **Created**: 2026-11-01
- **Last Updated**: 2026-11-01

**Goal:** Animate the entrance of the 5 Bento Grid cards with a 2-step Tetris puzzle reveal: ghost wireframe blueprints sketch during the band ascent, and the content blocks drop and lock into place from the foundation up when the band docks at the top.

**Architecture:** A dedicated, isolated `BentoRevealController` encapsulates the GSAP choreography and element states. It hooks directly into the master `transitionTimeline.ts` of `ElasticBandEngine`, replacing the monolithic `#app` slide-up with an orchestrated card-by-card Tetris assembly.

**Tech Stack:** TypeScript (ESNext), GSAP 3, Vitest, Tailwind CSS v4.

---

## Global Constraints
- Strictly zero layout thrashing: All motion driven exclusively by CSS `transform` (`translateY`, `scale`, `rotateX`) and `opacity`.
- Full lifecycle encapsulation: Clean disposal in `destroy()` (kill all tweens, remove inline transforms, release DOM references).
- Accessibility: Respect `prefers-reduced-motion` with an instant/soft fade fallback.
- Strict TDD: Unit tests written and failing before implementation code.

---

## File Structure

- **Create**:
  - `portfolio/src/components/home/BentoRevealController.ts`: Encapsulates initial hidden state setup, wireframe trace, Tetris drop cascade timeline creation, and disposal.
  - `portfolio/src/components/home/__tests__/BentoRevealController.test.ts`: TDD test suite for `BentoRevealController`.
- **Modify**:
  - `portfolio/src/components/home/ProfileHeader.ts`: Initialize and expose `BentoRevealController` on mount.
  - `portfolio/src/engines/band/transitionTimeline.ts`: Integrate `bentoRevealTimeline` into master transition sequence at `t = 0.85s` / `t = 1.20s`, replacing monolithic `#app` sliding sheet.
  - `portfolio/src/engines/band/constants.ts`: Add timing tokens for wireframe trace and Tetris drop cascade.
  - `portfolio/src/main.ts`: Wire `ProfileHeader.getRevealController()` to the transition orchestrator.
- **Test**:
  - `portfolio/src/engines/band/__tests__/transitionTimeline.test.ts`: Verify transition timeline integration.
  - `portfolio/src/components/home/__tests__/ProfileHeader.test.ts`: Verify profile header exposes reveal lifecycle.

---

## Tasks

### Task 1: Implement `BentoRevealController` with Strict TDD

**Files:**
- Create: `portfolio/src/components/home/BentoRevealController.ts`
- Test: `portfolio/src/components/home/__tests__/BentoRevealController.test.ts`

**Interfaces:**
```typescript
export interface BentoElements {
  heroLeft: HTMLElement;
  heroRight: HTMLElement;
  education: HTMLElement;
  globe: HTMLElement;
  summary: HTMLElement;
}

export interface BentoRevealOptions {
  reducedMotion?: boolean;
}

export class BentoRevealController {
  constructor(rootContainer: HTMLElement);
  public queryElements(): BentoElements | null;
  public prepareInitialState(): void;
  public createRevealTimeline(options?: BentoRevealOptions): gsap.core.Timeline;
  public destroy(): void;
}
```

- [x] **Step 1: Write failing unit tests for `BentoRevealController`**
- [x] **Step 2: Run test to confirm failure**
- [x] **Step 3: Implement `BentoRevealController`**
- [x] **Step 4: Run tests and verify 100% pass**
- [x] **Step 5: Commit Task 1**
  - Run `git add portfolio/src/components/home/BentoRevealController.ts portfolio/src/components/home/__tests__/BentoRevealController.test.ts; git commit -m "feat(home): implement BentoRevealController with TDD"`

---

### Task 2: Integrate Bento Reveal into `ProfileHeader` and `transitionTimeline`

**Files:**
- Modify: `portfolio/src/components/home/ProfileHeader.ts`
- Modify: `portfolio/src/engines/band/constants.ts`
- Modify: `portfolio/src/engines/band/transitionTimeline.ts`
- Modify: `portfolio/src/main.ts`
- Test: `portfolio/src/engines/band/__tests__/transitionTimeline.test.ts`
- Test: `portfolio/src/components/home/__tests__/ProfileHeader.test.ts`

**Interfaces:**
```typescript
// transitionTimeline.ts BandToNavOptions
export interface BandToNavOptions {
  // ... existing fields ...
  bentoController?: BentoRevealController | null;
}
```

- [x] **Step 1: Write failing tests for transition timeline integration**
- [x] **Step 2: Run tests to confirm failure**
- [x] **Step 3: Update `constants.ts` with reveal timing tokens**
- [x] **Step 4: Update `ProfileHeader.ts` and `transitionTimeline.ts`**
- [x] **Step 5: Run tests and verify 100% pass**
- [x] **Step 6: Commit Task 2**
  - Run `git add portfolio/src/components/home/ProfileHeader.ts portfolio/src/engines/band/constants.ts portfolio/src/engines/band/transitionTimeline.ts portfolio/src/main.ts; git commit -m "feat(band): integrate 2-step bento tetris reveal into transition timeline"`

---

### Task 3: Visual Polish, Hairline Glow Pulse, and Build Verification

**Files:**
- Modify: `portfolio/src/components/home/BentoRevealController.ts`
- Test: All suites (`npm test`)
- Build: `npm run build`

- [x] **Step 1: Fine-tune hairline pulse and 3D tilt recovery**
  - Ensure the vermilion flash on landing (`box-shadow: 0 0 16px rgba(255,68,33,0.4)`) transitions cleanly back to resting glass shadow (`box-shadow: 0 8px 32px rgba(0,0,0,0.37)`).
  - Verify Globe component canvas is properly triggered without WebGL redraw glitches.

- [x] **Step 2: Full automated test run**
  - Run `cd portfolio; npm test`
  - Verify all 29+ test suites pass with 0 errors.

- [x] **Step 3: Production build verification**
  - Run `cd portfolio; npm run build`
  - Confirm bundle size, TypeScript type checks, and zero warnings.

- [x] **Step 4: Commit Task 3**
  - Run `git add -A; git commit -m "feat(home): polish bento tetris drop physics and verify production build"`

---

## Verification & Manual Testing Checklist
1. Open browser to `http://localhost:5173`.
2. Click the "Click to enter" pill.
3. Observe:
   - Band glides horizontally and ascends toward nav bar.
   - ASCII water sink begins.
   - Ghost wireframe borders trace out on screen.
   - Instant band docks: Bottom row (Education -> Globe -> Summary) drops and snaps with mechanical overshoot and vermilion hairline flash.
   - Top row (Quote & Contact -> 3D Portrait Identity) drops and slams into place, completing the grid.
4. Test with `prefers-reduced-motion` enabled in browser dev tools: verify cards smoothly cross-fade without physical drops.
