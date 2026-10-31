# 027 - Logo Vectorization and SVG Generation Implementation Plan

- **Status**: Completed (Phase 1 & Phase 2)
- **Created**: 2026-10-31
- **Completed**: 2026-10-31
- **Target Assets**: `assets/logo.svg`, `assets/logo-dualtone.svg`
- **Tech Stack**: Python (`scikit-image`, `Pillow`, `numpy`), XML/SVG Standards, Automated IoU Validation

---

## 1. Goal & Context
Transform `assets/logo.jpg` into clean, modern, resolution-independent SVG vector assets:
1. **Background Removal**: Complete 100% transparent background (no background rects).
2. **Watermark Elimination**: Zero watermark text ("scalebranding"), circular concentric lines, or grid crosshairs.
3. **Geometric Fidelity**: Extract mathematical polygon vertices for the mask, floating ear, and eye cutouts with symmetrical alignment ($X = 288.5$) and $>99.0\%$ IoU overlap with the original graphic.
4. **Phase 2 (Option B - Dual-Tone Facet Shading)**:
   Highlight the initials **"Z"** and **"M"** embedded in the geometry using distinct polygonal facets:
   - **"Z" (3-Stroke Cyberpunk Zigzag)**:
     - Line 1: Left eye apex $(169.85, 379.00)$ &rarr; Left ear apex $(74.00, 104.38)$
     - Line 2: Left ear apex $(74.00, 104.38)$ &rarr; Right slash exit $(461.36, 369.00)$
     - Line 3: Right ear base $(465.51, 341.00)$ &rarr; Right ear apex $(503.00, 104.38)$
   - **"M" (Twin-Ear Crown)**:
     - Left flank: Left cheek $(122.55, 412.00)$ &rarr; Left ear apex $(74.00, 104.38)$
     - Inner valley: Left ear apex $(74.00, 104.38)$ &rarr; Forehead valley $(310.76, 236.00)$ &rarr; Right ear apex $(503.00, 104.38)$
     - Right flank: Right ear apex $(503.00, 104.38)$ &rarr; Right ear base $(465.51, 341.00)$
   - Structured with semantic CSS classes (`.logo-z`, `.logo-m`, `.logo-face`) and CSS variables (`--color-z`, `--color-m`, `--color-face`) for dynamic theming.

---

## 2. Requirements & Constraints
- Production-ready SVG markup with `viewBox="0 0 585 580"`.
- Clean compound path / polygon structure with `fill-rule="evenodd"` so eye cutouts and the slash are negative transparent space.
- Default `fill="currentColor"` with `#000000` fallback in `logo.svg`.
- Dual-tone polygonal facets with semantic styling in `logo-dualtone.svg`.
- Crisp geometric lines matching source coordinates without distortion.

---

## 3. Mathematical Specifications
- **Axis of symmetry**: $X = 288.5$.
- **Ear tips**: Left $(74.00, 104.38)$, Right $(503.00, 104.37)$ &rarr; Horizontal line at $Y = 104.38$.
- **Cheeks**: Left $(122.55, 412.00)$, Right $(454.00, 412.41)$ &rarr; Horizontal line at $Y = 412$.
- **Chin**: Sharp vertex at $(288.50, 524.00)$.
- **Slash**: Parallel diagonal separation band with slope $m \approx 0.681$ and perpendicular gap $23.1\text{ px}$.
- **Eyes**:
  - Left Eye: 5-point angular slit cutout.
  - Right Eye: 10-point sparkle star cutout.

---

## 4. Test-Driven Development (TDD) Plan
*A test verification script `assets/verify_logo.py` validates both assets:*
- **XML Validation**: Confirm `logo.svg` and `logo-dualtone.svg` parse into well-formed XML DOMs.
- **Artifact Cleanness**: Assert zero `<rect>` background and zero text or watermark remnants.
- **Raster IoU Match**: Rasterize vector paths and assert $\ge 98.8\%$ IoU with the thresholded binary raster mask.
- **Symmetry Metrics**: Assert symmetry of ear tips, cheeks, and chin within $0.5\text{ px}$.
- **Facet Integrity (Phase 2)**: Assert presence of `.logo-z` and `.logo-m` paths, and verify complete polygon tiling without gaps or boundary overlaps.

---

## 5. Implementation Steps
1. Update `assets/verify_logo.py` with Phase 2 assertions for `logo-dualtone.svg`.
2. Generate `assets/logo-dualtone.svg` with exact polygonal facets, semantic CSS classes, and transparent cutouts.
3. Mirror to `portfolio/public/logo-dualtone.svg`.
4. Run `python assets/verify_logo.py` to confirm all assertions pass.
5. Visually inspect output and update walkthrough artifact.

---

## 6. Verification & Testing
- Automated verification command: `python assets/verify_logo.py`
- Manual visual inspection of `assets/logo.svg`
