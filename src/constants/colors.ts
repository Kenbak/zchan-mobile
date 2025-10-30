// Zchan Terminal Theme Colors
// Green phosphorescent on black, inspired by old CRT monitors

export const COLORS = {
  // Main colors
  bg: '#0a0a0a',              // Deep black background
  bgLight: 'rgba(0, 20, 0, 0.5)', // Subtle green tint
  primary: '#00ff00',         // Bright terminal green
  secondary: '#00ffff',       // Cyan for links/highlights

  // Status colors
  success: '#00ff00',
  warning: '#ffff00',         // Yellow
  error: '#ff0000',           // Red
  info: '#00ffff',            // Cyan

  // UI elements
  border: '#00ff00',
  borderLight: 'rgba(0, 255, 0, 0.3)',
  text: '#00ff00',
  textMuted: 'rgba(0, 255, 0, 0.6)',
  textDim: 'rgba(0, 255, 0, 0.4)',

  // Effects
  glow: 'rgba(0, 255, 0, 0.3)',
  glowStrong: 'rgba(0, 255, 0, 0.6)',
  scanline: 'rgba(0, 0, 0, 0.15)',

  // Transparency
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.95)',
} as const;

export type Color = typeof COLORS[keyof typeof COLORS];
