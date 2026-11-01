import type { Project } from '@/domain/types';

export interface ScreenPosition {
  x: number;
  y: number;
}

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

export type ItemCountOrProjects = number | readonly Project[];

/**
 * Normalizes input count from either an integer or an array of Projects.
 */
function resolveCount(countOrProjects: ItemCountOrProjects): number {
  if (typeof countOrProjects === 'number') {
    return Math.max(0, Math.floor(countOrProjects));
  }
  return Array.isArray(countOrProjects) ? countOrProjects.length : 0;
}

/**
 * Pure Kinematics and 3D Projection Mathematics for Carousel Engine
 *
 * Implements deterministic coordinate transformations, non-linear warp deformation,
 * inertial velocity decay with 0.92 spring damping, and camera perspective projection.
 */
export class CarouselKinematics {
  public static readonly DEFAULT_DAMPING = 0.92;
  public static readonly VELOCITY_EPSILON = 0.0001;

  /**
   * Calculates the 1D scroll coordinate for a specific item index.
   * Coordinate system centers items symmetrically around x = 0.
   *
   * Equation: (-index + (count - 1) / 2) * unit
   */
  public static scrollForIndex(
    index: number,
    countOrProjects: ItemCountOrProjects,
    unit: number
  ): number {
    const count = resolveCount(countOrProjects);
    if (count <= 0) return 0;
    return (-index + (count - 1) / 2) * unit;
  }

  /**
   * Derives the nearest discrete project index from current scrollX offset,
   * clamped strictly within [0, count - 1].
   *
   * Equation: Math.max(0, Math.min(count - 1, Math.round(-scrollX / unit + (count - 1) / 2)))
   */
  public static indexFromScroll(
    scrollX: number,
    countOrProjects: ItemCountOrProjects,
    unit: number
  ): number {
    const count = resolveCount(countOrProjects);
    if (count <= 0 || unit === 0) return 0;
    const raw = Math.round(-scrollX / unit + (count - 1) / 2);
    return Math.max(0, Math.min(count - 1, raw));
  }

  /**
   * Confines scroll offset strictly between the minimum and maximum item bounds.
   */
  public static clampScroll(
    scrollX: number,
    countOrProjects: ItemCountOrProjects,
    unit: number
  ): number {
    const count = resolveCount(countOrProjects);
    if (count <= 0) return 0;
    const min = CarouselKinematics.scrollForIndex(count - 1, count, unit);
    const max = CarouselKinematics.scrollForIndex(0, count, unit);
    const minBound = Math.min(min, max);
    const maxBound = Math.max(min, max);
    return Math.max(minBound, Math.min(maxBound, scrollX));
  }

  /**
   * Computes non-linear cylinder mesh deformation (warp) from pointer/drag velocity.
   * Bounded within [-1.5, 1.5] saturation and decays towards 0 during rest.
   */
  public static calculateWarp(
    velocity: number,
    currentWarp: number,
    isDragging: boolean
  ): number {
    const ai = Math.max(-1.5, Math.min(1.5, velocity * 12));
    const target =
      Math.abs(ai) > 0.001 ? Math.sign(ai) * Math.pow(Math.abs(ai), 1.85) * 0.46 : 0;
    const lerp = isDragging ? 0.11 : 0.07;
    return currentWarp + (target - currentWarp) * lerp;
  }

  /**
   * Applies inertial velocity damping with clean zero cutoff.
   * Snaps directly to 0 if $|v| < 0.0001$ to prevent endless floating point drift.
   */
  public static applyInertialDamping(
    velocity: number,
    dampingFactor: number = CarouselKinematics.DEFAULT_DAMPING
  ): number {
    if (Math.abs(velocity) < CarouselKinematics.VELOCITY_EPSILON) {
      return 0;
    }
    const decayed = velocity * dampingFactor;
    if (Math.abs(decayed) < CarouselKinematics.VELOCITY_EPSILON) {
      return 0;
    }
    return decayed;
  }

  /**
   * Projects a 3D world coordinate to 2D screen coordinates based on
   * camera vertical FOV, camera Z position, and viewport dimensions.
   */
  public static project3DToScreen(
    worldPos: WorldPosition,
    cameraFov: number,
    cameraZ: number,
    viewportWidth: number,
    viewportHeight: number
  ): ScreenPosition {
    const dist = cameraZ - worldPos.z;
    if (dist <= 0) {
      return { x: viewportWidth / 2, y: viewportHeight / 2 };
    }

    const safeHeight = viewportHeight || 1;
    const aspect = viewportWidth / safeHeight;
    const fovRad = (cameraFov * Math.PI) / 180;
    const halfHeightAtZ = dist * Math.tan(fovRad / 2);
    const halfWidthAtZ = halfHeightAtZ * aspect;

    const ndcX = halfWidthAtZ === 0 ? 0 : worldPos.x / halfWidthAtZ;
    const ndcY = halfHeightAtZ === 0 ? 0 : worldPos.y / halfHeightAtZ;

    const x = (ndcX * 0.5 + 0.5) * viewportWidth;
    const y = (-ndcY * 0.5 + 0.5) * viewportHeight;

    return { x, y };
  }

  // --- Instance delegation methods for drop-in object compatibility ---

  public scrollForIndex(
    index: number,
    countOrProjects: ItemCountOrProjects,
    unit: number
  ): number {
    return CarouselKinematics.scrollForIndex(index, countOrProjects, unit);
  }

  public indexFromScroll(
    scrollX: number,
    countOrProjects: ItemCountOrProjects,
    unit: number
  ): number {
    return CarouselKinematics.indexFromScroll(scrollX, countOrProjects, unit);
  }

  public clampScroll(
    scrollX: number,
    countOrProjects: ItemCountOrProjects,
    unit: number
  ): number {
    return CarouselKinematics.clampScroll(scrollX, countOrProjects, unit);
  }

  public calculateWarp(
    velocity: number,
    currentWarp: number,
    isDragging: boolean
  ): number {
    return CarouselKinematics.calculateWarp(velocity, currentWarp, isDragging);
  }

  public applyInertialDamping(
    velocity: number,
    dampingFactor: number = CarouselKinematics.DEFAULT_DAMPING
  ): number {
    return CarouselKinematics.applyInertialDamping(velocity, dampingFactor);
  }

  public project3DToScreen(
    worldPos: WorldPosition,
    cameraFov: number,
    cameraZ: number,
    viewportWidth: number,
    viewportHeight: number
  ): ScreenPosition {
    return CarouselKinematics.project3DToScreen(
      worldPos,
      cameraFov,
      cameraZ,
      viewportWidth,
      viewportHeight
    );
  }
}
