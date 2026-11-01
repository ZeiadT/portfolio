# Bento Education, Globe, and Resume Button Implementation Plan

- **Status**: In Progress (Phase 2: Globe Scale & Rotation, Multi-entry Education, Summary Header & Copy)
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

### Phase 2 Refinements (Current):
1. **Globe Polish**:
   - Make the globe bigger and rotate slower (`phi += 0.001` or slower).
   - Remove the orange dot marker (`markers: []`).
   - Change title to "Based in Egypt, available globally" with "Egypt" highlighted in the portfolio primary color (`#ff4421`).
2. **Education Card Polish & Multiple Entries**:
   - Move dates/periods to the right on the same line as degrees (`flex items-start justify-between gap-2`).
   - Display full education history:
     1. 9-Month Professional Diploma (Oct 2025 – Sep 2026) - Mobile Application Development (Native) - Information Technology Institute (ITI), Smart Village Branch.
     2. B.Sc. in Computer Science (Oct 2021 – Jun 2025) - Faculty of Computers and Artificial Intelligence, Benha University (Graduation Project: ElevatED, Tech: Dart, Flutter, Python, Grade: Excellent).
     3. Digital Egypt Pioneers Initiative (DEPI) (Jun 2024 – Dec 2024) - Mobile Application Development (Native) - Ministry of Communications and Information Technology (MCIT) – Benha, Egypt.
3. **Summary Card Header & Copy Polish**:
   - Update summary title to an icon badge (`bg-[#ff4421]/10 text-[#ff4421]`) + `SUMMARY` tracking text on top left corner, matching Education card header styling.
   - Update summary text to:
     "Mobile Application Developer experienced in native and cross-platform mobile application development, with background in backend development using (C#/.NET). Strong in OOP, design patterns, and clean architecture, focused on building scalable, user-centered applications and delivering clean, maintainable solutions in Agile environments."

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
   - Verify 3-column layout structure with 12-column grid (`w-full grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 items-stretch select-text`).
   - Verify strict LTR ordering: Column 1 is Education (`lg:col-span-3`, `[data-bento-education]`), Column 2 is Globe (`lg:col-span-3`, `[data-bento-globe]`), Column 3 is Summary (`lg:col-span-6`, `[data-summary-heading]`).
   - Verify Education renders institution, degree, and period.
   - Verify Globe renders location and WebGL canvas container.
   - Verify Summary renders user summary copy with `[data-profile-summary]`.
   - Verify lifecycle teardown: `destroy()` cascades to `educationComponent.destroy()`, `globeComponent.destroy()`, detaches DOM root, and cleans up references.
   - Verify `ProfileHeader.test.ts` mounts Top Row and 3-Column Bottom Bento Row and tears down without residual elements.

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

- Automated test suite: `cd portfolio; npm test` (all 28 test suites, 388 tests passing).
- Production build: `cd portfolio; npm run build` (zero TypeScript or bundle errors).
- Visual check: Responsive layout across mobile, tablet, and desktop viewports.

---

## 7. Phase 2 Polish & Enhancements (Completed)

1. **Globe Polish**:
   - Enlarged dimensions (`max-w-[340px] sm:max-w-[420px]`, `-mb-20 sm:-mb-28`).
   - Slowed auto-rotation to `this.phi += 0.001`.
   - Removed orange dot marker (`markers: []`).
   - Updated headline to "Based in Egypt, available globally" with Egypt highlighted in `#ff4421`.
2. **Education Card Polish**:
   - Period / dates moved to the right (`flex items-start justify-between gap-3`).
   - Multi-entry timeline support (`ProfileEducationEntry[]`) rendering 3 full credentials:
     - 9-Month Professional Diploma (ITI Smart Village)
     - B.Sc. in Computer Science (Benha University, ElevatED graduation project)
     - Digital Egypt Pioneers Initiative (DEPI, MCIT)
   - Scrollable container with graceful fallbacks and strict XSS sanitization.
3. **Summary Card Polish**:
   - Replaced simple dot badge with matching icon badge (`w-7 h-7 rounded-lg bg-[#ff4421]/10 text-[#ff4421]`) and uppercase tracking title `SUMMARY` on the top left.
   - Updated narrative copy to focus on native/cross-platform mobile development, backend with C#/.NET, OOP, clean architecture, and Agile delivery.

---

## 8. Phase 3: Viewport Fitting, Education Copy Alignment, and Globe Scale

### 1. Requirements & Intent
1. **Reduce Bento Grid Vertical Footprint (~10%)**:
   - Cut dead vertical spacing so the full 2-row Bento grid fits within standard 1080p desktop/laptop viewports without unnecessary scrolling.
   - Outer shell adjustments: `main#app` padding trimmed (`pt-11 sm:pt-12 pb-6 sm:pb-8`), `profile-header-root` padding trimmed (`pt-1 sm:pt-2 md:pt-3 pb-4 sm:pb-6`), inter-row margin trimmed (`mt-4 sm:mt-5`).
   - Hero card min-height trimmed from `380px` to `340px`.
   - Education list max-height adjusted to `290px` with inner item padding `p-3 sm:p-3.5`.
2. **Education 2nd Item Specific Fields**:
   - Title / Degree: `Faculty of Computers and Artificial Intelligence`
   - Track / Field: `B.Sc. in Scientific Computing`
   - Location / Institution: `Benha University`
   - Period: `Oct 2021 – Jun 2025`
   - Details: ElevatED graduation project, Dart/Flutter/Python, Grade: Excellent.
   - In `types.ts`, support optional friendly aliases `title?: string`, `track?: string`, `location?: string` alongside `degree`, `field`, `institution` in `ProfileEducationEntry`.
3. **Globe Scale Expansion (20% larger inside canvas box)**:
   - Pass `scale: 1.2` in `COBEOptions` to enlarge the 3D globe sphere by 20% while strictly preserving the canvas and bento box dimensions.
   - Update tests in `ProfileGlobe.test.ts` to verify `scale: 1.2`.

### 2. Test Specifications (TDD First)
- `ProfileGlobe.test.ts`: Verify `createGlobe` is invoked with `scale: 1.2`.
- `ProfileEducation.test.ts`: Verify rendering with friendly aliases (`title`, `track`, `location`) as well as `degree`, `field`, `institution`.
- `profile.test.ts`: Verify `PROFILE_DATA.education` item 2 contains `Faculty of Computers and Artificial Intelligence`, `B.Sc. in Scientific Computing`, location `Benha University, Benha, Egypt`, and no bullet details.

---

## 9. Phase 4: Education Item 2 Clean Location & Detail Removal

1. **Location Update**:
   - Location set to `Benha University, Benha, Egypt`.
2. **Details Removal**:
   - Remove bullet points / `details` array from item 2 so it displays cleanly without the graduation project bullets.

---

## 10. Phase 5: Hero Card 1 Address Badge Removal

1. **Address Badge Removal**:
   - Remove the redundant location chip (`locationChip` pill) from the top bar of Hero Card 1 (quote section).
   - The location is already prominently featured in the dedicated Globe card ("Based in Egypt, available globally").
   - This leaves the top bar of Hero Card 1 uncluttered, allowing social links to align cleanly without duplicate location text.
2. **Test Specification**:
   - In `ProfileHeader.test.ts`, assert that no location chip/address badge is rendered in `[data-bento-hero-left]`.
