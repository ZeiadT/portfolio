# Contact Channel Copy Icon Morph Design Spec

- **Date**: 2026-10-29
- **Author**: Antigravity (Ponytail & Superpowers mode)
- **Status**: Approved by User
- **Component**: `portfolio/src/components/home/ProfileContact.ts`

---

## 1. Objective
Replace the emoji clipboard icon (`📋`) and floating `"Copied!"` tooltips in the contact channels (phone & email buttons) with an inline micro-interaction:
1. A dimmed primary copy icon (`#ff4421` with opacity/dimming).
2. On click, smoothly blur, fade, and scale out the copy icon while animating in a confirmation checkmark icon.
3. After 1.5 seconds, smoothly transition back to the copy icon.
4. Clean up all timeouts and event listeners in `destroy()`.

---

## 2. Technical Architecture & Component Details

### 2.1 Markup Architecture (`ProfileContact.ts`)
Inside both `button[data-contact-phone]` and `button[data-contact-email]`:
```html
<span
  data-copy-indicator
  class="relative w-3.5 h-3.5 flex items-center justify-center shrink-0 ml-1 text-[#ff4421]/70 group-hover:text-[#ff4421] transition-colors"
>
  <!-- Dimmed Primary Copy SVG Icon -->
  <svg
    data-icon-copy
    class="absolute inset-0 w-full h-full transition-all duration-200 ease-out opacity-100 blur-0 scale-100"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>

  <!-- Confirmation Check SVG Icon -->
  <svg
    data-icon-check
    class="absolute inset-0 w-full h-full transition-all duration-200 ease-out opacity-0 blur-xs scale-75 pointer-events-none text-[#ff4421]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
</span>
```

### 2.2 Micro-Animation Mechanics
- **Default State**:
  - `data-icon-copy`: `opacity-100 blur-0 scale-100`
  - `data-icon-check`: `opacity-0 blur-xs scale-75 pointer-events-none`
- **Active State (`onCopy`)**:
  - `data-icon-copy`: `opacity-0 blur-xs scale-75`
  - `data-icon-check`: `opacity-100 blur-0 scale-100`
  - Transition duration: 200ms ease-out.
  - Duration timer: 1500ms timeout before reverting to default state.
- **Teardown**:
  - Clear pending `phoneTimeout` and `emailTimeout`.
  - Unbind click listeners and nullify element references.

---

## 3. Testing Strategy (Strict TDD)
1. **Red Phase (`ProfileContact.test.ts`)**:
   - Assert absence of emoji `📋`.
   - Assert absence of old floating tooltip elements (`[data-copy-feedback]`, `[data-phone-feedback]`, `[data-email-feedback]`).
   - Assert presence of `[data-icon-copy]` and `[data-icon-check]`.
   - Verify on click:
     - `clipboard.writeText` is called.
     - `data-icon-copy` has `opacity-0`.
     - `data-icon-check` has `opacity-100`.
   - Verify teardown in `destroy()`.
2. **Green Phase**:
   - Implement `ProfileContact.ts`.
   - Run Vitest suite to ensure 116/116 tests pass.
   - Run production build `npm --prefix portfolio run build`.
