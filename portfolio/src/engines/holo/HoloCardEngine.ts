export interface HoloCardEngineOptions {
  imageSrc: string;
  alt?: string;
  edgeSensitivity?: number; // default 12.0
  holoIntensity?: number; // default 0.2 (light hint 10%)
  maxTiltDeg?: number; // default 12.0
  targetEl?: HTMLElement; // Element to apply 3D tilt CSS to
}

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5));
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec2 u_pointer; // Normalized [-1.0, 1.0]
uniform float u_edgeSensitivity; // default 12.0
uniform float u_holoIntensity;   // default 0.2
uniform vec2 u_uvScale;
uniform vec2 u_uvOffset;
uniform vec2 u_resolution;

void main() {
  vec2 texUV = v_uv * u_uvScale + u_uvOffset;
  vec4 base = texture(u_image, texUV);
  if (base.a < 0.01) {
    fragColor = vec4(0.0);
    return;
  }

  // 1. Anti-aliased blurred luminance and continuous spatial gradients
  // 4-point cross-sampling offset to eliminate 2x2 rasterizer derivative blockiness
  vec2 delta = vec2(1.5) / max(u_resolution, vec2(1.0));
  
  float lumaL = dot(texture(u_image, texUV - vec2(delta.x, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
  float lumaR = dot(texture(u_image, texUV + vec2(delta.x, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
  float lumaB = dot(texture(u_image, texUV - vec2(0.0, delta.y)).rgb, vec3(0.299, 0.587, 0.114));
  float lumaT = dot(texture(u_image, texUV + vec2(0.0, delta.y)).rgb, vec3(0.299, 0.587, 0.114));
  float luma = (lumaL + lumaR + lumaB + lumaT) * 0.25;

  // Continuous central differences (Sobel-style gradients) - zero raster quad pixelation
  float dx = (lumaR - lumaL) * 0.5;
  float dy = (lumaT - lumaB) * 0.5;

  // 2. Smooth anti-aliased contour trace mask
  float rawEdge = length(vec2(dx, dy)) * u_edgeSensitivity;
  float edge = smoothstep(0.02, 0.35, rawEdge);
  float highPass = smoothstep(0.65, 0.95, luma);
  float traceMask = max(edge, highPass * 0.45);

  // 3. Calm, smooth micro-etching & 3D normals (operates on screen v_uv coordinates)
  // Low frequency (60.0 instead of 320.0) and gentle amplitude (0.04 instead of 0.15)
  float etch = sin(v_uv.x * 60.0 + cos(v_uv.y * 60.0) * 3.0) * 0.04;
  vec3 normal = normalize(vec3(-dx * 12.0 + etch, -dy * 12.0 + etch, 1.0));

  // 4. Dynamic lighting & spectral iridescence
  vec3 lightDir = normalize(vec3(u_pointer.x, u_pointer.y, 0.65));
  float spec = smoothstep(0.1, 0.9, max(dot(normal, lightDir), 0.0));

  // Cosine spectral palette
  float t = dot(normal.xy, u_pointer) * 1.5 + (v_uv.x + v_uv.y) * 0.8 + luma;
  vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));

  // 5. Soft color-dodge & tone-blended compositing
  // Calibrated to 10% opacity with smooth power curves to avoid pixelated pinpoints
  vec3 holoReflection = rainbow * pow(spec, 2.0) * traceMask * u_holoIntensity;
  vec3 goldGlint = vec3(1.0, 0.95, 0.8) * pow(spec, 4.0) * edge * (u_holoIntensity * 0.3);

  // Blend harmoniously with image tones: preserves deep shadows & rich contrast
  vec3 blendWeight = 0.5 + 0.5 * base.rgb;
  vec3 finalColor = base.rgb + holoReflection * blendWeight + goldGlint * blendWeight;
  fragColor = vec4(finalColor, base.a);
}
`;

// Standard WebGL numeric constants fallback for test environments or incomplete mocks
const GL_CONST = {
  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  ARRAY_BUFFER: 0x8892,
  STATIC_DRAW: 0x88e4,
  FLOAT: 0x1406,
  TEXTURE_2D: 0x0de1,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,
  CLAMP_TO_EDGE: 0x812f,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_MAG_FILTER: 0x2800,
  LINEAR: 0x2601,
  RGBA: 0x1908,
  UNSIGNED_BYTE: 0x1401,
  TRIANGLE_STRIP: 0x0005,
  LINEAR_MIPMAP_LINEAR: 0x2703,
};

export class HoloCardEngine {
  private options: HoloCardEngineOptions;
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vs: WebGLShader | null = null;
  private fs: WebGLShader | null = null;
  private buffer: WebGLBuffer | null = null;
  private texture: WebGLTexture | null = null;
  private imgElement: HTMLImageElement | null = null;

  private uPointerLoc: WebGLUniformLocation | null = null;
  private uEdgeSensitivityLoc: WebGLUniformLocation | null = null;
  private uHoloIntensityLoc: WebGLUniformLocation | null = null;
  private uImageLoc: WebGLUniformLocation | null = null;
  private uUvScaleLoc: WebGLUniformLocation | null = null;
  private uUvOffsetLoc: WebGLUniformLocation | null = null;
  private uResolutionLoc: WebGLUniformLocation | null = null;

  private supported: boolean = false;
  private destroyed: boolean = false;
  private rafId: number | null = null;

  private targetX: number = 0;
  private targetY: number = 0;
  private currX: number = 0;
  private currY: number = 0;

  private readonly edgeSensitivity: number;
  private readonly holoIntensity: number;
  private readonly maxTiltDeg: number;
  private readonly targetEl: HTMLElement | null;

  constructor(options: HoloCardEngineOptions) {
    this.options = options;
    this.edgeSensitivity = options.edgeSensitivity ?? 12.0;
    this.holoIntensity = options.holoIntensity ?? 0.2;
    this.maxTiltDeg = options.maxTiltDeg ?? 12.0;
    this.targetEl = options.targetEl ?? null;
  }

  public isSupported(): boolean {
    return this.supported;
  }

  public mount(container: HTMLElement): void {
    if (this.destroyed) return;
    if (this.canvas) return;
    this.container = container;

    // Create and configure WebGL canvas
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('data-holo-canvas', 'true');
    this.canvas.className = 'absolute inset-0 w-full h-full pointer-events-none z-10';
    container.appendChild(this.canvas);

    // Attempt WebGL2 context acquisition
    try {
      this.gl = this.canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    } catch {
      this.gl = null;
    }

    if (this.gl) {
      try {
        this.initWebGL();
        this.supported = true;
      } catch (err) {
        console.warn('HoloCardEngine: WebGL2 initialization failed', err);
        this.supported = false;
        if (this.canvas) {
          this.canvas.remove();
          this.canvas = null;
        }
      }
    } else {
      this.supported = false;
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
      }
    }

    // Attach interaction and window resize events
    const interactionEl = this.targetEl || this.container;
    interactionEl.addEventListener('mousemove', this.handleMouseMove);
    interactionEl.addEventListener('mouseleave', this.handleMouseLeave);
    interactionEl.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    interactionEl.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    window.addEventListener('resize', this.resize);

    // Initial sizing
    this.resize();

    // Start physics and render animation loop (will render initial frame and suspend if at rest)
    this.startLoop();
  }

  private initWebGL(): void {
    const gl = this.gl;
    if (!gl) return;

    // Compile shaders
    this.vs = this.compileShader(gl.VERTEX_SHADER ?? GL_CONST.VERTEX_SHADER, VERTEX_SHADER);
    this.fs = this.compileShader(gl.FRAGMENT_SHADER ?? GL_CONST.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!this.vs || !this.fs) {
      throw new Error('Failed to compile holographic shaders');
    }

    // Link program
    const program = gl.createProgram();
    if (!program) {
      throw new Error('Failed to create WebGL program');
    }
    gl.attachShader(program, this.vs);
    gl.attachShader(program, this.fs);
    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS ?? GL_CONST.LINK_STATUS);
    if (!linked) {
      const log = typeof gl.getProgramInfoLog === 'function' ? gl.getProgramInfoLog(program) : '';
      gl.deleteProgram(program);
      throw new Error(`Shader program link error: ${log}`);
    }

    this.program = program;
    gl.useProgram(program);

    // Setup geometry (full-screen quad)
    const quadVertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ]);

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER ?? GL_CONST.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER ?? GL_CONST.ARRAY_BUFFER,
      quadVertices,
      gl.STATIC_DRAW ?? GL_CONST.STATIC_DRAW
    );

    const aPositionLoc = gl.getAttribLocation(program, 'a_position');
    if (aPositionLoc >= 0) {
      gl.enableVertexAttribArray(aPositionLoc);
      gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT ?? GL_CONST.FLOAT, false, 0, 0);
    }

    // Setup uniform locations
    this.uPointerLoc = gl.getUniformLocation(program, 'u_pointer');
    this.uEdgeSensitivityLoc = gl.getUniformLocation(program, 'u_edgeSensitivity');
    this.uHoloIntensityLoc = gl.getUniformLocation(program, 'u_holoIntensity');
    this.uImageLoc = gl.getUniformLocation(program, 'u_image');
    this.uUvScaleLoc = gl.getUniformLocation(program, 'u_uvScale');
    this.uUvOffsetLoc = gl.getUniformLocation(program, 'u_uvOffset');
    this.uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');

    if (this.uImageLoc) gl.uniform1i(this.uImageLoc, 0);
    if (this.uEdgeSensitivityLoc) gl.uniform1f(this.uEdgeSensitivityLoc, this.edgeSensitivity);
    if (this.uHoloIntensityLoc) gl.uniform1f(this.uHoloIntensityLoc, this.holoIntensity);
    if (this.uPointerLoc) gl.uniform2f(this.uPointerLoc, 0.0, 0.0);
    if (this.uUvScaleLoc) gl.uniform2f(this.uUvScaleLoc, 1.0, 1.0);
    if (this.uUvOffsetLoc) gl.uniform2f(this.uUvOffsetLoc, 0.0, 0.0);
    if (this.uResolutionLoc) {
      gl.uniform2f(
        this.uResolutionLoc,
        this.canvas?.width || 300,
        this.canvas?.height || 400
      );
    }

    // Setup base texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D, gl.TEXTURE_WRAP_S ?? GL_CONST.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE ?? GL_CONST.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D, gl.TEXTURE_WRAP_T ?? GL_CONST.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE ?? GL_CONST.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D, gl.TEXTURE_MIN_FILTER ?? GL_CONST.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR ?? GL_CONST.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D, gl.TEXTURE_MAG_FILTER ?? GL_CONST.TEXTURE_MAG_FILTER, gl.LINEAR ?? GL_CONST.LINEAR);

    // Initial 1x1 placeholder texture
    gl.texImage2D(
      gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D,
      0,
      gl.RGBA ?? GL_CONST.RGBA,
      1,
      1,
      0,
      gl.RGBA ?? GL_CONST.RGBA,
      gl.UNSIGNED_BYTE ?? GL_CONST.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );

    // Asynchronously load image
    const image = new Image();
    this.imgElement = image;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (this.destroyed || !this.gl || !this.texture) return;
      this.gl.bindTexture(this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D, this.texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D,
        0,
        this.gl.RGBA ?? GL_CONST.RGBA,
        this.gl.RGBA ?? GL_CONST.RGBA,
        this.gl.UNSIGNED_BYTE ?? GL_CONST.UNSIGNED_BYTE,
        image
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER ?? GL_CONST.TEXTURE_MIN_FILTER,
        this.gl.LINEAR_MIPMAP_LINEAR ?? GL_CONST.LINEAR_MIPMAP_LINEAR
      );
      if (typeof this.gl.generateMipmap === 'function') {
        this.gl.generateMipmap(this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D);
      }
      this.updateUvTransform();
      this.render();
    };
    image.src = this.options.imageSrc;
    if (image.complete && image.naturalWidth > 0 && this.gl && this.texture) {
      this.gl.bindTexture(this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D, this.texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D,
        0,
        this.gl.RGBA ?? GL_CONST.RGBA,
        this.gl.RGBA ?? GL_CONST.RGBA,
        this.gl.UNSIGNED_BYTE ?? GL_CONST.UNSIGNED_BYTE,
        image
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER ?? GL_CONST.TEXTURE_MIN_FILTER,
        this.gl.LINEAR_MIPMAP_LINEAR ?? GL_CONST.LINEAR_MIPMAP_LINEAR
      );
      if (typeof this.gl.generateMipmap === 'function') {
        this.gl.generateMipmap(this.gl.TEXTURE_2D ?? GL_CONST.TEXTURE_2D);
      }
      this.updateUvTransform();
    }
  }

  private updateUvTransform(): void {
    if (!this.gl || !this.program || !this.uUvScaleLoc || !this.uUvOffsetLoc) return;

    const imgAspect = (this.imgElement?.naturalWidth || 1) / (this.imgElement?.naturalHeight || 1);
    const canvasAspect =
      (this.canvas?.clientWidth || this.canvas?.width || 1) /
      (this.canvas?.clientHeight || this.canvas?.height || 1);

    let scaleX = 1.0;
    let scaleY = 1.0;
    let offsetX = 0.0;
    let offsetY = 0.0;

    if (canvasAspect < imgAspect) {
      // Canvas is narrower than image: cover full height, center-crop width
      scaleX = canvasAspect / imgAspect;
      offsetX = (1.0 - scaleX) * 0.5;
    } else if (canvasAspect > imgAspect) {
      // Canvas is wider than image: cover full width, align top
      scaleY = imgAspect / canvasAspect;
      offsetY = 0.0;
    }

    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.uUvScaleLoc, scaleX, scaleY);
    this.gl.uniform2f(this.uUvOffsetLoc, offsetX, offsetY);
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    if (!gl) return null;
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const compiled = gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS ?? GL_CONST.COMPILE_STATUS
    );
    if (!compiled) {
      const log = typeof gl.getShaderInfoLog === 'function' ? gl.getShaderInfoLog(shader) : '';
      gl.deleteShader(shader);
      throw new Error(`Shader compilation error: ${log}`);
    }

    return shader;
  }

  public resize = (): void => {
    if (!this.canvas || !this.container) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = this.container.getBoundingClientRect();
    const width = Math.round(rect.width || this.container.clientWidth || 300);
    const height = Math.round(rect.height || this.container.clientHeight || 420);

    const displayWidth = Math.round(width * dpr);
    const displayHeight = Math.round(height * dpr);

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      if (this.uResolutionLoc) {
        this.gl.uniform2f(this.uResolutionLoc, this.canvas.width, this.canvas.height);
      }
      this.updateUvTransform();
      this.render();
    }
  };

  private startLoop(): void {
    if (this.destroyed || this.rafId !== null) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const target = this.targetEl || this.container;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
    this.targetX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / width) * 2 - 1));
    this.targetY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / height) * 2 - 1));
    this.startLoop();
  };

  private handleMouseLeave = (): void => {
    this.targetX = 0;
    this.targetY = 0;
    this.startLoop();
  };

  private handleTouchMove = (e: TouchEvent): void => {
    const target = this.targetEl || this.container;
    if (!target) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = target.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
    this.targetX = Math.max(-1, Math.min(1, ((touch.clientX - rect.left) / width) * 2 - 1));
    this.targetY = Math.max(-1, Math.min(1, ((touch.clientY - rect.top) / height) * 2 - 1));
    this.startLoop();
  };

  private handleTouchEnd = (): void => {
    this.targetX = 0;
    this.targetY = 0;
    this.startLoop();
  };

  private render(): void {
    if (!this.gl || !this.program) return;
    if (this.uPointerLoc) {
      this.gl.uniform2f(this.uPointerLoc, this.currX, this.currY);
    }
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP ?? GL_CONST.TRIANGLE_STRIP, 0, 4);
  }

  private tick = (): void => {
    if (this.destroyed) return;

    // Check if resting at neutral position
    if (
      this.targetX === 0 &&
      this.targetY === 0 &&
      Math.abs(this.currX) < 0.0005 &&
      Math.abs(this.currY) < 0.0005
    ) {
      this.currX = 0;
      this.currY = 0;
      if (this.targetEl) {
        this.targetEl.style.transform = '';
      }
      this.render();
      this.rafId = null;
      return;
    }

    // Damped physics interpolation (lerp factor 0.1)
    this.currX += (this.targetX - this.currX) * 0.1;
    this.currY += (this.targetY - this.currY) * 0.1;

    // Apply CSS 3D tilt if targetEl is provided
    if (this.targetEl) {
      const tiltX = this.currY * -this.maxTiltDeg;
      const tiltY = this.currX * this.maxTiltDeg;
      this.targetEl.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(3)}deg) rotateY(${tiltY.toFixed(3)}deg) scale3d(1.03, 1.03, 1.03)`;
    }

    // WebGL rendering pass
    this.render();

    this.rafId = requestAnimationFrame(this.tick);
  };

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    // Cancel animation loop
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Remove event listeners
    const interactionEl = this.targetEl || this.container;
    if (interactionEl) {
      interactionEl.removeEventListener('mousemove', this.handleMouseMove);
      interactionEl.removeEventListener('mouseleave', this.handleMouseLeave);
      interactionEl.removeEventListener('touchmove', this.handleTouchMove);
      interactionEl.removeEventListener('touchend', this.handleTouchEnd);
    }
    window.removeEventListener('resize', this.resize);

    // Reset targetEl transform
    if (this.targetEl) {
      this.targetEl.style.transform = '';
    }

    // Clean up WebGL resources
    if (this.gl) {
      if (this.vs) {
        this.gl.deleteShader(this.vs);
        this.vs = null;
      }
      if (this.fs) {
        this.gl.deleteShader(this.fs);
        this.fs = null;
      }
      if (this.buffer) {
        this.gl.deleteBuffer(this.buffer);
        this.buffer = null;
      }
      if (this.texture) {
        this.gl.deleteTexture(this.texture);
        this.texture = null;
      }
      if (this.program) {
        this.gl.deleteProgram(this.program);
        this.program = null;
      }

      // Extension context release
      try {
        const loseContextExt = this.gl.getExtension('WEBGL_lose_context') as { loseContext?: () => void } | null;
        if (loseContextExt && typeof loseContextExt.loseContext === 'function') {
          loseContextExt.loseContext();
        }
      } catch {
        // Ignore extension lookup failure
      }
      this.gl = null;
    }

    // Remove canvas from DOM
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }

    this.imgElement = null;
    this.container = null;
  }
}
