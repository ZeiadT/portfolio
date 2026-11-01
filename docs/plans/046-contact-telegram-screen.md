# Feature Implementation Plan: Contact Screen (Feature 3: Telegram & Direct Messaging Hub)

- **Status**: Completed
- **Created**: 2026-11-01
- **Last Updated**: 2026-11-01
- **Branch**: `feat/contact-telegram-screen`
- **Worktree**: `../portfolio-contact`

---

## 1. Goal & Context

The **Contact Screen (Feature 3: Telegram & Direct Messaging Hub)** serves as the high-converting, tactile transmission hub for Zeiad Mohammed's portfolio. It empowers recruiters, prospective clients, and engineering peers to initiate immediate communication through two distinct, frictionless channels:
1. **Telegram Fast Track**: Dark glassmorphic channel card with instant pre-filled prompt chips (*"💼 Project Inquiry"*, *"🚀 Job Opportunity"*, *"☕ Say Hello"*) that launch Telegram with pre-encoded messages to `@zeiad_mohammed`.
2. **Direct In-App Email Dispatcher**: Sleek modern form with laser-hairline focus glow (`#ff4421`), live character counter, rate-limiting, and an Easter Egg retro monospace CLI terminal mode (`>_`).

The transmission process is crowned with a tactile kinetic send animation (button morphing into a spinning progress orb $\to$ paper airplane shooting upward off-screen $\to$ vermilion and white confetti particle burst $\to$ spring checkmark settle) accompanied by natively synthesized Web Audio haptic feedback.

---

## 2. Requirements & Constraints

### 2.1 Functional Requirements
- **Dual-Channel Transmission**:
  - **Telegram Direct Channel**: Glassmorphic card, Telegram brand accents (`#229ED9`), one-click deep link to `https://t.me/zeiad_mohammed?text=...`, prompt chips with URL-encoded templates.
  - **Direct Email Dispatcher**: Fields for `name`, `emailOrHandle`, and `message` (textarea with character limit e.g. 1000 and live counter). Laser-hairline focus effect (`border-[#ff4421]` with 12px ambient glow). Form validation with clear inline feedback.
- **Kinetic Send Animation**:
  - Button collapses into a circular spinning progress orb.
  - Orb morphs into a paper airplane vector icon and shoots upward off-screen (`y: -200px`, `scale: 0.2`, `opacity: 0`, ease `power4.in`, duration ~450ms).
  - Vermilion (`#ff4421`) and white (`#ffffff`) canvas confetti burst radiating from the launch point with natural gravity and decay.
  - Form transitions into a success state featuring a tactile spring checkmark (`back.out(1.7)`).
- **Audio Haptics**:
  - Pure Web Audio API (`AudioContext`) synthesis for mechanical switch clicks, keyboard clacks, and airplane takeoff swoosh.
  - Zero external `.mp3` or `.wav` dependencies.
  - Graceful no-op fallback when Web Audio is unavailable or suspended.
- **Live Cairo Timezone Clock HUD**:
  - Real-time digital neon clock tracking Cairo local time (`Africa/Cairo`) formatted as `HH:mm:ss UTC+2`.
  - Dynamic status indicator:
    - *Active / Available for chats* (09:00 – 23:00 Cairo time, pulsing emerald beacon `●`).
    - *Recharging* (23:00 – 09:00 Cairo time, amber crescent moon `🌙`).
  - Timer cleanup on `destroy()`.
- **Retro Monospace Terminal Mode (`>_`)**:
  - Toggle button in form header transforms the interface into a green-on-black phosphor terminal (`#00ff66` on `#050a05`).
  - Command interpreter supporting:
    - `help`: list commands.
    - `msg send <text>`: transmits message payload via `ContactService`.
    - `status`: displays transmitter status and latency.
    - `cairo`: displays local Cairo time and availability.
    - `clear`: wipes terminal output.
    - `gui` or toggle icon: reverts to visual form mode.

### 2.2 Technical & Architectural Constraints
- **Strict Clean Architecture**:
  - Domain layer: `ContactPayload`, `ProfileContact`, `ViewState` from `portfolio/src/domain/types.ts`.
  - Data layer: Profile information read from `portfolio/src/data/profile.ts`.
  - Services layer: `portfolio/src/services/contactService.ts` providing typed transmission, rate limiting, and mock fallback.
  - Components layer: `portfolio/src/components/contact/` implementing standard `Engine` lifecycle (`mount(container: HTMLElement)`, `destroy()`, `resize?()`).
