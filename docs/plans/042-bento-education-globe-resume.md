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

---

## 11. Phase 6: Contact Action Fill Icons & White Monochrome Styling

1. **Requirements & Intent**:
   - Replace the phone and email stroke icons with solid filled SVG icons (`fill="currentColor"`).
   - Change their styling to `text-white` (monochrome white) instead of vermilion `#ff4421`.
   - Preserve hover scale micro-interactions (`group-hover:scale-110 transition-transform duration-200`) and click-to-copy functionality.
2. **Test Specifications**:
   - In `ProfileContact.test.ts`, assert that the leading phone and email icons have `fill="currentColor"`, include `text-white`, and do not have `text-[#ff4421]`.

---

## 12. Phase 7: Dimmed Contact Text & Compact Non-Scrollable Education Layout

1. **Secondary Dimmed Contact Text**:
   - Style phone and email text labels inside `ProfileContact` buttons with secondary tone (`text-neutral-400 group-hover:text-neutral-200 transition-colors`).
   - Ensures visual hierarchy where the white icon and card border lead, and data labels remain elegant and secondary.
2. **Compact Non-Scrollable Education Layout**:
   - Completely remove `overflow-y-auto` and `max-h` scroll restrictions from `[data-education-list]`.
   - Consolidate item presentation into compact 2-tier rows:
     - Header line: Degree / Title (left) and Period (right).
     - Sub-line: Field / Track (in `#ff4421`) inline with Location / Institution (`text-neutral-400`).
   - Compact item padding (`px-3 py-2 sm:py-2.5`) to eliminate scrollbars and fit cleanly within the bento card height.
3. **Test Specifications**:
   - `ProfileContact.test.ts`: Verify phone and email text spans have class `text-neutral-400`.
   - `ProfileEducation.test.ts`: Verify `[data-education-list]` does not contain `overflow-y-auto` and each item fits without overflow.

---

## 13. Phase 8: Official CV Social Links & Google Drive Resume URL Integration

1. **Requirements & Intent**:
   - Update `PROFILE_DATA` in `portfolio/src/data/profile.ts` with authentic links from user's official CV:
     - Email: `zeiadm4business@gmail.com`
     - Phone: `+20 1019880091` / `+201019880091`
     - GitHub: `https://github.com/ZeiadT`
     - Codewars: `https://www.codewars.com/users/ZeiadT`
     - LinkedIn: `https://linkedin.com/in/zeiad-mohammed`
     - Resume URL: `https://drive.google.com/file/d/1nxESDH7D4pVdaa_3cl7Y7QlMjlBNnRQl/view?usp=sharing`
2. **Test Specifications**:
   - In `portfolio/src/data/__tests__/profile.test.ts`:
     - Assert `PROFILE_DATA.contact.email` is `zeiadm4business@gmail.com`.
     - Assert GitHub link URL is `https://github.com/ZeiadT`.
     - Assert Codewars link URL is `https://www.codewars.com/users/ZeiadT`.
     - Assert LinkedIn link URL is `https://linkedin.com/in/zeiad-mohammed`.
     - Assert `PROFILE_DATA.resumeUrl` is `https://drive.google.com/file/d/1nxESDH7D4pVdaa_3cl7Y7QlMjlBNnRQl/view?usp=sharing`.

---

## 14. Phase 9: Vertical Spacing Balance & Center Distribution

1. **Requirements & Intent**:
   - Balance the top clearance (between the 38px docked tabbar and screen content) with the bottom screen clearance.
   - Distribute vertical space into the center gap (`mt-6 sm:mt-7 lg:mt-8` on bottomRow) to give distinct hierarchy between hero tier and credentials tier.
   - Increase items vertical space slightly without breaking layout hierarchy or inducing scrolling:
     - Hero Card 1 & 2: Increase `min-h-[330px] lg:min-h-[340px]` to `min-h-[350px] lg:min-h-[360px]`, gap `gap-5 sm:gap-6`, padding `p-6 sm:p-6.5 lg:p-7.5`.
     - Education Card: Increase item vertical padding (`px-3.5 py-2.5 sm:py-3`), item gap (`gap-2 sm:gap-2.5`), container padding `p-5.5 sm:p-6.5`.
     - Globe Card: Padding `p-5.5 sm:p-6.5`, canvas container margin `-mb-14 sm:-mb-20`.
     - Summary Card: Padding `p-6 sm:p-6.5 lg:p-7.5`, leading `sm:leading-[1.8]`, header margin `mb-3 sm:mb-4`.
     - App Shell & Root: Update `<main id="app">` to `pt-14 sm:pt-16 pb-6 sm:pb-7` and `profile-header-root` to `pt-1 sm:pt-2 pb-2 sm:pb-3`.
2. **Test Specifications**:
   - Verify all unit and integration test suites pass with zero regressions.

---

## 15. Phase 10: Zero-Scroll Viewport Containment, Reduced Top Tabbar Gap, and Proportional Spacing

1. **Requirements & Intent**:
   - Reduce the top padding between the docked tab bar (38px) and header items to an exact, tight clearance (~8px - 10px).
   - Ensure the entire header bento grid fits inside standard viewports (750px - 900px+ height) without triggering any vertical scrollbar.
   - Maintain balanced, proportional relative paddings across both tiers:
     - App Shell (`<main id="app">`): `pt-10 sm:pt-11 pb-3 sm:pb-4`
     - Profile Root: `pt-0 sm:pt-1 pb-1 sm:pb-2`
     - Hero Row: `min-h-[290px] sm:min-h-[305px] lg:min-h-[315px]`, padding `p-4 sm:p-5 lg:p-5.5`, gap `gap-3 sm:gap-4`
     - Center Gap (`bottomRow`): `mt-3.5 sm:mt-4 lg:mt-4.5` (14px - 18px)
     - Education Card: Padding `p-4 sm:p-5`, item padding `px-3 py-1.5 sm:py-2`, gap `gap-1.5 sm:gap-2`
     - Globe Card: Padding `p-4 sm:p-5`, canvas offset `-mb-18 sm:-mb-24`
     - Summary Card: Padding `p-4 sm:p-5 lg:p-5.5`, header `mb-2 sm:mb-2.5`, text `text-sm sm:text-[15px] lg:text-base leading-relaxed sm:leading-normal`
2. **Test Specifications**:
   - Run full test suite to verify all 29 test files (410 tests) pass with zero regressions.
