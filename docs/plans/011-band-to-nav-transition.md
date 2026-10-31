# 011 - 1:1 Boc.Studio Band-to-Nav Transition & Main Screen Entrance

- **Status**: Completed band-to-nav flaws; updating animation easing curves to calibrated organic GSAP curves
- **Created**: 2026-10-29
- **Last Updated**: 2026-10-29
- **Tech Stack**: Vanilla TypeScript, GSAP 3 (gsap-timeline, CustomEase), Three.js, Tailwind CSS v4

---

## 1. Goal & Context
Resolve the visual flaws in the band-to-nav transition and calibrate the animation curves:

1. **Flaw 1: Logo moves left but stays black** (Fixed).
2. **Flaw 2: Logo stays in place while band moves up** (Fixed).
3. **Flaw 3: Static orange band visible behind the elastic band** (Fixed).
4. **Flaw 4: Elastic band snaps out of existence the moment user clicks enter** (Fixed).
5. **Nav Bar Tab Color States (Unselected Black, Hover White, Selected White)** (Fixed).
6. **Flaw 6: Jarring `power3.in` collision on logo glide and band ascent** (Fixed).
7. **Flaw 7: Sluggish sequential staging & static logo size during glide** (Fixed).
8. **Flaw 8: Animation rushing too fast for user observation (Current Focus)**:
   - **Root Cause**: The total timeline ran in only $0.87\text{s}$ ($0.05\text{s} + 0.82\text{s}$), making the color morph, horizontal travel, logo size reduction, and band ascent feel rushed and difficult to perceive.
   - **Fix**:
     - Breath delay: `startMotionDelay: 0.15s` (allows the user to register the click and observe the wordmark turn pure white and satellites fade).
     - Color morph duration: $0.4\text{s}$.
     - Ascent & scaling duration: `upwardAscent: 1.3s` (with `logoHorizontalGlide: 1.15s`), expanding total transition time to $\approx 1.45\text{s}$. The user has ample time to observe the logo glide, shrink, and dock into the top navbar alongside the rising 3D carousel.

---

## 2. Architecture & Components
- `src/style.css`:
  - Add `[data-brand-bar][data-mirrored="true"]` rules for transparent background and hidden DOM track.
  - Add `.nav-cluster .nav-tab` styling: default `#0d0d0d`, hover `#ffffff`, `[data-selected="true"]` `#ffffff`.
- `src/engines/band/navBar.ts`:
  - Implement active tab tracking with `data-selected` attribute (`'work'` default).
  - Add `setSelectedTab(tab: string)` and `getSelectedTab(): string`.
  - Bind tab click handler to automatically update active state and trigger callback.
- `src/engines/band/__tests__/navBar.test.ts`:
  - Add unit tests for unselected tab color (black), selected tab color (white), and tab switching.
- `src/engines/band/index.ts`:
  - In `onMarqueeReady`: assign `data-mirrored="true"` to `#brand-bar`. Do not set track opacity to 0.
  - In `replay()`: remove `data-mirrored` and reset state.
- `src/engines/band/transitionTimeline.ts`:
  - Freeze DOM track transform.
  - Remove `data-mirrored` from `brandBar`.
  - Clone lockup, strip `.text-[#0d0d0d]`, set `color: inherit`.
  - Add GSAP labels: `'fade'` ($0$), `'glide'` ($startGlideTime$), `'ascent'` ($startAscentTime$).
  - At label `'fade'`: fade satellites (`power1.in`), fade header/pill, morph logo to `#ffffff` ($0.3\text{s}$, `power2.inOut`).
  - At label `'glide'`: glide logo horizontally to $w$ ($0.35\text{s}$, `TRANSITION_EASES.logoGlide = 'power2.inOut'`).
  - At label `'ascent'`: ascend brand bar to $y: 0$ and collapse to height $v$ ($0.82\text{s}$, `TRANSITION_EASES.bandAscent = 'power3.inOut'`); ascend and scale logo in lockstep ($0.82\text{s}$, `TRANSITION_EASES.logoAscent = 'power3.inOut'`); sink ASCII background ($0.82\text{s}$, `TRANSITION_EASES.backgroundSink = 'power2.inOut'`); slide up 3D carousel app ($0.82\text{s}$, `TRANSITION_EASES.appEntrance = 'power3.inOut'`).
  - On complete: remove clone, clear brand bar inline props, activate `nav` mode.
- `src/engines/band/constants.ts`:
  - Export `TRANSITION_EASES` defining the calibrated easing tokens for all transition stages.
- `index.html`:
  - Ensure `#brand-bar` has `w-full` (replacing `w-[calc(100%+8rem)] -left-16`) to prevent horizontal jumps.
- `src/engines/band/__tests__/transitionTimeline.test.ts`:
  - Update tests to assert 2-phase motion (glide X at `$`, ascent Y at `L`), color morph to white, and proper cleanup.

---

## 3. Strict TDD Verification Plan
1. Update `transitionTimeline.test.ts` to reflect the 2-phase Boc.Studio sequence and `data-mirrored` handling.
2. Run test suite: `npm --prefix portfolio test src/engines/band/__tests__/transitionTimeline.test.ts`.
3. Implement `style.css`, `transitionTimeline.ts`, `index.ts`, `index.html`.
4. Verify all tests pass: `npm --prefix portfolio test`.
5. Run production build: `npm --prefix portfolio run build`.
