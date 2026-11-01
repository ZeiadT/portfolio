import * as THREE from 'three';
import type { Project } from '@/domain/types';

/**
 * Draws a rounded rectangle path compatible with all 2D canvas implementations
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): void {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, (Math.PI * 3) / 2);
  ctx.closePath();
}

/**
 * ProjectCardTexture
 *
 * Canvas-based 16:9 texture generator for project cards on the 3D carousel track.
 * Produces crisp, high-DPI Three.js CanvasTextures containing Swiss typography,
 * category badges, metadata pills, project title, subtitle, tags, and accent color.
 */
export class ProjectCardTexture {
  private project: Project;
  private width: number;
  private height: number;
  private dpr: number;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private texture: THREE.CanvasTexture;
  private disposed = false;

  constructor(project: Project, width = 1280, height?: number) {
    this.project = project;
    this.width = width;
    // Strictly preserve 16:9 aspect ratio if height is not explicitly provided
    this.height = height !== undefined ? height : Math.round((width * 9) / 16);

    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    this.canvas = document.createElement('canvas');
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx = this.canvas.getContext('2d');

    // Initial render
    this.render();

    // Create CanvasTexture
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.needsUpdate = true;
  }

  /**
   * Returns the underlying Three.js CanvasTexture
   */
  public getTexture(): THREE.CanvasTexture {
    return this.texture;
  }

  /**
   * Returns the underlying HTML5 Canvas element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Re-renders the card surface and marks the texture for GPU upload
   */
  public update(): void {
    if (this.disposed) return;
    this.render();
    this.texture.needsUpdate = true;
  }

  /**
   * Renders the complete project card surface
   */
  private render(): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = this.width;
    const h = this.height;
    const accent = this.project.accentColor || '#ff4421';

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // 1. Base Background - Deep obsidian with subtle vertical gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, '#0c0d12');
    bgGradient.addColorStop(1, '#07080a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Ambient Accent Glow
    ctx.save();
    const glowX = w * 0.85;
    const glowY = h * 0.2;
    const ambientGlow = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, h * 0.65);
    ambientGlow.addColorStop(0, `${accent}28`);
    ambientGlow.addColorStop(0.5, `${accent}0a`);
    ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 3. Card Frame Inset Border
    const pad = 24;
    const innerW = w - pad * 2;
    const innerH = h - pad * 2;
    const cardRadius = 24;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, pad, pad, innerW, innerH, cardRadius);
    ctx.stroke();

    // Top edge specular sheen highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(pad + cardRadius, pad);
    ctx.lineTo(pad + innerW - cardRadius, pad);
    ctx.stroke();
    ctx.restore();

    // 4. Header Bar: Category Badge, Accent Pill, and Year
    const headerY = pad + 44;
    const headerX = pad + 36;

    // Category Badge
    const categoryText = this.project.category.toUpperCase();
    ctx.font = '600 14px "JetBrains Mono", monospace, sans-serif';
    const catMetrics = ctx.measureText(categoryText);
    const catTextW = catMetrics?.width || categoryText.length * 9;
    const catBadgeW = catTextW + 36;
    const catBadgeH = 28;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, headerX, headerY, catBadgeW, catBadgeH, 14);
    ctx.fill();
    ctx.stroke();

    // Accent dot inside badge
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(headerX + 13, headerY + catBadgeH / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Category text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(categoryText, headerX + 24, headerY + catBadgeH / 2 + 0.5);
    ctx.restore();

    // Accent Pill Indicator beside Category
    const accentPillX = headerX + catBadgeW + 12;
    ctx.save();
    ctx.fillStyle = accent;
    drawRoundedRect(ctx, accentPillX, headerY + 4, 28, 20, 10);
    ctx.fill();
    ctx.restore();

    // Year Badge (Right aligned)
    const yearText = this.project.year;
    ctx.save();
    ctx.font = '600 16px "JetBrains Mono", monospace, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.fillText(yearText, w - pad - 36, headerY + catBadgeH / 2);
    ctx.restore();

    // 5. Main Content: Title, Accent Line, Subtitle, Description
    const contentX = headerX;
    const titleY = headerY + 130;

    // Project Title
    ctx.save();
    ctx.font = '700 68px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.project.title, contentX, titleY);

    // Accent underline indicator
    ctx.fillStyle = accent;
    drawRoundedRect(ctx, contentX, titleY + 16, 72, 4, 2);
    ctx.fill();
    ctx.restore();

    // Subtitle
    const subtitleY = titleY + 68;
    ctx.save();
    ctx.font = '500 28px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fillText(this.project.subtitle, contentX, subtitleY);
    ctx.restore();

    // Description
    if (this.project.description) {
      const descY = subtitleY + 44;
      ctx.save();
      ctx.font = '400 20px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.52)';

      // Draw single line / clean snippet
      const maxDescChars = 80;
      const descText =
        this.project.description.length > maxDescChars
          ? `${this.project.description.slice(0, maxDescChars)}...`
          : this.project.description;
      ctx.fillText(descText, contentX, descY);
      ctx.restore();
    }

    // 6. Bottom Tags Row
    const tagBottomY = h - pad - 60;
    let currentTagX = contentX;

    for (const tag of this.project.tags) {
      ctx.save();
      ctx.font = '500 15px "JetBrains Mono", monospace, sans-serif';
      const tagMetrics = ctx.measureText(tag);
      const tagTextW = tagMetrics?.width || tag.length * 9;
      const tagPadX = 14;
      const tagBadgeW = tagTextW + tagPadX * 2;
      const tagBadgeH = 32;

      // Tag pill background & border
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, currentTagX, tagBottomY, tagBadgeW, tagBadgeH, 8);
      ctx.fill();
      ctx.stroke();

      // Tag text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(tag, currentTagX + tagPadX, tagBottomY + tagBadgeH / 2);
      ctx.restore();

      currentTagX += tagBadgeW + 10;
    }

    ctx.restore();
  }

  /**
   * Releases GPU textures and clears canvas memory
   */
  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.texture.dispose();

    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Reset dimensions to free canvas backing store
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.ctx = null;
  }
}
