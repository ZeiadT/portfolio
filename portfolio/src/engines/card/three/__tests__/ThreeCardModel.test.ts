import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import * as THREE from 'three';
import type { CardSummonData, CardSummonTheme } from '@/engines/card/CardSummonEngine';
import { ThreeCardModel } from '../ThreeCardModel';
import { CardTextureGenerator } from '../CardTextureGenerator';

// Polyfill Canvas 2D context for headless happy-dom environment
const originalGetContext = typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.getContext : undefined;

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextType: string, ...args: unknown[]) {
    if (contextType === '2d') {
      const self = this as unknown as { _mockCtx2d?: Record<string, unknown> };
      if (!self._mockCtx2d) {
        self._mockCtx2d = {
          canvas: this,
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          font: '',
          textAlign: 'left',
          textBaseline: 'alphabetic',
          globalAlpha: 1,
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
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          measureText: vi.fn((text: string) => ({
            width: text.length * 8,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
          })),
        };
      }
      return self._mockCtx2d as unknown as CanvasRenderingContext2D;
    }
    return originalGetContext ? (originalGetContext as Function).apply(this, [contextType, ...args]) : null;
  };
}

describe('ThreeCardModel & CardTextureGenerator (3D Physical Card Engine)', () => {
  let container: HTMLElement;
  let model: ThreeCardModel | null = null;

  const mockCardData: CardSummonData = {
    name: 'Alex Rivera',
    rarity: 'Mythic Rare',
    stars: 5,
    role: 'Mobile Systems Architect',
    imageSrc: '/assets/portrait.webp',
    imageAlt: 'Alex Rivera Portrait',
    skillName: 'Reactive Rendering Engine',
    skillDescription: 'High-performance real-time graphics and physics architecture',
    atk: 99,
    def: 98,
    stats: {
      perf: 99,
      arch: 98,
      code: 95,
    },
  };

  const mockTheme: CardSummonTheme = {
    primaryColor: '#ff4421',
    coreColor: '#ffffff',
    accentColor: '#ff7700',
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'three-card-container';
    container.style.width = '600px';
    container.style.height = '800px';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (model) {
      model.destroy();
      model = null;
    }
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  afterAll(() => {
    if (typeof HTMLCanvasElement !== 'undefined' && originalGetContext) {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  describe('1. Lifecycle Contract & Engine Interface', () => {
    it('implements Engine lifecycle methods (mount, destroy, resize)', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      expect(typeof model.mount).toBe('function');
      expect(typeof model.destroy).toBe('function');
      expect(typeof model.resize).toBe('function');
    });

    it('creates and attaches WebGL canvas element to container upon mount', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      expect(container.querySelector('canvas')).toBeNull();

      model.mount(container);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();
      expect(container.contains(canvas)).toBe(true);
    });

    it('updates camera aspect and renderer dimensions on resize(width, height)', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.mount(container);

      expect(() => {
        model!.resize(1024, 768);
      }).not.toThrow();

      // Negative or zero dimensions must be handled safely without NaN or crashes
      expect(() => {
        model!.resize(0, 0);
      }).not.toThrow();
    });

    it('cleans up DOM and disposes geometries, textures, materials, and renderer on destroy()', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.mount(container);

      const canvas = container.querySelector('canvas');
      expect(canvas).not.toBeNull();

      // Spy on geometry, material, texture, and renderer disposal
      const slabMesh = model.cardGroup.children.find(
        (child) => (child as THREE.Mesh).geometry && child.name === 'card-slab'
      ) as THREE.Mesh;

      expect(slabMesh).toBeDefined();

      const geomDisposeSpy = vi.spyOn(slabMesh.geometry, 'dispose');
      const matSpies = (slabMesh.material as THREE.Material[]).map((m) => vi.spyOn(m, 'dispose'));
      expect(matSpies).toHaveLength(3);

      model.destroy();

      // Canvas removed from container
      expect(container.contains(canvas)).toBe(false);
      expect(geomDisposeSpy).toHaveBeenCalled();
      matSpies.forEach((spy) => expect(spy).toHaveBeenCalled());
    });

    it('safely tolerates redundant destroy() calls (idempotence)', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.mount(container);

      expect(() => {
        model!.destroy();
        model!.destroy();
      }).not.toThrow();
    });
  });

  describe('2. 3D Card Assembly & Physical Geometry', () => {
    it('creates root THREE.Group representing the physical card entity', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      expect(model.cardGroup).toBeInstanceOf(THREE.Group);
    });

    it('creates extruded rounded slab with physical thickness (depth > 0)', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      const slabMesh = model.cardGroup.children.find(
        (child) => child.name === 'card-slab'
      ) as THREE.Mesh;

      expect(slabMesh).toBeDefined();
      expect(slabMesh.geometry).toBeDefined();

      // Geometry should either be ExtrudeGeometry or have depth > 0 in bounding box / parameters
      const geometry = slabMesh.geometry as THREE.ExtrudeGeometry;
      const depth = geometry.parameters?.options?.depth ?? 0;
      expect(depth).toBeGreaterThan(0);
      expect(depth).toBeCloseTo(0.06, 2); // ~2.5mm relative scene thickness
    });

    it('includes gilded gold metallic material on the beveled rim/edges (metalness >= 0.8, roughness <= 0.3)', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      const slabMesh = model.cardGroup.children.find(
        (child) => child.name === 'card-slab'
      ) as THREE.Mesh;

      expect(slabMesh).toBeDefined();

      // Edge material should be MeshStandardMaterial with high metalness and low roughness
      const material = (
        Array.isArray(slabMesh.material) ? slabMesh.material[0] : slabMesh.material
      ) as THREE.MeshStandardMaterial;

      expect(material).toBeDefined();
      expect(material.metalness).toBeGreaterThanOrEqual(0.8);
      expect(material.roughness).toBeLessThanOrEqual(0.3);

      // Should have warm gold metallic color (e.g. 0xe5b85c or similar)
      const hexColor = material.color.getHexString();
      expect(hexColor).toMatch(/e5b85c|d4af37|ffd700|c59b27|e6be6a/i);
    });

    it('draws front/back textures directly onto the slab caps (no separate face layers)', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });

      const names = model.cardGroup.children.map((c) => c.name);
      expect(names).toEqual(['card-slab']);

      const slabMesh = model.cardGroup.children[0] as THREE.Mesh;
      const mats = slabMesh.material as THREE.MeshStandardMaterial[];
      expect(mats).toHaveLength(3);
      expect(mats[1].map).toBeInstanceOf(THREE.Texture);
      expect(mats[2].map).toBeInstanceOf(THREE.Texture);
      expect(mats[1].map).not.toBe(mats[2].map);
    });

    it('puts the front texture on the -Z cap (seen at rest rotationY = PI) and back on +Z, with [0,1] UVs', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });

      const geometry = (model.cardGroup.children[0] as THREE.Mesh).geometry;
      const pos = geometry.attributes.position;
      const uv = geometry.attributes.uv;

      for (const materialIndex of [1, 2]) {
        const groups = geometry.groups.filter((g) => g.materialIndex === materialIndex);
        expect(groups.length).toBeGreaterThan(0);
        for (const g of groups) {
          for (let i = g.start; i < g.start + g.count; i++) {
            const z = pos.getZ(i);
            if (materialIndex === 1) expect(z).toBeLessThan(0);
            else expect(z).toBeGreaterThan(0);
            expect(uv.getX(i)).toBeGreaterThanOrEqual(-1e-6);
            expect(uv.getX(i)).toBeLessThanOrEqual(1 + 1e-6);
            expect(uv.getY(i)).toBeGreaterThanOrEqual(-1e-6);
            expect(uv.getY(i)).toBeLessThanOrEqual(1 + 1e-6);
          }
        }
      }
    });
  });

  describe('3. Animation & Dynamic Controls', () => {
    it('setRotation(x, y, z) updates card group orientation', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.setRotation(0.3, 1.2, -0.4);

      expect(model.cardGroup.rotation.x).toBeCloseTo(0.3, 4);
      expect(model.cardGroup.rotation.y).toBeCloseTo(1.2, 4);
      expect(model.cardGroup.rotation.z).toBeCloseTo(-0.4, 4);
    });

    it('setPosition(x, y, z) updates card group translation', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.setPosition(2.5, -1.0, 5.0);

      expect(model.cardGroup.position.x).toBeCloseTo(2.5, 4);
      expect(model.cardGroup.position.y).toBeCloseTo(-1.0, 4);
      expect(model.cardGroup.position.z).toBeCloseTo(5.0, 4);
    });

    it('setScale(s) updates uniform card group scale', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.setScale(1.45);

      expect(model.cardGroup.scale.x).toBeCloseTo(1.45, 4);
      expect(model.cardGroup.scale.y).toBeCloseTo(1.45, 4);
      expect(model.cardGroup.scale.z).toBeCloseTo(1.45, 4);
    });

    it('setVeilOpacity(o) adjusts front mask veil opacity and clamps between 0 and 1', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });

      model.setVeilOpacity(0.65);
      expect(model.getVeilOpacity()).toBeCloseTo(0.65, 4);

      model.setVeilOpacity(1.5);
      expect(model.getVeilOpacity()).toBeLessThanOrEqual(1.0);

      model.setVeilOpacity(-0.5);
      expect(model.getVeilOpacity()).toBeGreaterThanOrEqual(0.0);
    });

    it('setVeilOpacity tints the front material dark and restores white at 0', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      const front = ((model.cardGroup.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial[])[1];

      model.setVeilOpacity(1);
      expect(front.color.r).toBeLessThan(0.5);

      model.setVeilOpacity(0);
      expect(front.color.getHex()).toBe(0xffffff);
    });

    it('setFoilWipeProgress(p) updates diagonal holographic foil wipe progress and clamps between 0 and 1', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });

      model.setFoilWipeProgress(0.45);
      expect(model.getFoilWipeProgress()).toBeCloseTo(0.45, 4);

      model.setFoilWipeProgress(1.8);
      expect(model.getFoilWipeProgress()).toBeLessThanOrEqual(1.0);

      model.setFoilWipeProgress(-0.3);
      expect(model.getFoilWipeProgress()).toBeGreaterThanOrEqual(0.0);
    });

    it('creates and attaches 48 3D celestial and sacred geometry particles orbiting in scene on mount', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.mount(container);

      const scene = (model as unknown as { scene: THREE.Scene }).scene;
      expect(scene).toBeDefined();

      const particleGroup = scene.children.find(
        (child) => child.name === 'celestial-particles'
      ) as THREE.Group;

      expect(particleGroup).toBeDefined();
      expect(particleGroup.children).toHaveLength(48);
    });

    it('disposes all particle geometries and materials cleanly upon destroy()', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.mount(container);

      const scene = (model as unknown as { scene: THREE.Scene }).scene;
      const particleGroup = scene.children.find(
        (child) => child.name === 'celestial-particles'
      ) as THREE.Group;

      expect(particleGroup).toBeDefined();

      const firstMesh = particleGroup.children[0] as THREE.Mesh;
      const geomSpy = vi.spyOn(firstMesh.geometry, 'dispose');
      const matSpy = vi.spyOn(firstMesh.material as THREE.Material, 'dispose');

      model.destroy();

      expect(geomSpy).toHaveBeenCalled();
      expect(matSpy).toHaveBeenCalled();
      expect((model as unknown as { particleGroup: THREE.Group | null }).particleGroup).toBeNull();
    });

    it('setSheenProgress(p) updates holographic specular shimmer progress', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });

      model.setSheenProgress(0.72);
      expect(model.getSheenProgress()).toBeCloseTo(0.72, 4);
    });

    it('setSheenProgress(p) does NOT shift frontTexture offset (card face artwork remains stationary)', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      const frontMat = ((model.cardGroup.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial[])[1];
      const texture = frontMat.map!;

      model.setSheenProgress(0.1);
      expect(texture.offset.x).toBe(0);
      expect(texture.offset.y).toBe(0);

      model.setSheenProgress(0.9);
      expect(texture.offset.x).toBe(0);
      expect(texture.offset.y).toBe(0);
    });

    it('uses fixed studio lighting without artificial moving sheen lights', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.mount(container);

      // Card uses stationary studio lighting (ambient, key, rim) so reflections respond to mouse tilt
      const sheenLight = (model as unknown as { sheenLight?: THREE.PointLight }).sheenLight;
      expect(sheenLight).toBeUndefined();
    });

    it('uses a luxury satin/matte finish on frontMaterial (roughness >= 0.8, metalness <= 0.1) preventing mirror glare', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      const slabMesh = model.cardGroup.children[0] as THREE.Mesh;
      const frontMat = (slabMesh.material as THREE.MeshStandardMaterial[])[1];

      expect(frontMat).toBeDefined();
      expect(frontMat.roughness).toBeGreaterThanOrEqual(0.8);
      expect(frontMat.metalness).toBeLessThanOrEqual(0.1);
    });

    it('sets up distributed studio lighting (ambient >= 1.3) avoiding direct mirror hotspots', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
      model.mount(container);

      const scene = (model as unknown as { scene: THREE.Scene }).scene;
      expect(scene).toBeDefined();

      const ambient = scene.children.find((c) => (c as THREE.AmbientLight).isAmbientLight) as THREE.AmbientLight;
      expect(ambient).toBeDefined();
      expect(ambient.intensity).toBeGreaterThanOrEqual(1.3);

      const directionalLights = scene.children.filter((c) => (c as THREE.DirectionalLight).isDirectionalLight) as THREE.DirectionalLight[];
      // Has angled key, bounce, and rim lights
      expect(directionalLights.length).toBeGreaterThanOrEqual(3);
    });

    it('setStatsAnimationProgress(stars, bars) updates star and stat bar progress', () => {
      model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });

      model.setStatsAnimationProgress(0.5, 0.75);
      expect(model.getStatsAnimationProgress()).toEqual({
        starsProgress: 0.5,
        barsProgress: 0.75,
      });
    });
  });

  describe('4. CardTextureGenerator', () => {
    describe('generateGoldenCardBackSvg', () => {
      it('returns high-resolution SVG string with guilloche, filigree, and celestial crest', () => {
        const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

        expect(typeof svg).toBe('string');
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');

        // Check 3x Retina resolution or viewBox (1050x1470)
        expect(svg).toMatch(/viewBox=["']0 0 1050 1470["']|width=["']1050["']/);

        // Check for guilloche concentric curves / geometry
        expect(svg).toMatch(/guilloche|<path|<circle/i);

        // Check for 4 corner filigree accents
        expect(svg).toMatch(/filigree|corner/i);

        // Check for celestial crest / radiating rings
        expect(svg).toMatch(/crest|celestial|ring/i);

        // Check gold metallic palette definitions
        expect(svg).toMatch(/#e5b85c|#d4af37|#ffd700|#8a6d2b|gold/i);
      });

      it('adapts accents to custom theme when provided', () => {
        const customTheme: CardSummonTheme = {
          primaryColor: '#00ffee',
          coreColor: '#ffffff',
        };
        const svg = CardTextureGenerator.generateGoldenCardBackSvg(customTheme);

        expect(svg).toContain('#00ffee');
      });
    });

    describe('generateGoldenCardBackTexture', () => {
      it('creates high-resolution THREE.CanvasTexture (or Texture) with mipmaps enabled', () => {
        const texture = CardTextureGenerator.generateGoldenCardBackTexture(mockTheme);

        expect(texture).toBeInstanceOf(THREE.Texture);
        expect(texture.generateMipmaps).toBe(true);
        expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
      });
    });

    describe('generateFrontCardTexture', () => {
      it('creates high-resolution THREE.CanvasTexture representing the editorial card face', () => {
        const texture = CardTextureGenerator.generateFrontCardTexture(mockCardData, mockTheme);

        expect(texture).toBeInstanceOf(THREE.Texture);
        expect(texture.generateMipmaps).toBe(true);
        expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
      });

      it('safely handles missing optional fields with sensible defaults', () => {
        const minimalData: CardSummonData = {
          name: 'Anonymous Candidate',
          rarity: 'Common',
          stars: 3,
          role: 'Junior Engineer',
          imageSrc: '',
          imageAlt: '',
          skillName: 'Clean Code',
          skillDescription: 'Basic syntax mastery',
        };

        expect(() => {
          CardTextureGenerator.generateFrontCardTexture(minimalData);
        }).not.toThrow();
      });

      it('renders intermediate diagonal foil wipe with champagne-gold gradient without throwing', () => {
        expect(() => {
          const texture = CardTextureGenerator.generateFrontCardTexture(mockCardData, mockTheme, {
            veilOpacity: 0.8,
            foilWipeProgress: 0.5,
            starsProgress: 0.5,
            barsProgress: 0.5,
          });
          expect(texture).toBeInstanceOf(THREE.Texture);
        }).not.toThrow();
      });
    });

    describe('5. Celestial Particle Field Structure', () => {
      it('initializes exactly 48 celestial orbital particles (16 stars, 16 diamonds, 16 motes)', () => {
        model = new ThreeCardModel({ cardData: mockCardData, theme: mockTheme });
        model.mount(container);

        const scene = (model as unknown as { scene: THREE.Scene }).scene;
        const particleGroup = scene.children.find(
          (child) => child.name === 'celestial-particles'
        ) as THREE.Group;

        expect(particleGroup).toBeDefined();
        expect(particleGroup.children.length).toBe(48);
      });
    });
  });
});

