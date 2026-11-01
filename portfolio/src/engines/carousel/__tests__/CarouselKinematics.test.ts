import { describe, it, expect } from 'vitest';
import { CarouselKinematics } from '../CarouselKinematics';
import type { Project } from '@/domain/types';

describe('CarouselKinematics', () => {
  const mockProjects: Partial<Project>[] = [
    { id: '1', title: 'Project 1' },
    { id: '2', title: 'Project 2' },
    { id: '3', title: 'Project 3' },
    { id: '4', title: 'Project 4' },
    { id: '5', title: 'Project 5' },
    { id: '6', title: 'Project 6' },
  ];

  describe('scrollForIndex', () => {
    it('returns symmetrical scroll coordinates centered at 0 for 6 items', () => {
      const count = 6;
      const unit = 100;

      const p0 = CarouselKinematics.scrollForIndex(0, count, unit);
      const p1 = CarouselKinematics.scrollForIndex(1, count, unit);
      const p2 = CarouselKinematics.scrollForIndex(2, count, unit);
      const p3 = CarouselKinematics.scrollForIndex(3, count, unit);
      const p4 = CarouselKinematics.scrollForIndex(4, count, unit);
      const p5 = CarouselKinematics.scrollForIndex(5, count, unit);

      expect(p0).toBe(250);
      expect(p1).toBe(150);
      expect(p2).toBe(50);
      expect(p3).toBe(-50);
      expect(p4).toBe(-150);
      expect(p5).toBe(-250);

      // Perfect symmetry
      expect(p0 + p5).toBe(0);
      expect(p1 + p4).toBe(0);
      expect(p2 + p3).toBe(0);
      expect(p0 + p1 + p2 + p3 + p4 + p5).toBe(0);
    });

    it('returns exact center (0) for the middle item of an odd count', () => {
      const count = 5;
      const unit = 80;

      expect(CarouselKinematics.scrollForIndex(0, count, unit)).toBe(160);
      expect(CarouselKinematics.scrollForIndex(1, count, unit)).toBe(80);
      expect(CarouselKinematics.scrollForIndex(2, count, unit)).toBe(0);
      expect(CarouselKinematics.scrollForIndex(3, count, unit)).toBe(-80);
      expect(CarouselKinematics.scrollForIndex(4, count, unit)).toBe(-160);
    });

    it('handles single item count without division error', () => {
      expect(CarouselKinematics.scrollForIndex(0, 1, 100)).toBe(0);
    });

    it('accepts Project array directly as item count input', () => {
      const p0 = CarouselKinematics.scrollForIndex(0, mockProjects as Project[], 100);
      const p5 = CarouselKinematics.scrollForIndex(5, mockProjects as Project[], 100);
      expect(p0).toBe(250);
      expect(p5).toBe(-250);
    });

    it('safely handles empty count (0) by returning 0', () => {
      expect(CarouselKinematics.scrollForIndex(0, 0, 100)).toBe(0);
      expect(CarouselKinematics.scrollForIndex(0, [] as Project[], 100)).toBe(0);
    });
  });

  describe('indexFromScroll', () => {
    it('accurately resolves discrete indices from exact scroll coordinates', () => {
      const count = 6;
      const unit = 100;

      expect(CarouselKinematics.indexFromScroll(250, count, unit)).toBe(0);
      expect(CarouselKinematics.indexFromScroll(150, count, unit)).toBe(1);
      expect(CarouselKinematics.indexFromScroll(50, count, unit)).toBe(2);
      expect(CarouselKinematics.indexFromScroll(-50, count, unit)).toBe(3);
      expect(CarouselKinematics.indexFromScroll(-150, count, unit)).toBe(4);
      expect(CarouselKinematics.indexFromScroll(-250, count, unit)).toBe(5);
    });

    it('resolves nearest index around rounding midpoints', () => {
      const count = 6;
      const unit = 100;

      // Midpoint between index 0 (250) and index 1 (150) is 200
      expect(CarouselKinematics.indexFromScroll(201, count, unit)).toBe(0);
      expect(CarouselKinematics.indexFromScroll(199, count, unit)).toBe(1);

      // Midpoint between index 2 (50) and index 3 (-50) is 0
      expect(CarouselKinematics.indexFromScroll(1, count, unit)).toBe(2);
      expect(CarouselKinematics.indexFromScroll(-1, count, unit)).toBe(3);
    });

    it('strictly clamps index to [0, count - 1] for extreme overscroll values', () => {
      const count = 6;
      const unit = 100;

      expect(CarouselKinematics.indexFromScroll(99999, count, unit)).toBe(0);
      expect(CarouselKinematics.indexFromScroll(-99999, count, unit)).toBe(5);
    });

    it('handles single item count returning index 0', () => {
      expect(CarouselKinematics.indexFromScroll(500, 1, 100)).toBe(0);
      expect(CarouselKinematics.indexFromScroll(-500, 1, 100)).toBe(0);
    });

    it('accepts Project array directly as item count input', () => {
      expect(CarouselKinematics.indexFromScroll(250, mockProjects as Project[], 100)).toBe(0);
      expect(CarouselKinematics.indexFromScroll(-250, mockProjects as Project[], 100)).toBe(5);
    });

    it('returns 0 if count is 0 or invalid', () => {
      expect(CarouselKinematics.indexFromScroll(100, 0, 100)).toBe(0);
      expect(CarouselKinematics.indexFromScroll(100, [] as Project[], 100)).toBe(0);
    });
  });

  describe('clampScroll', () => {
    it('strictly confines scrollX between min and max bounds for 6 items', () => {
      const count = 6;
      const unit = 100;
      // min = scrollForIndex(5) = -250, max = scrollForIndex(0) = 250

      expect(CarouselKinematics.clampScroll(0, count, unit)).toBe(0);
      expect(CarouselKinematics.clampScroll(120, count, unit)).toBe(120);
      expect(CarouselKinematics.clampScroll(-120, count, unit)).toBe(-120);

      // Boundary values
      expect(CarouselKinematics.clampScroll(250, count, unit)).toBe(250);
      expect(CarouselKinematics.clampScroll(-250, count, unit)).toBe(-250);

      // Beyond boundaries
      expect(CarouselKinematics.clampScroll(350, count, unit)).toBe(250);
      expect(CarouselKinematics.clampScroll(-350, count, unit)).toBe(-250);
      expect(CarouselKinematics.clampScroll(10000, count, unit)).toBe(250);
      expect(CarouselKinematics.clampScroll(-10000, count, unit)).toBe(-250);
    });

    it('handles single item count with 0 bounds', () => {
      expect(CarouselKinematics.clampScroll(100, 1, 50)).toBe(0);
      expect(CarouselKinematics.clampScroll(-100, 1, 50)).toBe(0);
    });

    it('accepts Project array directly as item count input', () => {
      expect(CarouselKinematics.clampScroll(500, mockProjects as Project[], 100)).toBe(250);
      expect(CarouselKinematics.clampScroll(-500, mockProjects as Project[], 100)).toBe(-250);
    });
  });

  describe('calculateWarp', () => {
    it('yields non-linear deformation bounded within [-1.5, 1.5] velocity saturation', () => {
      // Equation: ai = clamp(velocity * 12, -1.5, 1.5)
      // Saturating velocity is 1.5 / 12 = 0.125
      const warpAtSat = CarouselKinematics.calculateWarp(0.125, 0, false);
      const warpAboveSat = CarouselKinematics.calculateWarp(10.0, 0, false);

      expect(warpAtSat).toBeCloseTo(warpAboveSat, 5);
      expect(warpAtSat).toBeGreaterThan(0);

      const warpNegSat = CarouselKinematics.calculateWarp(-0.125, 0, false);
      const warpBelowSat = CarouselKinematics.calculateWarp(-10.0, 0, false);

      expect(warpNegSat).toBeCloseTo(warpBelowSat, 5);
      expect(warpNegSat).toBeCloseTo(-warpAtSat, 5);
    });

    it('decays toward 0 when velocity is zero or below 0.001 threshold', () => {
      const currentWarp = 0.5;

      // With velocity = 0, target is 0.
      // Not dragging: lerp = 0.07 -> next = 0.5 + (0 - 0.5) * 0.07 = 0.465
      const decayedIdle = CarouselKinematics.calculateWarp(0, currentWarp, false);
      expect(decayedIdle).toBeCloseTo(0.465, 5);

      // Dragging: lerp = 0.11 -> next = 0.5 + (0 - 0.5) * 0.11 = 0.445
      const decayedDrag = CarouselKinematics.calculateWarp(0, currentWarp, true);
      expect(decayedDrag).toBeCloseTo(0.445, 5);
    });

    it('preserves antisymmetry for opposite velocities', () => {
      const vel = 0.05;
      const positiveWarp = CarouselKinematics.calculateWarp(vel, 0, false);
      const negativeWarp = CarouselKinematics.calculateWarp(-vel, 0, false);

      expect(positiveWarp).toBeCloseTo(-negativeWarp, 6);
    });
  });

  describe('applyInertialDamping', () => {
    it('decays velocity by factor 0.92 per step by default', () => {
      const initial = 1.0;
      const step1 = CarouselKinematics.applyInertialDamping(initial);
      expect(step1).toBeCloseTo(0.92, 6);

      const step2 = CarouselKinematics.applyInertialDamping(step1);
      expect(step2).toBeCloseTo(0.92 * 0.92, 6);
    });

    it('respects a custom damping factor when provided', () => {
      const step = CarouselKinematics.applyInertialDamping(2.0, 0.85);
      expect(step).toBeCloseTo(1.7, 6);
    });

    it('snaps to 0 when absolute velocity is below epsilon (0.0001)', () => {
      expect(CarouselKinematics.applyInertialDamping(0.00008)).toBe(0);
      expect(CarouselKinematics.applyInertialDamping(-0.00008)).toBe(0);
      expect(CarouselKinematics.applyInertialDamping(0)).toBe(0);
    });

    it('snaps to 0 when post-damped velocity falls below 0.0001', () => {
      // 0.000105 * 0.92 = 0.0000966 < 0.0001
      expect(CarouselKinematics.applyInertialDamping(0.000105)).toBe(0);
      expect(CarouselKinematics.applyInertialDamping(-0.000105)).toBe(0);
    });

    it('converges to exact zero without infinite floating-point residue', () => {
      let vel = 10.0;
      let iterations = 0;
      while (vel !== 0 && iterations < 500) {
        vel = CarouselKinematics.applyInertialDamping(vel, 0.92);
        iterations++;
      }

      expect(vel).toBe(0);
      expect(iterations).toBeLessThan(150);
    });
  });

  describe('project3DToScreen', () => {
    const fov = 50;
    const cameraZ = 8;
    const viewportW = 1920;
    const viewportH = 1080;

    it('projects origin (0, 0, 0) directly to screen center (width/2, height/2)', () => {
      const screenPos = CarouselKinematics.project3DToScreen(
        { x: 0, y: 0, z: 0 },
        fov,
        cameraZ,
        viewportW,
        viewportH
      );

      expect(screenPos.x).toBeCloseTo(960, 4);
      expect(screenPos.y).toBeCloseTo(540, 4);
    });

    it('projects world coordinates accurately to 2D viewport boundaries', () => {
      const fovRad = (fov * Math.PI) / 180;
      const dist = cameraZ; // z = 0
      const halfHeightAtZ = dist * Math.tan(fovRad / 2);
      const aspect = viewportW / viewportH;
      const halfWidthAtZ = halfHeightAtZ * aspect;

      // Top-right boundary point in 3D (+halfWidth, +halfHeight, 0)
      // Screen space: x = viewportW (1920), y = 0 (top of screen)
      const topRight = CarouselKinematics.project3DToScreen(
        { x: halfWidthAtZ, y: halfHeightAtZ, z: 0 },
        fov,
        cameraZ,
        viewportW,
        viewportH
      );
      expect(topRight.x).toBeCloseTo(1920, 2);
      expect(topRight.y).toBeCloseTo(0, 2);

      // Bottom-left boundary point in 3D (-halfWidth, -halfHeight, 0)
      // Screen space: x = 0, y = 1080 (bottom of screen)
      const bottomLeft = CarouselKinematics.project3DToScreen(
        { x: -halfWidthAtZ, y: -halfHeightAtZ, z: 0 },
        fov,
        cameraZ,
        viewportW,
        viewportH
      );
      expect(bottomLeft.x).toBeCloseTo(0, 2);
      expect(bottomLeft.y).toBeCloseTo(1080, 2);
    });

    it('accounts for perspective scaling at different Z depths', () => {
      // Closer object at z = 4 (dist = 4, half distance of z=0) should project twice as far from screen center
      const posFar = CarouselKinematics.project3DToScreen(
        { x: 1, y: 0, z: 0 },
        fov,
        cameraZ,
        viewportW,
        viewportH
      );
      const posNear = CarouselKinematics.project3DToScreen(
        { x: 1, y: 0, z: 4 },
        fov,
        cameraZ,
        viewportW,
        viewportH
      );

      const deltaFarX = posFar.x - 960;
      const deltaNearX = posNear.x - 960;

      expect(deltaNearX).toBeCloseTo(deltaFarX * 2, 4);
    });

    it('safeguards against points at or behind the camera plane', () => {
      // Point at camera plane (z = 8) or behind camera (z = 10)
      const atCamera = CarouselKinematics.project3DToScreen(
        { x: 5, y: 5, z: 8 },
        fov,
        cameraZ,
        viewportW,
        viewportH
      );
      expect(Number.isFinite(atCamera.x)).toBe(true);
      expect(Number.isFinite(atCamera.y)).toBe(true);

      const behindCamera = CarouselKinematics.project3DToScreen(
        { x: 5, y: 5, z: 12 },
        fov,
        cameraZ,
        viewportW,
        viewportH
      );
      expect(Number.isFinite(behindCamera.x)).toBe(true);
      expect(Number.isFinite(behindCamera.y)).toBe(true);
    });

    it('functions seamlessly on mobile aspect ratios', () => {
      const mobileW = 375;
      const mobileH = 812;

      const center = CarouselKinematics.project3DToScreen(
        { x: 0, y: 0, z: 0 },
        fov,
        cameraZ,
        mobileW,
        mobileH
      );

      expect(center.x).toBeCloseTo(375 / 2, 4);
      expect(center.y).toBeCloseTo(812 / 2, 4);
    });
  });

  describe('Instance delegation', () => {
    it('allows instantiation and mirrors all static method behaviors', () => {
      const kinematics = new CarouselKinematics();

      expect(kinematics.scrollForIndex(0, 6, 100)).toBe(
        CarouselKinematics.scrollForIndex(0, 6, 100)
      );
      expect(kinematics.indexFromScroll(150, 6, 100)).toBe(
        CarouselKinematics.indexFromScroll(150, 6, 100)
      );
      expect(kinematics.clampScroll(350, 6, 100)).toBe(
        CarouselKinematics.clampScroll(350, 6, 100)
      );
      expect(kinematics.calculateWarp(0.1, 0, false)).toBe(
        CarouselKinematics.calculateWarp(0.1, 0, false)
      );
      expect(kinematics.applyInertialDamping(1.0)).toBe(
        CarouselKinematics.applyInertialDamping(1.0)
      );
      expect(
        kinematics.project3DToScreen({ x: 0, y: 0, z: 0 }, 50, 8, 1920, 1080)
      ).toEqual(
        CarouselKinematics.project3DToScreen({ x: 0, y: 0, z: 0 }, 50, 8, 1920, 1080)
      );
    });
  });
});
