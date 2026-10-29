/**
 * Ascii / Technical Matrix Background Grid Types & Contracts
 */

export interface TopographicTier {
  threshold: number; // Upper bound elevation (0.0 to 1.0)
  name: string;
  colorRgb: [number, number, number]; // [r, g, b]
  baseOpacity: number;
  glyphs: string[];
}

export const TOPOGRAPHIC_TIERS: TopographicTier[] = [
  {
    threshold: 0.20,
    name: 'Abyss',
    colorRgb: [10, 34, 64], // Deep oceanic midnight navy
    baseOpacity: 0.176, // Dimmed 20% from 0.22
    glyphs: ['0', '1'],
  },
  {
    threshold: 0.40,
    name: 'Slope',
    colorRgb: [2, 132, 199], // Deep cobalt / ocean blue
    baseOpacity: 0.304, // Dimmed 20% from 0.38
    glyphs: ['0', '1'],
  },
  {
    threshold: 0.60,
    name: 'Current',
    colorRgb: [0, 180, 216], // Vibrant cyan / electric blue
    baseOpacity: 0.464, // Dimmed 20% from 0.58
    glyphs: ['0', '1'],
  },
  {
    threshold: 0.80,
    name: 'Plateau',
    colorRgb: [125, 211, 252], // Powder minty aqua
    baseOpacity: 0.576, // Dimmed 20% from 0.72
    glyphs: ['0', '1'],
  },
  {
    threshold: 1.00,
    name: 'Crest',
    colorRgb: [248, 250, 252], // Crisp snow / off-white
    baseOpacity: 0.736, // Dimmed 20% from 0.92
    glyphs: ['0', '1'],
  },
];

export const SECONDARY_COLOR_CYAN = '#6eb9cd'; // Muted slate cyan

export interface AsciiCell {
  char: string;
  glyphIndex: number;
  baseX: number;
  baseY: number;
  dispX: number;
  dispY: number;
  velX: number;
  velY: number;
  opacity: number;
  ambientEnergy: number;
  twinklePhase: number;
  twinkleSpeed: number;
  elevation: number;
  tierIndex: number;
  isRidge: boolean;
}

export interface AsciiGridConfig {
  cellWidth: number;
  cellHeight: number;
  font: string;
  glyphs: string[];
  spring: number;
  damping: number;
  maxDisplacement: number;
  rippleSpeed: number;
  mouseMoveStrength: number;
  mouseClickStrength: number;
  flowSpeed: number;
  warpStrength: number;
  vortexCenter: [number, number];
}
