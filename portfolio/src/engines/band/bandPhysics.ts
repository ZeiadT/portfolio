/**
 * Calibrated WebGL Elastic Rubber Band Physics Engine
 * Rewrite from scratch: Subdued tactile elasticity with zero polygon tearing or boundary glitches.
 */

export interface PhysicsConfig {
  grid: number;
  mouse: number;
  strength: number;
  relaxation: number;
  elasticity: number;
  coupling: number;
  pullX: number;
  pullY: number;
  throw: number;
  feed: number;
  sharp: number;
  spread: number;
  air: number;
  range: number;
  maxDistortion: number;
}

export const PRESET_CALIBRATED: PhysicsConfig = {
  grid: 64,
  mouse: 0.22,
  strength: 1.6,       // Calibrated from original 10 -> 1.6
  relaxation: 0.94,     // Calibrated smooth damping
  elasticity: 0.10,     // Gentle rubber spring
  coupling: 0.32,
  pullX: 32,            // Calibrated reach from original 140 -> 32
  pullY: 24,            // Calibrated reach from original 90 -> 24
  throw: 0.45,
  feed: 0.88,
  sharp: 2,
  spread: 2,
  air: 36,              // Safe overflow margin preventing edge clipping
  range: 24,            // Byte displacement scale
  maxDistortion: 24,    // Hard clamp strictly preventing tearing
};

export function createPhysicsConfig(overrides: Partial<PhysicsConfig> = {}): PhysicsConfig {
  return {
    ...PRESET_CALIBRATED,
    ...overrides,
  };
}

/**
 * Normalizes CSS font-weight values to prevent synthetic font dilation (faux-bolding)
 * in Canvas 2D when targeting system sans-serif fonts without native 900 Black cuts.
 */
export function normalizeFontWeight(weight: string | number): string {
  const num = parseInt(String(weight), 10);
  if (!isNaN(num)) {
    if (num >= 800) return '700';
    return String(num);
  }
  if (weight === 'bold' || weight === 'bolder' || weight === 'black') return '700';
  return '400';
}

/**
 * Pure 2D spring grid mathematical simulation for rubber deformation.
 */
export class BandSpringGrid {
  public gridX: number;
  public gridY: number;
  public q: Float32Array; // displacement
  public S: Float32Array; // velocity
  public A: Float32Array; // neighbor coupling buffer
  public N: Uint8Array;   // packed byte texture (128 = 0 offset)
  public cfg: PhysicsConfig;

  constructor(gridX: number, gridY: number, cfg: PhysicsConfig = createPhysicsConfig()) {
    this.gridX = Math.max(8, gridX);
    this.gridY = Math.max(4, gridY);
    this.cfg = cfg;

    const count = this.gridX * this.gridY;
    this.q = new Float32Array(count * 2);
    this.S = new Float32Array(count * 2);
    this.A = new Float32Array(count * 2);
    this.N = new Uint8Array(count * 4);

    // Initialize neutral byte displacement (128 = 0 offset)
    for (let i = 0; i < count; i++) {
      this.N[i * 4] = 128;
      this.N[i * 4 + 1] = 128;
      this.N[i * 4 + 2] = 0;
      this.N[i * 4 + 3] = 255;
    }
  }