- **Component Isolation & Zero Memory Leaks**:
  - 100% self-contained. No global window leaks, no uncleared intervals/timeouts, no retained rAF loops or audio nodes.
  - Destroy cleanly detaches all DOM elements and unbinds all listeners.
- **Strict TDD**:
  - Failing test suite written and committed before writing implementation code.
  - 100% test coverage of validation, rate-limiting, timezone calculation, terminal commands, and lifecycle cleanup.

---

## 3. Architecture & File Decomposition

```
portfolio/src/
├── domain/
│   └── types.ts                    # ContactPayload, ProfileContact, Engine
├── services/
│   ├── contactService.ts           # Transmission adapter, mock fallback, rate limiting
│   └── __tests__/
│       └── contactService.test.ts  # Validation, rate-limiting, error handling
└── components/
    └── contact/
        ├── ContactHub.ts           # Root container & orchestrator implementing Engine
        ├── CairoTimeClock.ts       # Cairo timezone digital clock & status badge
        ├── TelegramChannelCard.ts  # Dark glassmorphic Telegram channel card & chips
        ├── DirectEmailDispatcher.ts# Email dispatcher form with laser hairlines
        ├── RetroTerminalMode.ts    # Monospace green CLI mode interpreter
        ├── KineticSendAnimation.ts # GSAP timeline + canvas confetti explosion
        ├── AudioHaptics.ts         # Native Web Audio API synthesizer
        └── __tests__/
            ├── ContactHub.test.ts
            ├── CairoTimeClock.test.ts
            ├── TelegramChannelCard.test.ts
            ├── DirectEmailDispatcher.test.ts
            ├── RetroTerminalMode.test.ts
            ├── KineticSendAnimation.test.ts
            └── AudioHaptics.test.ts
```

---

## 4. Test-Driven Development (TDD) Plan

### Phase 1: Transmission Service (`contactService.test.ts`)
- **Tests**:
  1. Validates required fields (`name`, `emailOrHandle`, `message`).
  2. Validates email/handle syntax (email regex or @handle format).
  3. Rejects empty strings, whitespace-only messages, and oversized messages (> 1000 chars).
  4. Enforces rate limiting: permits up to 3 requests per 60 seconds; throws rate limit error on 4th attempt.
  5. Mock transmission resolves successfully with simulated network delay.
  6. Pluggable custom transport handler hook.

### Phase 2: Live Cairo Timezone Clock (`CairoTimeClock.test.ts`)
- **Tests**:
  1. Formats time accurately in `Africa/Cairo` timezone.
  2. Correctly flags "Active / Available for chats" during 09:00 - 22:59 Cairo time.
  3. Correctly flags "Recharging" during 23:00 - 08:59 Cairo time.
  4. Mounts DOM elements cleanly into container.
  5. Clears periodic tick timer on `destroy()`, verifying zero lingering intervals.

### Phase 3: Telegram Fast Track (`TelegramChannelCard.test.ts`)
- **Tests**:
  1. Renders Telegram profile handle `@zeiad_mohammed` and deep link.
  2. Renders preset prompt chips (*"💼 Project Inquiry"*, *"🚀 Job Opportunity"*, *"☕ Say Hello"*).
  3. Clicking chips generates proper URL-encoded query string (`https://t.me/zeiad_mohammed?text=...`).
  4. Triggers audio haptic feedback on chip interaction.
  5. Clean teardown on `destroy()`.

### Phase 4: Direct Email Dispatcher & Validation (`DirectEmailDispatcher.test.ts`)
- **Tests**:
  1. Mounts inputs (`name`, `emailOrHandle`, `message`) and character counter (`0 / 1000`).
  2. Updates character counter dynamically on input typing.
  3. Displays inline error messages when submitting invalid or empty fields.
  4. Focus states toggle laser-hairline classes (`border-[#ff4421]`).
  5. Emits submit event with valid `ContactPayload`.
  6. Clean teardown of DOM and listeners on `destroy()`.

### Phase 5: Retro Monospace Terminal Mode (`RetroTerminalMode.test.ts`)
- **Tests**:
  1. Mounts green CRT monospace console with prompt line.
  2. Interprets `help` command: outputs command catalog.
  3. Interprets `cairo` command: outputs Cairo local time.
  4. Interprets `status` command: outputs transmitter status.
  5. Interprets `clear` command: empties console history.
  6. Interprets `msg send <text>`: validates and invokes `ContactService`.
  7. Interprets `gui`: triggers callback to flip view back to standard form.
  8. Keyboard navigation: `Enter` executes command, up/down arrows cycle history.
  9. Clean teardown on `destroy()`.

