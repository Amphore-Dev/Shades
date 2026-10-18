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

/** Built-in shapes. "image" needs an imageSource, so it's never picked at random. */
export type TBuiltinShadeType = (typeof SHADES_TYPES)[number] | "image";

/**
 * A built-in shape (autocompleted) or the key of a shape registered in
 * `customShapes`. Unknown types throw when generated.
 */
export type TShadeType = TBuiltinShadeType | (string & {});

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

export const SHADES_TYPES_CONSTRUCTORS_LIST: Record<
  TBuiltinShadeType,
  TShadeTypeConstructor
> = {
  square: SquaredShape,
  circle: CircleShape,
  text: TextShape,
  spiral: SpiralShape,
  image: ImageShape,
  triangle: TriangleShape,
};

export type TShadesTypesConstructors = typeof SHADES_TYPES_CONSTRUCTORS_LIST;
