import {
  CircleShape,
  ImageShape,
  SpiralShape,
  SquaredShape,
  TextShape,
  TriangleShape,
} from "../classes/ShadeItem.js";

export const ShadesTypes: string[] = [
  "square",
  "circle",
  //   "text",
  "spiral",
  //   "image",
  "triangle",
];

export type TShadeType = (typeof ShadesTypes)[number];

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

export const ShadesTypesConstructorsList: IShadeTypeConstructors = {
  square: SquaredShape,
  circle: CircleShape,
  text: TextShape,
  spiral: SpiralShape,
  image: ImageShape,
  triangle: TriangleShape,
};

export type ShadesTypesCodstructors = typeof ShadesTypesConstructorsList;
