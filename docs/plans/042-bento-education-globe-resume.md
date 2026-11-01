# Bento Education, Globe, and Resume Button Implementation Plan

- **Status**: Proposed
- **Created**: 2026-11-01
- **Last Updated**: 2026-11-01

---

## 1. Goal & Context

Enhance the portfolio header and about bento grid by:
1. Adding a "View Resume" button next to email and phone number separated by a `flex-1` fill spacer in Hero Card 1.
2. Replacing the two-column Summary + Pillars layout with an editorial 3-column bottom bento row arranged strictly LTR:
   - **Education Card** (3 cols)
   - **Globe Card** (3 cols) with interactive WebGL dot globe (`cobe`) and dynamic location copy
   - **Summary Narrative Card** (6 cols)

---

## 2. Requirements & Constraints

- **View Resume Button**:
  - Positioned inside `ProfileContactComponent`.
  - Layout: `[Phone]` `[Email]` `<div class="flex-1"></div>` `[View Resume ↗]`.
  - Links to `/resume.pdf` with `target="_blank"` and `rel="noopener noreferrer"`.
  - Styled with existing frosted glass styling (`rounded-xl border border-white/10 bg-white/[0.04]`).

- **Education Card (LTR Column 1 - 3 cols)**:
  - Header with graduation icon badge (`bg-[#ff4421]/10 text-[#ff4421]`) and `EDUCATION` title.
  - Sub-card with Institution, Degree, and Period (`2022 – Present`).

- **Globe Card (LTR Column 2 - 3 cols)**:
  - Header: Subtitle `FLEXIBLE WITH TIMEZONES` and Title `Based in [Location], available globally`.
  - Interactive WebGL canvas powered by `cobe` with auto-rotation, mouse/touch drag, and glow wrapper.
  - Clean lifecycle teardown calling `globe.destroy()`.

- **Summary Narrative Card (LTR Column 3 - 6 cols)**:
  - Header: Dot badge and `SUMMARY`.
  - Narrative paragraph rendered with fluid typography.

- **Isolation & Zero Memory Leaks**:
  - Every component must implement `mount(container: HTMLElement)` and `destroy()`.
  - Event listeners, animations, and canvas contexts must be cleanly disposed on teardown.

---

## 3. Architecture & Isolation Design

- **Domain Layer (`portfolio/src/domain/types.ts`)**:
  - Add `ProfileEducationEntry`: `{ institution: string; degree: string; period: string; }`
  - Update `ProfileData`: add optional `education?: ProfileEducationEntry;` and `resumeUrl?: string;`
- **Data Layer (`portfolio/src/data/profile.ts`)**:
  - Add default education record and `resumeUrl: '/resume.pdf'`.
- **Components (`portfolio/src/components/home/`)**:
  - `ProfileContact.ts`: Updated to support `resumeUrl` with spacer and button.
  - `ProfileEducation.ts`: New isolated component for education card.
  - `ProfileGlobe.ts`: New isolated component for cobe WebGL globe card.
  - `ProfileBio.ts`: Updated to orchestrate the 3-column bottom row (Education 3 cols, Globe 3 cols, Summary 6 cols).
- **Dependencies**:
  - `cobe`: Installed via `npm install cobe` in `portfolio/`.

---

## 4. Test-Driven Development (TDD) Plan

### Unit & Component Tests:
1. `ProfileContact.test.ts`:
   - Verify `[data-contact-resume]` link is rendered with correct `href`, `target`, and `rel`.
   - Verify `[data-contact-spacer]` element exists with class `flex-1`.
   - Verify button styling and icon.
   - Verify full lifecycle cleanup in `destroy()`.

2. `ProfileEducation.test.ts`:
   - Verify rendering of institution, degree, and period.
   - Verify fallback handling when data is undefined.
   - Verify complete cleanup on `destroy()`.

3. `ProfileGlobe.test.ts`:
   - Verify creation of `<canvas>` and wrapper elements.
   - Verify dynamic text includes the passed location.
   - Verify call to `destroy()` disposes `cobe` and mouse/touch drag listeners.

4. `ProfileBio.test.ts` & `ProfileHeader.test.ts`:
   - Verify 3-column layout structure with 12-column grid.
   - Verify LTR order: Column 1 is Education (`lg:col-span-3`), Column 2 is Globe (`lg:col-span-3`), Column 3 is Summary (`lg:col-span-6`).
   - Verify full destruction cascades cleanly to child components.

---

## 5. Implementation Steps (Green Phase)

1. Install `cobe` dependency in `portfolio/`.
2. Update `src/domain/types.ts` with `ProfileEducationEntry` and updated `ProfileData`.
3. Update `src/data/profile.ts` with default education and resume values.
4. Write failing tests for `ProfileContact` (Resume button and spacer) -> run `npm test` -> update `ProfileContact.ts` to pass.
5. Write failing tests for `ProfileEducation` -> run `npm test` -> implement `ProfileEducation.ts` to pass.
6. Write failing tests for `ProfileGlobe` -> run `npm test` -> implement `ProfileGlobe.ts` to pass.
7. Write failing tests for updated `ProfileBio` -> run `npm test` -> implement `ProfileBio.ts` to pass.
8. Run full test suite (`npm test`) and type check / production build (`npm run build`).

---

## 6. Verification & Testing

- Automated test suite: `cd portfolio; npm test` (all tests passing).
- Production build: `cd portfolio; npm run build` (zero TypeScript or bundle errors).
- Visual check: Responsive layout across mobile, tablet, and desktop viewports.
