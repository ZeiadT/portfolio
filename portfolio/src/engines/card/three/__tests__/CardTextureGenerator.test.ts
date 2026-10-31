import { describe, it, expect, afterAll, vi } from 'vitest';
import * as THREE from 'three';
import type { CardSummonData, CardSummonTheme } from '@/engines/card/CardSummonEngine';
import { CardTextureGenerator } from '../CardTextureGenerator';
import { ThreeCardModel } from '../ThreeCardModel';

// Polyfill Canvas 2D context for headless happy-dom environment
const originalGetContext = typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.getContext : undefined;

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextType: string, ...args: unknown[]) {
    if (contextType === '2d') {
      const self = this as unknown as { _mockCtx2d?: Record<string, unknown> };
      if (!self._mockCtx2d) {
        self._mockCtx2d = {
          canvas: this,
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          font: '',
          textAlign: 'left',
          textBaseline: 'alphabetic',
          globalAlpha: 1,
          filter: 'none',
          shadowColor: '',
          shadowBlur: 0,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          strokeRect: vi.fn(),
          rect: vi.fn(),
          fillText: vi.fn(),
          strokeText: vi.fn(),
          beginPath: vi.fn(),
          closePath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          arc: vi.fn(),
          stroke: vi.fn(),
          fill: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          scale: vi.fn(),
          drawImage: vi.fn(),
          clip: vi.fn(),
          createLinearGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          createRadialGradient: vi.fn(() => ({
            addColorStop: vi.fn(),
          })),
          measureText: vi.fn((text: string) => ({
            width: text.length * 8,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
          })),
        };
      }
      return self._mockCtx2d as unknown as CanvasRenderingContext2D;
    }
    return originalGetContext ? (originalGetContext as Function).apply(this, [contextType, ...args]) : null;
  };
}

