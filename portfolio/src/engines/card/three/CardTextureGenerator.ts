import * as THREE from 'three';
import type { CardSummonData, CardSummonTheme } from '@/engines/card/CardSummonEngine';
import { CARD_BACK_PATTERN_PATH } from './CardPatternPath';

/**
 * Helper to draw a rounded rectangle path using basic 2D context primitives
 * (beginPath, moveTo, lineTo, arc, closePath) to ensure complete compatibility
 * across headless mock contexts and real browser canvases.
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  CardTextureGenerator.drawRoundedRect(ctx, x, y, w, h, r);
}

export interface FrontCardTextureOptions {
  imageElement?: HTMLImageElement | null;
  starsProgress?: number;
  barsProgress?: number;
  veilOpacity?: number;
  foilWipeProgress?: number;
}

/**
 * CardTextureGenerator
 *
 * Generates high-DPI (3x Retina: 1050x1470) textures and vector SVGs for the physical
 * 3D Three.js card model, including:
 * 1. Opulent gilded metallic gold & obsidian celestial back (SVG & CanvasTexture)
 * 2. Editorial Luxury front card face (CanvasTexture with Swiss typography & stat tickers)
 */
export class CardTextureGenerator {
  public static readonly TEXTURE_WIDTH = 1050;
  public static readonly TEXTURE_HEIGHT = 1470;
  /**
   * Corner radius of the card in texture coordinate space (1050x1470).
   * Synchronized 1:1 with ThreeCardModel.CARD_RADIUS (0.24 units * (1050 / 3.5) = 72 px).
   */
  public static readonly CARD_CORNER_RADIUS = 72;

  /**
   * Vector path for the signature cat mask crest logo from assets/logo.svg.
   * ViewBox 0 0 585 580 (center at 292.5, 290).
   */
  public static readonly CAT_MASK_PATH =
    'M 74.00 104.38 L 461.36 369.00 L 454.00 412.00 L 288.50 524.00 L 122.55 412.00 Z ' +
    'M 503.00 104.38 L 465.51 341.00 L 310.76 236.00 Z ' +
    'M 364.00 374.13 L 378.00 395.64 L 407.00 378.83 L 399.49 411.00 L 380.63 421.00 L 370.00 450.25 L 361.00 430.40 L 349.00 435.44 L 305.60 439.00 L 359.55 407.00 Z ' +
    'M 169.85 379.00 L 176.67 408.00 L 179.00 412.19 L 224.00 434.50 L 271.00 439.42 Z';

  /**
   * Vector path for the signature star emblem with dynamic center swirl from assets/card-crest.svg.
   * ViewBox 0 0 600 600 (center at 300, 300).
   */
  public static readonly STAR_CREST_PATH =
    'M 76.79 418.88 L 161.38 378.22 L 176.38 369.55 L 292.18 311.88 L 242.85 320.88 L 209.38 324.12 L 198.38 323.94 L 192.38 322.50 L 188.38 319.97 L 187.40 316.88 L 187.97 312.88 L 192.25 305.88 L 209.30 289.88 L 237.38 269.55 L 268.38 250.41 L 267.78 251.88 L 242.38 270.24 L 228.35 281.88 L 218.16 293.88 L 216.71 300.88 L 218.38 303.46 L 223.38 305.57 L 233.38 305.81 L 257.38 299.12 L 278.23 289.88 L 279.13 288.88 L 277.38 288.30 L 255.38 290.96 L 250.38 289.99 L 248.01 286.88 L 252.25 279.88 L 261.55 271.88 L 351.88 207.88 L 313.51 113.88 L 310.79 107.88 L 306.88 103.88 L 298.38 101.49 L 292.01 103.88 L 288.38 107.98 L 240.28 224.88 L 233.38 232.20 L 225.38 235.11 L 103.38 243.71 L 98.38 245.16 L 94.38 248.88 L 91.89 256.88 L 92.26 260.88 L 94.72 264.88 L 157.66 319.88 L 163.41 327.88 L 164.05 333.88 L 161.45 340.88 L 151.38 352.88 L 137.38 365.41 L 82.38 409.39 L 73.25 418.88 L 76.79 418.88 Z ' +
    'M 423.42 497.88 L 427.38 496.14 L 431.60 491.88 L 433.00 488.88 L 433.28 483.88 L 406.34 370.88 L 405.86 364.88 L 407.18 355.88 L 410.81 347.88 L 416.78 340.88 L 504.57 264.88 L 507.42 258.88 L 507.66 254.88 L 505.38 249.27 L 499.38 244.34 L 451.66 239.88 L 517.38 190.46 L 524.07 184.88 L 526.38 181.17 L 521.43 181.88 L 512.38 185.50 L 362.38 251.54 L 330.38 266.34 L 308.47 277.88 L 362.38 268.50 L 393.38 268.37 L 406.38 271.47 L 413.38 275.64 L 417.23 281.88 L 417.80 290.88 L 416.26 296.88 L 410.91 304.88 L 402.51 312.88 L 391.38 320.57 L 402.89 307.88 L 405.90 302.88 L 407.16 295.88 L 404.38 291.11 L 398.38 287.59 L 385.38 284.72 L 358.40 284.88 L 367.38 289.77 L 370.76 292.88 L 371.50 299.88 L 368.50 305.88 L 362.73 312.88 L 345.38 328.11 L 321.38 345.15 L 285.38 367.59 L 242.38 392.10 L 180.96 424.88 L 176.93 436.88 L 165.89 484.88 L 167.15 490.88 L 171.47 495.88 L 178.38 498.53 L 184.38 497.27 L 290.38 432.81 L 296.38 429.46 L 301.38 429.20 L 307.38 431.52 L 414.38 497.03 L 418.38 498.43 L 423.42 497.88 Z';

