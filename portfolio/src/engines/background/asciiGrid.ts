import { TOPOGRAPHIC_TIERS } from './types';
import type { AsciiCell, AsciiGridConfig } from './types';

export const DEFAULT_GLYPHS = ['0', '1'];

export function createAsciiGridConfig(overrides: Partial<AsciiGridConfig> = {}): AsciiGridConfig {
  return {
    cellWidth: 32,
    cellHeight: 32,
    font: '11px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    glyphs: DEFAULT_GLYPHS,
    spring: 0.12,
    damping: 0.88,
    maxDisplacement: 24, // Calibrated down 20% (from 30 to 24)
    rippleSpeed: 380,
    mouseMoveStrength: 4.8, // Calibrated down 20% (from 6.0 to 4.8)
    mouseClickStrength: 35,
    flowSpeed: 0.22,
    warpStrength: 0.14,
    vortexCenter: [0.18, 0.45],
    ...overrides,
  };
}

/**
 * Evaluates the domain-warped topographic contour heightfield in [0, 1]
 */
export function evaluateTopographicElevation(
  u: number,
  v: number,
  time: number,
  vortexCenter: [number, number] = [0.18, 0.45],
  warpStrength = 0.14
): { elevation: number; tierIndex: number; isRidge: boolean } {
  // 1. Domain warping: coordinate distortion creating fluid marble contours
  const warpU = u + warpStrength * Math.sin(v * 4.2 + time * 0.4);
  const warpV = v + warpStrength * Math.cos(u * 3.8 - time * 0.35);

  // 2. Base harmonic wave components (sweeping diagonal bands)
  const w1 = Math.sin(warpU * 3.4 + warpV * 2.6 + time * 0.5);
  const w2 = Math.cos(warpU * 2.2 - warpV * 4.0 - time * 0.4);

  // 3. Concentric vortex eddy (matching the nested rings on the left of reference image)
  const dx = warpU - vortexCenter[0];
  const dy = warpV - vortexCenter[1];
  const dist = Math.sqrt(dx * dx + dy * dy);
  const vortexRings = Math.sin(dist * 22.0 - time * 0.6) * Math.exp(-dist * 2.2);

  // 4. Secondary undulating ridge (crossing from bottom-left to top-right)
  const ridge = Math.sin((warpU * 0.7 + warpV * 1.2) * 6.0 + time * 0.3) * 0.5;

  // 5. Combine and normalize into [0, 1]
  const raw = (w1 * 0.35 + w2 * 0.25 + vortexRings * 0.30 + ridge * 0.10) * 0.5 + 0.5;
  const elevation = Math.max(0, Math.min(1, raw));

  // 6. Quantize into 5 elevation tiers
  let tierIndex = 0;
  if (elevation >= 0.80) {
    tierIndex = 4;
  } else if (elevation >= 0.60) {
    tierIndex = 3;
  } else if (elevation >= 0.40) {
    tierIndex = 2;
  } else if (elevation >= 0.20) {
    tierIndex = 1;
  } else {
    tierIndex = 0;
  }

  // 7. Isoline Ridge Detection: proximity to tier boundaries (within 0.024)
  const d0 = Math.abs(elevation - 0.20);
  const d1 = Math.abs(elevation - 0.40);
  const d2 = Math.abs(elevation - 0.60);
  const d3 = Math.abs(elevation - 0.80);
  const isRidge = d0 < 0.024 || d1 < 0.024 || d2 < 0.024 || d3 < 0.024;

  return { elevation, tierIndex, isRidge };
}

interface ActiveShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  life: number;
}

/**
 * Pure mathematical simulation grid for reactive ASCII / matrix background.
 * Implements Option 1: Neural Twinkle (organic breathing constellation) with zero location shift.
 */
export class AsciiGrid {
  public cols = 1;
  public rows = 1;
  public cells: AsciiCell[] = [];
  public config: AsciiGridConfig;
  private shockwaves: ActiveShockwave[] = [];
  private time = 0;

  constructor(width: number, height: number, config: AsciiGridConfig = createAsciiGridConfig()) {
    this.config = config;
    this.resize(width, height);
  }

