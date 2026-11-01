import type { ContactPayload } from '@/domain/types';
import { CairoTimeClock } from './CairoTimeClock';
import type { AudioHaptics } from './AudioHaptics';

export interface RetroTerminalConfig {
  audioHaptics?: AudioHaptics;
  onSwitchToGui?: () => void;
  onSubmit?: (payload: ContactPayload) => Promise<void> | void;
}

/**
 * RetroTerminalMode
 * Vintage green-on-black monospace CRT command prompt allowing
 * developers and visitors to interact and transmit messages via CLI commands.
 */
export class RetroTerminalMode {
  private haptics?: AudioHaptics;
  private onSwitchToGui?: () => void;
  private onSubmit?: (payload: ContactPayload) => Promise<void> | void;

  private container: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private history: string[] = [];
  private historyIndex: number = -1;
  private cleanups: Array<() => void> = [];
  private clockHelper = new CairoTimeClock();

  constructor(config: RetroTerminalConfig = {}) {
    this.haptics = config.audioHaptics;
    this.onSwitchToGui = config.onSwitchToGui;
    this.onSubmit = config.onSubmit;
  }

  public mount(container: HTMLElement): void {
    this.container = container;

    const root = document.createElement('div');
    root.setAttribute('data-retro-terminal', 'true');
    root.className =
      'retro-terminal relative overflow-hidden rounded-3xl bg-[#050a05] border border-[#00ff66]/30 text-[#00ff66] font-mono text-xs p-5 sm:p-7 flex flex-col justify-between shadow-[0_0_40px_rgba(0,255,102,0.12)] min-h-[460px] select-text';

    root.innerHTML = `
      <!-- Scanline Overlay -->
      <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-40 z-10" aria-hidden="true"></div>

      <!-- Terminal Top Bar -->
      <div class="flex items-center justify-between border-b border-[#00ff66]/20 pb-3 mb-3 shrink-0 relative z-20">
        <div class="flex items-center gap-2">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66]"></span>
          <span class="font-bold tracking-wider text-[11px] text-[#00ff66]">TTY1: TRANSMISSION PROTOCOL</span>
        </div>

        <button
          type="button"
          data-terminal-exit
          class="px-2.5 py-1 rounded bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] hover:bg-[#00ff66]/20 text-[10px] uppercase tracking-wider font-mono cursor-pointer transition-colors active:scale-95"
        >
          [RETURN TO GUI]
        </button>
      </div>

      <!-- Console Output Buffer -->
      <div
        data-terminal-output
        class="flex-1 overflow-y-auto space-y-2 py-2 pr-2 relative z-20 scrollbar-thin scrollbar-thumb-[#00ff66]/30 select-text leading-relaxed"
      >
        <div class="text-[#00ff66]/70 whitespace-pre">┌─────────────────────────────────────────────────────────┐
│ ZEIAD MOHAMMED // DIRECT TRANSMISSION PROTOCOL v3.0     │
│ TYPE 'help' FOR COMMAND LIST OR 'gui' TO RETURN TO FORM │
└─────────────────────────────────────────────────────────┘</div>
      </div>

      <!-- Command Input Line -->
      <form data-terminal-form class="mt-3 pt-3 border-t border-[#00ff66]/20 flex items-center gap-2 shrink-0 relative z-20">
        <span class="text-[#00ff66] font-bold text-sm shrink-0">&gt;</span>
        <input
          data-terminal-input
          type="text"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="type 'help' or msg send 'hello'..."
          class="flex-1 bg-transparent border-none outline-none text-[#00ff66] text-xs font-mono placeholder-[#00ff66]/30 focus:ring-0"
        />
        <span class="animate-pulse font-bold text-sm leading-none text-[#00ff66]">▋</span>
      </form>
    `;

    this.rootEl = root;
    this.container.appendChild(root);

    this.bindEvents();
  }

  public async executeCommand(cmdRaw: string): Promise<void> {
    const trimmed = cmdRaw.trim();
    if (!trimmed) return;

    this.history.push(trimmed);
    this.historyIndex = this.history.length;

    this.appendLine(`> ${trimmed}`);

    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help': {
        this.appendLine(`AVAILABLE PROTOCOL COMMANDS:`);
        this.appendLine(`  msg send "<content>"  - Transmit direct message payload`);
        this.appendLine(`  cairo                 - Display current local time & availability in Cairo`);
        this.appendLine(`  status                - View transmitter & network status`);
        this.appendLine(`  clear                 - Wipe console history buffer`);
        this.appendLine(`  gui                   - Exit console & return to standard form`);
        break;
      }

      case 'cairo': {
        const now = new Date();
        const timeStr = this.clockHelper.getTimeString(now);
        const status = this.clockHelper.getStatus(now);
        this.appendLine(`LOCATION: Cairo, Egypt (Africa/Cairo)`);
        this.appendLine(`LOCAL TIME: ${timeStr} UTC+2`);
        this.appendLine(`STATUS: ${status.statusText}`);
        break;
      }