  /**
   * Vector path for the etched card background doodle pattern.
   * ViewBox 0 0 736 1104.
   */
  public static readonly CARD_BACK_PATTERN_PATH = CARD_BACK_PATTERN_PATH;

  /**
   * Helper to draw a rounded rectangle path using basic 2D context primitives
   * (beginPath, moveTo, lineTo, arc, closePath) to ensure complete compatibility
   * across headless mock contexts and real browser canvases.
   */
  public static drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arc(x + w - radius, y + radius, radius, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arc(x + w - radius, y + h - radius, radius, 0, Math.PI / 2);
    ctx.lineTo(x + radius, y + h);
    ctx.arc(x + radius, y + h - radius, radius, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, (3 * Math.PI) / 2);
    ctx.closePath();
  }

  /**
   * Computes concentric inner corner radius using optical math:
   * inner radius = max(0, outer radius - gap)
   */
  public static computeConcentricRadius(outerRadius: number, gap: number): number {
    return Math.max(0, outerRadius - gap);
  }

  /**
   * Applies fine-art grayscale desaturation formula L = 0.299R + 0.587G + 0.114B to pixel buffer.
   */
  public static desaturatePixels(data: Uint8ClampedArray | number[]): void {
    for (let i = 0; i < data.length; i += 4) {
      const l = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = l;
      data[i + 1] = l;
      data[i + 2] = l;
    }
  }

