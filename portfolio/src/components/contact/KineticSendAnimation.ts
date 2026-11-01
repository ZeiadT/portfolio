import gsap from 'gsap';
import type { AudioHaptics } from './AudioHaptics';

export interface KineticSendConfig {
  audioHaptics?: AudioHaptics;
  particleCount?: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  decay: number;
}

/**
 * KineticSendAnimation
 * Multi-stage kinetic transmission sequence:
 * 1. Button collapses into spinning progress orb
 * 2. Morphs into paper airplane and shoots upward off-screen (`y: -200px`, `power4.in`)
 * 3. Detonates vermilion and white confetti particle burst
 * 4. Settles with tactile spring checkmark
 */
export class KineticSendAnimation {
  private haptics?: AudioHaptics;
  private particleCount: number;

  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private successEl: HTMLElement | null = null;

  private activeTimeline: gsap.core.Timeline | null = null;
  private rafId: number | null = null;
  private particles: ConfettiParticle[] = [];

  constructor(config: KineticSendConfig = {}) {
    this.haptics = config.audioHaptics;
    this.particleCount = config.particleCount ?? 50;
  }

  public mount(container: HTMLElement): void {
    this.container = container;

    // Overlay Canvas for Confetti
    const canvas = document.createElement('canvas');
    canvas.setAttribute('data-confetti-canvas', 'true');
    canvas.className = 'pointer-events-none absolute inset-0 w-full h-full z-40';
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.container.appendChild(canvas);
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width || 600;
    this.canvas.height = rect.height || 600;
  }

  public async play(buttonEl: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      this.resizeCanvas();

      const btnRect = buttonEl.getBoundingClientRect();
      const containerRect = this.container?.getBoundingClientRect() || { left: 0, top: 0, width: 600, height: 600 };
      const originX = btnRect.left - containerRect.left + btnRect.width / 2;
      const originY = btnRect.top - containerRect.top + btnRect.height / 2;

      // Original button metrics
      const originalWidth = buttonEl.offsetWidth;

      // 1. Morph button into spinning orb
      buttonEl.style.width = `${originalWidth}px`;
      buttonEl.innerHTML = `
        <span data-spinner class="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
      `;

      this.activeTimeline = gsap.timeline();

      this.activeTimeline
        .to(buttonEl, {
          width: 44,
          height: 44,
          borderRadius: 9999,
          padding: 0,
          duration: 0.3,
          ease: 'power2.out',
        })
        .add(() => {
          // 2. Transform into Paper Airplane
          buttonEl.innerHTML = `
            <svg data-airplane class="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          `;
          this.haptics?.playSwoosh();
        })
        .to(buttonEl, {
          y: -180,
          scale: 0.2,
          opacity: 0,
          duration: 0.45,
          ease: 'power4.in',
        })
        .add(() => {
          // 3. Detonate Confetti
          this.haptics?.playSuccess();
          this.triggerConfetti(originX, originY - 60);

          // 4. Mount Success Checkmark
          this.showSuccess(buttonEl.parentElement || this.container!);
          resolve();
        });
    });
  }

  private triggerConfetti(startX: number, startY: number): void {
    if (!this.canvas) return;
    const colors = ['#ff4421', '#ffffff', '#ff7755', '#229ED9', '#ffcc00'];

    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / this.particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        alpha: 1,
        decay: 0.015 + Math.random() * 0.02,
      });
    }

    this.startConfettiLoop();
  }

  private startConfettiLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    const loop = () => {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let activeCount = 0;
      for (const p of this.particles) {
        if (p.alpha <= 0) continue;

        activeCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
        this.ctx.restore();
      }

      if (activeCount > 0) {
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.rafId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private showSuccess(parent: HTMLElement): void {
    this.removeSuccess();

    const success = document.createElement('div');
    success.setAttribute('data-send-success', 'true');
    success.className =
      'send-success-badge flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#ff4421]/15 border border-[#ff4421]/40 text-[#ff4421] text-xs font-mono font-medium shadow-lg select-none';

    success.innerHTML = `
      <span class="w-5 h-5 rounded-full bg-[#ff4421] text-white flex items-center justify-center">
        <svg class="w-3 h-3 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </span>
      <span class="text-white font-semibold">Transmission Dispatched!</span>
    `;

    this.successEl = success;
    parent.appendChild(success);

    gsap.from(success, {
      scale: 0.6,
      opacity: 0,
      duration: 0.4,
      ease: 'back.out(1.7)',
    });
  }

  public removeSuccess(): void {
    if (this.successEl && this.successEl.parentNode) {
      this.successEl.parentNode.removeChild(this.successEl);
    }
    this.successEl = null;
  }

  public reset(buttonEl: HTMLElement): void {
    this.removeSuccess();

    if (this.activeTimeline) {
      this.activeTimeline.kill();
      this.activeTimeline = null;
    }

    gsap.set(buttonEl, {
      clearProps: 'all',
    });
    buttonEl.style.display = '';
    buttonEl.innerHTML = `
      <span data-submit-text class="flex items-center gap-2">
        <span>SEND TRANSMISSION</span>
        <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </span>
    `;
  }

  public destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.activeTimeline) {
      this.activeTimeline.kill();
      this.activeTimeline = null;
    }

    this.removeSuccess();

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.canvas = null;
    this.ctx = null;
    this.container = null;
  }
}
