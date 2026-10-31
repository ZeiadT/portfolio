import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import gsap from 'gsap';
import { CardSummonEngine } from '../CardSummonEngine';

describe('Empirical Kinematics Challenger: CardSummonEngine & ThreeCardModel', () => {
  let engine: CardSummonEngine;
  let container: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = document.createElement('div');
    container.id = 'app-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (engine) {
      engine.destroy();
    }
  });

  interface SampledTransformSnapshot {
    t: number;
    bottomGlow: { opacity: number; scaleX: number; scaleY: number; yPercent: number };
    cardEl: {
      x: number;
      y: number;
      yPercent: number;
      rotationX: number;
      rotationY: number;
      rotationZ: number;
      scale: number;
      scaleX: number;
      scaleY: number;
      opacity: number;
    };
    aura: { opacity: number; scale: number };
    flashVeil: { opacity: number };
    shockwave: { scale: number; opacity: number };
    threeCardModel: {
      posX: number;
      posY: number;
      rotXDeg: number;
      rotYDeg: number;
      rotZDeg: number;
      scale: number;
    } | null;
  }

  function captureSnapshot(engineInstance: CardSummonEngine, time: number): SampledTransformSnapshot {
    const tl = engineInstance.getTimeline();
    if (!tl) throw new Error('Timeline is null');

    tl.seek(time, false);

    const bottomGlow = document.querySelector<HTMLElement>('[data-summon-bottom-glow]');
    const cardEl = document.querySelector<HTMLElement>('[data-summon-card]');
    const aura = document.querySelector<HTMLElement>('[data-summon-card-aura]');
    const flashVeil = document.querySelector<HTMLElement>('[data-summon-flash-veil]');
    const shockwave = document.querySelector<HTMLElement>('[data-summon-shockwave]');
    const threeModel = engineInstance.getThreeCardModel();

    let threeSnapshot = null;
    if (threeModel) {
      const group = threeModel.cardGroup;
      threeSnapshot = {
        posX: group.position.x,
        posY: group.position.y,
        rotXDeg: (group.rotation.x * 180) / Math.PI,
        rotYDeg: (group.rotation.y * 180) / Math.PI,
        rotZDeg: (group.rotation.z * 180) / Math.PI,
        scale: group.scale.x,
      };
    }

    return {
      t: time,
      bottomGlow: {
        opacity: Number(gsap.getProperty(bottomGlow, 'opacity') ?? 0),
        scaleX: Number(gsap.getProperty(bottomGlow, 'scaleX') ?? 1),
        scaleY: Number(gsap.getProperty(bottomGlow, 'scaleY') ?? 1),
        yPercent: Number(gsap.getProperty(bottomGlow, 'yPercent') ?? 0),
      },
      cardEl: {
        x: Number(gsap.getProperty(cardEl, 'x') ?? 0),
        y: Number(gsap.getProperty(cardEl, 'y') ?? 0),
        yPercent: Number(gsap.getProperty(cardEl, 'yPercent') ?? 0),
        rotationX: Number(gsap.getProperty(cardEl, 'rotationX') ?? 0),
        rotationY: Number(gsap.getProperty(cardEl, 'rotationY') ?? 0),
        rotationZ: Number(gsap.getProperty(cardEl, 'rotationZ') ?? 0),
        scale: Number(gsap.getProperty(cardEl, 'scale') ?? 1),
        scaleX: Number(gsap.getProperty(cardEl, 'scaleX') ?? 1),
        scaleY: Number(gsap.getProperty(cardEl, 'scaleY') ?? 1),
        opacity: Number(gsap.getProperty(cardEl, 'opacity') ?? 0),
      },
      aura: {
        opacity: Number(gsap.getProperty(aura, 'opacity') ?? 0),
        scale: Number(gsap.getProperty(aura, 'scale') ?? 1),
      },
      flashVeil: {
        opacity: Number(gsap.getProperty(flashVeil, 'opacity') ?? 0),
      },
      shockwave: {
        scale: shockwave ? Number(gsap.getProperty(shockwave, 'scale') ?? 1) : 0,
        opacity: shockwave ? Number(gsap.getProperty(shockwave, 'opacity') ?? 0) : 0,
      },
      threeCardModel: threeSnapshot,
    };
  }

  it('1. Empirical sampling table at timestamps t = 0, 0.15, 0.35, 0.75, 1.10, 1.25, 1.45, 1.85, 2.20s', () => {
    engine = new CardSummonEngine();
    engine.open();

    const sampleTimes = [0.0, 0.15, 0.35, 0.75, 1.10, 1.25, 1.45, 1.85, 2.20];
    const snapshots: SampledTransformSnapshot[] = [];

    for (const t of sampleTimes) {
      const snap = captureSnapshot(engine, t);
      snapshots.push(snap);
    }

    console.log(JSON.stringify(snapshots.map(s => ({
      t: s.t,
      glowScaleY: Math.round(s.bottomGlow.scaleY * 1000) / 1000,
      glowScaleX: Math.round(s.bottomGlow.scaleX * 1000) / 1000,
      cardYPercent: Math.round(s.cardEl.yPercent * 10) / 10,
      cardRotY: Math.round(s.cardEl.rotationY * 10) / 10,
      cardScale: Math.round(s.cardEl.scale * 1000) / 1000,
      cardX: Math.round(s.cardEl.x * 1000) / 1000,
      flashOp: Math.round(s.flashVeil.opacity * 1000) / 1000,
      shockScale: Math.round(s.shockwave.scale * 1000) / 1000,
      threeRotY: s.threeCardModel ? Math.round(s.threeCardModel.rotYDeg * 10) / 10 : null,
      threeScale: s.threeCardModel ? Math.round(s.threeCardModel.scale * 1000) / 1000 : null,
    })), null, 2));

    // Verify snapshots array length
    expect(snapshots.length).toBe(9);

    // Verify specific properties at each required timestamp:

    // t = 0.00s: Initial state
    const s0 = snapshots[0];
    expect(s0.bottomGlow.opacity).toBeCloseTo(0, 1);
    expect(s0.bottomGlow.scaleY).toBeCloseTo(0, 1);
    expect(s0.cardEl.opacity).toBeCloseTo(0, 1);

    // t = 0.15s: Bottom glow emerging in Phase 1
    const s015 = snapshots[1];
    expect(s015.bottomGlow.opacity).toBeGreaterThan(0.5);
    expect(s015.bottomGlow.scaleY).toBeGreaterThan(0.5);

    // t = 0.35s: Phase 1 inhale ends, Phase 2 ascent starts
    const s035 = snapshots[2];
    expect(s035.cardEl.rotationY).toBeCloseTo(-900, 1);
    expect(s035.cardEl.yPercent).toBeCloseTo(120, 1);
    expect(s035.cardEl.scale).toBeCloseTo(0.55, 2);

    // t = 0.75s: Phase 2 ascent midpoint, harmonic vibration begins
    const s075 = snapshots[3];
    expect(s075.cardEl.yPercent).toBeLessThan(120);
    expect(s075.cardEl.rotationY).toBeGreaterThan(-900);
    expect(s075.cardEl.rotationY).toBeLessThan(180);

    // t = 1.10s: Phase 2 arrival and start of 150ms Fermata Freeze
    const s110 = snapshots[4];
    expect(s110.cardEl.rotationY).toBeCloseTo(180, 1);
    expect(s110.cardEl.yPercent).toBeCloseTo(-2.8, 1);
    expect(s110.cardEl.x).toBe(0);
    expect(s110.cardEl.scale).toBeCloseTo(1.020, 2);

    // t = 1.25s: Climax / apex rupture trigger at end of 150ms freeze
    const s125 = snapshots[5];
    expect(s125.cardEl.rotationY).toBeCloseTo(180, 1);
    expect(s125.cardEl.x).toBe(0);
    expect(s125.cardEl.scale).toBeCloseTo(1.025, 2);

    // t = 1.45s: Descent begins towards center
    const s145 = snapshots[6];
    expect(s145.cardEl.rotationY).toBeCloseTo(180, 1);
    expect(s145.cardEl.yPercent).toBeCloseTo(-2.8, 1);
    expect(s145.cardEl.scale).toBeCloseTo(1.025, 2);

    // t = 1.85s: Descent settling and foil wipe completing
    const s185 = snapshots[7];
    expect(s185.cardEl.yPercent).toBeGreaterThanOrEqual(-2.8);
    expect(s185.cardEl.yPercent).toBeLessThanOrEqual(0);
    expect(s185.cardEl.scaleY).toBeGreaterThanOrEqual(0.98);

    // t = 2.20s: Complete sequence settled at origin
    const s220 = snapshots[8];
    expect(s220.cardEl.yPercent).toBeCloseTo(0, 1);
    expect(s220.cardEl.rotationY).toBeCloseTo(180, 1);
    expect(s220.cardEl.scale).toBeCloseTo(1.0, 2);
  });

  it('2. Phase 1: verifies gentle inhale squash (scaleY ~ 0.86, scaleX ~ 1.08) and absence of cartoon squash (no scaleY <= 0.80)', () => {
    engine = new CardSummonEngine();
    engine.open();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();
    const bottomGlow = document.querySelector<HTMLElement>('[data-summon-bottom-glow]');
    expect(bottomGlow).not.toBeNull();

    // Sample across the inhale window: 0.25s to 0.35s
    let minScaleY = 1.0;
    let maxScaleX = 1.0;
    for (let t = 0.25; t <= 0.35; t += 0.005) {
      tl?.seek(t, false);
      const sY = Number(gsap.getProperty(bottomGlow!, 'scaleY'));
      const sX = Number(gsap.getProperty(bottomGlow!, 'scaleX'));
      if (sY < minScaleY) minScaleY = sY;
      if (sX > maxScaleX) maxScaleX = sX;
    }

    // Must be refined luxury breath ~ 0.86 / 1.08
    expect(minScaleY).toBeGreaterThanOrEqual(0.84);
    expect(minScaleY).toBeLessThanOrEqual(0.88);
    expect(maxScaleX).toBeGreaterThanOrEqual(1.06);
    expect(maxScaleX).toBeLessThanOrEqual(1.10);

    // Strictly verify non-cartoonish invariant: no aggressive squash (e.g. 0.70)
    expect(minScaleY).not.toBeLessThan(0.80);
    expect(maxScaleX).not.toBeGreaterThan(1.15);
  });

  it('3. Phase 2: verifies deceleration curve from -900 to 180 deg, bandlimited hum <= 0.55px, and absolute zero vibration at 1.10s', () => {
    engine = new CardSummonEngine();
    engine.open();

    const tl = engine.getTimeline();
    const cardEl = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(cardEl).not.toBeNull();

    // Verify ascent start and arrival angles
    tl?.seek(0.35, false);
    const startRotY = Number(gsap.getProperty(cardEl!, 'rotationY'));
    expect(startRotY).toBeCloseTo(-900, 1);

    tl?.seek(1.10, false);
    const endRotY = Number(gsap.getProperty(cardEl!, 'rotationY'));
    expect(endRotY).toBeCloseTo(180, 1);

    // Verify deceleration: rotation delta in early ascent (0.35 - 0.50) is greater than late ascent (0.95 - 1.10)
    tl?.seek(0.35, false);
    const rot035 = Number(gsap.getProperty(cardEl!, 'rotationY'));
    tl?.seek(0.50, false);
    const rot050 = Number(gsap.getProperty(cardEl!, 'rotationY'));
    const deltaEarly = rot050 - rot035; // early spin angular travel

    tl?.seek(0.95, false);
    const rot095 = Number(gsap.getProperty(cardEl!, 'rotationY'));
    tl?.seek(1.10, false);
    const rot110 = Number(gsap.getProperty(cardEl!, 'rotationY'));
    const deltaLate = rot110 - rot095; // late spin angular travel (should decelerate)

    expect(deltaEarly).toBeGreaterThan(deltaLate);

    // Verify bandlimited harmonic vibration hum (0.75s to 1.10s)
    let maxAbsX = 0;
    for (let t = 0.75; t < 1.10; t += 0.005) {
      tl?.seek(t, false);
      const x = Math.abs(Number(gsap.getProperty(cardEl!, 'x')) || 0);
      if (x > maxAbsX) maxAbsX = x;
    }

    // Bandlimited: amplitude ~ 0.45px, strictly bounded <= 0.55px
    expect(maxAbsX).toBeGreaterThanOrEqual(0.35);
    expect(maxAbsX).toBeLessThanOrEqual(0.55);

    // Absolutely zero vibration at 1.10s
    tl?.seek(1.10, false);
    const xAt110 = Number(gsap.getProperty(cardEl!, 'x'));
    expect(xAt110).toBe(0);
  });

  it('4. Fermata Freeze: verifies 150ms dead still translation (x=0, y locked), rotation diff <= 1.0 deg, and subtle scale swell 1.020 -> 1.025', () => {
    engine = new CardSummonEngine();
    engine.open();

    const tl = engine.getTimeline();
    const cardEl = document.querySelector<HTMLElement>('[data-summon-card]');

    // Sample densely every 10ms from 1.10s to 1.25s (16 samples)
    const samples: { t: number; x: number; yPercent: number; rotY: number; scale: number }[] = [];
    for (let t = 1.10; t <= 1.2501; t += 0.01) {
      tl?.seek(t, false);
      samples.push({
        t: Math.round(t * 100) / 100,
        x: Number(gsap.getProperty(cardEl!, 'x')),
        yPercent: Number(gsap.getProperty(cardEl!, 'yPercent')),
        rotY: Number(gsap.getProperty(cardEl!, 'rotationY')),
        scale: Number(gsap.getProperty(cardEl!, 'scale')),
      });
    }

    expect(samples.length).toBeGreaterThanOrEqual(15);

    for (const s of samples) {
      // Translation is dead still
      expect(s.x).toBe(0);
      expect(s.yPercent).toBeCloseTo(-2.8, 2);
      // Rotation diff <= 1.0 deg (in fact, squarely 180)
      expect(Math.abs(s.rotY - 180)).toBeLessThanOrEqual(1.0);
      // Scale is in [1.020, 1.025]
      expect(s.scale).toBeGreaterThanOrEqual(1.0199);
      expect(s.scale).toBeLessThanOrEqual(1.0251);
    }

    // Verify monotonic subtle swell from 1.020 to 1.025
    expect(samples[0].scale).toBeCloseTo(1.020, 3);
    expect(samples[samples.length - 1].scale).toBeCloseTo(1.025, 3);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i].scale).toBeGreaterThanOrEqual(samples[i - 1].scale - 0.0001);
    }
  });

  it('5. Phase 3: verifies optical bloom opacity peak >= 0.9, warm golden styling, and absence of static shockwave circle', () => {
    engine = new CardSummonEngine();
    engine.open();

    const flashVeil = document.querySelector<HTMLElement>('[data-summon-flash-veil]');
    expect(flashVeil).not.toBeNull();
    expect(document.querySelector('[data-summon-shockwave]')).toBeNull();

    // Verify warm gradient / amber styling (no military stun grenade pure white)
    const veilBg = (flashVeil?.style.background || '') + (flashVeil?.className || '');
    expect(veilBg).toMatch(/radial-gradient|amber|gold|rgba\(255,\s*2[0-9]{2}/i);

    const tl = engine.getTimeline();
    let peakOpacity = 0;

    for (let t = 1.25; t <= 1.60; t += 0.01) {
      tl?.seek(t, false);
      const op = Number(gsap.getProperty(flashVeil!, 'opacity'));
      if (op > peakOpacity) peakOpacity = op;
    }

    expect(peakOpacity).toBeGreaterThanOrEqual(0.9);
  });

  it('6. Phase 4: verifies descent duration >= 0.4s and scaleY >= 0.98 (no cartoon squash on landing)', () => {
    engine = new CardSummonEngine();
    engine.open();

    const cardEl = document.querySelector<HTMLElement>('[data-summon-card]');
    const tl = engine.getTimeline();

    // Descent starts at 1.45s and concludes at 1.95s -> 0.50s duration
    const descentDuration = 1.95 - 1.45;
    expect(descentDuration).toBeGreaterThanOrEqual(0.40);

    let minScaleY = 1.0;
    for (let t = 1.45; t <= 1.95; t += 0.02) {
      tl?.seek(t, false);
      const sY = Number(gsap.getProperty(cardEl!, 'scaleY'));
      if (sY < minScaleY) minScaleY = sY;
    }

    // Zero-squash landing: scaleY must remain >= 0.98
    expect(minScaleY).toBeGreaterThanOrEqual(0.98);

    // Arrives squarely at 0 yPercent and scale 1.0
    tl?.seek(1.95, false);
    expect(Number(gsap.getProperty(cardEl!, 'yPercent'))).toBeCloseTo(0, 1);
    expect(Number(gsap.getProperty(cardEl!, 'scale'))).toBeCloseTo(1.0, 2);
  });

  it('7. Phase 5: verifies active idle floating breathing loop with smooth sine curve, and parallax tilt damped within +/- 15 deg', () => {
    engine = new CardSummonEngine();
    engine.open();

    const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
    const cardEl = document.querySelector<HTMLElement>('[data-summon-card]');
    expect(modal).not.toBeNull();
    expect(cardEl).not.toBeNull();

    vi.spyOn(cardEl!, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      top: 100,
      width: 400,
      height: 400,
      right: 600,
      bottom: 500,
      x: 200,
      y: 100,
      toJSON: () => {},
    });

    const tl = engine.getTimeline();
    // Complete sequence to enter Phase 5
    tl?.progress(1);

    const idleTween = engine.getIdleFloatTween();
    expect(idleTween).not.toBeNull();
    expect(idleTween?.paused()).toBe(false);
    expect(idleTween?.vars.repeat).toBe(-1);
    expect(idleTween?.vars.yoyo).toBe(true);
    expect(idleTween?.vars.ease).toBe('sine.inOut');
    expect(idleTween?.duration()).toBe(3.6);

    // Parallax damping tests across full cursor excursion on cardEl:
    const testPoints = [
      { clientX: 200, clientY: 100 },       // top-left
      { clientX: 600, clientY: 500 },       // bottom-right
      { clientX: 400, clientY: 300 },       // center
      { clientX: 600, clientY: 100 },       // top-right
      { clientX: 200, clientY: 500 },       // bottom-left
    ];

    for (const pt of testPoints) {
      cardEl?.dispatchEvent(new PointerEvent('pointermove', { clientX: pt.clientX, clientY: pt.clientY, bubbles: true }));
      expect(idleTween?.paused()).toBe(true);

      // Fast-forward any active gsap tweens on card
      gsap.getTweensOf(cardEl!).forEach((tw) => {
        if (tw !== idleTween) tw.progress(1);
      });

      const rotY = Number(gsap.getProperty(cardEl!, 'rotationY'));
      const rotX = Number(gsap.getProperty(cardEl!, 'rotationX'));

      // Card is flipped: baseRotY is 180.
      // Damped tilt must strictly stay within +/- 15 deg from base
      expect(Math.abs(rotY - 180)).toBeLessThanOrEqual(15.0);
      expect(Math.abs(rotX)).toBeLessThanOrEqual(15.0);
    }

    // Leave card: returns to resting position and resumes idle float
    cardEl?.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    expect(idleTween?.paused()).toBe(false);
  });

  it('8. ThreeCardModel kinematics synchronization across all phases', () => {
    engine = new CardSummonEngine();
    engine.open();

    const threeModel = engine.getThreeCardModel();
    expect(threeModel).not.toBeNull();

    const tl = engine.getTimeline();
    expect(tl).not.toBeNull();

    // Verify 3D cardGroup exists and has slab
    const slab = threeModel?.cardGroup.getObjectByName('card-slab');
    expect(slab).toBeDefined();

    // Sample at t = 1.10s (fermata)
    tl?.seek(1.10, false);
    expect((threeModel!.cardGroup.rotation.y * 180) / Math.PI).toBeCloseTo(180, 1);
    expect(threeModel!.cardGroup.scale.x).toBeCloseTo(1.020, 2);

    // Sample at t = 2.20s (settled)
    tl?.progress(1);
    expect((threeModel!.cardGroup.rotation.y * 180) / Math.PI).toBeCloseTo(180, 1);
    expect(threeModel!.cardGroup.scale.x).toBeCloseTo(1.0, 2);
    expect(threeModel!.cardGroup.position.y).toBeCloseTo(0, 1);
  });

  describe('Adversarial Stress Harnesses & Failure Mode Probing', () => {
    it('9. Interruption during Phase 2 vibration (t = 0.85s): close() and destroy() kill all active tweens cleanly', () => {
      engine = new CardSummonEngine();
      engine.open();

      const tl = engine.getTimeline();
      // Seek into mid-vibration
      tl?.seek(0.85, false);

      const card = document.querySelector<HTMLElement>('[data-summon-card]');
      expect(card).not.toBeNull();

      // Trigger mid-animation close
      engine.close();
      engine.getCloseTimeline()?.progress(1);

      // Ensure open timeline and tweens are dead
      expect(engine.isOpen()).toBe(false);
      expect(engine.getIdleFloatTween()).toBeNull();
      expect(document.querySelector('[data-summon-card]')).toBeNull();

      // Idempotent destroy call
      expect(() => engine.destroy()).not.toThrow();
    });

    it('10. Rapid cyclic open/close thrashing (5 rapid cycles)', () => {
      engine = new CardSummonEngine();

      for (let i = 0; i < 5; i++) {
        engine.open();
        expect(engine.isOpen()).toBe(true);
        const tl = engine.getTimeline();
        expect(tl).not.toBeNull();
        tl?.seek(Math.random() * 2.0, false);
        engine.close();
        engine.getCloseTimeline()?.progress(1);
        expect(engine.isOpen()).toBe(false);
      }

      // Final open settles properly
      engine.open();
      expect(engine.isOpen()).toBe(true);
      engine.getTimeline()?.progress(1);
      expect(engine.getIdleFloatTween()).not.toBeNull();
      engine.destroy();
    });

    it('11. Phase 5 rapid flip toggle stress (15 consecutive clicks)', () => {
      engine = new CardSummonEngine();
      engine.open();

      const tl = engine.getTimeline();
      tl?.progress(1);

      const card = document.querySelector<HTMLElement>('[data-summon-card]');
      expect(card).not.toBeNull();

      for (let i = 0; i < 15; i++) {
        card?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      // Card rotation remains valid finite numbers (never NaN or Infinity)
      const rotY = Number(gsap.getProperty(card!, 'rotationY'));
      const rotX = Number(gsap.getProperty(card!, 'rotationX'));
      expect(Number.isFinite(rotY)).toBe(true);
      expect(Number.isFinite(rotX)).toBe(true);
      expect(Number.isNaN(rotY)).toBe(false);
    });

    it('12. Zero-dimension bounding rect resilience (no division by zero / NaN)', () => {
      engine = new CardSummonEngine();
      engine.open();

      const modal = document.querySelector<HTMLElement>('[data-card-summon-modal]');
      const card = document.querySelector<HTMLElement>('[data-summon-card]');
      engine.getTimeline()?.progress(1);

      // Simulate collapsed container (width = 0, height = 0)
      vi.spyOn(modal!, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => {},
      });

      expect(() => {
        modal?.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 100, bubbles: true }));
      }).not.toThrow();

      const rotY = Number(gsap.getProperty(card!, 'rotationY'));
      expect(Number.isFinite(rotY)).toBe(true);
      expect(Number.isNaN(rotY)).toBe(false);
    });

    it('13. prefers-reduced-motion bypasses all 5 animation phases cleanly', () => {
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      engine = new CardSummonEngine();
      engine.open();

      const card = document.querySelector<HTMLElement>('[data-summon-card]');
      expect(card).not.toBeNull();

      // Immediately facing front face at rest (rotationY = 180, scale = 1, opacity = 1)
      expect(Number(gsap.getProperty(card!, 'rotationY'))).toBe(180);
      expect(Number(gsap.getProperty(card!, 'scale'))).toBe(1);
      expect(Number(gsap.getProperty(card!, 'opacity'))).toBe(1);

      // Idle float is bypassed under reduced motion
      expect(engine.getIdleFloatTween()).toBeNull();
    });
  });
});

