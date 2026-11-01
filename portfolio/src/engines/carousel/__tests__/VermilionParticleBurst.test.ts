import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { VermilionParticleBurst } from '../VermilionParticleBurst';

describe('VermilionParticleBurst', () => {
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
  });

  describe('Initialization', () => {
    it('creates a particle burst with default count of 48 particles', () => {
      const burst = new VermilionParticleBurst(scene);
      expect(burst.particleCount).toBe(48);
      expect(scene.children).toContain(burst.points);
      expect(burst.isActive).toBe(false);
      expect(burst.points.visible).toBe(false);
    });

    it('accepts custom particle count', () => {
      const burst = new VermilionParticleBurst(scene, 64);
      expect(burst.particleCount).toBe(64);
      const positionAttr = burst.geometry.getAttribute('position');
      expect(positionAttr.count).toBe(64);
    });

    it('configures vermilion color #ff4421 on points material', () => {
      const burst = new VermilionParticleBurst(scene);
      const hex = burst.material.color.getHexString().toLowerCase();
      expect(hex).toBe('ff4421');
      expect(burst.material.transparent).toBe(true);
      expect(burst.material.depthWrite).toBe(false);
      expect(burst.material.blending).toBe(THREE.AdditiveBlending);
    });
  });

  describe('Triggering Burst', () => {
    it('activates the burst and positions particles at the origin', () => {
      const burst = new VermilionParticleBurst(scene, 16);
      const origin = new THREE.Vector3(2, -3, 1.5);

      burst.trigger(origin);

      expect(burst.isActive).toBe(true);
      expect(burst.points.visible).toBe(true);
      expect(burst.material.opacity).toBe(1.0);

      const positions = burst.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < burst.particleCount; i++) {
        expect(positions.getX(i)).toBeCloseTo(2, 4);
        expect(positions.getY(i)).toBeCloseTo(-3, 4);
        expect(positions.getZ(i)).toBeCloseTo(1.5, 4);
      }
    });

    it('allows re-triggering from a new origin', () => {
      const burst = new VermilionParticleBurst(scene, 8);
      burst.trigger(new THREE.Vector3(0, 0, 0));
      burst.update(0.2);

      const newOrigin = new THREE.Vector3(10, 20, 30);
      burst.trigger(newOrigin);

      expect(burst.isActive).toBe(true);
      const positions = burst.geometry.getAttribute('position') as THREE.BufferAttribute;
      expect(positions.getX(0)).toBeCloseTo(10, 4);
      expect(positions.getY(0)).toBeCloseTo(20, 4);
      expect(positions.getZ(0)).toBeCloseTo(30, 4);
    });
  });

  describe('Kinematics and Update', () => {
    it('expands particles radially outward away from origin over time', () => {
      const burst = new VermilionParticleBurst(scene, 24);
      const origin = new THREE.Vector3(0, 0, 0);
      burst.trigger(origin);

      burst.update(0.1);

      const positions = burst.geometry.getAttribute('position') as THREE.BufferAttribute;
      let movedCount = 0;
      for (let i = 0; i < burst.particleCount; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const dist = Math.sqrt(x * x + y * y + z * z);
        if (dist > 0.001) {
          movedCount++;
        }
      }
      expect(movedCount).toBe(burst.particleCount);
    });

    it('fades material opacity as burst progresses', () => {
      const burst = new VermilionParticleBurst(scene, 16);
      burst.trigger(new THREE.Vector3(0, 0, 0));

      const initialOpacity = burst.material.opacity;
      burst.update(0.3);
      expect(burst.material.opacity).toBeLessThan(initialOpacity);
      expect(burst.material.opacity).toBeGreaterThan(0);
    });

    it('applies drag deceleration on particle velocity', () => {
      const burst = new VermilionParticleBurst(scene, 10);
      burst.trigger(new THREE.Vector3(0, 0, 0));

      // Capture displacement across two equal time steps
      burst.update(0.1);
      const positions = burst.geometry.getAttribute('position') as THREE.BufferAttribute;
      const step1Dist = Math.sqrt(
        positions.getX(0) ** 2 + positions.getY(0) ** 2 + positions.getZ(0) ** 2
      );

      const xPrev = positions.getX(0);
      const yPrev = positions.getY(0);
      const zPrev = positions.getZ(0);

      burst.update(0.1);
      const step2Dist = Math.sqrt(
        (positions.getX(0) - xPrev) ** 2 +
        (positions.getY(0) - yPrev) ** 2 +
        (positions.getZ(0) - zPrev) ** 2
      );

      // Due to drag factor (0.94), velocity in step 2 is lower than step 1
      expect(step2Dist).toBeLessThan(step1Dist);
    });

    it('safely handles non-positive or invalid deltaTime', () => {
      const burst = new VermilionParticleBurst(scene, 8);
      burst.trigger(new THREE.Vector3(1, 2, 3));

      expect(() => {
        burst.update(0);
        burst.update(-0.1);
        burst.update(NaN);
      }).not.toThrow();

      const positions = burst.geometry.getAttribute('position') as THREE.BufferAttribute;
      expect(positions.getX(0)).toBeCloseTo(1, 4);
      expect(positions.getY(0)).toBeCloseTo(2, 4);
    });
  });

  describe('Lifetime Expiration and Culling', () => {
    it('deactivates and hides points once max lifetime expires (~0.9s)', () => {
      const burst = new VermilionParticleBurst(scene, 16);
      burst.trigger(new THREE.Vector3(0, 0, 0));

      expect(burst.isActive).toBe(true);

      // Advance past max lifetime (0.95s)
      burst.update(1.0);

      expect(burst.isActive).toBe(false);
      expect(burst.points.visible).toBe(false);
      expect(burst.material.opacity).toBe(0);
    });

    it('does not mutate positions when inactive', () => {
      const burst = new VermilionParticleBurst(scene, 10);
      burst.trigger(new THREE.Vector3(0, 0, 0));
      burst.update(1.0); // Now inactive

      const positions = burst.geometry.getAttribute('position') as THREE.BufferAttribute;
      const xBefore = positions.getX(0);

      burst.update(0.1);
      expect(positions.getX(0)).toBe(xBefore);
    });
  });

  describe('Disposal and Lifecycle', () => {
    it('removes points from scene and disposes geometry and material', () => {
      const burst = new VermilionParticleBurst(scene);
      const geoSpy = vi.spyOn(burst.geometry, 'dispose');
      const matSpy = vi.spyOn(burst.material, 'dispose');

      burst.destroy();

      expect(scene.children).not.toContain(burst.points);
      expect(geoSpy).toHaveBeenCalledTimes(1);
      expect(matSpy).toHaveBeenCalledTimes(1);
      expect(burst.isDestroyed).toBe(true);
      expect(burst.isActive).toBe(false);
    });

    it('survives multiple destroy calls idempotently without error', () => {
      const burst = new VermilionParticleBurst(scene);
      expect(() => {
        burst.destroy();
        burst.destroy();
      }).not.toThrow();
    });

    it('ignores trigger and update after being destroyed', () => {
      const burst = new VermilionParticleBurst(scene);
      burst.destroy();

      expect(() => {
        burst.trigger(new THREE.Vector3(0, 0, 0));
        burst.update(0.1);
      }).not.toThrow();

      expect(burst.isActive).toBe(false);
    });
  });
});
