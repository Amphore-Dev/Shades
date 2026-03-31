import {
  IShadeColor,
  IShadeConfig,
  TShadeType,
} from "../../interfaces/index.js";
import { IPoint } from "../../interfaces/Points.js";

/**
 * Base class for all shape types
 */
export class ShadeItem {
  id: string;
  position: IPoint;
  angle: number = 0;
  rotation: boolean = false;
  color: IShadeColor;
  type: TShadeType = "circle";
  filled: boolean = false;

  constructor(x: number, y: number, color: IShadeColor) {
    // random id
    this.id = Math.random().toString(36).substr(2, 9);
    this.position = { x, y };
    this.color = color;
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: IShadeConfig,
    offset: IPoint
  ) => {
    console.warn("draw method not implemented");
  };

  drawPath = (ctx: CanvasRenderingContext2D) => {
    if (this.filled) ctx.fill();
    else ctx.stroke();
  };

  setColors = (ctx: CanvasRenderingContext2D, gradRatio: number, i: number) => {
    if (!this.color) return;
    const { r, g, b } = this.color;
    if (this.filled)
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${1 - (gradRatio * i) / 100})`;
    else
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${1 - (gradRatio * i) / 100})`;
  };
}