  public injectPointerForce(u: number, v: number, vX: number, vY: number, isDown: boolean): void {
    if (Math.abs(vX) < 1e-5 && Math.abs(vY) < 1e-5) return;

    const { mouse, sharp, strength, throw: throwVal } = this.cfg;
    const E = this.gridX;
    const j = this.gridY;

    const px = E * u;
    const py = j * v;
    const radius = Math.max(E, j) * mouse;
    const r2 = radius * radius;
    const aspect = j / E;

    const spanX = Math.ceil(radius * Math.sqrt(aspect)) + 1;
    const spanY = Math.ceil(radius) + 1;

    const minX = Math.max(0, Math.floor(px - spanX));
    const maxX = Math.min(E - 1, Math.ceil(px + spanX));
    const minY = Math.max(0, Math.floor(py - spanY));
    const maxY = Math.min(j - 1, Math.ceil(py + spanY));

    const forceMultiplier = isDown ? 1.6 : 1.0;

    for (let gx = minX; gx <= maxX; gx++) {
      for (let gy = minY; gy <= maxY; gy++) {
        const dx = px - gx;
        const dy = py - gy;
        const dist2 = (dx * dx) / aspect + dy * dy;

        if (dist2 < r2) {
          const idx = 2 * (gx + E * gy);
          const factor = Math.pow(1 - dist2 / r2, sharp) * 4;
          const force = 100 * strength * factor * forceMultiplier;

          this.q[idx] += force * vX * (1 - throwVal);
          this.q[idx + 1] += force * vY * (1 - throwVal);
          this.S[idx] += force * vX * throwVal * 0.5;
          this.S[idx + 1] += force * vY * throwVal * 0.5;
        }
      }
    }
  }

  public stepPhysics(): number {
    const { elasticity, relaxation, coupling, spread, range, maxDistortion } = this.cfg;
    const E = this.gridX;
    const j = this.gridY;
    const q = this.q;
    const S = this.S;
    const A = this.A;
    const N = this.N;

    // 1. Neighbor Spring Coupling (Diffusion)
    if (coupling > 0.004) {
      const passes = Math.max(1, Math.round(spread));
      for (let p = 0; p < passes; p++) {
        for (let gy = 0; gy < j; gy++) {
          for (let gx = 0; gx < E; gx++) {
            const idx = 2 * (gx + E * gy);
            const left = 2 * (Math.max(0, gx - 1) + E * gy);
            const right = 2 * (Math.min(E - 1, gx + 1) + E * gy);
            const top = 2 * (gx + E * Math.max(0, gy - 1));
            const bottom = 2 * (gx + E * Math.min(j - 1, gy + 1));

            A[idx] = q[idx] + coupling * ((q[left] + q[right] + q[top] + q[bottom]) / 4 - q[idx]);
            A[idx + 1] = q[idx + 1] + coupling * ((q[left + 1] + q[right + 1] + q[top + 1] + q[bottom + 1]) / 4 - q[idx + 1]);
          }
        }
        for (let k = 0; k < q.length; k++) {
          q[k] = A[k];
        }
      }
    }

    // 2. Spring Elasticity, Velocity Dampening, and Strict Clamping
    if (elasticity > 0.004) {
      for (let i = 0; i < q.length; i++) {
        const vel = (S[i] - elasticity * q[i]) * relaxation;
        S[i] = vel;
        q[i] += vel;

        // Hard clamp strictly preventing tearing and UV boundary clipping
        if (Math.abs(q[i]) > maxDistortion) {
          q[i] = Math.sign(q[i]) * maxDistortion;
          S[i] = 0;
        }
      }
    } else {
      for (let i = 0; i < q.length; i++) {
        q[i] *= relaxation;
        if (Math.abs(q[i]) > maxDistortion) {
          q[i] = Math.sign(q[i]) * maxDistortion;
        }
      }
    }

    // 3. Pack into Byte Displacement Texture
    let activeEnergy = 0;
    for (let i = 0; i < E * j; i++) {
      const nx = Math.max(-1, Math.min(1, q[2 * i] / range));
      const ny = Math.max(-1, Math.min(1, q[2 * i + 1] / range));

      activeEnergy += Math.abs(q[2 * i]) + Math.abs(q[2 * i + 1]);

      N[4 * i] = Math.round(127 * nx + 128);
      N[4 * i + 1] = Math.round(127 * ny + 128);
      N[4 * i + 2] = 0;
      N[4 * i + 3] = 255;
    }

    return activeEnergy;
  }

