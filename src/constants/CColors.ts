import { TShadeColor } from "@/types/TShadeItem.js";

export const HOME_COLORS: TShadeColor[] = [
  { r: 80, g: 178, b: 192 },
  { r: 241, g: 162, b: 8 },
  { r: 214, g: 40, b: 57 },

  { r: 0, g: 255, b: 255 },
  { r: 252, g: 163, b: 17 },
  { r: 237, g: 37, b: 78 },
  { r: 209, g: 52, b: 91 },
];

export const LIGHT_COLORS: TShadeColor[] = [
  { r: 255, g: 255, b: 255 },
  { r: 0, g: 255, b: 0 },
  { r: 255, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 },
  { r: 255, g: 105, b: 120 },
  { r: 7, g: 190, b: 184 },
  { r: 186, g: 50, b: 79 },
  { r: 23, g: 86, b: 118 },
  { r: 75, g: 163, b: 195 },
  { r: 255, g: 200, b: 87 },
  { r: 250, g: 120, b: 30 },
  { r: 223, g: 41, b: 53 },
  { r: 129, g: 195, b: 215 },
  { r: 49, g: 203, b: 0 },
  { r: 17, g: 152, b: 34 },
  { r: 155, g: 197, b: 91 },
];

export const DARK_COLORS: TShadeColor[] = [
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
  { r: 0, g: 0, b: 0 },
];

export const COLORS = [...HOME_COLORS, ...LIGHT_COLORS, ...DARK_COLORS];
