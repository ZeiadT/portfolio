/**
 * Calibrated Spring Lattice Physics Simulator for Elastic Rubber Band
 * Engineered for smooth, tactile deformation with zero visual glitches or tears.
 */

export interface ElasticPhysicsConfig {
  grid: number;
  mouseRadius: number;
  strength: number;
  relaxation: number;
  elasticity: number;
  coupling: number;
  pullX: number;
  pullY: number;
  maxDistortion: number;
  throwVal: number;
  sharp: number;
}

export const DEFAULT_PHYSICS_CONFIG: ElasticPhysicsConfig = {
  grid: 48,
  mouseRadius: 0.16,
  strength: 1.8,
  relaxation: 0.94,
  elasticity: 0.08,
  coupling: 0.22,
  pullX: 18,
  pullY: 12,
  maxDistortion: 24,
  throwVal: 0.4,
  sharp: 2.0,
};

export class BandPhysicsSimulator {
  private cfg: ElasticPhysicsConfig;
  private gridX = 48;
  private gridY = 8;
  private displacements: Float32Array = new Float32Array(0); // [dx, dy, ...]
  private velocities: Float32Array = new Float32Array(0);    // [vx, vy, ...]
  private neighborBuffer: Float32Array = new Float32Array(0);
  private displacementTexture: Uint8Array = new Uint8Array(0); // RGBA bytes

  constructor(config: Partial<ElasticPhysicsConfig> = {}) {
    this.cfg = { ...DEFAULT_PHYSICS_CONFIG, ...config };
  }

  public initGrid(width: number, height: number): void {
    const safeW = Math.max(1, width);
    const safeH = Math.max(1, height);

    this.gridX = Math.max(16, Math.round(this.cfg.grid));
    const aspect = safeW / safeH;
    this.gridY = Math.max(4, Math.round(this.gridX / aspect));

    const totalPoints = this.gridX * this.gridY;
    this.displacements = new Float32Array(totalPoints * 2);
    this.velocities = new Float32Array(totalPoints * 2);
    this.neighborBuffer = new Float32Array(totalPoints * 2);
    this.displacementTexture = new Uint8Array(totalPoints * 4);

    this.reset();
  }

  public getGridDimensions(): { gridX: number; gridY: number } {
    return { gridX: this.gridX, gridY: this.gridY };
  }

  public getDisplacementTexture(): Uint8Array {
    return this.displacementTexture;
  }

  public reset(): void {
    this.displacements.fill(0);
    this.velocities.fill(0);
    this.neighborBuffer.fill(0);

    const total = this.gridX * this.gridY;
    for (let i = 0; i < total; i++) {
      this.displacementTexture[i * 4] = 128;     // 128 = 0 offset
      this.displacementTexture[i * 4 + 1] = 128; // 128 = 0 offset
      this.displacementTexture[i * 4 + 2] = 0;
      this.displacementTexture[i * 4 + 3] = 255;
    }
  }

  public injectForce(normX: number, normY: number, rawVelX: number, rawVelY: number): void {
    if (this.displacements.length === 0) return;

    // Clamp input velocity to prevent physics explosions
    const velX = Math.max(-0.5, Math.min(0.5, rawVelX));
    const velY = Math.max(-0.5, Math.min(0.5, rawVelY));

    const { gridX, gridY } = this;
    const px = gridX * normX;
    const py = gridY * normY;
    const radius = Math.max(gridX, gridY) * this.cfg.mouseRadius;
    const r2 = radius * radius;
    const aspect = gridY / gridX;

    const spanX = Math.ceil(radius * Math.sqrt(aspect)) + 1;
    const spanY = Math.ceil(radius) + 1;

    const minX = Math.max(0, Math.floor(px - spanX));
    const maxX = Math.min(gridX - 1, Math.ceil(px + spanX));
    const minY = Math.max(0, Math.floor(py - spanY));
    const maxY = Math.min(gridY - 1, Math.ceil(py + spanY));

    for (let gy = minY; gy <= maxY; gy++) {
      for (let gx = minX; gx <= maxX; gx++) {
        const dx = px - gx;
        const dy = py - gy;
        const dist2 = (dx * dx) / aspect + dy * dy;

        if (dist2 < r2) {
          const idx = 2 * (gx + gridX * gy);
          const factor = Math.pow(1 - dist2 / r2, this.cfg.sharp);
          const force = 10 * this.cfg.strength * factor;

          this.displacements[idx] += force * velX * (1 - this.cfg.throwVal);
          this.displacements[idx + 1] += force * velY * (1 - this.cfg.throwVal);
          this.velocities[idx] += force * velX * this.cfg.throwVal;
          this.velocities[idx + 1] += force * velY * this.cfg.throwVal;
        }
      }
    }
  }

  public step(): number {
    const { gridX, gridY, displacements: q, velocities: S, neighborBuffer: A, cfg } = this;
    const total = gridX * gridY;
    if (total === 0 || q.length === 0) return 0;

    // 1. Neighbor Spring Coupling (Diffuse force to neighbors)
    if (cfg.coupling > 0.001) {
      for (let gy = 0; gy < gridY; gy++) {
        for (let gx = 0; gx < gridX; gx++) {
          const idx = 2 * (gx + gridX * gy);
          const left = 2 * (Math.max(0, gx - 1) + gridX * gy);
          const right = 2 * (Math.min(gridX - 1, gx + 1) + gridX * gy);
          const top = 2 * (gx + gridX * Math.max(0, gy - 1));
          const bottom = 2 * (gx + gridX * Math.min(gridY - 1, gy + 1));

          A[idx] = q[idx] + cfg.coupling * ((q[left] + q[right] + q[top] + q[bottom]) * 0.25 - q[idx]);
          A[idx + 1] = q[idx + 1] + cfg.coupling * ((q[left + 1] + q[right + 1] + q[top + 1] + q[bottom + 1]) * 0.25 - q[idx + 1]);
        }
      }
      for (let k = 0; k < q.length; k++) {
        q[k] = A[k];
      }
    }

    // 2. Velocity Dampening & Elastic Return
    if (cfg.elasticity > 0.001) {
      for (let i = 0; i < q.length; i++) {
        const vel = (S[i] - cfg.elasticity * q[i]) * cfg.relaxation;
        S[i] = Math.abs(vel) < 1e-4 ? 0 : vel;
        q[i] = Math.abs(q[i] + vel) < 1e-4 ? 0 : q[i] + vel;
      }
    } else {
      for (let i = 0; i < q.length; i++) {
        q[i] = Math.abs(q[i] * cfg.relaxation) < 1e-4 ? 0 : q[i] * cfg.relaxation;
      }
    }

    // 3. Pack into 8-bit Displacement Texture with strict clamping
    let totalKineticEnergy = 0;
    const maxD = cfg.maxDistortion;

    for (let i = 0; i < total; i++) {
      const qx = q[2 * i];
      const qy = q[2 * i + 1];

      totalKineticEnergy += Math.abs(qx) + Math.abs(qy);

      // Clamp between -1.0 and 1.0
      const normX = Math.max(-1.0, Math.min(1.0, qx / maxD));
      const normY = Math.max(-1.0, Math.min(1.0, qy / maxD));

      // Map [-1, 1] to [0, 255] where 128 = 0
      this.displacementTexture[4 * i] = Math.round(127 * normX + 128);
      this.displacementTexture[4 * i + 1] = Math.round(127 * normY + 128);
      this.displacementTexture[4 * i + 2] = 0;
      this.displacementTexture[4 * i + 3] = 255;
    }

    return totalKineticEnergy;
  }
}
