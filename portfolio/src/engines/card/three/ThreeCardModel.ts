import * as THREE from 'three';
import type { CardSummonData, CardSummonTheme } from '@/engines/card/CardSummonEngine';
import { CardTextureGenerator } from './CardTextureGenerator';

export interface ThreeCardModelOptions {
  cardData?: Partial<CardSummonData>;
  theme?: CardSummonTheme;
}

const DEFAULT_CARD_DATA: CardSummonData = {
  name: 'Alex Rivera',
  rarity: 'Mythic Rare',
  stars: 5,
  role: 'Mobile Systems Architect',
  imageSrc: '/profile.jpg',
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

const VEIL_COLOR = new THREE.Color(0x0a0a14);

/**
 * Creates a centered 2D rounded rectangle shape.
 */
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;
  const r = Math.min(radius, w / 2, h / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + h - r);
  shape.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + h);
  shape.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, (3 * Math.PI) / 2, false);

  return shape;
}

/**
 * ThreeCardModel
 *
 * Hardware-accelerated 3D Physical Card Model built with Three.js.
 * Features:
 * - Extruded physical slab geometry with beveled gilded metallic gold edges
 * - High-DPI editorial front face texture
 * - Opulent gilded gold guilloche & celestial crest back face texture
 * - Frosted obsidian reveal veil (tint on the front face material)
 * - Specular sheen highlight progression controls
 * - Full engine lifecycle (mount, resize, destroy) with zero-leak resource disposal
 */
export class ThreeCardModel {
  public static readonly CARD_WIDTH = 3.5;
  public static readonly CARD_HEIGHT = 4.9;
  public static readonly CARD_DEPTH = 0.06;
  public static readonly CARD_RADIUS = 0.24;

  public readonly cardGroup: THREE.Group = new THREE.Group();

  private cardData: CardSummonData;
  private theme: CardSummonTheme;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;

  private frontTexture: THREE.CanvasTexture | null = null;
  private backTexture: THREE.CanvasTexture | null = null;
  private frontMaterial: THREE.MeshStandardMaterial | null = null;
  private frontCanvas: HTMLCanvasElement | null = null;
  private loadedImage: HTMLImageElement | null = null;

  private starsProgress: number = 0;
  private barsProgress: number = 0;
  private veilOpacity: number = 1.0;
  private foilWipeProgress: number = 0.0;
  private sheenProgress: number = 0;
  private isDestroyed: boolean = false;

  private customUniforms = {
    uVeilOpacity: { value: 1.0 },
    uFoilWipeProgress: { value: 0.0 },
  };