  public getActiveEnergy(): number {
    let energy = 0;
    for (let i = 0; i < this.q.length; i++) {
      energy += Math.abs(this.q[i]);
    }
    return energy;
  }
}

/**
 * High-performance WebGL Rubber Band Engine.
 */
export class BandPhysicsEngine {
  private canvas: HTMLCanvasElement;
  private brandBar: HTMLElement;
  private gl: WebGLRenderingContext | null = null;
  private offscreen: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;

  private program: WebGLProgram | null = null;
  private uTex: WebGLTexture | null = null;
  private uData: WebGLTexture | null = null;
  private uTexLoc: WebGLUniformLocation | null = null;
  private uDataLoc: WebGLUniformLocation | null = null;
  private uReachLoc: WebGLUniformLocation | null = null;

  private cfg: PhysicsConfig;
  private springGrid: BandSpringGrid | null = null;
  private barWidth = 1;
  private barHeight = 1;
  private totalHeight = 1;
  private dpr = 1;
  private ssaaScale = 1;

  private pointer = {
    x: 0,
    y: 0,
    vX: 0,
    vY: 0,
    inside: false,
  };
  private prevPointer: [number, number] | null = null;
  private isRunning = false;
  private animId = 0;
  private boundPointerMove: ((e: PointerEvent) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, brandBar: HTMLElement, config?: Partial<PhysicsConfig>) {
    this.canvas = canvas;
    this.brandBar = brandBar;
    this.cfg = createPhysicsConfig(config);
    this.offscreen = document.createElement('canvas');
    this.ctx = this.offscreen.getContext('2d', { willReadFrequently: false });

    this.initWebGL();
    this.bindEvents();
  }