      case 'status': {
        this.appendLine(`SYSTEM STATUS: ONLINE`);
        this.appendLine(`CHANNELS: Telegram Fast Track [READY] | Direct Dispatcher [READY]`);
        this.appendLine(`LATENCY: < 12ms`);
        this.appendLine(`AUDIO SYNTH: Active Web Audio Haptics`);
        break;
      }

      case 'clear': {
        if (this.rootEl) {
          const out = this.rootEl.querySelector('[data-terminal-output]');
          if (out) out.innerHTML = '';
        }
        break;
      }

      case 'gui':
      case 'exit': {
        this.appendLine(`Returning to visual interface...`);
        if (this.onSwitchToGui) {
          this.onSwitchToGui();
        }
        break;
      }

      case 'msg': {
        const sub = parts[1]?.toLowerCase();
        if (sub === 'send') {
          // Extract message text from quotes or remainder
          const rawMatch = trimmed.match(/^msg\s+send\s+["']?([^"']+)["']?$/i);
          const msgContent = rawMatch ? rawMatch[1] : parts.slice(2).join(' ');

          if (!msgContent || msgContent.trim().length < 3) {
            this.appendLine(`ERROR: Message content too short. Usage: msg send "Your message here"`);
            return;
          }

          this.appendLine(`TRANSMITTING ENCRYPTED PACKET...`);
          const payload: ContactPayload = {
            name: 'Terminal User',
            emailOrHandle: 'terminal@cli.local',
            channel: 'email',
            message: msgContent.trim(),
            timestamp: Date.now(),
          };

          if (this.onSubmit) {
            try {
              await this.onSubmit(payload);
              this.appendLine(`SUCCESS: Transmission dispatched and received by host.`);
            } catch (err: any) {
              this.appendLine(`TRANSMISSION ERROR: ${err.message || 'Dispatch failed'}`);
            }
          }
        } else {
          this.appendLine(`UNKNOWN SUBCOMMAND '${sub}'. Try: msg send "hello"`);
        }
        break;
      }

      default: {
        this.appendLine(`command not recognized: '${command}'. Type 'help' for command list.`);
        break;
      }
    }

    this.scrollToBottom();
  }

  private appendLine(text: string): void {
    if (!this.rootEl) return;
    const out = this.rootEl.querySelector('[data-terminal-output]');
    if (!out) return;

    const line = document.createElement('div');
    line.className = 'whitespace-pre-wrap break-words';
    line.textContent = text;
    out.appendChild(line);
  }

  private scrollToBottom(): void {
    if (!this.rootEl) return;
    const out = this.rootEl.querySelector('[data-terminal-output]');
    if (out) {
      out.scrollTop = out.scrollHeight;
    }
  }

  private bindEvents(): void {
    if (!this.rootEl) return;

    const form = this.rootEl.querySelector('[data-terminal-form]') as HTMLFormElement | null;
    const input = this.rootEl.querySelector('[data-terminal-input]') as HTMLInputElement | null;
    const exitBtn = this.rootEl.querySelector('[data-terminal-exit]') as HTMLButtonElement | null;

    if (exitBtn) {
      const onExit = () => {
        this.haptics?.playClick();
        if (this.onSwitchToGui) {
          this.onSwitchToGui();
        }
      };
      exitBtn.addEventListener('click', onExit);
      this.cleanups.push(() => exitBtn.removeEventListener('click', onExit));
    }

    if (input) {
      // Keypress sound
      const onKeypress = () => {
        this.haptics?.playKeypress();
      };
      input.addEventListener('input', onKeypress);
      this.cleanups.push(() => input.removeEventListener('input', onKeypress));

      // ArrowUp / ArrowDown history navigation
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.history.length > 0 && this.historyIndex > 0) {
            this.historyIndex--;
            input.value = this.history[this.historyIndex];
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            input.value = this.history[this.historyIndex];
          } else {
            this.historyIndex = this.history.length;
            input.value = '';
          }
        }
      };
      input.addEventListener('keydown', onKeyDown);
      this.cleanups.push(() => input.removeEventListener('keydown', onKeyDown));

      // Focus input on terminal click
      const onTerminalClick = () => {
        input.focus();
      };
      this.rootEl.addEventListener('click', onTerminalClick);
      this.cleanups.push(() => this.rootEl?.removeEventListener('click', onTerminalClick));
    }

    if (form && input) {
      const onFormSubmit = async (e: Event) => {
        e.preventDefault();
        this.haptics?.playClick();
        const val = input.value;
        input.value = '';
        await this.executeCommand(val);
      };
      form.addEventListener('submit', onFormSubmit);
      this.cleanups.push(() => form.removeEventListener('submit', onFormSubmit));
    }
  }

  public destroy(): void {
    this.cleanups.forEach((cleanup) => cleanup());
    this.cleanups = [];

    if (this.rootEl && this.rootEl.parentNode) {
      this.rootEl.parentNode.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.container = null;
  }
}