  public resize(width: number, height: number): void {
    const safeWidth = Math.max(1, width || 1);
    const safeHeight = Math.max(1, height || 1);

    this.cols = Math.max(1, Math.floor(safeWidth / this.config.cellWidth));
    this.rows = Math.max(1, Math.floor(safeHeight / this.config.cellHeight));

    this.cells = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const baseX = c * this.config.cellWidth + this.config.cellWidth / 2;
        const baseY = r * this.config.cellHeight + this.config.cellHeight / 2;
        const u = baseX / safeWidth;
        const v = baseY / safeHeight;

        const topo = evaluateTopographicElevation(
          u,
          v,
          0,
          this.config.vortexCenter,
          this.config.warpStrength
        );

        const tier = TOPOGRAPHIC_TIERS[topo.tierIndex];
        const glyphIndex = (r * 13 + c * 7) % tier.glyphs.length;
        const char = tier.glyphs[glyphIndex];

        // Unique asynchronous phase and speed per cell for organic starry breathing
        const twinklePhase = (((r * 19 + c * 31) % 100) / 100) * Math.PI * 2;
        const twinkleSpeed = 0.8 + (((r * 11 + c * 23) % 10) / 10) * 1.1;

        this.cells.push({
          char,
          glyphIndex,
          baseX,
          baseY,
          dispX: 0,
          dispY: 0,
          velX: 0,
          velY: 0,
          opacity: tier.baseOpacity,
          ambientEnergy: 0,
          twinklePhase,
          twinkleSpeed,
          elevation: topo.elevation,
          tierIndex: topo.tierIndex,
          isRidge: topo.isRidge,
        });
      }
    }
  }

  public triggerShockwave(x: number, y: number, strength = 40, customMaxRadius?: number): void {
    const maxDim = Math.max(this.cols * this.config.cellWidth, this.rows * this.config.cellHeight);
    const maxRadius = customMaxRadius ?? (maxDim * 1.2);
    this.shockwaves.push({
      x,
      y,
      radius: 0,
      maxRadius,
      strength,
      life: 1.0,
    });
  }

  public update(dt = 0.016): void {
    const { spring, damping, maxDisplacement, rippleSpeed, flowSpeed, warpStrength, vortexCenter } = this.config;
    this.time += dt * flowSpeed;

    const totalWidth = Math.max(1, this.cols * this.config.cellWidth);
    const totalHeight = Math.max(1, this.rows * this.config.cellHeight);

    // 1. Advance Topographic Elevation Field & Neural Twinkle
    for (const cell of this.cells) {
      const u = cell.baseX / totalWidth;
      const v = cell.baseY / totalHeight;

      const topo = evaluateTopographicElevation(
        u,
        v,
        this.time,
        vortexCenter,
        warpStrength
      );

      cell.elevation = topo.elevation;
      cell.tierIndex = topo.tierIndex;
      cell.isRidge = topo.isRidge;

      const tier = TOPOGRAPHIC_TIERS[topo.tierIndex];

      cell.twinklePhase += cell.twinkleSpeed * dt;
      const sinVal = Math.sin(cell.twinklePhase);

      // Only the top ~18% of the breathing cycle gently illuminates (smooth ease-in/out)
      if (sinVal > 0.65) {
        const raw = (sinVal - 0.65) / 0.35;
        cell.ambientEnergy = raw * raw;

        // Sporadically mutate glyph at the very apex of the breathing twinkle
        if (raw > 0.85 && Math.sin(cell.twinklePhase * 3.7) > 0.82) {
          cell.glyphIndex = (cell.glyphIndex + 1) % tier.glyphs.length;
        }
      } else {
        cell.ambientEnergy = 0;
      }

      // Assign glyph from active elevation tier
      const safeGlyphIdx = cell.glyphIndex % tier.glyphs.length;
      cell.char = tier.glyphs[safeGlyphIdx];

      // Opacity from tier base + ridge highlight bonus + subtle breathing (dimmed 20%)
      const ridgeBonus = cell.isRidge ? 0.128 : 0;
      cell.opacity = Math.min(0.85, tier.baseOpacity + ridgeBonus + cell.ambientEnergy * 0.096);
    }

    // 2. Advance active physical shockwaves (user click, hover, curtain collapse)
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += rippleSpeed * dt;
      sw.life -= dt * 0.8;

      const waveWidth = 80;

      for (const cell of this.cells) {
        const dx = cell.baseX - sw.x;
        const dy = cell.baseY - sw.y;
        const dist = Math.hypot(dx, dy);

        const delta = Math.abs(dist - sw.radius);
        if (delta < waveWidth) {
          const factor = (1 - delta / waveWidth) * sw.life;
          const angle = Math.atan2(dy, dx);
          const force = sw.strength * factor * 0.35;

          cell.velX += Math.cos(angle) * force;
          cell.velY += Math.sin(angle) * force;
        }
      }

      if (sw.life <= 0 || sw.radius > sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 3. Step spring physics and damp velocity for each cell (strictly clamped to maxDisplacement)
    for (const cell of this.cells) {
      const accX = -spring * cell.dispX;
      const accY = -spring * cell.dispY;

      cell.velX = (cell.velX + accX) * damping;
      cell.velY = (cell.velY + accY) * damping;

      cell.dispX += cell.velX;
      cell.dispY += cell.velY;

      // Clamp max displacement
      const mag = Math.hypot(cell.dispX, cell.dispY);
      if (mag > maxDisplacement && mag > 0) {
        const scale = maxDisplacement / mag;
        cell.dispX *= scale;
        cell.dispY *= scale;
      }
    }
  }
}
