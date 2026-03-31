import { IPoint } from "./Points.js";

import { IShadeColor } from "./shadeItem.js";
import { TShadeType } from "./shades.js";

export type IShadeFilter = (
  itemColor: IShadeColor,
  mainColor: IShadeColor
) => boolean;

export interface IShadeConfig {
  width: number;
  height: number;
  spacing: number;
  thickness: number;
  nbrShades: number;
  nbrItemsX: number;
  nbrItemsY: number;
  offsetX: number;
  offsetY: number;
  center: IPoint;
  totalWidth: number;
  totalHeight: number;
  gradRatio: number;
  type: TShadeType;
  colors?: IShadeColor[];
  mainColor?: IShadeColor;
  rotationFilter: IShadeFilter;
  fillFilter: IShadeFilter;
}

export type TPartialIShadeConfig = Partial<IShadeConfig>;
