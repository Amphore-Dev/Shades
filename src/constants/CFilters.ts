import { TShadeColor } from "../types/index.js";

import { rgbToHex } from "../utils/UColors.js";
import { random } from "../utils/UMaths.js";

// filters
export const SAME_COLOR_FILTER = (
  mainColor: TShadeColor,
  itemColor: TShadeColor
) => rgbToHex(itemColor) === rgbToHex(mainColor);

export const NO_FILTER = () => true;
export const RANDOM_FILTER = () => false;
export const RANDOM_50_FILTER = () => random(0, 1, true) === 1;

export const RANDOM_FILTERS = [
  SAME_COLOR_FILTER,
  NO_FILTER,
  RANDOM_FILTER,
  RANDOM_50_FILTER,
];

export const LINE_CAP_TYPES: CanvasLineCap[] = ["butt", "round", "square"];
