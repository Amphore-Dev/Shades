import { SHADES_TYPES } from "@/constants/CShades.js";
import {
  CircleShape,
  ImageShape,
  SpiralShape,
  SquaredShape,
  TextShape,
  TriangleShape,
} from "../classes/index.js";

export type TShadeType = (typeof SHADES_TYPES)[number] | string;

export type TShadeTypeConstructor =
  | typeof SquaredShape
  | typeof CircleShape
  | typeof TextShape
  | typeof SpiralShape
  | typeof ImageShape
  | typeof TriangleShape;

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

export type ShadesTypesCodstructors = typeof SHADES_TYPES_CONSTRUCTORS_LIST;