  /**
   * Generates a high-resolution (1050x1470) SVG string for the golden card back.
   * Features:
   * - Faded metallic etched doodle pattern with tactile deboss shadow
   * - Radial fade-out mask smoothly clearing space around the central crest
   * - Centered signature star logo with vibrant multi-tier golden glow aura
   * - Gilded metallic gold border frames with concentric corner radii
   */
  public static generateGoldenCardBackSvg(theme: CardSummonTheme = {}): string {
    const primaryColor = theme.primaryColor ?? '#ff4421';
    const coreColor = theme.coreColor ?? '#ffffff';
    const accentColor = theme.accentColor ?? '#ffd700';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 1470" width="1050" height="1470" fill="none">
  <defs>
    <!-- Obsidian Card Core Gradient -->
    <radialGradient id="gold-back-bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#141419" />
      <stop offset="60%" stop-color="#0a0a0d" />
      <stop offset="100%" stop-color="#050507" />
    </radialGradient>

    <!-- Metallic Gilded Gold Foil Gradient -->
    <linearGradient id="gold-foil-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
      <stop offset="12%" stop-color="#ffd700" />
      <stop offset="35%" stop-color="#e5b85c" />
      <stop offset="60%" stop-color="#d4af37" />
      <stop offset="85%" stop-color="#ffaa00" />
      <stop offset="100%" stop-color="#8a6d2b" />
    </linearGradient>

    <!-- Radiant Gold Rim Accent -->
    <linearGradient id="gold-rim-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8a6d2b" />
      <stop offset="40%" stop-color="#ffd700" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#e5b85c" />
      <stop offset="100%" stop-color="#d4af37" />
    </linearGradient>

    <!-- Theme Energy Palette Integration -->
    <linearGradient id="primary-energy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.9" />
      <stop offset="50%" stop-color="${coreColor}" stop-opacity="1" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.9" />
    </linearGradient>

    <!-- Mysterious Dark Obsidian Etched Pattern Gradient (Black-on-Black Debossed Engraving) -->
    <linearGradient id="dark-etched-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050508" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#030305" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#020204" stop-opacity="0.85" />
    </linearGradient>

    <!-- Reflective Golden Paper Foil Gradient with Specular Sheen Peak -->
    <linearGradient id="gold-paper-foil-grad" x1="15%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#735518" />
      <stop offset="18%" stop-color="#b88d2c" />
      <stop offset="35%" stop-color="#fdf0a6" />
      <stop offset="48%" stop-color="#ffffff" />
      <stop offset="55%" stop-color="#fff4b8" />
      <stop offset="72%" stop-color="#cda036" />
      <stop offset="88%" stop-color="#8f6b1e" />
      <stop offset="100%" stop-color="#5a4110" />
    </linearGradient>

    <!-- Tactile Golden Paper Emboss / Deboss Drop Shadow (No Neon Bloom Glow) -->
    <filter id="gold-paper-emboss" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3.5" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.85" />
    </filter>

    <!-- Smooth Continuous Inward Radial Fade Mask: Naturally dissipates toward the logo without hard crop -->
    <radialGradient id="pattern-radial-fade-grad" cx="525" cy="735" r="580" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#000000" />
      <stop offset="15%" stop-color="#141414" />
      <stop offset="35%" stop-color="#454545" />
      <stop offset="60%" stop-color="#8a8a8a" />
      <stop offset="85%" stop-color="#d0d0d0" />
      <stop offset="100%" stop-color="#ffffff" />
    </radialGradient>
    <mask id="card-pattern-radial-mask">
      <rect width="1050" height="1470" fill="url(#pattern-radial-fade-grad)" />
    </mask>
  </defs>

  <!-- Obsidian Base Surface (1050x1470, R=72 synchronized with CARD_CORNER_RADIUS) -->
  <rect width="1050" height="1470" rx="${CardTextureGenerator.CARD_CORNER_RADIUS}" fill="url(#gold-back-bg)" />

  <!-- Outer Gilded Metallic Borders (Concentric: R_inner = 72 - padding => 48, 36, 30) -->
  <g data-summon-card-back-frame="true">
    <rect x="24" y="24" width="1002" height="1422" rx="48" fill="none" stroke="url(#gold-foil-grad)" stroke-width="4.5" />
    <rect x="36" y="36" width="978" height="1398" rx="36" fill="none" stroke="#ffd700" stroke-opacity="0.45" stroke-width="2.5" stroke-dasharray="16 10" />
    <rect x="42" y="42" width="966" height="1386" rx="30" fill="none" stroke="#d4af37" stroke-opacity="0.25" stroke-width="1.5" />
  </g>

  <!-- Etched Doodle Pattern Background with Smooth Inward Radial Fade (Black-on-Black) -->
  <g data-summon-card-etched-pattern="true" mask="url(#card-pattern-radial-mask)">
    <!-- Debossed shadow groove pass -->
    <path d="${CardTextureGenerator.CARD_BACK_PATTERN_PATH}" transform="translate(1.5, -51) scale(1.42663)" fill="#000000" fill-opacity="0.85" fill-rule="evenodd" />
    <!-- Mysterious Dark Obsidian etched stroke pass -->
    <path d="${CardTextureGenerator.CARD_BACK_PATTERN_PATH}" transform="translate(0, -52.5) scale(1.42663)" fill="url(#dark-etched-grad)" fill-rule="evenodd" />
  </g>

  <!-- Central Reflective Golden Paper Star Crest (Tactile Emboss without Neon Bloom) -->
  <g data-summon-card-crest="true" filter="url(#gold-paper-emboss)">
    <path d="${CardTextureGenerator.STAR_CREST_PATH}" transform="translate(525, 735) scale(0.528) translate(-300, -300)" fill="url(#gold-paper-foil-grad)" stroke="#ffd700" stroke-width="1.3636" fill-rule="evenodd" />
  </g>
</svg>`;
  }

  /**
   * Draws the gilded golden card back content onto a canvas or 2D context.
   */
  public static drawGoldenCardBackContent(
    target: HTMLCanvasElement | CanvasRenderingContext2D,
    _theme: CardSummonTheme = {}
  ): void {
    const ctx = 'getContext' in target ? target.getContext('2d') : target;
    if (!ctx) return;

    ctx.save();

    // Rounded clip boundary (1050x1470, R=72 synchronized with CARD_CORNER_RADIUS)
    drawRoundedRect(ctx, 0, 0, 1050, 1470, CardTextureGenerator.CARD_CORNER_RADIUS);
    if (typeof ctx.clip === 'function') {
      ctx.clip();
    }

    // 1. Dark Obsidian Gradient Surface
    const bgGrad = ctx.createRadialGradient(525, 735, 120, 525, 735, 800);
    bgGrad.addColorStop(0, '#141419');
    bgGrad.addColorStop(0.65, '#0a0a0d');
    bgGrad.addColorStop(1, '#050507');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1050, 1470);

    // 2. Faded Metallic Etched Pattern with Radial Fade-Out around Center Crest
    ctx.save();
    const patternScale = 1.42663;
    const patternOffsetY = (1470 - 1104 * patternScale) / 2; // -52.5

    if (typeof Path2D !== 'undefined') {
      try {
        const patternPath = new Path2D(CardTextureGenerator.CARD_BACK_PATTERN_PATH);

        // Mysterious Dark Obsidian Etched Palette (Black-on-Black Debossed Engraving)
        const darkEtchedGrad = ctx.createLinearGradient(0, 0, 1050, 1470);
        darkEtchedGrad.addColorStop(0, 'rgba(5, 5, 8, 0.95)');
        darkEtchedGrad.addColorStop(0.5, 'rgba(3, 3, 5, 0.9)');
        darkEtchedGrad.addColorStop(1, 'rgba(2, 2, 4, 0.85)');

        // Pass A: Debossed inner groove (tactile engraved depth)
        ctx.save();
        ctx.translate(1.5, patternOffsetY + 1.5);
        ctx.scale(patternScale, patternScale);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        if (typeof (ctx as unknown as { fill: (p: Path2D, fillRule?: CanvasFillRule) => void }).fill === 'function') {
          (ctx as unknown as { fill: (p: Path2D, fillRule?: CanvasFillRule) => void }).fill(patternPath, 'evenodd');
        }
        ctx.restore();

        // Pass B: Mysterious Dark Obsidian stroke pass
        ctx.save();
        ctx.translate(0, patternOffsetY);
        ctx.scale(patternScale, patternScale);
        ctx.fillStyle = darkEtchedGrad;
        if (typeof (ctx as unknown as { fill: (p: Path2D, fillRule?: CanvasFillRule) => void }).fill === 'function') {
          (ctx as unknown as { fill: (p: Path2D, fillRule?: CanvasFillRule) => void }).fill(patternPath, 'evenodd');
        }
        ctx.restore();

        // Smooth Continuous Inward Radial Fade Mask (Naturally dissipates toward the logo without hard crop)
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        const radialFade = ctx.createRadialGradient(525, 735, 0, 525, 735, 580);
        radialFade.addColorStop(0, 'rgba(0, 0, 0, 1)');
        radialFade.addColorStop(0.15, 'rgba(0, 0, 0, 0.9)');
        radialFade.addColorStop(0.35, 'rgba(0, 0, 0, 0.65)');
        radialFade.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
        radialFade.addColorStop(0.85, 'rgba(0, 0, 0, 0.1)');
        radialFade.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radialFade;
        ctx.fillRect(0, 0, 1050, 1470);
        ctx.restore();
      } catch {
        // Fallback for headless environments without full Path2D support
      }
    }
    ctx.restore();

    // 3. Multi-tier Gilded Gold Borders (concentric: R_inner = R_outer - padding)
    const goldFoil = ctx.createLinearGradient(0, 0, 1050, 1470);
    goldFoil.addColorStop(0, '#ffffff');
    goldFoil.addColorStop(0.15, '#ffd700');
    goldFoil.addColorStop(0.5, '#d4af37');
    goldFoil.addColorStop(0.85, '#ffaa00');
    goldFoil.addColorStop(1, '#8a6d2b');

    ctx.strokeStyle = goldFoil;
    ctx.lineWidth = 4.5;
    drawRoundedRect(ctx, 24, 24, 1002, 1422, CardTextureGenerator.computeConcentricRadius(CardTextureGenerator.CARD_CORNER_RADIUS, 24)); // 48
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, 36, 36, 978, 1398, CardTextureGenerator.computeConcentricRadius(CardTextureGenerator.CARD_CORNER_RADIUS, 36)); // 36
    ctx.stroke();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 42, 42, 966, 1386, CardTextureGenerator.computeConcentricRadius(CardTextureGenerator.CARD_CORNER_RADIUS, 42)); // 30
    ctx.stroke();

    // 4. Central Star Crest (Tactile Reflective Golden Paper Emblem without Neon Halo)
    ctx.save();
    ctx.translate(525, 735);

    // Reflective golden paper foil gradient with high specular sheen peak
    const goldPaperFoil = ctx.createLinearGradient(-150, -150, 150, 150);
    goldPaperFoil.addColorStop(0, '#735518');
    goldPaperFoil.addColorStop(0.18, '#b88d2c');
    goldPaperFoil.addColorStop(0.35, '#fdf0a6');
    goldPaperFoil.addColorStop(0.48, '#ffffff');
    goldPaperFoil.addColorStop(0.55, '#fff4b8');
    goldPaperFoil.addColorStop(0.72, '#cda036');
    goldPaperFoil.addColorStop(0.88, '#8f6b1e');
    goldPaperFoil.addColorStop(1, '#5a4110');

    ctx.save();
    ctx.scale(0.528, 0.528);
    ctx.translate(-300, -300);
    ctx.fillStyle = goldPaperFoil;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.3636;
    // Tactile physical paper deboss / drop shadow underneath (zero neon glow blur)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3.5;

    if (typeof Path2D !== 'undefined') {
      try {
        const path = new Path2D(CardTextureGenerator.STAR_CREST_PATH);
        if (typeof (ctx as unknown as { fill: (p: Path2D, fillRule?: CanvasFillRule) => void }).fill === 'function') {
          (ctx as unknown as { fill: (p?: Path2D, fillRule?: CanvasFillRule) => void }).fill(path, 'evenodd');
        }
        if (typeof (ctx as unknown as { stroke: (p?: Path2D) => void }).stroke === 'function') {
          (ctx as unknown as { stroke: (p?: Path2D) => void }).stroke(path);
        }
      } catch {
        ctx.fill();
      }
    } else {
      ctx.fill();
    }
    ctx.restore();

    ctx.restore();
    ctx.restore();
  }

  /**
   * Generates a high-DPI THREE.CanvasTexture for the golden card back.
   * Renders high-detail gilded geometry directly onto an HTML5 Canvas, ensuring
   * immediate synchronous readiness without asynchronous image decoding hiccups.
   */
  public static generateGoldenCardBackTexture(
    theme: CardSummonTheme = {},
    existingCanvas?: HTMLCanvasElement
  ): THREE.CanvasTexture {
    const canvas = existingCanvas ?? document.createElement('canvas');
    if (!existingCanvas) {
      canvas.width = CardTextureGenerator.TEXTURE_WIDTH;
      canvas.height = CardTextureGenerator.TEXTURE_HEIGHT;
    }

    CardTextureGenerator.drawGoldenCardBackContent(canvas, theme);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Generates a high-DPI THREE.CanvasTexture rendering the Editorial Luxury Card Face.
   * Layout features:
   * - Crisp dark background (#0a0a0e) with subtle gradient and hairline border frame
   * - Header: Golden role title, golden stars, and technical coordinates
   * - Portrait window: duotone framed container with corner index stamp
   * - Boxed identity & skills: candidate name, Rare Edition badge, and 3 icon skills
   * - Attribute stats: PERF // 60FPS, ARCH // CLEAN, CODE // KMP with progress bars
   * - Accreditation footer
   */
  public static generateFrontCardTexture(
    data: CardSummonData,
    theme: CardSummonTheme = {},
    options: FrontCardTextureOptions = {},
    existingCanvas?: HTMLCanvasElement
  ): THREE.CanvasTexture {
    const canvas = existingCanvas ?? document.createElement('canvas');
    if (!existingCanvas) {
      canvas.width = CardTextureGenerator.TEXTURE_WIDTH;
      canvas.height = CardTextureGenerator.TEXTURE_HEIGHT;
    }

    CardTextureGenerator.drawFrontCardContent(canvas, data, theme, options);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Draws the front card content onto a 2D canvas context.
   */
  public static drawFrontCardContent(
    canvas: HTMLCanvasElement,
    data: CardSummonData,
    _theme: CardSummonTheme = {},
    options: FrontCardTextureOptions = {}
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const roleTitle = data.role || 'Mobile Developer';
      const candidateName = data.name || 'Anonymous Candidate';
      const starCount = Math.max(0, Math.floor(data.stars ?? 5));
      const perfScore = Math.min(100, Math.max(0, data.stats?.perf ?? 99));
      const archScore = Math.min(100, Math.max(0, data.stats?.arch ?? 98));
      const codeScore = Math.min(100, Math.max(0, data.stats?.code ?? 95));

      ctx.save();

      // Concentric outer card clip (1050x1470, R=72 matches physical 3D card corner radius)
      const outerRadius = CardTextureGenerator.CARD_CORNER_RADIUS;
      CardTextureGenerator.drawRoundedRect(ctx, 0, 0, 1050, 1470, outerRadius);
      if (typeof ctx.clip === 'function') {
        ctx.clip();
      }

      // 1. Dark Obsidian Gradient Surface matching the back side
      const bgGrad = ctx.createRadialGradient(525, 735, 120, 525, 735, 800);
      bgGrad.addColorStop(0, '#08080b');
      bgGrad.addColorStop(0.5, '#040406');
      bgGrad.addColorStop(1, '#010102');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1050, 1470);

      // 2. Monoline Hairline Border Frame with Corner Crosshairs
      // inner radius = outer radius - gap = 72 - 24 = 48
      const borderGap = 24;
      const borderInnerRadius = CardTextureGenerator.computeConcentricRadius(outerRadius, borderGap);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.lineWidth = 1.5;
      CardTextureGenerator.drawRoundedRect(
        ctx,
        borderGap,
        borderGap,
        1050 - 2 * borderGap,
        1470 - 2 * borderGap,
        borderInnerRadius
      );
      ctx.stroke();

      // 3. Header Block
      // Left Role Title with Primary Color Indicator Orb
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(58, 86, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 26px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fef08a'; // Amber-200 warm gold
      ctx.fillText(roleTitle.toUpperCase(), 76, 86);

      // Right Stars (with animated sequential illumination in warm gold)
      const starsProgress = Math.max(0, Math.min(1, options.starsProgress ?? 1.0));
      const litCount = Math.min(starCount, Math.max(0, Math.round(starsProgress * starCount)));
      const unlitCount = Math.max(0, starCount - litCount);

      ctx.font = '26px sans-serif';
      ctx.textAlign = 'right';

      if (unlitCount === 0) {
        ctx.fillStyle = '#ffd700';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctx.shadowBlur = 8;
        ctx.fillText('★'.repeat(starCount), 992, 86);
        ctx.shadowBlur = 0;
      } else {
        const dimStr = '★'.repeat(unlitCount);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
        ctx.shadowBlur = 0;
        ctx.fillText(dimStr, 992, 86);

        if (litCount > 0) {
          const dimWidth = ctx.measureText(dimStr).width;
          ctx.fillStyle = '#ffd700';
          ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
          ctx.shadowBlur = 8;
          ctx.fillText('★'.repeat(litCount), 992 - dimWidth, 86);
          ctx.shadowBlur = 0;
        }
      }

      // Technical Coordinates Subheader
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.textAlign = 'left';
      ctx.fillText('SPEC: 5x7 ARCHIVE', 50, 124);
      ctx.textAlign = 'right';
      ctx.fillText('LAT: 30.04° N // LON: 31.23° E', 992, 124);

      // 4. Portrait Window Container (X=56, Y=160, W=938, H=520, p=8 => R=16)
      const portraitX = 56;
      const portraitY = 160;
      const portraitW = 938;
      const portraitH = 520;
      const portraitR = 16;

      ctx.save();
      CardTextureGenerator.drawRoundedRect(ctx, portraitX, portraitY, portraitW, portraitH, portraitR);
      if (typeof ctx.clip === 'function') {
        ctx.clip();
      }

      // Duotone background inside portrait
      const portraitGrad = ctx.createLinearGradient(0, portraitY, 0, portraitY + portraitH);
      portraitGrad.addColorStop(0, '#040406');
      portraitGrad.addColorStop(1, '#010102');
      ctx.fillStyle = portraitGrad;
      ctx.fillRect(portraitX, portraitY, portraitW, portraitH);

      const img = options.imageElement;
      if (img && img.complete && img.naturalWidth > 0) {
        // Draw user photograph cover-fit inside portrait window
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const boxRatio = portraitW / portraitH;
        let dw = portraitW;
        let dh = portraitH;
        let dx = portraitX;
        let dy = portraitY;
        if (imgRatio > boxRatio) {
          dw = portraitH * imgRatio;
          dx = portraitX + (portraitW - dw) / 2;
        } else {
          dh = portraitW / imgRatio;
          const faceOffsetY = (portraitH - dh) * 0.20;
          dy = portraitY + faceOffsetY;
        }

        const hasNativeFilter = 'filter' in ctx && typeof ctx.filter === 'string';
        ctx.save();
        if (hasNativeFilter) {
          ctx.filter = 'grayscale(100%)';
        }
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        // Pixel luminance grayscale desaturation fallback only when native filter is unsupported
        if (!hasNativeFilter) {
          try {
            if (typeof ctx.getImageData === 'function' && typeof ctx.putImageData === 'function') {
              const imgData = ctx.getImageData(portraitX, portraitY, portraitW, portraitH);
              CardTextureGenerator.desaturatePixels(imgData.data);
              ctx.putImageData(imgData, portraitX, portraitY);
            }
          } catch {
            // Silently ignore cross-origin taint
          }
        }

        // Soft dark vignette overlay
        const vignette = ctx.createLinearGradient(0, portraitY, 0, portraitY + portraitH);
        vignette.addColorStop(0, 'rgba(8, 8, 12, 0.25)');
        vignette.addColorStop(0.7, 'rgba(8, 8, 12, 0.15)');
        vignette.addColorStop(1, 'rgba(1, 1, 2, 0.85)');
        ctx.fillStyle = vignette;
        ctx.fillRect(portraitX, portraitY, portraitW, portraitH);
      } else {
        // Stylized Portrait Silhouette / Technical Geometry Fallback
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.08)';
        ctx.lineWidth = 1.5;
        for (let r = 60; r <= 240; r += 40) {
          ctx.beginPath();
          ctx.arc(portraitX + portraitW / 2, portraitY + portraitH / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Central Architectural Diamond Node
        ctx.fillStyle = 'rgba(255, 215, 0, 0.04)';
        ctx.beginPath();
        ctx.moveTo(portraitX + portraitW / 2, portraitY + 130);
        ctx.lineTo(portraitX + portraitW / 2 + 100, portraitY + portraitH / 2);
        ctx.lineTo(portraitX + portraitW / 2, portraitY + portraitH - 130);
        ctx.lineTo(portraitX + portraitW / 2 - 100, portraitY + portraitH / 2);
        ctx.closePath();
        ctx.fill();
      }

      // Portrait Hairline Border
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.lineWidth = 1.5;
      CardTextureGenerator.drawRoundedRect(ctx, portraitX, portraitY, portraitW, portraitH, portraitR);
      ctx.stroke();

      // Corner Catalog Index Stamp (concentric R=8)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      CardTextureGenerator.drawRoundedRect(ctx, portraitX + portraitW - 164, portraitY + portraitH - 46, 150, 34, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
      ctx.lineWidth = 1;
      CardTextureGenerator.drawRoundedRect(ctx, portraitX + portraitW - 164, portraitY + portraitH - 46, 150, 34, 8);
      ctx.stroke();

      ctx.fillStyle = '#fcd34d';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('INDEX: 01 // CV', portraitX + portraitW - 89, portraitY + portraitH - 29);

      ctx.restore();

      // 5. Boxed Identity & Skills Container (X=56, Y=704, W=938, H=376, R=16)
      const boxX = 56;
      const boxY = 704;
      const boxW = 938;
      const boxH = 376;
      const boxR = 16;

      ctx.fillStyle = 'rgba(2, 2, 4, 0.88)';
      CardTextureGenerator.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, boxR);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
      ctx.lineWidth = 1.5;
      CardTextureGenerator.drawRoundedRect(ctx, boxX, boxY, boxW, boxH, boxR);
      ctx.stroke();

      // Candidate Name (bold 44px sans-serif)
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(candidateName, boxX + 28, boxY + 46);

      // "RARE EDITION" Badge (enlarged to 180x44)
      const badgeW = 180;
      const badgeH = 44;
      const badgeX = boxX + boxW - badgeW - 28;
      const badgeY = boxY + 24;
      const badgeR = 8; // concentric: max(0, 16 - 8) = 8

      ctx.fillStyle = 'rgba(6, 6, 9, 0.90)';
      CardTextureGenerator.drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeR);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.lineWidth = 1.5;
      CardTextureGenerator.drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeR);
      ctx.stroke();

      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RARE EDITION', badgeX + badgeW / 2, badgeY + badgeH / 2);

      // Gilded Hairline Divider
      const divGrad = ctx.createLinearGradient(boxX + 28, 0, boxX + boxW - 28, 0);
      divGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      divGrad.addColorStop(0.5, 'rgba(252, 211, 77, 0.3)');
      divGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxX + 28, boxY + 92);
      ctx.lineTo(boxX + boxW - 28, boxY + 92);
      ctx.stroke();

      // Skills List with Static Golden Stars (first skill 1, second 2, third 3)
      const skills = [
        { name: 'Hard worker', stars: '★' },
        { name: 'Passionate designer', stars: '★★' },
        { name: 'Perfection seeker', stars: '★★★' },
      ];

      skills.forEach((skill, index) => {
        const rowY = boxY + 144 + index * 80;

        // Skill Gold Bullet
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(boxX + 42, rowY, 6, 0, Math.PI * 2);
        ctx.fill();

        // Skill Name
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '500 24px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillText(skill.name, boxX + 68, rowY);

        // Golden 5-point Stars on Right
        ctx.textAlign = 'right';
        ctx.font = '26px sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(skill.stars, boxX + boxW - 32, rowY);
      });

      // 6. Monospace Attribute Stats Tickers
      const barsProgress = Math.max(0, Math.min(1, options.barsProgress ?? 1.0));
      const statsY = 1104;
      const statColW = 298;
      const statColH = 196;
      const statGap = 22;
      const statColR = 16;

      const statColumns = [
        { title: 'PERF // 60FPS', score: perfScore },
        { title: 'ARCH // CLEAN', score: archScore },
        { title: 'CODE // KMP', score: codeScore },
      ];

      statColumns.forEach((stat, i) => {
        const colX = boxX + i * (statColW + statGap);

        ctx.fillStyle = 'rgba(2, 2, 4, 0.88)';
        CardTextureGenerator.drawRoundedRect(ctx, colX, statsY, statColW, statColH, statColR);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.lineWidth = 1.2;
        CardTextureGenerator.drawRoundedRect(ctx, colX, statsY, statColW, statColH, statColR);
        ctx.stroke();

        // Title (Warm champagne gold)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 18px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fcd34d';
        ctx.fillText(stat.title, colX + statColW / 2, statsY + 38);

        // Score (animated counting from 0 to target score in pure warm gold)
        const currentScore = Math.round(stat.score * barsProgress);
        ctx.font = 'bold 44px "JetBrains Mono", monospace';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(String(currentScore), colX + statColW / 2, statsY + 104);

        // Progress Bar Track (rgba(255, 215, 0, 0.15))
        const barMargin = 28;
        const barW = statColW - barMargin * 2;
        const barH = 10;
        const barX = colX + barMargin;
        const barY = statsY + 152;
        const barR = 5;

        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        CardTextureGenerator.drawRoundedRect(ctx, barX, barY, barW, barH, barR);
        ctx.fill();

        // Progress Bar Active Fill (warm gold)
        const fillW = Math.max(0, Math.min(barW, ((stat.score * barsProgress) / 100) * barW));
        if (fillW > 0) {
          ctx.fillStyle = '#ffd700';
          CardTextureGenerator.drawRoundedRect(ctx, barX, barY, fillW, barH, barR);
          ctx.fill();
        }
      });

      // 7. Accreditation Footer
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(boxX, 1342);
      ctx.lineTo(boxX + boxW, 1342);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '15px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.fillText(
        'BENHA UNIVERSITY B.SC. (CS) • ITI SMART VILLAGE 9-MONTH DIPLOMA • 2026',
        525,
        1380
      );

      // 8. Frosted Obsidian Shroud, Golden Celestial Seal & Diagonal Holographic Foil Wipe
      const veilOpacity = Math.max(0, Math.min(1, options.veilOpacity ?? 0.0));
      const foilWipeProgress = Math.max(0, Math.min(1, options.foilWipeProgress ?? 0.0));

      if (veilOpacity > 0.001) {
        ctx.save();

        if (foilWipeProgress > 0 && foilWipeProgress < 1) {
          // Diagonal wipe: angle -35 degrees
          const rad = (-35 * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);

          // Span of card projected onto the wipe axis
          const p0 = 0;
          const p1 = 1050 * cos;
          const p2 = 1470 * sin;
          const p3 = 1050 * cos + 1470 * sin;
          const minP = Math.min(p0, p1, p2, p3);
          const maxP = Math.max(p0, p1, p2, p3);
          const foilBandWidth = 240;
          const bandOffset = foilBandWidth * 1.5;
          const startP = minP - bandOffset;
          const endP = maxP + bandOffset;
          const currentP = startP + foilWipeProgress * (endP - startP);

          ctx.save();
          ctx.translate(525, 735);
          ctx.rotate(rad);
          const centerP = 525 * cos + 735 * sin;
          const localCut = currentP - centerP;

          // Clip to unrevealed region (ahead of the wipe line)
          ctx.beginPath();
          if (typeof ctx.rect === 'function') {
            ctx.rect(localCut, -1800, 3600, 3600);
          } else {
            ctx.moveTo(localCut, -1800);
            ctx.lineTo(localCut + 3600, -1800);
            ctx.lineTo(localCut + 3600, 1800);
            ctx.lineTo(localCut, 1800);
            ctx.closePath();
          }
          if (typeof ctx.clip === 'function') {
            ctx.clip();
          }

          // Frosted obsidian base fill
          ctx.fillStyle = `rgba(2, 2, 4, ${veilOpacity * 0.98})`;
          ctx.fillRect(-2000, -2000, 4000, 4000);

          ctx.restore();

          // Diagonal Holographic Foil Gleam along the wipe boundary (graceful champagne-gold specular sweep)
          ctx.save();
          ctx.translate(525, 735);
          ctx.rotate(rad);

          const grad = ctx.createLinearGradient(
            localCut - foilBandWidth / 2,
            0,
            localCut + foilBandWidth / 2,
            0
          );
          grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
          grad.addColorStop(0.25, `rgba(255, 215, 0, ${0.35 * veilOpacity})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${0.95 * veilOpacity})`);
          grad.addColorStop(0.75, `rgba(251, 191, 36, ${0.50 * veilOpacity})`);
          grad.addColorStop(1, 'rgba(251, 191, 36, 0)');

          ctx.fillStyle = grad;
          ctx.fillRect(localCut - foilBandWidth / 2, -1800, foilBandWidth, 3600);

          // Softened specular hairline on the leading cut
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.65 * veilOpacity})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(localCut, -1800);
          ctx.lineTo(localCut, 1800);
          ctx.stroke();

          ctx.restore();
        } else if (foilWipeProgress <= 0) {
          // Fully shrouded state (before wipe starts)
          ctx.fillStyle = `rgba(2, 2, 4, ${veilOpacity * 0.98})`;
          CardTextureGenerator.drawRoundedRect(ctx, 0, 0, 1050, 1470, CardTextureGenerator.CARD_CORNER_RADIUS);
          ctx.fill();

          // Golden hairline frame (p=28 => R=72-28=44)
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.35 * veilOpacity})`;
          ctx.lineWidth = 2.5;
          CardTextureGenerator.drawRoundedRect(ctx, 28, 28, 1050 - 56, 1470 - 56, CardTextureGenerator.computeConcentricRadius(CardTextureGenerator.CARD_CORNER_RADIUS, 28));
          ctx.stroke();

