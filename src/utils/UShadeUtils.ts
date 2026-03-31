import { TShadeColor, TShadeConfig, TShadeType } from "../types/index.js";

import {
  COLORS,
  LIGHT_COLORS,
  LINE_CAP_TYPES,
  MAX_SHADES_NBR,
  RANDOM_FILTERS,
  SHADES_TYPES,
} from "../constants/index.js";

import { rgbToHex } from "./UColors.js";
import { random } from "./UMaths.js";
import { TShadesEngineOptions } from "../classes/ShadesEngine.js";

export const genConfig = (options?: TShadesEngineOptions) => {
  let usedTypes = [
    ...(options?.shapes && options.shapes.length > 0
      ? options.shapes
      : SHADES_TYPES),
  ];

  // merge custom shapes if provided and remove duplicates using a Set
  if (options?.customShapes) {
    const customShapeTypes = Object.keys(options.customShapes);
    usedTypes.push(...customShapeTypes);
    // Remove duplicates using a Set
    usedTypes = Array.from(new Set(usedTypes));
  }

  const type: TShadeType = usedTypes[random(0, usedTypes.length - 1, true)];

  const nbrShades =
    type !== "logo" ? random(3, MAX_SHADES_NBR, true) : MAX_SHADES_NBR;
  const size = random(10, 100, true);
  const nbrItemsX = type !== "logo" ? random(3, 30, true) : 1;
  const nbrItemsY = type !== "logo" ? random(3, 30, true) : 1;
  const spacing = random(10, 100, true);
  const gradRatio = 100 / nbrShades;
  const center = {
    x: document.body.clientWidth / 2,
    y: document.body.clientHeight / 2,
  };
  const colors = getRandColors(type);
  const lineCap = getRandLineCap();

  const config: TShadeConfig = {
    nbrShades,
    nbrItemsX,
    nbrItemsY,
    width: size,
    height: size,
    spacing,
    thickness: random(1, 20, true),
    offsetX: 0,
    offsetY: 0,
    totalWidth: nbrItemsX * size + nbrItemsX * spacing,
    totalHeight: nbrItemsY * size + nbrItemsY * spacing,
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

export const getRandColors = (type_or_colors?: TShadeType | TShadeColor[]) => {
  let tryCount = 0;

  const usedColors =
    type_or_colors === "logo"
      ? LIGHT_COLORS
      : typeof type_or_colors === "object"
        ? type_or_colors
        : COLORS;

  const colors = [
    usedColors[random(0, usedColors.length - 1, true)],
    usedColors[random(0, usedColors.length - 1, true)],
  ];

  while (rgbToHex(colors[0]) === rgbToHex(colors[1]) && tryCount < 10) {
    colors[1] = usedColors[random(0, usedColors.length - 1, true)];
    tryCount++;
  }

  return colors;
};

export const getRandColor = () => {
  const colors = getRandColors();
  return colors[random(0, colors.length - 1, true)];
};

export const getRandLineCap = () =>
  LINE_CAP_TYPES[random(0, LINE_CAP_TYPES.length - 1, true)];
