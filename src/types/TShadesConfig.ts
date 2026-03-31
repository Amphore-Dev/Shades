import { TPoint } from "./TPoints.js";

import { TShadeColor } from "./TShadeItem.js";
import { TShadeType } from "./TShades.js";

export type TShadeFilter = (
  itemColor: TShadeColor,
  mainColor: TShadeColor
) => boolean;

export type TShadeConfig = {
  width: number;
  height: number;
  spacing: number;
  thickness: number;
  nbrShades: number;
  nbrItemsX: number;
  nbrItemsY: number;
  offsetX: number;
  offsetY: number;
  center: TPoint;
  totalWidth: number;
  totalHeight: number;
  gradRatio: number;
  type: TShadeType;
  colors?: TShadeColor[];
  mainColor?: TShadeColor;
  lineCap?: CanvasLineCap;
  rotationFilter: TShadeFilter;
  fillFilter: TShadeFilter;
};
