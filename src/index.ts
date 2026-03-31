// Export main engine class
export { ShadesEngine } from "./ShadesEngine.js";
export type { IShadesEngineOptions } from "./ShadesEngine.js";

// Export core types and interfaces
export type {
  IShadeColor,
  IShadeConfig,
  TPartialIShadeConfig,
  TShadeType,
  TShadeTypeConstructor,
  IShadeFilter,
} from "./interfaces/index.js";

export type { IPoint } from "./interfaces/index.js";

// Export utility functions for advanced users
export { genConfig, getRandColors, getRandColor } from "./utils/shadeUtils.js";

// Export shape classes for custom implementations
export { ShadeItem, TextShape } from "./classes/ShadeItem.js";
// Export individual shape classes for more granular imports
export {
  CircleShape,
  ImageShape,
  SpiralShape,
  SquaredShape,
  TriangleShape,
} from "./classes/shapes/index.js";
// Export constants
export {
  HOME_COLORS as HomeColors,
  MAX_SHADES_NBR as MaxShadesNbr,
} from "./constants/shadesConstants.js";
export { ShadesTypes } from "./interfaces/shades.js";
