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
 * Normalizes vertex UV coordinates of a ShapeGeometry to [0, 1] range.
 */
function normalizeShapeUVs(geometry: THREE.BufferGeometry, width: number, height: number): void {
  const uvAttr = geometry.attributes.uv;
  if (!uvAttr) return;
  for (let i = 0; i < uvAttr.count; i++) {
    const u = uvAttr.getX(i);
    const v = uvAttr.getY(i);
    uvAttr.setXY(i, (u + width / 2) / width, (v + height / 2) / height);
  }
  uvAttr.needsUpdate = true;
}

/**
 * ThreeCardModel
 *
 * Hardware-accelerated 3D Physical Card Model built with Three.js.
 * Features:
 * - Extruded physical slab geometry with beveled gilded metallic gold edges
 * - High-DPI editorial front face texture
 * - Opulent gilded gold guilloche & celestial crest back face texture
 * - Frosted obsidian reveal veil with dynamic opacity transitions
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
  private veilMesh: THREE.Mesh | null = null;

  private veilOpacity: number = 1.0;
  private sheenProgress: number = 0;
  private isDestroyed: boolean = false;

  constructor(options: ThreeCardModelOptions = {}) {
    this.cardData = { ...DEFAULT_CARD_DATA, ...options.cardData };
    this.theme = options.theme ?? {};

    this.buildCardAssembly();
  }

  /**
   * Constructs the 3D card assembly within cardGroup:
   * 1. card-slab: Extruded rounded slab with beveled gilded gold edges
   * 2. card-front: Front face mesh displaying high-DPI canvas texture (+Z exterior)
   * 3. card-back: Back face mesh displaying golden guilloche texture (-Z exterior, rotated 180° on Y)
   * 4. card-veil: Frosted obsidian overlay mesh (+Z exterior)
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

    const slabMesh = new THREE.Mesh(slabGeometry, slabMaterial);
    slabMesh.name = 'card-slab';
    this.cardGroup.add(slabMesh);

    // 2. Front Face
    this.frontTexture = CardTextureGenerator.generateFrontCardTexture(this.cardData, this.theme);
    const frontGeometry = new THREE.ShapeGeometry(shape);
    normalizeShapeUVs(frontGeometry, width, height);

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: this.frontTexture,
      roughness: 0.35,
      metalness: 0.1,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const frontMesh = new THREE.Mesh(frontGeometry, frontMaterial);
    frontMesh.name = 'card-front';
    frontMesh.position.z = 0.0425;
    this.cardGroup.add(frontMesh);

    // 3. Back Face (rotated 180° on Y)
    this.backTexture = CardTextureGenerator.generateGoldenCardBackTexture(this.theme);
    const backGeometry = new THREE.ShapeGeometry(shape);
    normalizeShapeUVs(backGeometry, width, height);

    const backMaterial = new THREE.MeshStandardMaterial({
      map: this.backTexture,
      roughness: 0.3,
      metalness: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const backMesh = new THREE.Mesh(backGeometry, backMaterial);
    backMesh.name = 'card-back';
    backMesh.position.z = -0.0425;
    backMesh.rotation.y = Math.PI;
    this.cardGroup.add(backMesh);

    // 4. Veil Overlay
    const veilGeometry = new THREE.ShapeGeometry(shape);
    normalizeShapeUVs(veilGeometry, width, height);

    const veilMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0a14,
      transparent: true,
      opacity: this.veilOpacity * 0.75,
      depthWrite: false,
    });

    this.veilMesh = new THREE.Mesh(veilGeometry, veilMaterial);
    this.veilMesh.name = 'card-veil';
    this.veilMesh.position.z = 0.0435;
    this.veilMesh.visible = this.veilOpacity > 0.001;
    this.cardGroup.add(this.veilMesh);
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
    this.camera.position.set(0, 0, 7);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
    keyLight.position.set(5, 5, 5);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd700, 1.5);
    rimLight.position.set(-5, 3, -5);
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
    if (this.veilMesh && this.veilMesh.material) {
      const mat = this.veilMesh.material as THREE.MeshBasicMaterial;
      mat.opacity = this.veilOpacity * 0.75;
      this.veilMesh.visible = this.veilOpacity > 0.001;
    }
  }

  public getVeilOpacity(): number {
    return this.veilOpacity;
  }

  /**
   * Sets holographic sheen progress [0, 1] to animate specular shimmer offset.
   */
  public setSheenProgress(p: number): void {
    this.sheenProgress = p;
    if (this.frontTexture) {
      this.frontTexture.offset.x = (p - 0.5) * 0.1;
    }
  }

  public getSheenProgress(): number {
    return this.sheenProgress;
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
    this.veilMesh = null;
  }
}
