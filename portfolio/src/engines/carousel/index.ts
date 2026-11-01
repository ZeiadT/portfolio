import * as THREE from 'three';
import gsap from 'gsap';
import type { Engine, Project } from '@/domain/types';
import { CarouselKinematics } from './CarouselKinematics';
import { AudioClickSynth } from './AudioClickSynth';
import { VermilionParticleBurst } from './VermilionParticleBurst';
import { ProjectCardTexture } from './ProjectCardTexture';
import { createCarouselMaterial } from './shaders/carouselShaders';
import { CarouselGestureController } from './CarouselGestureController';

export { CarouselKinematics } from './CarouselKinematics';
export { AudioClickSynth, type AudioClickSynthOptions } from './AudioClickSynth';
export { VermilionParticleBurst, VERMILION_HEX } from './VermilionParticleBurst';
export { ProjectCardTexture } from './ProjectCardTexture';
export {
  CAROUSEL_VERT_SHADER,
  CAROUSEL_FRAG_SHADER,
  createCarouselMaterial,
  createCarouselUniforms,
  type CarouselUniforms,
  type CarouselMaterialOptions,
} from './shaders/carouselShaders';
export {
  CarouselGestureController,
  type CarouselGestureControllerOptions,
} from './CarouselGestureController';

/**
 * Representation of an individual 3D carousel project card tile on the track
 */
export interface CarouselTile {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  material: THREE.ShaderMaterial;
  texture: THREE.CanvasTexture;
  cardTexture: ProjectCardTexture;
  project: Project;
  index: number;
  rep: number;
}

/**
 * Options configuring the CarouselGLEngine
 */
export interface CarouselGLEngineOptions {
  onProjectSelect?: (project: Project, index: number) => void;
  onIndexChange?: (index: number) => void;
  audioEnabled?: boolean;
}

/**
 * Artemii 3D WebGL Carousel Engine (CarouselGLEngine)
 *
 * Implements a high-performance curved 3D WebGL project carousel engine:
 * - Curved cylindrical perspective track with Three.js (0.160+)
 * - 3-replica track geometry with 16:9 project cards
 * - Spring-damped inertial kinematics (0.92 damping)
 * - Zero-asset synthesized mechanical audio ticks (AudioClickSynth)
 * - Vermilion (#ff4421) kinetic particle shockwave burst easter egg (VermilionParticleBurst)
 * - High-DPI canvas texture generation with Swiss typography (ProjectCardTexture)
 * - Cylindrical roll vertex shader and Rec.601 luma desaturation fragment shader
 * - Unified pointer drag, inertia, mouse wheel, and keyboard snapping with GSAP power3.out
 * - Raycast click selection invoking onProjectSelect
 * - Resilient to headless test environments (fallback renderer)
 * - 100% self-contained lifecycle disposal (no memory leaks)
 */
export class CarouselGLEngine implements Engine {
  public readonly id = 'carousel-gl';

  // Physical & Camera Dimensions
  public static readonly CAM_FOV = 50;
  public static readonly CAM_Z = 8.0;
  public static readonly TILE_HEIGHT = 2.25;
  public static readonly TILE_WIDTH = 2.25 * (16 / 9); // 4.0
  public static readonly TILE_GAP = 0.1;
  public static readonly TILE_UNIT = CarouselGLEngine.TILE_WIDTH + CarouselGLEngine.TILE_GAP; // 4.1
  public static readonly SPRING_DAMPING = 0.92;
  public static readonly DRAG_SENSITIVITY = 0.012;
  public static readonly SNAP_EASE = 'power3.out';

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private track: THREE.Group | null = null;
  private tiles: CarouselTile[] = [];
  private projects: Project[] = [];
  private options: CarouselGLEngineOptions;

  private gestureController: CarouselGestureController | null = null;
  private audioSynth: AudioClickSynth | null = null;
  private particleBurst: VermilionParticleBurst | null = null;

