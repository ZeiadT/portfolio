import * as THREE from 'three';
import type { CardSummonData, CardSummonTheme } from '@/engines/card/CardSummonEngine';

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

function drawQuadCurve(
  ctx: CanvasRenderingContext2D,
  cpx: number,
  cpy: number,
  x: number,
  y: number
): void {
  if (typeof ctx.quadraticCurveTo === 'function') {
    ctx.quadraticCurveTo(cpx, cpy, x, y);
  } else {
    ctx.lineTo(x, y);
  }
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
   * Vector path for the signature cat mask crest logo from assets/logo.svg.
   * ViewBox 0 0 585 580 (center at 292.5, 290).
   */
  public static readonly CAT_MASK_PATH =
    'M 74.00 104.38 L 461.36 369.00 L 454.00 412.00 L 288.50 524.00 L 122.55 412.00 Z ' +
    'M 503.00 104.38 L 465.51 341.00 L 310.76 236.00 Z ' +
    'M 364.00 374.13 L 378.00 395.64 L 407.00 378.83 L 399.49 411.00 L 380.63 421.00 L 370.00 450.25 L 361.00 430.40 L 349.00 435.44 L 305.60 439.00 L 359.55 407.00 Z ' +
    'M 169.85 379.00 L 176.67 408.00 L 179.00 412.19 L 224.00 434.50 L 271.00 439.42 Z';

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
   * R_inner = max(0, R_outer - padding)
   */
  public static computeConcentricRadius(outerRadius: number, padding: number): number {
    return Math.max(0, outerRadius - padding);
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
   * - Concentric guilloche sacred geometry pattern
   * - 4 Symmetrical ornate corner filigree flourishes
   * - Astronomical celestial halo rings and cardinal diamond star nodes
   * - Central glowing Ace crest with starburst core
   * - Metallic gold gradient definitions integrating custom theme colors
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

    <!-- Celestial Energy Glow -->
    <radialGradient id="gold-crest-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${coreColor}" stop-opacity="0.95" />
      <stop offset="30%" stop-color="${accentColor}" stop-opacity="0.75" />
      <stop offset="70%" stop-color="${primaryColor}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
    </radialGradient>

    <!-- Primary Accent Flare -->
    <linearGradient id="primary-energy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.9" />
      <stop offset="50%" stop-color="${coreColor}" stop-opacity="1" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.9" />
    </linearGradient>

    <!-- Concentric Guilloche Sacred Geometry Pattern -->
    <pattern id="guilloche-sacred-pattern" width="84" height="84" patternUnits="userSpaceOnUse" data-guilloche="true">
      <path d="M 0 42 L 42 0 L 84 42 L 42 84 Z" fill="none" stroke="#d4af37" stroke-opacity="0.14" stroke-width="1.8" />
      <circle cx="42" cy="42" r="4.5" fill="#ffd700" fill-opacity="0.3" />
      <path d="M 0 0 L 84 84 M 84 0 L 0 84" stroke="#e5b85c" stroke-opacity="0.08" stroke-width="1.2" />
      <circle cx="42" cy="42" r="28" fill="none" stroke="#ffd700" stroke-opacity="0.09" stroke-width="1.2" stroke-dasharray="4 6" />
      <circle cx="42" cy="42" r="38" fill="none" stroke="${primaryColor}" stroke-opacity="0.06" stroke-width="0.8" />
    </pattern>
  </defs>

  <!-- Obsidian Base Surface (1050x1470, R=48) -->
  <rect width="1050" height="1470" rx="48" fill="url(#gold-back-bg)" />

  <!-- Concentric Guilloche Inset Grid -->
  <rect x="36" y="36" width="978" height="1398" rx="36" fill="url(#guilloche-sacred-pattern)" />

  <!-- Outer Gilded Metallic Borders -->
  <g data-summon-card-back-frame="true">
    <rect x="36" y="36" width="978" height="1398" rx="36" fill="none" stroke="url(#gold-foil-grad)" stroke-width="4.5" />
    <rect x="54" y="54" width="942" height="1362" rx="28" fill="none" stroke="#ffd700" stroke-opacity="0.45" stroke-width="2.5" stroke-dasharray="16 10" />
    <rect x="70" y="70" width="910" height="1330" rx="20" fill="none" stroke="#d4af37" stroke-opacity="0.25" stroke-width="1.5" />
  </g>

  <!-- Radiating Celestial Rays and Constellations -->
  <g data-summon-card-pattern="true">
    <!-- Center Cardinal Rays -->
    <g stroke="url(#gold-rim-grad)" stroke-width="1.5" stroke-dasharray="8 12" opacity="0.4">
      <line x1="525" y1="735" x2="135" y2="225" />
      <line x1="525" y1="735" x2="915" y2="225" />
      <line x1="525" y1="735" x2="135" y2="1245" />
      <line x1="525" y1="735" x2="915" y2="1245" />
      <line x1="525" y1="735" x2="525" y2="120" />
      <line x1="525" y1="735" x2="525" y2="1350" />
      <line x1="525" y1="735" x2="90" y2="735" />
      <line x1="525" y1="735" x2="960" y2="735" />
    </g>

    <!-- Outer Celestial Orbit Arcs -->
    <circle cx="525" cy="735" r="375" fill="none" stroke="${primaryColor}" stroke-opacity="0.22" stroke-width="2" stroke-dasharray="24 16" />
    <circle cx="525" cy="735" r="444" fill="none" stroke="#ffd700" stroke-opacity="0.18" stroke-width="1.8" stroke-dasharray="6 24" />

    <!-- Top-Left Quadrant Constellation -->
    <g transform="translate(255, 345)">
      <path d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="4.5" fill="${coreColor}" />
      <line x1="0" y1="0" x2="105" y2="75" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.8" stroke-dasharray="6 8" />
      <line x1="0" y1="0" x2="-75" y2="120" stroke="${primaryColor}" stroke-opacity="0.35" stroke-width="1.8" stroke-dasharray="6 8" />
      <circle cx="105" cy="75" r="5" fill="#ffd700" />
      <circle cx="-75" cy="120" r="6" fill="${primaryColor}" />
    </g>

    <!-- Top-Right Quadrant Constellation -->
    <g transform="translate(795, 345) scale(-1, 1)">
      <path d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="4.5" fill="${coreColor}" />
      <line x1="0" y1="0" x2="105" y2="75" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.8" stroke-dasharray="6 8" />
      <line x1="0" y1="0" x2="-75" y2="120" stroke="${primaryColor}" stroke-opacity="0.35" stroke-width="1.8" stroke-dasharray="6 8" />
      <circle cx="105" cy="75" r="5" fill="#ffd700" />
      <circle cx="-75" cy="120" r="6" fill="${primaryColor}" />
    </g>

    <!-- Bottom-Left Quadrant Constellation -->
    <g transform="translate(255, 1125) scale(1, -1)">
      <path d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="4.5" fill="${coreColor}" />
      <line x1="0" y1="0" x2="105" y2="75" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.8" stroke-dasharray="6 8" />
      <line x1="0" y1="0" x2="-75" y2="120" stroke="${primaryColor}" stroke-opacity="0.35" stroke-width="1.8" stroke-dasharray="6 8" />
      <circle cx="105" cy="75" r="5" fill="#ffd700" />
      <circle cx="-75" cy="120" r="6" fill="${primaryColor}" />
    </g>

    <!-- Bottom-Right Quadrant Constellation -->
    <g transform="translate(795, 1125) scale(-1, -1)">
      <path d="M 0 -24 L 6 -6 L 24 0 L 6 6 L 0 24 L -6 6 L -24 0 L -6 -6 Z" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="4.5" fill="${coreColor}" />
      <line x1="0" y1="0" x2="105" y2="75" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.8" stroke-dasharray="6 8" />
      <line x1="0" y1="0" x2="-75" y2="120" stroke="${primaryColor}" stroke-opacity="0.35" stroke-width="1.8" stroke-dasharray="6 8" />
      <circle cx="105" cy="75" r="5" fill="#ffd700" />
      <circle cx="-75" cy="120" r="6" fill="${primaryColor}" />
    </g>

    <!-- Cardinal Diamond Star Nodes -->
    <g transform="translate(144, 735)">
      <polygon points="0,-21 10.5,0 0,21 -10.5,0" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="3.5" fill="${coreColor}" />
      <line x1="0" y1="-42" x2="0" y2="42" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.5" />
    </g>
    <g transform="translate(906, 735)">
      <polygon points="0,-21 10.5,0 0,21 -10.5,0" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="3.5" fill="${coreColor}" />
      <line x1="0" y1="-42" x2="0" y2="42" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.5" />
    </g>
    <g transform="translate(525, 144)">
      <polygon points="0,-21 10.5,0 0,21 -10.5,0" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="3.5" fill="${coreColor}" />
      <line x1="-42" y1="0" x2="42" y2="0" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.5" />
    </g>
    <g transform="translate(525, 1326)">
      <polygon points="0,-21 10.5,0 0,21 -10.5,0" fill="url(#gold-foil-grad)" />
      <circle cx="0" cy="0" r="3.5" fill="${coreColor}" />
      <line x1="-42" y1="0" x2="42" y2="0" stroke="#ffd700" stroke-opacity="0.4" stroke-width="1.5" />
    </g>
  </g>

  <!-- 4 Symmetrical Corner Filigrees -->
  <g data-summon-card-filigree="true" class="filigree-corner" transform="translate(72, 72)">
    <path d="M 0 105 L 0 30 Q 0 0 30 0 L 105 0 Q 45 15 30 30 Q 15 45 0 105 Z" fill="url(#gold-foil-grad)" fill-opacity="0.6" />
    <path d="M 12 84 C 12 42 42 12 84 12 M 30 54 C 30 36 36 30 54 30" stroke="#ffd700" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <circle cx="24" cy="24" r="7.5" fill="url(#gold-foil-grad)" />
    <circle cx="24" cy="24" r="14" fill="none" stroke="#d4af37" stroke-width="1.5" />
  </g>
  <g data-summon-card-filigree="true" class="filigree-corner" transform="translate(978, 72) scale(-1, 1)">
    <path d="M 0 105 L 0 30 Q 0 0 30 0 L 105 0 Q 45 15 30 30 Q 15 45 0 105 Z" fill="url(#gold-foil-grad)" fill-opacity="0.6" />
    <path d="M 12 84 C 12 42 42 12 84 12 M 30 54 C 30 36 36 30 54 30" stroke="#ffd700" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <circle cx="24" cy="24" r="7.5" fill="url(#gold-foil-grad)" />
    <circle cx="24" cy="24" r="14" fill="none" stroke="#d4af37" stroke-width="1.5" />
  </g>
  <g data-summon-card-filigree="true" class="filigree-corner" transform="translate(72, 1398) scale(1, -1)">
    <path d="M 0 105 L 0 30 Q 0 0 30 0 L 105 0 Q 45 15 30 30 Q 15 45 0 105 Z" fill="url(#gold-foil-grad)" fill-opacity="0.6" />
    <path d="M 12 84 C 12 42 42 12 84 12 M 30 54 C 30 36 36 30 54 30" stroke="#ffd700" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <circle cx="24" cy="24" r="7.5" fill="url(#gold-foil-grad)" />
    <circle cx="24" cy="24" r="14" fill="none" stroke="#d4af37" stroke-width="1.5" />
  </g>
  <g data-summon-card-filigree="true" class="filigree-corner" transform="translate(978, 1398) scale(-1, -1)">
    <path d="M 0 105 L 0 30 Q 0 0 30 0 L 105 0 Q 45 15 30 30 Q 15 45 0 105 Z" fill="url(#gold-foil-grad)" fill-opacity="0.6" />
    <path d="M 12 84 C 12 42 42 12 84 12 M 30 54 C 30 36 36 30 54 30" stroke="#ffd700" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.9" />
    <circle cx="24" cy="24" r="7.5" fill="url(#gold-foil-grad)" />
    <circle cx="24" cy="24" r="14" fill="none" stroke="#d4af37" stroke-width="1.5" />
  </g>

  <!-- Concentric Halo Rings & Radiating Celestial Notches -->
  <g data-summon-card-halo="true" transform="translate(525, 735)">
    <circle cx="0" cy="0" r="285" fill="none" stroke="url(#gold-rim-grad)" stroke-opacity="0.4" stroke-width="3" stroke-dasharray="9 18" />
    <circle cx="0" cy="0" r="246" fill="none" stroke="#ffd700" stroke-opacity="0.7" stroke-width="3.6" />
    <circle cx="0" cy="0" r="204" fill="none" stroke="url(#gold-foil-grad)" stroke-opacity="0.8" stroke-width="3" stroke-dasharray="36 12 12 12" />
    <circle cx="0" cy="0" r="156" fill="none" stroke="${coreColor}" stroke-opacity="0.5" stroke-width="2.5" />
    <path d="M 0 -294 L 0 -264 M 0 264 L 0 294 M -294 0 L -264 0 M 264 0 L 294 0" stroke="#ffd700" stroke-width="4.5" stroke-linecap="round" />
    <path d="M -207 -207 L -186 -186 M 186 186 L 207 207 M 207 -207 L 186 -186 M -186 186 L -207 207" stroke="${primaryColor}" stroke-width="3.6" stroke-linecap="round" />
  </g>

  <!-- Central Glowing Cat Mask Crest -->
  <g data-summon-card-crest="true">
    <circle cx="525" cy="735" r="132" fill="url(#gold-crest-glow)" />
    <path d="${CardTextureGenerator.CAT_MASK_PATH}" transform="translate(525, 735) scale(0.38) translate(-292.5, -290)" fill="url(#gold-foil-grad)" stroke="#ffd700" stroke-width="2" fill-rule="evenodd" />
  </g>
</svg>`;
  }

  /**
   * Draws the gilded golden card back content onto a canvas or 2D context.
   */
  public static drawGoldenCardBackContent(
    target: HTMLCanvasElement | CanvasRenderingContext2D,
    theme: CardSummonTheme = {}
  ): void {
    const ctx = 'getContext' in target ? target.getContext('2d') : target;
    if (!ctx) return;

    const primaryColor = theme.primaryColor ?? '#ff4421';
    const coreColor = theme.coreColor ?? '#ffffff';
    const accentColor = theme.accentColor ?? '#ffd700';

    ctx.save();

    // Rounded clip boundary (1050x1470, R=48)
    drawRoundedRect(ctx, 0, 0, 1050, 1470, 48);
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

    // 2. Guilloche Geometric Lattice
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
    ctx.lineWidth = 1.5;
    const step = 84;
    for (let y = 36; y <= 1434; y += step) {
      ctx.beginPath();
      for (let x = 36; x <= 1014; x += step) {
        ctx.moveTo(x + step / 2, y);
        ctx.lineTo(x + step, y + step / 2);
        ctx.lineTo(x + step / 2, y + step);
        ctx.lineTo(x, y + step / 2);
        ctx.closePath();
      }
      ctx.stroke();
    }

    // 3. Multi-tier Gilded Gold Borders
    const goldFoil = ctx.createLinearGradient(0, 0, 1050, 1470);
    goldFoil.addColorStop(0, '#ffffff');
    goldFoil.addColorStop(0.15, '#ffd700');
    goldFoil.addColorStop(0.5, '#d4af37');
    goldFoil.addColorStop(0.85, '#ffaa00');
    goldFoil.addColorStop(1, '#8a6d2b');

    ctx.strokeStyle = goldFoil;
    ctx.lineWidth = 4.5;
    drawRoundedRect(ctx, 36, 36, 978, 1398, 36);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, 54, 54, 942, 1362, 28);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 70, 70, 910, 1330, 20);
    ctx.stroke();

    // 4. Corner Filigree Flourishes (4 Quadrants)
    const cornerCoords = [
      { x: 72, y: 72, sx: 1, sy: 1 },
      { x: 978, y: 72, sx: -1, sy: 1 },
      { x: 72, y: 1398, sx: 1, sy: -1 },
      { x: 978, y: 1398, sx: -1, sy: -1 },
    ];

    for (const c of cornerCoords) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.sx, c.sy);

      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, 105);
      ctx.lineTo(0, 30);
      drawQuadCurve(ctx, 0, 0, 30, 0);
      ctx.lineTo(105, 0);
      drawQuadCurve(ctx, 45, 15, 30, 30);
      drawQuadCurve(ctx, 15, 45, 0, 105);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(24, 24, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 5. Concentric Halo Rings & Radiating Lines
    ctx.save();
    ctx.translate(525, 735);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 285, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.arc(0, 0, 246, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 204, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 156, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal Starburst Lines
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -294);
    ctx.lineTo(0, -264);
    ctx.moveTo(0, 264);
    ctx.lineTo(0, 294);
    ctx.moveTo(-294, 0);
    ctx.lineTo(-264, 0);
    ctx.moveTo(264, 0);
    ctx.lineTo(294, 0);
    ctx.stroke();

    // 6. Central Cat Mask Crest
    const crestGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 132);
    crestGlow.addColorStop(0, coreColor);
    crestGlow.addColorStop(0.3, accentColor);
    crestGlow.addColorStop(0.7, primaryColor);
    crestGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = crestGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 132, 0, Math.PI * 2);
    ctx.fill();

    // Cat Mask Vector Logo Crest
    ctx.save();
    ctx.scale(0.38, 0.38);
    ctx.translate(-292.5, -290);
    ctx.fillStyle = goldFoil;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    if (typeof Path2D !== 'undefined') {
      try {
        const path = new Path2D(CardTextureGenerator.CAT_MASK_PATH);
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

      // Concentric outer card clip (1050x1470, R=48)
      CardTextureGenerator.drawRoundedRect(ctx, 0, 0, 1050, 1470, 48);
      if (typeof ctx.clip === 'function') {
        ctx.clip();
      }

      // 1. Crisp Obsidian Dark Background with Subtle Vignette
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 1470);
      bgGrad.addColorStop(0, '#0d0d12');
      bgGrad.addColorStop(0.5, '#09090d');
      bgGrad.addColorStop(1, '#050508');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1050, 1470);

      // 2. Monoline Hairline Border Frame with Corner Crosshairs (X=24, Y=24, W=1002, H=1422, p=24 => R=24)
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.lineWidth = 1.5;
      CardTextureGenerator.drawRoundedRect(ctx, 24, 24, 1002, 1422, 24);
      ctx.stroke();

      // Corner Hairline Crosshairs (+)
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.font = '22px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', 48, 48);
      ctx.fillText('+', 1002, 48);
      ctx.fillText('+', 48, 1422);
      ctx.fillText('+', 1002, 1422);

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
      portraitGrad.addColorStop(0, '#121218');
      portraitGrad.addColorStop(1, '#060609');
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
          dy = portraitY + (portraitH - dh) / 2;
        }

        ctx.save();
        if ('filter' in ctx) {
          ctx.filter = 'grayscale(100%)';
        }
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();

        // Pixel luminance grayscale desaturation fallback
        try {
          if (ctx.filter !== 'grayscale(100%)' && typeof ctx.getImageData === 'function' && typeof ctx.putImageData === 'function') {
            const imgData = ctx.getImageData(portraitX, portraitY, portraitW, portraitH);
            CardTextureGenerator.desaturatePixels(imgData.data);
            ctx.putImageData(imgData, portraitX, portraitY);
          }
        } catch {
          // Silently ignore cross-origin taint
        }

        // Soft dark vignette overlay
        const vignette = ctx.createLinearGradient(0, portraitY, 0, portraitY + portraitH);
        vignette.addColorStop(0, 'rgba(8, 8, 12, 0.25)');
        vignette.addColorStop(0.7, 'rgba(8, 8, 12, 0.15)');
        vignette.addColorStop(1, 'rgba(8, 8, 12, 0.7)');
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

      ctx.fillStyle = 'rgba(255, 215, 0, 0.02)';
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

      ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
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

      // Skills List with Static 3/2/1 Golden Stars
      const skills = [
        { name: 'Hard worker', stars: '★★★' },
        { name: 'Passionate designer', stars: '★★' },
        { name: 'Perfection seeker', stars: '★' },
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

        ctx.fillStyle = 'rgba(255, 215, 0, 0.02)';
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
          const currentP = minP + foilWipeProgress * (maxP - minP);

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
          ctx.fillStyle = `rgba(7, 7, 11, ${veilOpacity * 0.98})`;
          ctx.fillRect(-2000, -2000, 4000, 4000);

          ctx.restore();

          // Diagonal Holographic Foil Gleam along the wipe boundary (graceful champagne-gold specular sweep)
          ctx.save();
          ctx.translate(525, 735);
          ctx.rotate(rad);

          const foilBandWidth = 240;
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
          ctx.fillStyle = `rgba(7, 7, 11, ${veilOpacity * 0.98})`;
          CardTextureGenerator.drawRoundedRect(ctx, 0, 0, 1050, 1470, 48);
          ctx.fill();

          // Golden hairline frame (p=28 => R=48-28=20)
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.35 * veilOpacity})`;
          ctx.lineWidth = 2.5;
          CardTextureGenerator.drawRoundedRect(ctx, 28, 28, 1050 - 56, 1470 - 56, 20);
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
