export interface CairoStatus {
  isAvailable: boolean;
  statusText: string;
}

/**
 * CairoTimeClock
 * Live digital neon clock tracking Cairo, Egypt local time (`Africa/Cairo`)
 * with dynamic active / recharging availability status.
 */
export class CairoTimeClock {
  private container: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;

  private timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  private hourFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Cairo',
    hour12: false,
    hour: 'numeric',
  });

  public getTimeString(date: Date = new Date()): string {
    return this.timeFormatter.format(date);
  }

  public getStatus(date: Date = new Date()): CairoStatus {
    const hour = parseInt(this.hourFormatter.format(date), 10);
    // Active from 09:00 to 22:59 Cairo time
    const isAvailable = hour >= 9 && hour < 23;
    return {
      isAvailable,
      statusText: isAvailable ? 'Active / Available for chats' : 'Recharging (Off-peak)',
    };
  }

  public mount(container: HTMLElement): void {
    this.container = container;

    const root = document.createElement('div');
    root.setAttribute('data-cairo-clock', 'true');
    root.className =
      'cairo-clock-hud inline-flex flex-wrap items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md select-none text-xs font-mono';

    const now = new Date();
    const timeStr = this.getTimeString(now);
    const status = this.getStatus(now);

    root.innerHTML = `
      <div class="flex items-center gap-2 text-neutral-300">
        <span class="text-neutral-500 text-[10px] uppercase tracking-wider">CAIRO</span>
        <span data-cairo-time class="text-neutral-100 font-semibold tracking-wider tabular-nums">${timeStr}</span>
        <span class="text-neutral-500 text-[10px]">UTC+2</span>
      </div>
      <div class="h-3 w-px bg-white/10 hidden sm:block"></div>
      <div data-cairo-status class="flex items-center gap-1.5 ${
        status.isAvailable ? 'text-emerald-400' : 'text-amber-400/90'
      }">
        <span class="relative flex h-2 w-2">
          ${
            status.isAvailable
              ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>`
              : `<span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500/80"></span>`
          }
        </span>
        <span class="text-[11px] font-sans font-medium">${status.statusText}</span>
      </div>
    `;

    this.rootEl = root;
    this.container.appendChild(root);

    // Update time and status every 1000ms
    this.timerId = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  private updateDisplay(): void {
    if (!this.rootEl) return;

    const now = new Date();
    const timeDisplay = this.rootEl.querySelector('[data-cairo-time]');
    const statusContainer = this.rootEl.querySelector('[data-cairo-status]');

    if (timeDisplay) {
      timeDisplay.textContent = this.getTimeString(now);
    }

    if (statusContainer) {
      const status = this.getStatus(now);
      statusContainer.className = `flex items-center gap-1.5 ${
        status.isAvailable ? 'text-emerald-400' : 'text-amber-400/90'
      }`;
      statusContainer.innerHTML = `
        <span class="relative flex h-2 w-2">
          ${
            status.isAvailable
              ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>`
              : `<span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500/80"></span>`
          }
        </span>
        <span class="text-[11px] font-sans font-medium">${status.statusText}</span>
      `;
    }
  }

  public destroy(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.rootEl && this.rootEl.parentNode) {
      this.rootEl.parentNode.removeChild(this.rootEl);
    }
    this.rootEl = null;
    this.container = null;
  }
}