          // Golden Celestial Seal in Center (525, 735)
          const sealX = 525;
          const sealY = 735;

          // Outer dashed halo ring (R=190)
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.65 * veilOpacity})`;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(sealX, sealY, 190, 0, Math.PI * 2);
          ctx.stroke();

          // Inner halo ring (R=150)
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 * veilOpacity})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(sealX, sealY, 150, 0, Math.PI * 2);
          ctx.stroke();

          // 8-Pointed Radiant Golden Star in center
          ctx.save();
          ctx.translate(sealX, sealY);
          ctx.fillStyle = `rgba(255, 215, 0, ${0.92 * veilOpacity})`;
          for (let arm = 0; arm < 4; arm++) {
            ctx.beginPath();
            ctx.moveTo(0, -90);
            ctx.lineTo(16, -20);
            ctx.lineTo(90, 0);
            ctx.lineTo(16, 20);
            ctx.lineTo(0, 90);
            ctx.lineTo(-16, 20);
            ctx.lineTo(-90, 0);
            ctx.lineTo(-16, -20);
            ctx.closePath();
            ctx.fill();
            ctx.rotate(Math.PI / 4);
          }
          ctx.restore();

          // Seal Monospace Micro-Typography
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(255, 215, 0, ${0.85 * veilOpacity})`;
          ctx.fillText('RESTRICTED ACCESS // CANDIDATE DOSSIER', sealX, sealY + 240);

          ctx.font = '16px "JetBrains Mono", monospace';
          ctx.fillStyle = `rgba(255, 255, 255, ${0.45 * veilOpacity})`;
          ctx.fillText('LEVEL 5 CLEARANCE REQUIRED', sealX, sealY + 275);
        }

        ctx.restore();
      }

      ctx.restore();
  }
}