### Phase 6: Kinetic Send Animation & Confetti (`KineticSendAnimation.test.ts`)
- **Tests**:
  1. Creates progress orb, paper airplane SVG, and confetti canvas.
  2. Triggers GSAP sequence from idle $\to$ spinning orb $\to$ airplane launch $\to$ confetti burst.
  3. Renders confetti particles on canvas without throwing in headless / mock canvas context.
  4. Displays tactile spring checkmark on completion.
  5. Resets state on repeat calls or teardown.
  6. Disposes all GSAP tweens, rAF handles, and canvas contexts on `destroy()`.

### Phase 7: Audio Haptics (`AudioHaptics.test.ts`)
- **Tests**:
  1. Initializes `AudioContext` lazily upon first user interaction.
  2. Synthesizes `click` transient without errors.
  3. Synthesizes `swoosh` noise sweep without errors.
  4. Synthesizes `success` melodic chime without errors.
  5. Handles muted / unsupported environments gracefully without throwing.
  6. Closes `AudioContext` on `destroy()`.

### Phase 8: Contact Hub Integration (`ContactHub.test.ts`)
- **Tests**:
  1. Mounts the complete dual-card transmission hub into a container.
  2. Handles view toggles between GUI form and Retro Terminal mode.
  3. Wires up transmission flow from form/terminal through `contactService` and `KineticSendAnimation`.
  4. Survives 20 rapid `mount()` and `destroy()` cycles with zero lingering DOM nodes or global listeners.

---

## 5. Implementation Roadmap (Strict TDD)

1. **Step 1: Contact Service**
   - Write failing unit tests in `src/services/__tests__/contactService.test.ts`.
   - Implement `src/services/contactService.ts`.
   - Verify green tests (`npm test contactService`).

2. **Step 2: Audio Haptics**
   - Write failing unit tests in `src/components/contact/__tests__/AudioHaptics.test.ts`.
   - Implement `src/components/contact/AudioHaptics.ts`.
   - Verify green tests (`npm test AudioHaptics`).

3. **Step 3: Cairo Timezone Clock**
   - Write failing unit tests in `src/components/contact/__tests__/CairoTimeClock.test.ts`.
   - Implement `src/components/contact/CairoTimeClock.ts`.
   - Verify green tests (`npm test CairoTimeClock`).

4. **Step 4: Telegram Channel Card**
   - Write failing unit tests in `src/components/contact/__tests__/TelegramChannelCard.test.ts`.
   - Implement `src/components/contact/TelegramChannelCard.ts`.
   - Verify green tests (`npm test TelegramChannelCard`).

5. **Step 5: Direct Email Dispatcher**
   - Write failing unit tests in `src/components/contact/__tests__/DirectEmailDispatcher.test.ts`.
   - Implement `src/components/contact/DirectEmailDispatcher.ts`.
   - Verify green tests (`npm test DirectEmailDispatcher`).

6. **Step 6: Retro Monospace Terminal Mode**
   - Write failing unit tests in `src/components/contact/__tests__/RetroTerminalMode.test.ts`.
   - Implement `src/components/contact/RetroTerminalMode.ts`.
   - Verify green tests (`npm test RetroTerminalMode`).

7. **Step 7: Kinetic Send Animation & Confetti**
   - Write failing unit tests in `src/components/contact/__tests__/KineticSendAnimation.test.ts`.
   - Implement `src/components/contact/KineticSendAnimation.ts`.
   - Verify green tests (`npm test KineticSendAnimation`).

8. **Step 8: Contact Hub Orchestrator**
   - Write failing integration tests in `src/components/contact/__tests__/ContactHub.test.ts`.
   - Implement `src/components/contact/ContactHub.ts`.
   - Verify green tests (`npm test ContactHub`).

9. **Step 9: Full Suite Verification & Build Validation**
   - Run complete Vitest suite across all 30+ test files: `npm test`.
   - Run Vite production bundle build: `npm run build`.

---

## 6. Verification Checklist
- [x] All unit and integration tests passing (`npm test` - 465 passing).
- [x] TypeScript compilation passing with zero warnings or errors (`tsc --noEmit`).
- [x] Production build succeeds (`npm run build`).
- [x] Zero memory leaks or dangling event listeners after `destroy()`.
