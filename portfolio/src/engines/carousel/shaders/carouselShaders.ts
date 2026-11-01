import * as THREE from 'three';

/**
 * CAROUSEL_VERT_SHADER
 *
 * Vertex shader computing:
 * 1. Exponential cylindrical roll curve peaking at screen center: exp(-screenX * screenX * 6.0)
 * 2. Lateral edge bend: edgeCurve * uWarpIntensity * -0.4
 * 3. Parabolic vertical bow curve: (1.0 - yNorm * yNorm) * rollCurve * uWarpIntensity * 0.15
 * 4. Dynamic Z-roll and Y-scale governed by uWarpIntensity
 */
export const CAROUSEL_VERT_SHADER = /* glsl */ `
uniform float uWarpIntensity;
uniform float uViewportWidth;
uniform float uTileHalfH;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  
  // Normalized screen X position relative to half viewport width [-1.0, 1.0]
  float screenX = clamp(worldPos.x / max(uViewportWidth * 0.5, 0.001), -1.0, 1.0);
  
  // Exponential cylindrical roll curve peaking at center of the viewport
  float rollCurve = exp(-screenX * screenX * 6.0);
  float edgeCurve = screenX * screenX;
  float edgeBend = edgeCurve * uWarpIntensity * -0.4;
  float zRoll = rollCurve * uWarpIntensity * 0.8 + edgeBend;
  float scaleY = 1.0 + rollCurve * uWarpIntensity * 0.15;
  
  // Parabolic bow curve along the vertical axis
  float yNorm = position.y / max(uTileHalfH, 0.001);
  float bowCurve = 1.0 - yNorm * yNorm;
  float bow = bowCurve * rollCurve * uWarpIntensity * 0.15;
  
  vec3 p = position;
  p.y *= scaleY;
  p.x += bow;
  p.z += zRoll;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

/**
 * CAROUSEL_FRAG_SHADER
 *
 * Fragment shader sampling texture with:
 * 1. Aspect cover scaling and offset (uCoverScale, uCoverOffset)
 * 2. Rec.601 luma desaturation: dot(col.rgb, vec3(0.299, 0.587, 0.114))
 * 3. Contrast / brightness modulation (uBright)
 * 4. Alpha transparency (uOpacity)
 */
export const CAROUSEL_FRAG_SHADER = /* glsl */ `
uniform sampler2D uTexture;
uniform vec2 uCoverScale;
uniform vec2 uCoverOffset;
uniform float uGray;
uniform float uBright;
uniform float uOpacity;
varying vec2 vUv;

void main() {
  vec2 uv = (vUv - 0.5) * uCoverScale + 0.5 + uCoverOffset;
  vec4 col = texture2D(uTexture, uv);
  
  // Rec.601 Luma formula for grayscale desaturation
  float luma = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  col.rgb = mix(col.rgb, vec3(luma), clamp(uGray, 0.0, 1.0));
  col.rgb *= uBright;
  col.a *= clamp(uOpacity, 0.0, 1.0);
  
  gl_FragColor = col;
}
`;

export interface CarouselUniforms {
  uTexture: { value: THREE.Texture | null };
  uCoverScale: { value: THREE.Vector2 };
  uCoverOffset: { value: THREE.Vector2 };
  uWarpIntensity: { value: number };
  uViewportWidth: { value: number };
  uTileHalfH: { value: number };
  uGray: { value: number };
  uBright: { value: number };
  uOpacity: { value: number };
  [uniform: string]: THREE.IUniform;
}

/**
 * Creates default uniform mapping for the carousel shader pipeline
 */
export function createCarouselUniforms(texture?: THREE.Texture | null): CarouselUniforms {
  return {
    uTexture: { value: texture ?? null },
    uCoverScale: { value: new THREE.Vector2(1.0, 1.0) },
    uCoverOffset: { value: new THREE.Vector2(0.0, 0.0) },
    uWarpIntensity: { value: 0.0 },
    uViewportWidth: { value: 10.0 },
    uTileHalfH: { value: 2.0 },
    uGray: { value: 0.0 },
    uBright: { value: 1.0 },
    uOpacity: { value: 1.0 },
  };
}

export interface CarouselMaterialOptions {
  texture?: THREE.Texture | null;
  depthWrite?: boolean;
  side?: THREE.Side;
}

/**
 * Instantiates a configured Three.js ShaderMaterial using the cylindrical roll shaders
 */
export function createCarouselMaterial(options: CarouselMaterialOptions = {}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: CAROUSEL_VERT_SHADER,
    fragmentShader: CAROUSEL_FRAG_SHADER,
    uniforms: createCarouselUniforms(options.texture),
    transparent: true,
    depthWrite: options.depthWrite ?? false,
    side: options.side ?? THREE.DoubleSide,
  });
}
