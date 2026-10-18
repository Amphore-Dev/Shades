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
  /** Gap between items; horizontal only when spacingY is set. */
  spacing: number;
  /** Vertical gap between items. Defaults to spacing. */
  spacingY?: number;
  thickness: number;
  nbrShades: number;
  nbrItemsX: number;
  nbrItemsY: number;
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

/**
 * A predefined generation: any field left out is randomized.
 * `center`, `totalWidth` and `totalHeight` are always computed by the engine.
 */
export type TShadesPreset = Partial<
  Omit<TShadeConfig, "center" | "totalWidth" | "totalHeight">
>;
