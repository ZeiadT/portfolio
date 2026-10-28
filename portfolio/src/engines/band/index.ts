import type { Engine } from '@/domain/types';
import { BandPhysicsSimulator } from './bandPhysics';

/**
 * Elastic Band WebGL Engine
 * Renders an interactive rubber ribbon with subtle cursor-driven spring dynamics.
 */
export class ElasticBandEngine implements Engine {
  public readonly id = 'elastic-band';
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private createdCanvas = false;
  private gl: WebGLRenderingContext | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;

  private simulator: BandPhysicsSimulator;
  private animId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // WebGL resources
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private uTex: WebGLTexture | null = null;
  private uData: WebGLTexture | null = null;
  private uTexLoc: WebGLUniformLocation | null = null;
  private uDataLoc: WebGLUniformLocation | null = null;
  private uReachLoc: WebGLUniformLocation | null = null;

  private ribbonCanvas: HTMLCanvasElement | null = null;
  private ribbonCtx: CanvasRenderingContext2D | null = null;

  private width = 1;
  private height = 1;
  private dpr = 1;
  private prevPointer: [number, number] | null = null;

  constructor() {
    this.simulator = new BandPhysicsSimulator();
  }

  public mount(container: HTMLElement): void {
    this.container = container;

    // Check if canvas already exists or create one
    let canvas = container.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing select-none';
      container.appendChild(canvas);
      this.createdCanvas = true;
    } else {
      canvas.classList.add('pointer-events-auto');
      this.createdCanvas = false;
    }
    this.canvas = canvas;

    this.initRenderer();
    this.bindEvents();
    this.resize();
    this.startLoop();
  }

  private initRenderer(): void {
    if (!this.canvas) return;

    // Offscreen ribbon surface (for primary vermilion base)
    this.ribbonCanvas = document.createElement('canvas');
    this.ribbonCtx = this.ribbonCanvas.getContext('2d');

    const gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      // Fallback 2D context for environments without WebGL
      this.ctx2d = this.canvas.getContext('2d');
      return;
    }

    this.gl = gl;

    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform sampler2D uData;
      uniform vec2 uReach;

      void main() {
        // 128 is neutral zero offset
        vec2 offset = (texture2D(uData, vUv).rg * 255.0 - 128.0) / 127.0;
        vec2 uv = vUv + offset * uReach;

        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(0.0);
        } else {
          gl_FragColor = texture2D(uTex, uv);
        }
      }
    `;

    const createShader = (type: number, src: string): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getShaderParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      return;
    }
    this.program = prog;

    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Fullscreen triangle buffer
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const createTexture = (filter: number): WebGLTexture | null => {
      const tex = gl.createTexture();
      if (!tex) return null;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      return tex;
    };

    this.uTex = createTexture(gl.LINEAR);
    this.uData = createTexture(gl.LINEAR);

    this.uTexLoc = gl.getUniformLocation(prog, 'uTex');
    this.uDataLoc = gl.getUniformLocation(prog, 'uData');
    this.uReachLoc = gl.getUniformLocation(prog, 'uReach');
  }

  public resize = (): void => {
    if (!this.container || !this.canvas) return;

    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(1, Math.round(rect.width || window.innerWidth));
    this.height = Math.max(1, Math.round(rect.height || 64));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    if (this.ribbonCanvas) {
      this.ribbonCanvas.width = this.canvas.width;
      this.ribbonCanvas.height = this.canvas.height;
      this.drawRibbonBase();
    }

    this.simulator.initGrid(this.width, this.height);

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  };

  private drawRibbonBase(): void {
    if (!this.ribbonCtx || !this.ribbonCanvas) return;
    const ctx = this.ribbonCtx;
    ctx.clearRect(0, 0, this.ribbonCanvas.width, this.ribbonCanvas.height);
    // Draw solid vermilion ribbon
    ctx.fillStyle = '#ff4421';
    ctx.fillRect(0, 0, this.ribbonCanvas.width, this.ribbonCanvas.height);
  }

  private bindEvents(): void {
    if (this.container && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.resize);
      this.resizeObserver.observe(this.container);
    }

    window.addEventListener('resize', this.resize, { passive: true });

    if (this.canvas) {
      this.canvas.addEventListener('pointerenter', this.onPointerEnter);
      this.canvas.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.canvas.addEventListener('pointerleave', this.onPointerLeave);
    }
  }

  private onPointerEnter = (e: PointerEvent): void => {
    this.prevPointer = [e.clientX, e.clientY];
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;

    const normX = rx / this.width;
    const normY = 1.0 - ry / this.height;

    if (this.prevPointer) {
      const vX = (e.clientX - this.prevPointer[0]) / this.width;
      const vY = -(e.clientY - this.prevPointer[1]) / this.height;
      this.simulator.injectForce(normX, normY, vX, vY);
    }

    this.prevPointer = [e.clientX, e.clientY];
  };

  private onPointerLeave = (): void => {
    this.prevPointer = null;
  };

  public triggerInteractiveWave(normX: number, normY: number): void {
    this.simulator.injectForce(normX, normY, 0.08, -0.08);
  }

  private startLoop(): void {
    const loop = () => {
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  private render(): void {
    this.simulator.step();

    // Render WebGL
    if (this.gl && this.program && this.uTex && this.uData && this.ribbonCanvas) {
      const gl = this.gl;
      gl.useProgram(this.program);

      // Upload base texture if not already
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.uTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.ribbonCanvas);
      gl.uniform1i(this.uTexLoc, 0);

      // Upload displacement data texture
      const dims = this.simulator.getGridDimensions();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.uData);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        dims.gridX,
        dims.gridY,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.simulator.getDisplacementTexture()
      );
      gl.uniform1i(this.uDataLoc, 1);

      // Uniform reach
      const reachX = 18 / Math.max(1, this.width);
      const reachY = 12 / Math.max(1, this.height);
      gl.uniform2f(this.uReachLoc, reachX, reachY);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else if (this.ctx2d && this.canvas) {
      // 2D Fallback: solid vermilion ribbon
      this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx2d.fillStyle = '#ff4421';
      this.ctx2d.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  public destroy(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    window.removeEventListener('resize', this.resize);

    if (this.canvas) {
      this.canvas.removeEventListener('pointerenter', this.onPointerEnter);
      this.canvas.removeEventListener('pointermove', this.onPointerMove);
      this.canvas.removeEventListener('pointerleave', this.onPointerLeave);

      if (this.createdCanvas && this.canvas.parentElement) {
        this.canvas.parentElement.removeChild(this.canvas);
      }
    }

    if (this.gl) {
      if (this.buffer) this.gl.deleteBuffer(this.buffer);
      if (this.uTex) this.gl.deleteTexture(this.uTex);
      if (this.uData) this.gl.deleteTexture(this.uData);
      if (this.program) this.gl.deleteProgram(this.program);
    }

    this.container = null;
    this.canvas = null;
    this.gl = null;
    this.ctx2d = null;
    this.ribbonCanvas = null;
    this.ribbonCtx = null;
  }
}
