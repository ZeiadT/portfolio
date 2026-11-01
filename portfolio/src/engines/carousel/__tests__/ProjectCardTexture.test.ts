import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { ProjectCardTexture } from '../ProjectCardTexture';
import {
  CAROUSEL_VERT_SHADER,
  CAROUSEL_FRAG_SHADER,
  createCarouselUniforms,
  createCarouselMaterial,
} from '../shaders/carouselShaders';
import { PROJECTS } from '@/data/projects';
import type { Project } from '@/domain/types';

describe('Task 4: Card Texture Generator & Shader Pipeline', () => {
  // Canvas 2D Mock Context
  let mockCtx: Record<string, unknown>;
  const originalGetContext = typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.getContext : undefined;

  beforeEach(() => {
    mockCtx = {
      canvas: null,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      rect: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      drawImage: vi.fn(),
      clip: vi.fn(),
      roundRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      measureText: vi.fn((text: string) => ({
        width: text.length * 10,
        actualBoundingBoxAscent: 12,
        actualBoundingBoxDescent: 4,
      })),
    };

    if (typeof HTMLCanvasElement !== 'undefined') {
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextType: string) {
        if (contextType === '2d') {
          mockCtx.canvas = this;
          return mockCtx as unknown as CanvasRenderingContext2D;
        }
        return null;
      } as unknown as typeof HTMLCanvasElement.prototype.getContext;
    }
  });

  afterEach(() => {
    if (typeof HTMLCanvasElement !== 'undefined' && originalGetContext) {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
    vi.restoreAllMocks();
  });

  describe('Carousel Shaders (carouselShaders.ts)', () => {
    it('defines CAROUSEL_VERT_SHADER with cylindrical roll curve, edge bend, vertical bow curve, and warp intensity', () => {
      expect(CAROUSEL_VERT_SHADER).toBeDefined();
      expect(typeof CAROUSEL_VERT_SHADER).toBe('string');

      // Check required uniforms and varyings
      expect(CAROUSEL_VERT_SHADER).toContain('uWarpIntensity');
      expect(CAROUSEL_VERT_SHADER).toContain('uViewportWidth');
      expect(CAROUSEL_VERT_SHADER).toContain('uTileHalfH');
      expect(CAROUSEL_VERT_SHADER).toContain('varying vec2 vUv');

      // Check exponential cylindrical roll formula: exp(-screenX * screenX * 6.0)
      expect(CAROUSEL_VERT_SHADER).toMatch(/exp\s*\(\s*-[a-zA-Z0-9_]+\s*\*\s*[a-zA-Z0-9_]+\s*\*\s*6\.0\s*\)/);

      // Check edge bend formula
      expect(CAROUSEL_VERT_SHADER).toContain('-0.4');

      // Check vertical bow curve formula (1.0 - yNorm * yNorm)
      expect(CAROUSEL_VERT_SHADER).toMatch(/1\.0\s*-\s*[a-zA-Z0-9_]+\s*\*\s*[a-zA-Z0-9_]+/);
      expect(CAROUSEL_VERT_SHADER).toContain('0.15');

      // Check position transformation output
      expect(CAROUSEL_VERT_SHADER).toContain('gl_Position');
    });

    it('defines CAROUSEL_FRAG_SHADER with texture sampling, cover scaling, Rec.601 luma desaturation, brightness, and opacity', () => {
      expect(CAROUSEL_FRAG_SHADER).toBeDefined();
      expect(typeof CAROUSEL_FRAG_SHADER).toBe('string');

      // Check required uniforms and varyings
      expect(CAROUSEL_FRAG_SHADER).toContain('uTexture');
      expect(CAROUSEL_FRAG_SHADER).toContain('uCoverScale');
      expect(CAROUSEL_FRAG_SHADER).toContain('uCoverOffset');
      expect(CAROUSEL_FRAG_SHADER).toContain('uGray');
      expect(CAROUSEL_FRAG_SHADER).toContain('uBright');
      expect(CAROUSEL_FRAG_SHADER).toContain('uOpacity');
      expect(CAROUSEL_FRAG_SHADER).toContain('varying vec2 vUv');

      // Check Rec.601 luma formula: dot(col.rgb, vec3(0.299, 0.587, 0.114))
      expect(CAROUSEL_FRAG_SHADER).toContain('0.299');
      expect(CAROUSEL_FRAG_SHADER).toContain('0.587');
      expect(CAROUSEL_FRAG_SHADER).toContain('0.114');

      // Check texture sampling and output
      expect(CAROUSEL_FRAG_SHADER).toContain('texture2D');
      expect(CAROUSEL_FRAG_SHADER).toContain('gl_FragColor');
    });

    it('creates standard uniform structures with createCarouselUniforms', () => {
      const uniforms = createCarouselUniforms();
      expect(uniforms.uTexture.value).toBeNull();
      expect(uniforms.uCoverScale.value).toBeInstanceOf(THREE.Vector2);
      expect(uniforms.uCoverOffset.value).toBeInstanceOf(THREE.Vector2);
      expect(uniforms.uWarpIntensity.value).toBe(0);
      expect(uniforms.uViewportWidth.value).toBeGreaterThan(0);
      expect(uniforms.uTileHalfH.value).toBeGreaterThan(0);
      expect(uniforms.uGray.value).toBe(0);
      expect(uniforms.uBright.value).toBe(1);
      expect(uniforms.uOpacity.value).toBe(1);
    });

    it('creates a valid Three.js ShaderMaterial with createCarouselMaterial', () => {
      const material = createCarouselMaterial();
      expect(material).toBeInstanceOf(THREE.ShaderMaterial);
      expect(material.vertexShader).toBe(CAROUSEL_VERT_SHADER);
      expect(material.fragmentShader).toBe(CAROUSEL_FRAG_SHADER);
      expect(material.transparent).toBe(true);
      expect(material.uniforms.uWarpIntensity).toBeDefined();
      expect(material.uniforms.uTexture).toBeDefined();
      expect(material.uniforms.uGray).toBeDefined();
    });

    it('respects custom material options in createCarouselMaterial', () => {
      const dummyTexture = new THREE.Texture();
      const material = createCarouselMaterial({
        texture: dummyTexture,
        depthWrite: true,
        side: THREE.FrontSide,
      });

      expect(material.uniforms.uTexture.value).toBe(dummyTexture);
      expect(material.depthWrite).toBe(true);
      expect(material.side).toBe(THREE.FrontSide);

      material.dispose();
      dummyTexture.dispose();
    });
  });

  describe('ProjectCardTexture (ProjectCardTexture.ts)', () => {
    const sampleProject: Project = PROJECTS[0]; // Dusk

    it('creates a 16:9 canvas with device-pixel-ratio scaling', () => {
      const cardTexture = new ProjectCardTexture(sampleProject, 1280, 720);
      const canvas = cardTexture.getCanvas();

      expect(canvas).toBeDefined();
      expect(canvas.width / canvas.height).toBeCloseTo(16 / 9, 2);

      cardTexture.dispose();
    });

    it('defaults height to 16:9 aspect ratio if omitted', () => {
      const cardTexture = new ProjectCardTexture(sampleProject, 1600);
      const canvas = cardTexture.getCanvas();

      expect(canvas.width).toBe(1600 * (window.devicePixelRatio || 1));
      expect(canvas.height).toBe(900 * (window.devicePixelRatio || 1));
      expect(canvas.width / canvas.height).toBeCloseTo(16 / 9, 2);

      cardTexture.dispose();
    });

    it('renders project title, subtitle, category badge, year, and accent pill', () => {
      const cardTexture = new ProjectCardTexture(sampleProject);

      const fillTextSpy = mockCtx.fillText as unknown as ReturnType<typeof vi.fn>;
      expect(fillTextSpy).toHaveBeenCalled();

      const renderedTexts: string[] = fillTextSpy.mock.calls.map((call: unknown[]) => String(call[0]));

      // Verify title is rendered
      expect(renderedTexts).toContain(sampleProject.title);

      // Verify subtitle is rendered
      expect(renderedTexts).toContain(sampleProject.subtitle);

      // Verify category or uppercase category is rendered
      const hasCategory = renderedTexts.some(
        (t) => t.toUpperCase() === sampleProject.category.toUpperCase()
      );
      expect(hasCategory).toBe(true);

      // Verify year is rendered
      expect(renderedTexts).toContain(sampleProject.year);

      // Verify tags are rendered
      for (const tag of sampleProject.tags) {
        expect(renderedTexts).toContain(tag);
      }

      cardTexture.dispose();
    });

    it('renders cleanly across all 6 portfolio projects without error', () => {
      expect(PROJECTS.length).toBeGreaterThanOrEqual(6);

      for (const project of PROJECTS) {
        const cardTexture = new ProjectCardTexture(project);
        expect(cardTexture.getTexture()).toBeInstanceOf(THREE.CanvasTexture);
        expect(cardTexture.getCanvas()).toBeInstanceOf(HTMLCanvasElement);
        cardTexture.dispose();
      }
    });

    it('initializes CanvasTexture with correct filtering, color space, and update flag', () => {
      const cardTexture = new ProjectCardTexture(sampleProject);
      const texture = cardTexture.getTexture();

      expect(texture).toBeInstanceOf(THREE.CanvasTexture);
      expect(texture.image).toBe(cardTexture.getCanvas());
      expect(texture.generateMipmaps).toBe(true);
      expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
      expect(texture.magFilter).toBe(THREE.LinearFilter);
      expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
      expect(texture.version).toBeGreaterThan(0);

      cardTexture.dispose();
    });

    it('updates texture and increments version on update()', () => {
      const cardTexture = new ProjectCardTexture(sampleProject);
      const texture = cardTexture.getTexture();

      const initialVersion = texture.version;
      cardTexture.update();

      expect(texture.version).toBeGreaterThan(initialVersion);

      cardTexture.dispose();
    });

    it('cleans up canvas and disposes texture on dispose()', () => {
      const cardTexture = new ProjectCardTexture(sampleProject);
      const texture = cardTexture.getTexture();
      const disposeSpy = vi.spyOn(texture, 'dispose');

      cardTexture.dispose();

      expect(disposeSpy).toHaveBeenCalledTimes(1);

      // Subsequent dispose calls are safe
      expect(() => cardTexture.dispose()).not.toThrow();
    });

    it('handles projects without accentColor or description gracefully', () => {
      const minimalProject: Project = {
        id: 'minimal',
        title: 'Minimal Project',
        subtitle: 'Minimal Subtitle',
        category: 'Other',
        year: '2026',
        tags: [],
        description: '',
        links: {},
        media: { thumbnail: '/assets/dummy.png' },
      };

      expect(() => {
        const cardTexture = new ProjectCardTexture(minimalProject);
        cardTexture.update();
        cardTexture.dispose();
      }).not.toThrow();
    });

    it('ignores update() calls after dispose()', () => {
      const cardTexture = new ProjectCardTexture(sampleProject);
      const texture = cardTexture.getTexture();
      cardTexture.dispose();

      const initialVersion = texture.version;
      cardTexture.update();

      expect(texture.version).toBe(initialVersion);
    });

    it('respects explicitly provided width and height', () => {
      const cardTexture = new ProjectCardTexture(sampleProject, 800, 450);
      const canvas = cardTexture.getCanvas();

      const dpr = window.devicePixelRatio || 1;
      expect(canvas.width).toBe(800 * dpr);
      expect(canvas.height).toBe(450 * dpr);

      cardTexture.dispose();
    });
  });
});