  private initWebGL(): void {
    if (typeof window === 'undefined') return;
    const gl = this.canvas.getContext('webgl', {
      premultipliedAlpha: true,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return;
    this.gl = gl;

    const vsSource = `
      attribute vec2 a;
      varying vec2 v;
      void main(){
        v = a * 0.5 + 0.5;
        gl_Position = vec4(a, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 v;
      uniform sampler2D uTex, uData;
      uniform vec2 uReach;
      void main(){
        vec2 off = (texture2D(uData, v).rg * 255.0 - 128.0) / 127.0;
        vec2 uv = v + off * uReach;
        if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0){
          gl_FragColor = vec4(0.0);
        } else {
          gl_FragColor = texture2D(uTex, uv);
        }
      }
    `;

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    this.program = prog;

    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Fullscreen quad buffer
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const createTex = (filter: number) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      return t;
    };

    this.uTex = createTex(gl.LINEAR);
    this.uData = createTex(gl.LINEAR);

    this.uTexLoc = gl.getUniformLocation(prog, 'uTex');
    this.uDataLoc = gl.getUniformLocation(prog, 'uData');
    this.uReachLoc = gl.getUniformLocation(prog, 'uReach');

    this.updateDimensions();
  }

  public updateDimensions = (): void => {
    const rect = this.brandBar.getBoundingClientRect();
    this.barWidth = Math.max(1, Math.round(rect.width));
    this.barHeight = Math.max(1, Math.round(rect.height));

    const air = Math.round(this.cfg.air);
    this.totalHeight = this.barHeight + 2 * air;
    this.dpr = Math.max(1, window.devicePixelRatio || 1);

    this.canvas.style.width = `${this.barWidth}px`;
    this.canvas.style.height = `${this.totalHeight}px`;
    this.canvas.style.top = `-${air}px`;

    this.canvas.width = Math.round(this.barWidth * this.dpr);
    this.canvas.height = Math.round(this.totalHeight * this.dpr);

    // Super-Sampled Antialiasing (SSAA):
    // Allocate offscreen 2D canvas buffer at minimum 2x or 1.5x DPR.
    // Hardware bilinear filtering in the WebGL fragment shader automatically downsamples cleanly.
    this.ssaaScale = Math.max(2, this.dpr * 1.5);
    this.offscreen.width = Math.round(this.barWidth * this.ssaaScale);
    this.offscreen.height = Math.round(this.totalHeight * this.ssaaScale);

    // Grid sizing
    const gridX = Math.max(16, Math.round(this.cfg.grid));
    const aspect = this.barWidth / this.totalHeight;
    const gridY = Math.max(6, Math.round(gridX / aspect));

    this.springGrid = new BandSpringGrid(gridX, gridY, this.cfg);
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  private bindEvents(): void {
    this.boundPointerMove = (e: PointerEvent) => {
      const rect = this.brandBar.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      const air = this.cfg.air;

      this.pointer.inside = rx >= 0 && rx <= rect.width && ry >= -air && ry <= rect.height + air;

      if (!this.pointer.inside) {
        this.prevPointer = null;
        return;
      }

      const u = rx / this.barWidth;
      const v = 1 - (ry + air) / this.totalHeight;

      this.pointer.x = u;
      this.pointer.y = v;

      if (this.prevPointer) {
        this.pointer.vX = u - this.prevPointer[0];
        this.pointer.vY = v - this.prevPointer[1];
      }
      this.prevPointer = [u, v];
    };

    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
  }

  private drawBandSnapshot(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.offscreen.width, this.offscreen.height);
    ctx.scale(this.ssaaScale, this.ssaaScale);

    const air = this.cfg.air;

    // 1. Draw the Solid Vermilion Band
    ctx.fillStyle = '#ff4421';
    ctx.fillRect(0, air, this.barWidth, this.barHeight);

    // 2. Clone text from live DOM track
    const track = document.querySelector<HTMLElement>('#brand-track');
    if (!track) return;

    const barRect = this.brandBar.getBoundingClientRect();
    ctx.save();
    ctx.fillStyle = '#0d0d0d';
    ctx.textBaseline = 'middle';

    const items = track.querySelectorAll<HTMLElement>('.track-render-item');
    items.forEach((item) => {
      const opacity = parseFloat(window.getComputedStyle(item).opacity || '1');
      if (opacity <= 0.05) return;

      const r = item.getBoundingClientRect();
      const x = r.left - barRect.left;
      // Match exact vertical center of the DOM element with 1px optical baseline calibration (rolled back from 2px)
      const y = r.top - barRect.top + r.height / 2 + air + 1;

      ctx.globalAlpha = opacity;
      const style = window.getComputedStyle(item);
      const fontFamily =
        style.fontFamily && style.fontFamily !== 'none'
          ? style.fontFamily
          : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

      if (item.classList.contains('wordmark-label')) {
        // Character-by-character snapshot rendering to match exact DOM letter positions
        const charSpans = item.querySelectorAll<HTMLElement>(
          '.hero-char:not(.trademark-char), .static-char:not(.trademark-char)'
        );

        // Ensure canvas snapshot matches the exact computed DOM font size and normalized weight of the rendered glyphs
        const targetChar = charSpans[0] || item;
        const charStyle = window.getComputedStyle(targetChar);
        const fontSize = charStyle.fontSize || style.fontSize || '26px';
        const rawWeight = charStyle.fontWeight || style.fontWeight || '700';
        const fontWeight = normalizeFontWeight(rawWeight);
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;

        if (charSpans.length > 0) {
          if ('letterSpacing' in ctx) {
            ctx.letterSpacing = 'normal';
          }
          charSpans.forEach((span) => {
            const charRect = span.getBoundingClientRect();
            const charX = charRect.left - barRect.left;
            const charY = charRect.top - barRect.top + charRect.height / 2 + air + 1;
            ctx.fillText(span.textContent || '', charX, charY);
          });
        } else {
          if ('letterSpacing' in ctx && style.letterSpacing) {
            ctx.letterSpacing = style.letterSpacing;
          }
          ctx.fillText('ZEIAD MOHAMMED', x, y);
        }

        const tmEl = item.querySelector<HTMLElement>('.trademark-char');
        if ('letterSpacing' in ctx) {
          ctx.letterSpacing = 'normal';
        }

        if (tmEl) {
          const tmStyle = window.getComputedStyle(tmEl);
          const tmFontSize = tmStyle.fontSize || '14px';
          const tmFontWeight = normalizeFontWeight(tmStyle.fontWeight || '700');
          ctx.font = `${tmFontWeight} ${tmFontSize} ${fontFamily}`;

          const tmRect = tmEl.getBoundingClientRect();
          const tmX = tmRect.left - barRect.left;
          const tmY = tmRect.top - barRect.top + tmRect.height / 2 + air + 1;
          ctx.fillText('®', tmX, tmY);
        } else {
          const numSize = parseFloat(fontSize);
          const supSize = Math.max(10, Math.round(numSize * 0.54));
          ctx.font = `700 ${supSize}px ${fontFamily}`;
          const nameWidth = ctx.measureText('ZEIAD MOHAMMED').width;
          const supY = y - numSize * 0.32;
          ctx.fillText('®', x + nameWidth + 4, supY);
        }
      } else {
        // Apply letterSpacing if supported by Canvas 2D
        if ('letterSpacing' in ctx && style.letterSpacing) {
          ctx.letterSpacing = style.letterSpacing;
        }

        const text = (item.textContent || '').trim().toUpperCase();
        const fontSize = style.fontSize || '13px';
        const rawWeight = style.fontWeight || '600';
        const fontWeight = normalizeFontWeight(rawWeight);
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        ctx.fillText(text, x, y);

        // Render underline if active (e.g. "View Engineering Work")
        if (style.textDecorationLine && style.textDecorationLine.includes('underline')) {
          const textW = ctx.measureText(text).width;
          const underlineY = y + parseFloat(fontSize) * 0.55;
          ctx.fillRect(x, underlineY, textW, 1.2);
        }
      }
    });

    ctx.restore();
  }

  /**
   * Executes a single complete render cycle synchronously.
   * Can be called before intro curtain collapse to guarantee zero-latency handoff.
   */
  public renderFrame(): void {
    // 1. Snapshot live band + marquee to 2D offscreen buffer
    this.drawBandSnapshot();

    const gl = this.gl;
    const grid = this.springGrid;
    if (!gl || !this.program || !grid) return;

    // 2. Inject pointer force (hover-only)
    if (this.pointer.inside) {
      grid.injectPointerForce(
        this.pointer.x,
        this.pointer.y,
        this.pointer.vX,
        this.pointer.vY,
        false
      );
    }

    this.pointer.vX *= this.cfg.feed;
    this.pointer.vY *= this.cfg.feed;

    // 3. Step physics
    grid.stepPhysics();

    this.canvas.style.opacity = '1';

    // 4. Upload textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.uTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.offscreen);
    gl.uniform1i(this.uTexLoc, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.uData);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      grid.gridX,
      grid.gridY,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      grid.N
    );
    gl.uniform1i(this.uDataLoc, 1);

    // 5. Reach uniforms
    const reachX = this.cfg.pullX / Math.max(1, this.barWidth);
    const reachY = this.cfg.pullY / Math.max(1, this.totalHeight);
    gl.uniform2f(this.uReachLoc, reachX, reachY);

    // 6. Draw quad
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Synchronous immediate first frame paint
    this.renderFrame();

    const render = () => {
      if (!this.isRunning) return;
      this.animId = requestAnimationFrame(render);
      this.renderFrame();
    };

    this.animId = requestAnimationFrame(render);
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animId);
  }

  public destroy(): void {
    this.stop();
    if (this.boundPointerMove) {
      window.removeEventListener('pointermove', this.boundPointerMove);
      this.boundPointerMove = null;
    }
  }
}