  private selectedIndex = 0;
  private scrollX = 0;
  private targetScrollX = 0;
  private lastScrollX = 0;
  private scrollVel = 0;
  private warpIntensity = 0;
  private viewportWidth = 10.0;
  private animId: number | null = null;
  private lastFrameTime = 0;
  private isDestroyed = false;
  private snapTween: gsap.core.Tween | null = null;

  constructor(projects: Project[], options?: CarouselGLEngineOptions) {
    this.projects = projects;
    this.options = options ?? {};
  }

  /**
   * Mounts the engine into the specified DOM container.
   */
  public mount(container: HTMLElement): void {
    if (this.isDestroyed) return;
    this.container = container;

    const width = container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const height = container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 800);
    const aspect = width / Math.max(height, 1);

    // 1. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(CarouselGLEngine.CAM_FOV, aspect, 0.1, 120);
    this.camera.position.set(0, 0, CarouselGLEngine.CAM_Z);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateMatrixWorld(true);

    this.updateViewportWidth(width, height);

    // 2. Hardware-accelerated WebGL Renderer with graceful headless fallback
    this.initRenderer(width, height);

    // 3. Track Group and 3-replica cylindrical tile meshes
    this.initTrack();

    // 4. Sub-systems: Synthesizer, Particles, Gestures
    this.audioSynth = new AudioClickSynth({ enabled: this.options.audioEnabled ?? true });
    this.particleBurst = new VermilionParticleBurst(this.scene);

    this.gestureController = new CarouselGestureController({
      container: this.container,
      totalProjects: this.projects.length,
      onScrollDelta: this.handleScrollDelta,
      onIndexChange: (newIndex, snap) => {
        this.setSelectedIndex(newIndex, !snap);
      },
      onCardDoubleClick: (_index) => {
        this.triggerShockwave();
      },
      onHoverTilt: (tiltX, tiltY) => {
        if (this.track) {
          this.track.rotation.y = THREE.MathUtils.degToRad(tiltX * 0.3);
          this.track.rotation.x = THREE.MathUtils.degToRad(-tiltY * 0.3);
        }
      },
      getCurrentIndex: () => this.selectedIndex,
    });

