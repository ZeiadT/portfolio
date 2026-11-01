import * as THREE from 'three';

/**
 * Vermilion Particle Shockwave Burst (VermilionParticleBurst)
 *
 * Implements a 3D vermilion particle shockwave burst easter egg (`#ff4421`)
 * for the 3D Carousel Engine. It triggers on rapid double-clicking an active
 * project card, emitting particles radially outward in 3D with drag and fading alpha.
 */

export const VERMILION_HEX = 0xff4421;
export const DEFAULT_PARTICLE_COUNT = 48;
export const DEFAULT_DRAG = 0.94;
export const MIN_LIFETIME = 0.6;
export const MAX_LIFETIME = 0.9;

export class VermilionParticleBurst {
  private readonly scene: THREE.Scene;
  private readonly _particleCount: number;
  private readonly _geometry: THREE.BufferGeometry;
  private readonly _material: THREE.PointsMaterial;
  private readonly _points: THREE.Points;
  private readonly _positionAttr: THREE.BufferAttribute;

  private readonly _velocities: Float32Array;
  private readonly _lifetimes: Float32Array;

  private _isActive: boolean = false;
  private _isDestroyed: boolean = false;
  private _elapsed: number = 0;
  private _maxDuration: number = MAX_LIFETIME;

  constructor(scene: THREE.Scene, particleCount: number = DEFAULT_PARTICLE_COUNT) {
    this.scene = scene;
    this._particleCount = Math.max(1, Math.floor(particleCount));

    const positions = new Float32Array(this._particleCount * 3);
    this._velocities = new Float32Array(this._particleCount * 3);
    this._lifetimes = new Float32Array(this._particleCount);

    this._geometry = new THREE.BufferGeometry();
    this._positionAttr = new THREE.BufferAttribute(positions, 3);
    this._geometry.setAttribute('position', this._positionAttr);

    this._material = new THREE.PointsMaterial({
      color: new THREE.Color(VERMILION_HEX),
      size: 0.25,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this._points = new THREE.Points(this._geometry, this._material);
    this._points.visible = false;

    this.scene.add(this._points);
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public get isDestroyed(): boolean {
    return this._isDestroyed;
  }

  public get particleCount(): number {
    return this._particleCount;
  }

  public get points(): THREE.Points {
    return this._points;
  }

  public get geometry(): THREE.BufferGeometry {
    return this._geometry;
  }

  public get material(): THREE.PointsMaterial {
    return this._material;
  }

  /**
   * Spawns burst of vermilion particles expanding radially outward in 3D
   * centered at the specified origin vector.
   */
  public trigger(origin: THREE.Vector3): void {
    if (this._isDestroyed) return;

    this._isActive = true;
    this._elapsed = 0;
    this._points.visible = true;
    this._material.opacity = 1.0;

    let maxDuration = MIN_LIFETIME;

    for (let i = 0; i < this._particleCount; i++) {
      const idx = i * 3;

      // Position initialized at origin
      this._positionAttr.setXYZ(i, origin.x, origin.y, origin.z);

      // Radial distribution outward in 3D (disc in XY with Z dispersion)
      const angle = (i / this._particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 3.0 + Math.random() * 3.5; // 3.0 to 6.5 units/sec
      const zSpeed = (Math.random() - 0.5) * 2.0;

      this._velocities[idx] = Math.cos(angle) * speed;
      this._velocities[idx + 1] = Math.sin(angle) * speed;
      this._velocities[idx + 2] = zSpeed;

      const lifetime = MIN_LIFETIME + Math.random() * (MAX_LIFETIME - MIN_LIFETIME);
      this._lifetimes[i] = lifetime;
      if (lifetime > maxDuration) {
        maxDuration = lifetime;
      }
    }

    this._maxDuration = maxDuration;
    this._positionAttr.needsUpdate = true;
  }

  /**
   * Updates particle positions along velocity vectors, applies drag (0.94),
   * fades material alpha, and deactivates when duration completes.
   */
  public update(deltaTime: number): void {
    if (this._isDestroyed || !this._isActive) return;
    if (deltaTime <= 0 || !Number.isFinite(deltaTime)) return;

    this._elapsed += deltaTime;

    if (this._elapsed >= this._maxDuration) {
      this._isActive = false;
      this._points.visible = false;
      this._material.opacity = 0;
      return;
    }

    // Fade opacity over burst lifetime
    const progress = Math.min(1, Math.max(0, this._elapsed / this._maxDuration));
    this._material.opacity = Math.max(0, 1 - progress);

    // Frame-rate independent drag factor (calibrated for 0.94 per 1/60s)
    const dragFactor = Math.pow(DEFAULT_DRAG, deltaTime * 60);

    const positions = this._positionAttr.array as Float32Array;

    for (let i = 0; i < this._particleCount; i++) {
      const idx = i * 3;

      // Decelerate velocity by drag
      this._velocities[idx] *= dragFactor;
      this._velocities[idx + 1] *= dragFactor;
      this._velocities[idx + 2] *= dragFactor;

      // Integrate position
      positions[idx] += this._velocities[idx] * deltaTime;
      positions[idx + 1] += this._velocities[idx + 1] * deltaTime;
      positions[idx + 2] += this._velocities[idx + 2] * deltaTime;
    }

    this._positionAttr.needsUpdate = true;
  }

  /**
   * Completely disposes Three.js buffers, materials, and removes points from the scene.
   */
  public destroy(): void {
    if (this._isDestroyed) return;

    this._isDestroyed = true;
    this._isActive = false;
    this._points.visible = false;

    if (this._points.parent) {
      this._points.parent.remove(this._points);
    } else {
      this.scene.remove(this._points);
    }

    this._geometry.dispose();
    this._material.dispose();
  }
}
