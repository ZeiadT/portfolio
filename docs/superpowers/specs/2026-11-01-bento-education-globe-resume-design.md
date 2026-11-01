# Bento Education, Globe, and Resume Button Design Specification

- **Date**: 2026-11-01
- **Status**: Proposed
- **Author**: Antigravity Pair Programming

---

## 1. Executive Summary

This feature modernizes the portfolio's hero and about sections by introducing three key enhancements inspired by the editorial bento aesthetics of `awrs.me`:
1. **View Resume Action**: Adds a dedicated "View Resume" button to Hero Card 1's bottom contact bar, separated from the phone and email copy buttons by an expanding fill-width spacer (`flex-1`).
2. **Interactive 3D Dot Globe Card**: Introduces an isolated `ProfileGlobe` component using the lightweight ~5KB WebGL library `cobe`, featuring atmospheric glow, auto-rotation, smooth drag interactions, and dynamic location copy (`"Based in [Location], available globally"`).
3. **Education Bento Card**: Introduces an isolated `ProfileEducation` component displaying the user's institution, degree, and study period with an editorial graduation icon badge.
4. **Three-Column Bottom Bento Layout**: Reorganizes the bottom row underneath the upper hero composition into an editorial 12-column grid arranged strictly LTR:
   - **Education Card** (3 cols)
   - **Globe Card** (3 cols)
   - **Summary Narrative Card** (6 cols)

---

## 2. Requirements & Visual Standards

### 2.1 View Resume Button
- **Placement**: Inside `ProfileContactComponent` at the bottom of Hero Card 1 (Left Hero Card).
- **Layout**:
  - `[Phone Button]` `[Email Button]` `<div class="flex-1"></div>` `[View Resume Button ↗]`
  - On narrow/mobile screens, gracefully wraps while keeping the button aligned and accessible.
- **Attributes**:
  - Target: Opens `/resume.pdf` (or `data.resumeUrl`) in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).
  - Visual styling: Frosted glass pill matching the existing contact buttons (`rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 hover:text-white hover:border-[#ff4421]/50 hover:bg-white/[0.08] active:scale-95 transition-all`).
  - Icon: Document or diagonal external arrow icon (`↗` or Lucide-style SVG) confirming external tab navigation.

### 2.2 Bottom Bento Row Reorganization
- Container: `w-full grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 items-stretch mt-6 select-text`.
- **Column 1 (LTR): Education (lg:col-span-3, md:col-span-6)**
  - Card style: `p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-between`.
  - Header: Graduation cap icon enclosed in an accent badge (`bg-[#ff4421]/10 text-[#ff4421]`) + uppercase tracking title (`EDUCATION`).
  - Inner content container (`bg-white/[0.03] border border-white/10 rounded-xl p-3.5 sm:p-4`):
    - Institution: Bold, crisp text (`text-sm sm:text-base font-bold text-neutral-100`).
    - Degree: Secondary subtitle (`text-xs text-neutral-400 mt-1`).
    - Period: Subtle monospace or tertiary text (`text-[11px] font-mono text-neutral-400 mt-2 block`, e.g., `2022 – Present`).
- **Column 2 (LTR): Globe Box (lg:col-span-3, md:col-span-6)**
  - Card style: `p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col overflow-hidden relative`.
  - Top Text:
    - Subtitle: `text-[11px] uppercase tracking-[0.2em] font-semibold text-neutral-400` ("FLEXIBLE WITH TIMEZONES").
    - Title: `text-base sm:text-lg font-bold text-neutral-100 leading-snug mt-1` ("Based in Cairo, <span class='text-neutral-400'>available globally</span>").
  - Canvas Container:
    - Outer glow wrapper with radial gradient blur (`#ff4421` / neutral ambient glow).
    - Canvas mounted and driven by `cobe` with auto-rotation (`phi` increment) and drag listener for interactive rotation with mouse and touch.
    - Size: Crisp 2x devicePixelRatio canvas with clean clipping and smooth lifecycle disposal.
- **Column 3 (LTR): Summary Narrative (lg:col-span-6, md:col-span-12)**
  - Card style: `p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.37)] flex flex-col justify-center`.
  - Header badge: Amber/vermilion dot indicator + `SUMMARY` uppercase tracking label.
  - Body: Editorial lead narrative with fluid line-height (`text-neutral-200 text-sm sm:text-base leading-relaxed`).

---

## 3. Architecture & Domain Contracts

### 3.1 Domain Types (`src/domain/types.ts`)
```typescript
export interface ProfileEducationEntry {
  institution: string;
  degree: string;
  period: string;
}

export interface ProfileData {
  title: string;
  quote: string;
  summary: string;
  location: string;
  contact: ProfileContact;
  links: ProfileLink[];
  avatar: ProfileAvatarConfig;
  pillars?: string[];
  education?: ProfileEducationEntry;
  resumeUrl?: string;
}
```

### 3.2 Data Record (`src/data/profile.ts`)
```typescript
export const PROFILE_DATA: ProfileData = {
  // ... existing fields
  location: 'Cairo, Egypt',
  resumeUrl: '/resume.pdf',
  education: {
    institution: 'Helwan University',
    degree: "Bachelor's in Computer Science",
    period: '2022 – Present',
  },
};
```

### 3.3 Component Isolation
Every component maintains an explicit, strict lifecycle:
- `mount(container: HTMLElement): void`
- `destroy(): void`
- `resize?(): void`

1. `ProfileContactComponent`: Updated to render Phone, Email, Spacer (`flex-1`), and View Resume button. Cleanly cleans up any event listeners.
2. `ProfileEducationComponent`: Isolated component rendering the education card. Zero external side-effects.
3. `ProfileGlobeComponent`: Isolated component encapsulating the `cobe` canvas instance, drag event listeners, requestAnimationFrame rendering, and explicit disposal calling `globe.destroy()`.
4. `ProfileBioComponent` (or updated `ProfileHeader` bottom row): Orchestrates the 3-column bento row (Education -> Globe -> Summary).

---

## 4. Dependencies

- **`cobe`**: Lightweight (~5KB) WebGL globe library for canvas rendering.
  - Installed via `npm install cobe`.

---

## 5. Test-Driven Development (TDD) Strategy

All tests will be written and confirmed failing before implementation code:

1. **`ProfileContact.test.ts`**:
   - Asserts existence of `[data-contact-resume]` link with `href="/resume.pdf"`, `target="_blank"`, `rel="noopener noreferrer"`.
   - Asserts existence of fill spacer element with `flex-1` between contact buttons and resume link.
   - Asserts teardown removes all elements without memory leaks.

2. **`ProfileEducation.test.ts`**:
   - Asserts rendering of institution, degree, and period from provided `ProfileEducationEntry`.
   - Asserts fallback rendering if optional fields are missing.
   - Asserts complete DOM removal on `destroy()`.

3. **`ProfileGlobe.test.ts`**:
   - Asserts canvas creation and mounting within container.
   - Asserts rendering of location text dynamically populated from `location` string.
   - Asserts `globe.destroy()` and event listener removal on `destroy()`.

4. **`ProfileBio.test.ts` / `ProfileHeader.test.ts`**:
   - Asserts 3-column grid structure with 12-column layout.
   - Asserts LTR ordering: Education first, Globe second, Summary third.
