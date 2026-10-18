import { TShadeColor, TShadeConfig, TShadeType } from "../types/index.js";

import {
  COLORS,
  LINE_CAP_TYPES,
  MAX_SHADES_NBR,
  RANDOM_FILTERS,
  SHADES_TYPES,
} from "../constants/index.js";

import { rgbToHex } from "./UColors.js";
import { random } from "./UMaths.js";
import { TShadesEngineOptions } from "../classes/ShadesEngine.js";

type TGridConfig = Pick<
  TShadeConfig,
  "width" | "height" | "spacing" | "spacingY" | "nbrItemsX" | "nbrItemsY"
>;

/** Top-left corner of the item in column `x`, row `y`, from the grid origin. */
export const getItemPosition = (
  { width, height, spacing, spacingY = spacing }: TGridConfig,
  x: number,
  y: number
) => ({ x: x * (width + spacing), y: y * (height + spacingY) });

/** Size of the whole grid: the items and the gaps between them. */
export const getGridSize = ({
  width,
  height,
  spacing,
  spacingY = spacing,
  nbrItemsX,
  nbrItemsY,
}: TGridConfig) => ({
  totalWidth: nbrItemsX * width + (nbrItemsX - 1) * spacing,
  totalHeight: nbrItemsY * height + (nbrItemsY - 1) * spacingY,
});

export const genConfig = (
  options?: TShadesEngineOptions,
  forcedType?: TShadeType
) => {
  // `shapes` is the exact pool; otherwise built-in shapes plus custom ones
  const usedTypes: TShadeType[] = options?.shapes?.length
    ? [...new Set(options.shapes)]
    : [
        ...new Set([
          ...SHADES_TYPES,
          ...Object.keys(options?.customShapes ?? {}),
        ]),
      ];

  const type: TShadeType =
    forcedType ?? usedTypes[random(0, usedTypes.length - 1, true)];

  const nbrShades = random(3, MAX_SHADES_NBR, true);
  const size = random(10, 100, true);
  const nbrItemsX = random(3, 30, true);
  const nbrItemsY = random(3, 30, true);
  const spacing = random(10, 100, true);
  const gradRatio = 100 / nbrShades;
  const center = {
    x: document.body.clientWidth / 2,
    y: document.body.clientHeight / 2,
  };
  const colors = getRandColors();
  const lineCap = getRandLineCap();

  const config: TShadeConfig = {
    nbrShades,
    nbrItemsX,
    nbrItemsY,
    width: size,
    height: size,
    spacing,
    thickness: random(1, 20, true),
    ...getGridSize({
      width: size,
      height: size,
      spacing,
      nbrItemsX,
      nbrItemsY,
    }),
    gradRatio,
    center,
    type,
    colors,
    rotationFilter: getRandFilter(),
    fillFilter: getRandFilter(),
    lineCap: lineCap,
  };

  return config;
};

export const getRandFilter = () =>
  RANDOM_FILTERS[random(0, RANDOM_FILTERS.length - 1, true)];

/** Two different colors picked from `colors` (the default palette otherwise). */
export const getRandColors = (colors: TShadeColor[] = COLORS) => {
  let tryCount = 0;

  const usedColors = colors;

  const picked = [
    usedColors[random(0, usedColors.length - 1, true)],
    usedColors[random(0, usedColors.length - 1, true)],
  ];

  while (rgbToHex(picked[0]) === rgbToHex(picked[1]) && tryCount < 10) {
    picked[1] = usedColors[random(0, usedColors.length - 1, true)];
    tryCount++;
  }

  return picked;
};

export const getRandColor = () => {
  const colors = getRandColors();
  return colors[random(0, colors.length - 1, true)];
};

export const getRandLineCap = () =>
  LINE_CAP_TYPES[random(0, LINE_CAP_TYPES.length - 1, true)];
