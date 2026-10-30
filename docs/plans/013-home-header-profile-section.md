# 013 - Home Header Profile Section & Navigation Alignment

- **Status**: Completed
- **Created**: 2026-10-29
- **Last Updated**: 2026-10-30
- **Tech Stack**: Vanilla TypeScript, GSAP 3, Tailwind CSS v4, Vitest

---

## 1. Goal Description & Refinements
Implement user-approved profile header refinements and subsequent aesthetic cleanup:

1. **Add LinkedIn Icon**:
   - In `portfolio/src/domain/types.ts`: Extended `ProfileLink['icon']` type union to include `'linkedin'`.
   - In `portfolio/src/data/profile.ts`: Added LinkedIn entry with URL `https://linkedin.com/in/zeiad-mohammed` to `links`.
   - In `portfolio/src/components/home/ProfileLinks.ts`: Added official LinkedIn SVG glyph in `getIconSvg('linkedin')`, styled identically to GitHub and Codewars (solid `#ff4421` square button with hover scale and glow).

2. **Click-to-Copy for Both Phone & Email**:
   - In `portfolio/src/components/home/ProfileContact.ts`: Converted phone element from `tel:` link into an interactive click-to-copy `<button>` matching email.
   - Displays a `"Copied!"` tooltip on click with 1.5s timeout.
   - Cleanly disposes of timeouts and event listeners for both buttons in `destroy()`.

3. **Remove Phone from Under Avatar**:
   - In `portfolio/src/components/home/ProfileAvatar.ts`: Removed phone number, phone copy button, and phone feedback elements from underneath the portrait card so only the role title appears.
   - Removed unused phone-related rendering and listeners.

4. **Update Title to "Mobile Developer" (Edge-to-Edge Full Width)**:
   - In `portfolio/src/data/profile.ts`: Set `title: 'Mobile Developer'`.
   - In `portfolio/src/components/home/ProfileAvatar.ts`: Styled `data-avatar-title` as uppercase `"MOBILE DEVELOPER"` with wide letter-spacing (`tracking-[0.25em] text-xs sm:text-sm font-bold text-white select-none uppercase pl-[0.25em]`) calibrated to span the exact full width of the portrait card.

5. **Pure, Clean Portrait Card (Purged Holographic Effect, Foil, and All Glow Halos)**:
   - Following user aesthetic direction: removed holographic effects completely, presenting a pure, crisp portrait card with zero canvas overlays, shaders, halos, or foil.
   - In `portfolio/src/components/home/ProfileAvatar.ts`:
     - Removed `HoloCardEngine` WebGL2 canvas instantiation, mounting, and destruction.
     - Removed `canvas[data-holo-canvas]` and any 3D tilt / pointer tracking overhead.
     - Removed all legacy foil elements (`data-avatar-foil`, `data-foil-rainbow`, `data-foil-glare`).
     - Removed all corner rainbow and glow emitters (`data-corner-glow-left`, `data-corner-glow-right`, `data-avatar-glow`).
     - Retained clean portrait photo, fallback monogram on load error, edge-to-edge title, click-to-lightbox handler, and clean lifecycle disposal in `destroy()`.

---

## 2. Component & Architecture Details

### Domain & Data Layer
- `portfolio/src/domain/types.ts`:
  - `ProfileLink`: `icon: 'github' | 'codewars' | 'linkedin' | 'external'`.
- `portfolio/src/data/profile.ts`:
  - `title: 'Mobile Developer'`.
  - LinkedIn link record.
- `portfolio/src/data/__tests__/profile.test.ts`:
  - Asserts `title` is `'Mobile Developer'` and 3 links exist.

### UI Components Layer (`portfolio/src/components/home/`)
- `ProfileLinks.ts`:
  - LinkedIn SVG vector glyph for `linkedin` key.
- `ProfileContact.ts`:
  - Interactive click-to-copy buttons for phone and email with tooltips.
- `ProfileAvatar.ts`:
  - Pure, clean portrait card:
    - Zero holographic canvas or shader overlays over the image.
    - Zero glow emitters behind or around the card.
    - Zero cursor tracking overhead or unused event listeners.
    - Edge-to-edge uppercase title `MOBILE DEVELOPER`.
    - Memory-safe lifecycle: clean detachment and nullification on `destroy()`.
- `ProfileHeader.ts`:
  - Curated Editorial Bento Grid integration.

---

## 3. Strict TDD Verification Evidence

1. **Test Verification (`npm --prefix portfolio test`)**:
   - All test suites passing.
   - `ProfileAvatar.test.ts` asserts absence of holographic canvas and verifies pure portrait image display, fallback monogram, edge-to-edge title, click/keyboard navigation, and clean `destroy()` lifecycle.
2. **Production Build Verification (`npm --prefix portfolio run build`)**:
   - Vite 6 + TypeScript (`tsc && vite build`) passed with zero errors.