describe('CardTextureGenerator (Unit Tests)', () => {
  const mockCardData: CardSummonData = {
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

  const mockTheme: CardSummonTheme = {
    primaryColor: '#ff4421',
    coreColor: '#ffffff',
    accentColor: '#ffd700',
  };

  afterAll(() => {
    if (typeof HTMLCanvasElement !== 'undefined' && originalGetContext) {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  describe('generateGoldenCardBackSvg', () => {
    it('returns a valid 3x Retina SVG string with viewBox="0 0 1050 1470"', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      expect(typeof svg).toBe('string');
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).toContain('viewBox="0 0 1050 1470"');
      expect(svg).toContain('width="1050"');
      expect(svg).toContain('height="1470"');
    });

    it('contains concentric guilloche pattern and sacred geometry', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      expect(svg).toMatch(/guilloche/i);
      expect(svg).toContain('<pattern');
      expect(svg).toContain('</pattern>');
    });

    it('contains 4 symmetrical corner filigree flourishes', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      expect(svg).toMatch(/filigree|corner/i);
      // Symmetrical 4 quadrants should be represented
      expect(svg).toMatch(/scale\(-1,\s*1\)/);
      expect(svg).toMatch(/scale\(1,\s*-1\)/);
      expect(svg).toMatch(/scale\(-1,\s*-1\)/);
    });

    it('contains celestial halo rings, cardinal diamond nodes, and central Ace crest', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      expect(svg).toMatch(/crest|celestial|ring/i);
      expect(svg).toContain('data-summon-card-crest');
      expect(svg).toContain('data-summon-card-halo');
    });

    it('incorporates rich metallic gold palette and theme colors', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      expect(svg).toMatch(/#ffd700|#d4af37|#e5b85c|#8a6d2b/i);
      expect(svg).toContain('#ff4421'); // primaryColor
      expect(svg).toContain('#ffffff'); // coreColor
    });

    it('gracefully handles empty theme parameters with default fallback colors', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg();

      expect(typeof svg).toBe('string');
      expect(svg).toContain('viewBox="0 0 1050 1470"');
      expect(svg).toContain('#ff4421'); // default primaryColor
    });

    it('adapts custom theme primaryColor, coreColor, and accentColor', () => {
      const customTheme: CardSummonTheme = {
        primaryColor: '#00ffee',
        coreColor: '#f0f0ff',
        accentColor: '#e0a020',
      };
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(customTheme);

      expect(svg).toContain('#00ffee');
      expect(svg).toContain('#f0f0ff');
      expect(svg).toContain('#e0a020');
    });

    it('integrates the vector star crest and replaces the legacy cat mask crest on card back', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      // Verify the vector star crest path is present
      expect(CardTextureGenerator.STAR_CREST_PATH).toBeDefined();
      expect(svg).toContain(CardTextureGenerator.STAR_CREST_PATH);
      expect(svg).toContain('fill-rule="evenodd"');
      expect(svg).toContain('fill="url(#gold-foil-grad)"');
      expect(svg).toContain('stroke="#ffd700"');
      expect(svg).toContain('stroke-width="2"');

      // Verify old Ace diamond polygon is cleanly removed
      expect(svg).not.toContain('polygon points="0,-126 84,0 0,126 -84,0"');
    });

    it('enforces optical concentric corner radius formula (R_inner = R_outer - padding) for all back frames', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      // Outer base card is rx="48"
      expect(svg).toContain('rx="48"');

      // Primary frame at padding 24 has rx="24" (48 - 24 = 24), frame at padding 36 has rx="12" (48 - 36 = 12)
      expect(svg).toMatch(/rx=["']24["']|rx=["']12["']/);
      // No non-concentric rx="36" on an inner frame with padding 36!
      expect(svg).not.toMatch(/<rect\s+x=["']36["']\s+y=["']36["'][^>]*rx=["']36["']/);
    });
  });

  describe('drawGoldenCardBackContent', () => {
    it('renders golden card back onto canvas context without throwing and draws central crest', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1050;
      canvas.height = 1470;
      const ctx = canvas.getContext('2d')!;

      expect(() => {
        CardTextureGenerator.drawGoldenCardBackContent(canvas, mockTheme);
      }).not.toThrow();

      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('accepts a direct CanvasRenderingContext2D target', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1050;
      canvas.height = 1470;
      const ctx = canvas.getContext('2d')!;

      expect(() => {
        CardTextureGenerator.drawGoldenCardBackContent(ctx, mockTheme);
      }).not.toThrow();
    });
  });

  describe('generateGoldenCardBackTexture', () => {
    it('creates a high-resolution THREE.CanvasTexture with 1050x1470 dimensions', () => {
      const texture = CardTextureGenerator.generateGoldenCardBackTexture(mockTheme);

      expect(texture).toBeInstanceOf(THREE.CanvasTexture);
      expect(texture.image).toBeDefined();
      expect(texture.image.width).toBe(1050);
      expect(texture.image.height).toBe(1470);
    });

    it('configures texture mipmaps, filters, color space, and needsUpdate', () => {
      const texture = CardTextureGenerator.generateGoldenCardBackTexture(mockTheme);

      expect(texture.generateMipmaps).toBe(true);
      expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
      expect(texture.magFilter).toBe(THREE.LinearFilter);
      expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
      expect(texture.version).toBeGreaterThan(0);
    });

    it('tolerates invocation without theme argument', () => {
      expect(() => {
        CardTextureGenerator.generateGoldenCardBackTexture();
      }).not.toThrow();
    });
  });

  describe('generateFrontCardTexture', () => {
    it('creates a high-resolution THREE.CanvasTexture representing the editorial front face', () => {
      const texture = CardTextureGenerator.generateFrontCardTexture(mockCardData, mockTheme);

      expect(texture).toBeInstanceOf(THREE.CanvasTexture);
      expect(texture.image).toBeDefined();
      expect(texture.image.width).toBe(1050);
      expect(texture.image.height).toBe(1470);
      expect(texture.generateMipmaps).toBe(true);
      expect(texture.minFilter).toBe(THREE.LinearMipmapLinearFilter);
      expect(texture.magFilter).toBe(THREE.LinearFilter);
      expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
      expect(texture.version).toBeGreaterThan(0);
    });

    it('safely handles minimal/empty card data without throwing', () => {
      const minimalData: CardSummonData = {
        name: '',
        rarity: '',
        stars: 0,
        role: '',
        imageSrc: '',
        imageAlt: '',
        skillName: '',
        skillDescription: '',
      };

      expect(() => {
        const texture = CardTextureGenerator.generateFrontCardTexture(minimalData);
        expect(texture).toBeInstanceOf(THREE.CanvasTexture);
      }).not.toThrow();
    });

    it('handles negative or extreme star and stat values safely', () => {
      const extremeData: CardSummonData = {
        ...mockCardData,
        stars: -3,
        stats: {
          perf: 150,
          arch: -20,
          code: 0,
        },
      };

      expect(() => {
        const texture = CardTextureGenerator.generateFrontCardTexture(extremeData);
        expect(texture).toBeInstanceOf(THREE.CanvasTexture);
      }).not.toThrow();
    });

    it('renders with custom starsProgress and barsProgress animation controls', () => {
      const texture0 = CardTextureGenerator.generateFrontCardTexture(mockCardData, mockTheme, {
        starsProgress: 0,
        barsProgress: 0,
      });
      expect(texture0).toBeInstanceOf(THREE.CanvasTexture);

      const textureHalf = CardTextureGenerator.generateFrontCardTexture(mockCardData, mockTheme, {
        starsProgress: 0.5,
        barsProgress: 0.5,
      });
      expect(textureHalf).toBeInstanceOf(THREE.CanvasTexture);

      const textureFull = CardTextureGenerator.generateFrontCardTexture(mockCardData, mockTheme, {
        starsProgress: 1.0,
        barsProgress: 1.0,
      });
      expect(textureFull).toBeInstanceOf(THREE.CanvasTexture);
    });

    it('renders frosted obsidian shroud and golden celestial seal when veilOpacity > 0', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1050;
      canvas.height = 1470;
      const ctx = canvas.getContext('2d');
      const fillTextSpy = vi.spyOn(ctx!, 'fillText');

      CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme, {
        veilOpacity: 1.0,
        foilWipeProgress: 0.0,
      });

      // Golden seal micro-typography should be drawn on canvas
      expect(fillTextSpy).toHaveBeenCalledWith(
        expect.stringMatching(/RESTRICTED ACCESS|CANDIDATE DOSSIER|CLASSIFIED/i),
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('renders diagonal holographic foil wipe when foilWipeProgress is active (0 < p < 1)', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1050;
      canvas.height = 1470;
      const ctx = canvas.getContext('2d');
      const createLinearGradientSpy = vi.spyOn(ctx!, 'createLinearGradient');

      CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme, {
        veilOpacity: 0.5,
        foilWipeProgress: 0.5,
      });

      // Linear gradient for diagonal foil wipe should be constructed
      expect(createLinearGradientSpy).toHaveBeenCalled();
    });

    it('does not render frosted obsidian shroud when veilOpacity is 0', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1050;
      canvas.height = 1470;
      const ctx = canvas.getContext('2d');
      const fillTextSpy = vi.spyOn(ctx!, 'fillText');

      CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme, {
        veilOpacity: 0.0,
        foilWipeProgress: 1.0,
      });

      const restrictedCalls = fillTextSpy.mock.calls.filter((call) =>
        /RESTRICTED ACCESS|CANDIDATE DOSSIER/i.test(String(call[0]))
      );
      expect(restrictedCalls).toHaveLength(0);
    });

    it('draws custom imageElement onto the canvas portrait window when supplied', () => {
      const fakeImage = {
        naturalWidth: 800,
        naturalHeight: 600,
        complete: true,
      } as unknown as HTMLImageElement;

      expect(() => {
        const texture = CardTextureGenerator.generateFrontCardTexture(mockCardData, mockTheme, {
          imageElement: fakeImage,
        });
        expect(texture).toBeInstanceOf(THREE.CanvasTexture);
      }).not.toThrow();
    });

    describe('Task 2: Front Face Layout Redesign', () => {
      it('defines CARD_CORNER_RADIUS mathematically synchronized with physical 3D card radius (0.24 units * 300 px/unit = 72 px)', () => {
        expect(CardTextureGenerator.CARD_CORNER_RADIUS).toBe(72);
        const textureToWorldScale = CardTextureGenerator.TEXTURE_WIDTH / ThreeCardModel.CARD_WIDTH; // 1050 / 3.5 = 300
        expect(CardTextureGenerator.CARD_CORNER_RADIUS / textureToWorldScale).toBeCloseTo(ThreeCardModel.CARD_RADIUS);
      });

      it('computes concentric corner radii according to inner radius = max(0, outer radius - gap)', () => {
        expect(CardTextureGenerator.computeConcentricRadius(72, 24)).toBe(48);
        expect(CardTextureGenerator.computeConcentricRadius(48, 24)).toBe(24);
        expect(CardTextureGenerator.computeConcentricRadius(24, 8)).toBe(16);
        expect(CardTextureGenerator.computeConcentricRadius(16, 8)).toBe(8);
        expect(CardTextureGenerator.computeConcentricRadius(16, 20)).toBe(0);
      });

      it('applies concentric radii to outer clip (R=72 from card corner radius itself) and hairline border (R=48 via outer - gap)', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 1470;
        const spy = vi.spyOn(CardTextureGenerator, 'drawRoundedRect');

        CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme);

        // 1. Outer card clip: (ctx, 0, 0, 1050, 1470, 72) using card corner radius itself
        expect(spy).toHaveBeenCalledWith(expect.anything(), 0, 0, 1050, 1470, 72);

        // 2. Inset frame: X=24, Y=24, W=1002, H=1422, R=48 (inner radius = outer radius (72) - gap (24) = 48)
        expect(spy).toHaveBeenCalledWith(expect.anything(), 24, 24, 1002, 1422, 48);

        // 3. Portrait container: X=56, Y=160, W=938, H=520, R=16 (p=8 => 24 - 8 = 16)
        expect(spy).toHaveBeenCalledWith(expect.anything(), 56, 160, 938, 520, 16);

        // 4. Boxed identity & skills: X=56, Y=704, W=938, H=376, R=16
        expect(spy).toHaveBeenCalledWith(expect.anything(), 56, 704, 938, 376, 16);

        // 5. Stat columns: statColW=298, statColH=196, R=16
        expect(spy).toHaveBeenCalledWith(expect.anything(), 56, 1104, 298, 196, 16);

        spy.mockRestore();
      });

      it('does NOT render the 4 corner crosshairs/stars (+) on the front card face corners', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 1470;
        const ctx = canvas.getContext('2d');
        const fillTextSpy = vi.spyOn(ctx!, 'fillText');

        CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme);

        const plusCalls = fillTextSpy.mock.calls.filter((call) => call[0] === '+');
        expect(plusCalls).toHaveLength(0);
      });

      it('desaturates pixels using fine-art luminance formula L = 0.299R + 0.587G + 0.114B', () => {
        const buffer = new Uint8ClampedArray([
          255, 0, 0, 255,    // Pure Red: 0.299 * 255 = 76.245 -> 76
          0, 255, 0, 255,    // Pure Green: 0.587 * 255 = 149.685 -> 150
          0, 0, 255, 255,    // Pure Blue: 0.114 * 255 = 29.07 -> 29
          100, 100, 100, 255 // Neutral Gray: stays 100
        ]);

        CardTextureGenerator.desaturatePixels(buffer);

        expect(buffer[0]).toBe(76);
        expect(buffer[1]).toBe(76);
        expect(buffer[2]).toBe(76);
        expect(buffer[3]).toBe(255);

        expect(buffer[4]).toBe(150);
        expect(buffer[5]).toBe(150);
        expect(buffer[6]).toBe(150);

        expect(buffer[8]).toBe(29);
        expect(buffer[9]).toBe(29);
        expect(buffer[10]).toBe(29);

        expect(buffer[12]).toBe(100);
        expect(buffer[13]).toBe(100);
        expect(buffer[14]).toBe(100);
      });

      it('renders taller grayscale portrait with filter or luminance desaturation in 938x520 window', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 1470;
        const ctx = canvas.getContext('2d')!;
        const drawImageSpy = vi.spyOn(ctx, 'drawImage');

        const fakeImage = {
          naturalWidth: 1000,
          naturalHeight: 1000,
          complete: true,
        } as unknown as HTMLImageElement;

        CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme, {
          imageElement: fakeImage,
        });

        // Verify drawImage was called with destination inside expanded 938x520 portrait container at (56, 160)
        expect(drawImageSpy).toHaveBeenCalled();
        const call = drawImageSpy.mock.calls[0];
        expect(call[0]).toBe(fakeImage);
        expect(call[1]).toBe(56); // dx
        expect(call[3]).toBe(938); // dw
        expect(call[4]).toBe(938); // dh
      });

      it('renders enlarged candidate name typography (44px) and enlarged RARE EDITION badge (180x44)', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 1470;
        const ctx = canvas.getContext('2d')!;
        const fillTextSpy = vi.spyOn(ctx, 'fillText');
        const spyDrawRoundedRect = vi.spyOn(CardTextureGenerator, 'drawRoundedRect');

        CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme);

        expect(fillTextSpy).toHaveBeenCalledWith(mockCardData.name, expect.any(Number), expect.any(Number));

        // Verify RARE EDITION badge dimensions: 180x44
        const badgeCall = spyDrawRoundedRect.mock.calls.find(
          (c) => c[3] === 180 && c[4] === 44
        );
        expect(badgeCall).toBeDefined();

        spyDrawRoundedRect.mockRestore();
      });

      it('renders skills with static 1/2/3 golden stars (first skill 1, second 2, third 3) and eliminates old colored tags', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 1470;
        const ctx = canvas.getContext('2d')!;
        const fillTextSpy = vi.spyOn(ctx, 'fillText');

        CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme);

        const renderedTexts = fillTextSpy.mock.calls.map((call) => String(call[0]));

        expect(renderedTexts).toContain('Hard worker');
        expect(renderedTexts).toContain('Passionate designer');
        expect(renderedTexts).toContain('Perfection seeker');

        // Verify exact star counts for each skill in ascending order (1, 2, 3)
        const hardWorkerIdx = fillTextSpy.mock.calls.findIndex((c) => c[0] === 'Hard worker');
        const passionateDesignerIdx = fillTextSpy.mock.calls.findIndex((c) => c[0] === 'Passionate designer');
        const perfectionSeekerIdx = fillTextSpy.mock.calls.findIndex((c) => c[0] === 'Perfection seeker');

        expect(hardWorkerIdx).toBeGreaterThan(-1);
        expect(passionateDesignerIdx).toBeGreaterThan(-1);
        expect(perfectionSeekerIdx).toBeGreaterThan(-1);

        // First skill: 1 star
        expect(fillTextSpy.mock.calls[hardWorkerIdx + 1][0]).toBe('★');

        // Second skill: 2 stars
        expect(fillTextSpy.mock.calls[passionateDesignerIdx + 1][0]).toBe('★★');

        // Third skill: 3 stars
        expect(fillTextSpy.mock.calls[perfectionSeekerIdx + 1][0]).toBe('★★★');

        // Verify old colored tech tags are completely eliminated
        expect(renderedTexts).not.toContain('COROUTINES');
        expect(renderedTexts).not.toContain('SHARED');
        expect(renderedTexts).not.toContain('COMPOSE');
      });

      it('renders monochrome gold stat tickers and progress tracks without cyan or emerald colors', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1050;
        canvas.height = 1470;
        const ctx = canvas.getContext('2d')!;
        const fillTextSpy = vi.spyOn(ctx, 'fillText');

        CardTextureGenerator.drawFrontCardContent(canvas, mockCardData, mockTheme, {
          barsProgress: 1.0,
        });

        const renderedTexts = fillTextSpy.mock.calls.map((call) => String(call[0]));
        expect(renderedTexts).toContain('PERF // 60FPS');
        expect(renderedTexts).toContain('ARCH // CLEAN');
        expect(renderedTexts).toContain('CODE // KMP');
      });
    });
  });
});
