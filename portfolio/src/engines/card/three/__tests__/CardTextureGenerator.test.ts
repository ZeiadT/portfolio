import { describe, it, expect, afterAll, vi } from 'vitest';
import * as THREE from 'three';
import type { CardSummonData, CardSummonTheme } from '@/engines/card/CardSummonEngine';
import { CardTextureGenerator } from '../CardTextureGenerator';

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

    it('integrates the vector cat mask crest and replaces the legacy Ace diamond polygon', () => {
      const svg = CardTextureGenerator.generateGoldenCardBackSvg(mockTheme);

      // Verify the vector cat mask crest path is present
      expect(CardTextureGenerator.CAT_MASK_PATH).toBeDefined();
      expect(svg).toContain(CardTextureGenerator.CAT_MASK_PATH);
      expect(svg).toContain('fill-rule="evenodd"');
      expect(svg).toContain('fill="url(#gold-foil-grad)"');
      expect(svg).toContain('stroke="#ffd700"');
      expect(svg).toContain('stroke-width="2"');

      // Verify old Ace diamond polygon is cleanly removed
      expect(svg).not.toContain('polygon points="0,-126 84,0 0,126 -84,0"');
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
  });
});