    // 5. Event Listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.resize);
    }
    this.container.addEventListener('click', this.handleClick);

    // 6. Start RAF Render Loop
    this.lastFrameTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.animate();
  }

  private initRenderer(width: number, height: number): void {
    if (!this.container) return;

    const testCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    const hasWebGL = Boolean(
      testCanvas && (testCanvas.getContext('webgl2') || testCanvas.getContext('webgl'))
    );

    if (hasWebGL) {
      try {
        this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch {
        this.renderer = this.createFallbackRenderer(width, height);
      }
    } else {
      this.renderer = this.createFallbackRenderer(width, height);
    }

    this.renderer.setSize(width, height);
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    this.renderer.setPixelRatio(dpr);

    if (this.renderer.domElement && this.container) {
      this.renderer.domElement.style.display = 'block';
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.container.appendChild(this.renderer.domElement);
    }
  }

  private createFallbackRenderer(width: number, height: number): THREE.WebGLRenderer {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return {
      domElement: canvas,
      setSize: (_w: number, _h: number) => {},
      setPixelRatio: (_ratio: number) => {},
      render: (_scene: THREE.Scene, _camera: THREE.Camera) => {},
      dispose: () => {},
    } as unknown as THREE.WebGLRenderer;
  }

  private initTrack(): void {
    if (!this.scene) return;

    this.track = new THREE.Group();
    this.scene.add(this.track);

    this.selectedIndex = 0;
    this.scrollX = CarouselKinematics.scrollForIndex(0, this.projects.length, CarouselGLEngine.TILE_UNIT);
    this.targetScrollX = this.scrollX;
    this.lastScrollX = this.scrollX;
    this.track.position.x = this.scrollX;

    const count = this.projects.length;
    this.tiles = [];

    // 3 replicas (-1, 0, 1) for infinite curved track feel
    for (let rep = -1; rep <= 1; rep++) {
      this.projects.forEach((project, index) => {
        const cardTexture = new ProjectCardTexture(project);
        const texture = cardTexture.getTexture();
        const material = createCarouselMaterial({ texture });

        material.uniforms.uViewportWidth.value = this.viewportWidth;
        material.uniforms.uTileHalfH.value = CarouselGLEngine.TILE_HEIGHT / 2;
        material.uniforms.uGray.value = rep === 0 && index === 0 ? 0.0 : 1.0;

        const geometry = new THREE.PlaneGeometry(
          CarouselGLEngine.TILE_WIDTH,
          CarouselGLEngine.TILE_HEIGHT,
          16,
          16
        );
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = (rep * count + index - (count - 1) / 2) * CarouselGLEngine.TILE_UNIT;
        mesh.position.y = 0;
        mesh.position.z = 0;
        mesh.userData = { logicalIndex: index, rep };

        this.track!.add(mesh);
        this.tiles.push({
          mesh,
          material,
          texture,
          cardTexture,
          project,
          index,
          rep,
        });
      });
    }

    this.track.updateMatrixWorld(true);
  }

  private handleScrollDelta = (delta: number): void => {
    if (this.isDestroyed || !this.track) return;

    if (this.snapTween) {
      this.snapTween.kill();
      this.snapTween = null;
    }

    this.targetScrollX = CarouselKinematics.clampScroll(
      this.targetScrollX + delta * CarouselGLEngine.DRAG_SENSITIVITY,
      this.projects.length,
      CarouselGLEngine.TILE_UNIT
    );
    this.scrollX = this.targetScrollX;
    this.track.position.x = this.scrollX;

    const liveIndex = CarouselKinematics.indexFromScroll(
      this.scrollX,
      this.projects.length,
      CarouselGLEngine.TILE_UNIT
    );

    if (liveIndex !== this.selectedIndex) {
      this.selectedIndex = liveIndex;
      this.gestureController?.setCurrentIndex(liveIndex);
      this.audioSynth?.triggerIndexCrossing(liveIndex);
      this.options.onIndexChange?.(liveIndex);
    }
  };

  private handleClick = (event: MouseEvent): void => {
    if (!this.container || !this.camera || !this.scene || this.tiles.length === 0) return;
    if (this.gestureController?.isDragging) return;

    const rect = this.container.getBoundingClientRect();
    const width = rect.width || this.container.clientWidth || 1;
    const height = rect.height || this.container.clientHeight || 1;
    const clientX = event.clientX - (rect.left || 0);
    const clientY = event.clientY - (rect.top || 0);

    const mouse = new THREE.Vector2(
      (clientX / width) * 2 - 1,
      -(clientY / height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    if (this.track) {
      this.track.updateMatrixWorld(true);
    }

    const meshes = this.tiles.map((t) => t.mesh);
    const hits = raycaster.intersectObjects(meshes);

    if (hits.length > 0) {
      const hitMesh = hits[0].object as THREE.Mesh;
      const logicalIndex = hitMesh.userData?.logicalIndex;
      if (typeof logicalIndex === 'number' && logicalIndex >= 0 && logicalIndex < this.projects.length) {
        this.setSelectedIndex(logicalIndex, false);
        this.options.onProjectSelect?.(this.projects[logicalIndex], logicalIndex);
      }
    }
  };

  private animate = (): void => {
    if (this.isDestroyed) return;
    this.animId = requestAnimationFrame(this.animate);

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const dt = Math.min(0.1, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    this.renderFrame(dt > 0 ? dt : 0.016);
  };

  /**
   * Evaluates an individual simulation and animation frame.
   */
  public renderFrame(deltaTime: number = 0.016): void {
    if (this.isDestroyed || !this.track) return;

    const isDragging = this.gestureController?.isDragging ?? false;

    if (!isDragging) {
      // Smooth interpolation to target scroll coordinate
      this.scrollX += (this.targetScrollX - this.scrollX) * 0.15;
    }

    this.scrollX = CarouselKinematics.clampScroll(
      this.scrollX,
      this.projects.length,
      CarouselGLEngine.TILE_UNIT
    );
    this.track.position.x = this.scrollX;

    // Kinematic velocity and warp deformation
    const delta = this.scrollX - this.lastScrollX;
    this.lastScrollX = this.scrollX;
    this.scrollVel = CarouselKinematics.applyInertialDamping(
      this.scrollVel + (delta - this.scrollVel) * 0.16,
      CarouselGLEngine.SPRING_DAMPING
    );
    this.warpIntensity = CarouselKinematics.calculateWarp(
      this.scrollVel,
      this.warpIntensity,
      isDragging
    );

    // Update tile uniforms and desaturation focus
    this.updateTileFocus(false);

    // If settled on a new index while drifting
    if (!isDragging) {
      const settledIndex = CarouselKinematics.indexFromScroll(
        this.scrollX,
        this.projects.length,
        CarouselGLEngine.TILE_UNIT
      );
      if (settledIndex !== this.selectedIndex) {
        this.selectedIndex = settledIndex;
        this.gestureController?.setCurrentIndex(settledIndex);
        this.audioSynth?.triggerIndexCrossing(settledIndex);
        this.options.onIndexChange?.(settledIndex);
      }
    }

    // Update particle burst
    this.particleBurst?.update(deltaTime);

    // Render WebGL
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updateTileFocus(immediate: boolean): void {
    this.tiles.forEach((tile) => {
      const worldX = tile.mesh.position.x + this.scrollX;
      tile.material.uniforms.uWarpIntensity.value = this.warpIntensity;

      // Receding cards desaturate proportional to distance from center (rep === 0 at worldX === 0)
      const distFromCenter = tile.rep === 0 ? Math.abs(worldX) / CarouselGLEngine.TILE_UNIT : 1.0;
      const targetGray = Math.min(1.0, Math.max(0.0, distFromCenter));

      if (immediate) {
        tile.material.uniforms.uGray.value = targetGray;
      } else {
        const curGray = tile.material.uniforms.uGray.value;
        tile.material.uniforms.uGray.value += (targetGray - curGray) * 0.15;
      }
    });
  }

  private updateViewportWidth(width: number, height: number): void {
    const safeHeight = Math.max(1, height);
    const aspect = width / safeHeight;
    const vHeight = 2 * Math.tan((CarouselGLEngine.CAM_FOV * Math.PI) / 360) * CarouselGLEngine.CAM_Z;
    this.viewportWidth = vHeight * aspect;
  }

  /**
   * Resizes camera projection, viewport width uniform, and renderer dimensions.
   */
  public resize = (): void => {
    if (this.isDestroyed || !this.container || !this.renderer || !this.camera) return;

    const width = this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const height = this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 800);

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);

    this.updateViewportWidth(width, height);

    this.tiles.forEach((tile) => {
      tile.material.uniforms.uViewportWidth.value = this.viewportWidth;
    });
  };

  /**
   * Navigates to a specific project index.
   *
   * @param index Target index to select
   * @param immediate If true, snaps instantaneously without animation
   */
  public setSelectedIndex(index: number, immediate: boolean = false): void {
    if (this.projects.length === 0) return;
    const clamped = Math.max(0, Math.min(this.projects.length - 1, Math.floor(index)));
    const previousIndex = this.selectedIndex;
    this.selectedIndex = clamped;
    this.targetScrollX = CarouselKinematics.scrollForIndex(
      clamped,
      this.projects.length,
      CarouselGLEngine.TILE_UNIT
    );

    if (this.gestureController) {
      this.gestureController.setCurrentIndex(clamped);
    }

    if (clamped !== previousIndex && this.audioSynth) {
      this.audioSynth.triggerIndexCrossing(clamped);
    }

    if (this.options.onIndexChange && clamped !== previousIndex) {
      this.options.onIndexChange(clamped);
    }

    if (immediate) {
      if (this.snapTween) {
        this.snapTween.kill();
        this.snapTween = null;
      }
      this.scrollX = this.targetScrollX;
      this.lastScrollX = this.scrollX;
      if (this.track) {
        this.track.position.x = this.scrollX;
      }
      this.updateTileFocus(true);
    } else {
      if (this.snapTween) {
        this.snapTween.kill();
      }
      this.snapTween = gsap.to(this, {
        scrollX: this.targetScrollX,
        duration: 0.8,
        ease: CarouselGLEngine.SNAP_EASE,
        onUpdate: () => {
          if (this.track) {
            this.track.position.x = this.scrollX;
          }
        },
        onComplete: () => {
          this.snapTween = null;
        },
      });
    }
  }

  /**
   * Advances carousel to the next project.
   */
  public next(): void {
    this.setSelectedIndex(this.selectedIndex + 1, false);
  }

  /**
   * Rewinds carousel to the previous project.
   */
  public prev(): void {
    this.setSelectedIndex(this.selectedIndex - 1, false);
  }

  /**
   * Triggers the vermilion shockwave particle burst easter egg centered at
   * the active project card's 3D position.
   */
  public triggerShockwave(origin?: THREE.Vector3): void {
    if (this.isDestroyed || !this.particleBurst) return;

    if (origin) {
      this.particleBurst.trigger(origin);
      return;
    }

    const centerTile = this.getCenterTile();
    const pos = new THREE.Vector3();
    if (centerTile) {
      centerTile.mesh.getWorldPosition(pos);
    }
    this.particleBurst.trigger(pos);
  }

  public getCenterTile(): CarouselTile | null {
    return this.tiles.find((t) => t.rep === 0 && t.index === this.selectedIndex) ?? this.tiles[0] ?? null;
  }

  public getSelectedIndex(): number {
    return this.selectedIndex;
  }

  public getProjects(): Project[] {
    return this.projects;
  }

  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  public getScene(): THREE.Scene | null {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  public getTrack(): THREE.Group | null {
    return this.track;
  }

  public getTiles(): CarouselTile[] {
    return this.tiles;
  }

  public getGestureController(): CarouselGestureController | null {
    return this.gestureController;
  }

  public getAudioSynth(): AudioClickSynth | null {
    return this.audioSynth;
  }

  public getParticleBurst(): VermilionParticleBurst | null {
    return this.particleBurst;
  }

  public getViewportWidth(): number {
    return this.viewportWidth;
  }

  public setOnProjectSelect(callback: (project: Project, index: number) => void): void {
    this.options.onProjectSelect = callback;
  }

  public setOnIndexChange(callback: (index: number) => void): void {
    this.options.onIndexChange = callback;
  }

  /**
   * Cleanly disposes all WebGL buffers, materials, textures, event listeners,
   * audio contexts, and cancels animation frame loops.
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }

    if (this.snapTween) {
      this.snapTween.kill();
      this.snapTween = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resize);
    }

    if (this.container) {
      this.container.removeEventListener('click', this.handleClick);
    }

    if (this.gestureController) {
      this.gestureController.destroy();
      this.gestureController = null;
    }

    if (this.audioSynth) {
      this.audioSynth.destroy();
      this.audioSynth = null;
    }

    if (this.particleBurst) {
      this.particleBurst.destroy();
      this.particleBurst = null;
    }

    this.tiles.forEach((tile) => {
      tile.mesh.geometry.dispose();
      tile.material.dispose();
      tile.cardTexture.dispose();
    });
    this.tiles = [];

    if (this.scene && this.track) {
      this.scene.remove(this.track);
    }
    this.track = null;

    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.container = null;
  }
}
