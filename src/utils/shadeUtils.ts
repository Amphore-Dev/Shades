import {
  IShadeColor,
  IShadeConfig,
  ShadesTypes,
  ShadesTypesConstructorsList,
  TShadeType,
} from "../interfaces/index.js";

import {
  COLORS,
  LIGHT_COLORS,
  MAX_SHADES_NBR,
  RANDOM_FILTERS,
} from "../constants/shadesConstants.js";

import { rgbToHex } from "./colors.js";
import { random } from "./maths.js";

export const genConfig = () => {
  const type: TShadeType =
    ShadesTypes[random(0, ShadesTypes?.length - 1, true)];

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

  const config: IShadeConfig = {
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
  };

  return config;
};

export const getRandFilter = () =>
  RANDOM_FILTERS[random(0, RANDOM_FILTERS.length - 1, true)];

export const getRandColors = (type_or_colors?: TShadeType | IShadeColor[]) => {
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

export const getRandomTypeConstructor = () => {
  const type = ShadesTypes[random(0, ShadesTypes.length - 1, true)];

  return ShadesTypesConstructorsList[type];
};
