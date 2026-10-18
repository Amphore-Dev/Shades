// Export main engine class
export * from "./classes/index.js";

// Export core types
export type * from "./types/index.js";

// Export utility functions for advanced users
export { genConfig, getRandColors, getRandColor } from "./utils/UShadeUtils.js";

// Export individual shape classes
// Export constants
export {
  HOME_COLORS,
  LIGHT_COLORS,
  DARK_COLORS,
  MAX_SHADES_NBR,
  MAX_ITEMS_NBR,
  SAME_COLOR_FILTER,
  NO_FILTER,
  RANDOM_FILTER,
  RANDOM_50_FILTER,
} from "./constants/index.js";
