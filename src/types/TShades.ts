import { SHADES_TYPES } from "../constants/CShades.js";
import {
  CircleShape,
  ImageShape,
  SpiralShape,
  SquaredShape,
  TextShape,
  TriangleShape,
} from "../classes/index.js";
import type { ShadeItem } from "../classes/shapes/BaseShape.js";
import { TShadeColor } from "./TShadeItem.js";
import { TShapeOptions } from "./TShapeOptions.js";

export type TShadeType = (typeof SHADES_TYPES)[number] | string;

/**
 * Any shape class: built-in ones and custom shapes extending ShadeItem.
 * `options` holds the shape options plus extra ones a shape may read
 * (`text`, `font`, `imageSource`...).
 */
export type TShadeTypeConstructor = new (
  x: number,
  y: number,
  color: TShadeColor,
  options?: TShapeOptions & { [key: string]: unknown }
) => ShadeItem;

type IShadeTypeConstructors = {
  [key in TShadeType]: TShadeTypeConstructor;
};

export const SHADES_TYPES_CONSTRUCTORS_LIST: IShadeTypeConstructors = {
  square: SquaredShape,
  circle: CircleShape,
  text: TextShape,
  spiral: SpiralShape,
  image: ImageShape,
  triangle: TriangleShape,
};

export type TShadesTypesConstructors = typeof SHADES_TYPES_CONSTRUCTORS_LIST;