  constructor(options: ThreeCardModelOptions = {}) {
    this.cardData = { ...DEFAULT_CARD_DATA, ...options.cardData };
    this.theme = options.theme ?? {};

    // Asynchronously preload portrait photograph
    const imgSrc = this.cardData.imageSrc || '/profile.jpg';
    if (typeof Image !== 'undefined') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!this.isDestroyed) {
          this.loadedImage = img;
          this.redrawFrontTexture();
        }
      };
      img.src = imgSrc;
    }

    this.buildCardAssembly();
  }

  /**
   * Constructs the 3D card as a single extruded slab mesh with materials
   * [gilded gold edge, front face texture (-Z cap), golden back texture (+Z cap)].
   */
  private buildCardAssembly(): void {
    const width = ThreeCardModel.CARD_WIDTH;
    const height = ThreeCardModel.CARD_HEIGHT;
    const depth = ThreeCardModel.CARD_DEPTH;
    const radius = ThreeCardModel.CARD_RADIUS;

    const shape = createRoundedRectShape(width, height, radius);

    // 1. Gilded Gold Extruded Slab
    const slabGeometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 3,
    });
    slabGeometry.center();

    const slabMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5b85c,
      metalness: 0.85,
      roughness: 0.22,
      name: 'gilded-gold',
    });

    // 2. Faces drawn straight onto the slab caps: materials [gold edge, front, back]
    this.frontCanvas = document.createElement('canvas');
    this.frontCanvas.width = CardTextureGenerator.TEXTURE_WIDTH;
    this.frontCanvas.height = CardTextureGenerator.TEXTURE_HEIGHT;

    this.frontTexture = CardTextureGenerator.generateFrontCardTexture(
      this.cardData,
      this.theme,
      {
        imageElement: this.loadedImage,
        starsProgress: 1.0,
        barsProgress: 1.0,
        veilOpacity: 0.0,
        foilWipeProgress: 1.0,
      },
      this.frontCanvas
    );
    this.backTexture = CardTextureGenerator.generateGoldenCardBackTexture(this.theme);
    this.frontMaterial = new THREE.MeshStandardMaterial({
      map: this.frontTexture,
      roughness: 0.88, // Luxury satin/matte print - zero mirror reflection or specular glare!
      metalness: 0.0,
    });

    this.frontMaterial.onBeforeCompile = (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uVeilOpacity = this.customUniforms.uVeilOpacity;
      shader.uniforms.uFoilWipeProgress = this.customUniforms.uFoilWipeProgress;

      shader.fragmentShader = `
        uniform float uVeilOpacity;
        uniform float uFoilWipeProgress;
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #include <map_fragment>
        #ifdef USE_MAP
        if (uVeilOpacity > 0.001) {
          float rad = -0.610865; // -35 degrees in radians
          vec2 wipeDir = vec2(cos(rad), sin(rad));
          vec2 uvCoord = vec2(vMapUv.x, (1.0 - vMapUv.y) * 1.4);
          float p = dot(uvCoord, wipeDir);
          float minP = min(0.0, min(wipeDir.x, min(1.4 * wipeDir.y, wipeDir.x + 1.4 * wipeDir.y)));
          float maxP = max(0.0, max(wipeDir.x, max(1.4 * wipeDir.y, wipeDir.x + 1.4 * wipeDir.y)));

          float band = 0.12;
          float bandOffset = band * 1.6; // Offset sweep outside the corners so gleam is completely off-card at progress 0 and 1
          float startP = minP - bandOffset;
          float endP = maxP + bandOffset;
          float currentP = mix(startP, endP, uFoilWipeProgress);
          float dist = p - currentP;

          // Ahead of wipe line: dark frosted obsidian veil
          if (dist > 0.0) {
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.027, 0.027, 0.043), uVeilOpacity * 0.96);
          }
          // Diagonal foil specular gleam band: only active while the wipe is in motion (uFoilWipeProgress > 0.001 && uFoilWipeProgress < 0.999)
          if (uFoilWipeProgress > 0.001 && uFoilWipeProgress < 0.999 && abs(dist) < band) {
            float factor = 1.0 - abs(dist) / band;
            float gleam = factor * factor;
            vec3 goldGleam = mix(vec3(1.0, 0.84, 0.0), vec3(1.0, 1.0, 1.0), gleam);
            diffuseColor.rgb += goldGleam * gleam * uVeilOpacity * 1.4;
          }
        }
        #endif
        `
      );
    };
    const backMaterial = new THREE.MeshStandardMaterial({
      map: this.backTexture,
      roughness: 0.3,
      metalness: 0.3,
    });

    // ExtrudeGeometry (non-indexed) puts both caps in group 0 and sides in group 1.
    // Split caps by Z and normalize their UVs. The engine rests at rotationY = PI,
    // so the -Z cap is the front (U mirrored to read correctly from behind).
    const pos = slabGeometry.attributes.position;
    const uv = slabGeometry.attributes.uv;
    const sourceGroups = slabGeometry.groups.slice();
    slabGeometry.clearGroups();
    for (const g of sourceGroups) {
      if (g.materialIndex !== 0) {
        slabGeometry.addGroup(g.start, g.count, 0);
        continue;
      }
      for (let t = g.start; t < g.start + g.count; t += 3) {
        const isFront = pos.getZ(t) < 0;
        const materialIndex = isFront ? 1 : 2;
        for (let i = t; i < t + 3; i++) {
          const u = (pos.getX(i) + width / 2) / width;
          uv.setXY(i, isFront ? 1 - u : u, (pos.getY(i) + height / 2) / height);
        }
        const last = slabGeometry.groups[slabGeometry.groups.length - 1];
        if (last && last.materialIndex === materialIndex && last.start + last.count === t) {
          last.count += 3;
        } else {
          slabGeometry.addGroup(t, 3, materialIndex);
        }
      }
    }
    uv.needsUpdate = true;

    const slabMesh = new THREE.Mesh(slabGeometry, [slabMaterial, this.frontMaterial, backMaterial]);
    slabMesh.name = 'card-slab';
    this.cardGroup.add(slabMesh);

    this.setVeilOpacity(this.veilOpacity);
  }

  /**
   * Mounts the WebGL scene and renderer inside the target DOM container.
   */
  public mount(container: HTMLElement): void {
    this.container = container;
    this.isDestroyed = false;

    const width = container.clientWidth > 0 ? container.clientWidth : 600;
    const height = container.clientHeight > 0 ? container.clientHeight : 800;
    const aspect = width / height;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 10.0);

    // Distributed studio lighting setup (soft diffuse front illumination, no direct flashlight hotspot)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Angled key light (top-right high angle)
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 0.9);
    keyLight.position.set(4, 6, 4);
    this.scene.add(keyLight);

    // Soft bounce fill light (bottom-left)
    const bounceLight = new THREE.DirectionalLight(0xeeefff, 0.5);
    bounceLight.position.set(-4, -3, 3);
    this.scene.add(bounceLight);

    // Metallic rim specular light for gilded gold edges
    const rimLight = new THREE.DirectionalLight(0xffd700, 1.6);
    rimLight.position.set(-5, 4, -5);
    this.scene.add(rimLight);

    // Add card hierarchy to scene
    this.scene.add(this.cardGroup);

    // Initialize WebGLRenderer with fallback for headless/non-WebGL environments
    const testCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    const hasWebGL = Boolean(
      testCanvas &&
      (testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'))
    );

    if (hasWebGL) {
      try {
        this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        this.renderer = this.createFallbackRenderer();
      }
    } else {
      this.renderer = this.createFallbackRenderer();
    }

    this.renderer.setSize(width, height, false);
    if (typeof window !== 'undefined' && 'devicePixelRatio' in window) {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    if (this.renderer.domElement && this.container) {
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.inset = '0';
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.pointerEvents = 'none';
      this.container.appendChild(this.renderer.domElement);
    }

    // Start RAF render loop
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      this.renderLoop();
    }
  }

  private createFallbackRenderer(): THREE.WebGLRenderer {
    const canvas = document.createElement('canvas');
    return {
      domElement: canvas,
      setSize: (_w: number, _h: number, _updateStyle?: boolean) => {},
      setPixelRatio: (_ratio: number) => {},
      render: (_scene: THREE.Scene, _camera: THREE.Camera) => {},
      dispose: () => {},
    } as unknown as THREE.WebGLRenderer;
  }

  private renderLoop = (): void => {
    if (this.isDestroyed) return;

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      this.animationFrameId = window.requestAnimationFrame(this.renderLoop);
    }
  };

  /**
   * Resizes camera projection and WebGL renderer dimensions.
   */
  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    if (this.renderer) {
      this.renderer.setSize(width, height, false);
    }
  }

  /**
   * Dynamic rotation controller.
   */
  public setRotation(x: number, y: number, z: number): void {
    this.cardGroup.rotation.set(x, y, z);
  }

  /**
   * Dynamic translation controller.
   */
  public setPosition(x: number, y: number, z: number): void {
    this.cardGroup.position.set(x, y, z);
  }

  /**
   * Uniform scale controller.
   */
  public setScale(s: number): void {
    this.cardGroup.scale.set(s, s, s);
  }

  /**
   * Returns the Three.js card group container.
   */
  public getCardGroup(): THREE.Group {
    return this.cardGroup;
  }

  /**
   * Sets the opacity of the frosted obsidian front veil overlay [0, 1].
   */
  public setVeilOpacity(o: number): void {
    this.veilOpacity = Math.max(0, Math.min(1, o));
    this.customUniforms.uVeilOpacity.value = this.veilOpacity;
    // Veil is a tint on the front face itself, not a separate layer.
    this.frontMaterial?.color.setHex(0xffffff).lerp(VEIL_COLOR, this.veilOpacity * 0.75);
  }

  public getVeilOpacity(): number {
    return this.veilOpacity;
  }

  /**
   * Sets diagonal holographic foil wipe progress [0, 1].
   */
  public setFoilWipeProgress(p: number): void {
    this.foilWipeProgress = Math.max(0, Math.min(1, p));
    this.customUniforms.uFoilWipeProgress.value = this.foilWipeProgress;
  }

  public getFoilWipeProgress(): number {
    return this.foilWipeProgress;
  }

  /**
   * Sets holographic sheen progress [0, 1].
   */
  public setSheenProgress(p: number): void {
    this.sheenProgress = p;
  }

  public getSheenProgress(): number {
    return this.sheenProgress;
  }

  /**
   * Sets animated star illumination progress [0, 1] and progress bar fill progress [0, 1].
   */
  public setStatsAnimationProgress(starsProgress: number, barsProgress: number): void {
    this.starsProgress = Math.max(0, Math.min(1, starsProgress));
    this.barsProgress = Math.max(0, Math.min(1, barsProgress));
  }

  public getStatsAnimationProgress(): { starsProgress: number; barsProgress: number } {
    return {
      starsProgress: this.starsProgress,
      barsProgress: this.barsProgress,
    };
  }

  /**
   * Redraws the front card canvas with current animation states and photo.
   */
  private redrawFrontTexture(): void {
    if (!this.frontCanvas || !this.frontTexture) return;
    CardTextureGenerator.drawFrontCardContent(
      this.frontCanvas,
      this.cardData,
      this.theme,
      {
        imageElement: this.loadedImage,
        starsProgress: 1.0,
        barsProgress: 1.0,
        veilOpacity: 0.0,
        foilWipeProgress: 1.0,
      }
    );
    this.frontTexture.needsUpdate = true;
  }

  /**
   * Cleans up all DOM nodes, geometries, materials, textures, and renderer resources.
   * Completely idempotent.
   */
  public destroy(): void {
    if (this.isDestroyed) {
      return;
    }
    this.isDestroyed = true;

    this.loadedImage = null;
    this.frontCanvas = null;

    if (
      this.animationFrameId !== null &&
      typeof window !== 'undefined' &&
      typeof window.cancelAnimationFrame === 'function'
    ) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }

    // Traverse and dispose geometries and materials
    this.cardGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });

    // Dispose textures
    if (this.frontTexture) {
      this.frontTexture.dispose();
      this.frontTexture = null;
    }
    if (this.backTexture) {
      this.backTexture.dispose();
      this.backTexture = null;
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.cardGroup.clear();
    this.scene = null;
    this.camera = null;
    this.container = null;
    this.frontMaterial = null;
  }
}
