import { IShadeColor } from "../interfaces/index.js";

/**
 * Convert RGB values to hex color string
 */
export function rgbToHex(color: IShadeColor): string {
  if (!color) {
    return "#000000"; // Default to black if no color is provided
  }
  const toHex = (n: number): string => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Convert integer to hex string
 */
export function intToHex(n: number): string {
  const hex = Math.round(n).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Convert hex string to RGB values
 */
export function hexToRgb(hex: string): IShadeColor | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Create random RGB color
 */
export function randomColor(): IShadeColor {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}
