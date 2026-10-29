# Design Specification: WebGL2 Pokémon Secret Rare Holo Card Engine

## 1. Overview
Refactor the portfolio portrait card component (`ProfileAvatarComponent`) to integrate an authentic "Secret Rare / Legendary Pokémon Card" etched holographic effect.

Instead of a flat rainbow overlay across the entire image, the holographic foil programmatically traces the artwork's contours, line art, edges, and specular highlights using screen-space luminance derivatives inside a WebGL2 fragment shader.

## 2. Architectural Boundaries & Component Isolation
Following project rules (`AGENTS.md`):
- Engine layer: `src/engines/holo/HoloCardEngine.ts` implements the standalone lifecycle:
  - `mount(container: HTMLElement): void`
  - `resize(): void`
  - `destroy(): void`
- Component consumer: `src/components/home/ProfileAvatar.ts` instantiates and mounts `HoloCardEngine`.
- Fallback resilience:
  - Standard `<img>` element is retained in the DOM.
  - If WebGL2 is unsupported (e.g. headless Vitest JSDOM environment, older mobile browser, or texture CORS block), `HoloCardEngine` gracefully fails initialization, leaving the clean fallback `<img>` active.
  - When WebGL2 initializes successfully and the image texture uploads, the WebGL `<canvas>` is displayed smoothly above or in place of the base `<img>`.

## 3. Shader Pipeline (GLSL ES 3.00)

### 3.1 Vertex Shader
```glsl
#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  // Map normalized quad [-1, 1] to UV [0, 1]
  // Invert Y so HTML image texture renders upright
  v_uv = vec2(a_position.x * 0.5 + 0.5, 1.0 - (a_position.y * 0.5 + 0.5));
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

### 3.2 Fragment Shader
```glsl
#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_image;
uniform vec2 u_pointer; // Normalized [-1.0, 1.0]
uniform float u_edgeSensitivity; // default 12.0
uniform float u_holoIntensity;   // default 2.0

void main() {
  vec4 base = texture(u_image, v_uv);
  if (base.a < 0.01) {
    fragColor = vec4(0.0);
    return;
  }

  // 1. Perceptual Luminance
  float luma = dot(base.rgb, vec3(0.299, 0.587, 0.114));

  // 2. Hardware Screen-Space Derivatives
  float dx = dFdx(luma);
  float dy = dFdy(luma);

  // 3. Contour Trace Mask
  float edge = clamp(length(vec2(dx, dy)) * u_edgeSensitivity, 0.0, 1.0);
  float highPass = smoothstep(0.6, 0.92, luma);
  float traceMask = max(edge, highPass * 0.45);

  // 4. Procedural Micro-Etching & 3D Surface Normals
  float etch = sin(v_uv.x * 320.0 + cos(v_uv.y * 320.0) * 5.0) * 0.15;
  vec3 normal = normalize(vec3(-dx * 15.0 + etch, -dy * 15.0 + etch, 1.0));

  // 5. Dynamic Lighting & Spectral Iridescence
  vec3 lightDir = normalize(vec3(u_pointer.x, u_pointer.y, 0.65));
  float spec = max(dot(normal, lightDir), 0.0);

  // Cosine spectral palette
  float t = dot(normal.xy, u_pointer) * 1.5 + (v_uv.x + v_uv.y) * 0.8 + luma;
  vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));

  // 6. Color-Dodge / Additive Compositing
  vec3 holoReflection = rainbow * pow(spec, 2.5) * traceMask * u_holoIntensity;
  vec3 goldGlint = vec3(1.0, 0.95, 0.8) * pow(spec, 8.0) * edge * 0.6;

  vec3 finalColor = base.rgb + holoReflection + goldGlint;
  fragColor = vec4(finalColor, base.a);
}
```

## 4. Interactive Physics & Tilt
- Pointer tracking tracks bounding box `getBoundingClientRect()` on `mousemove` and `touchmove`.
- Raw target `(targetX, targetY)` normalized from `-1.0` (top-left) to `1.0` (bottom-right).
- In a continuous `requestAnimationFrame` loop, damping is applied via linear interpolation:
  `currX += (targetX - currX) * 0.1;`
  `currY += (targetY - currY) * 0.1;`
- CSS 3D perspective tilt is applied to the card container:
  `transform = perspective(900px) rotateX(${currY * -12}deg) rotateY(${currX * 12}deg) scale3d(1.03, 1.03, 1.03);`
- On `mouseleave` / `touchend`, target is reset to `(0, 0)`, smoothly returning the tilt and reflection back to neutral.

## 5. Lifecycle & Disposal
On `destroy()`:
- Cancel `requestAnimationFrame`.
- Remove window `resize` listener and element pointer/touch listeners.
- Delete WebGL texture, vertex buffer, shaders, and shader program.
- Call WebGL lose-context extension (`gl.getExtension('WEBGL_lose_context')?.loseContext()`) if available.
- Remove canvas from DOM.
