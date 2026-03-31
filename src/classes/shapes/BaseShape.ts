import {
  TShadeColor,
  TShadeConfig,
  TShadeType,
  TShapeOptions,
} from "../../types/index.js";
import { TPoint } from "../../types/TPoints.js";

/**
 * Base class for all shape types
 */
export class ShadeItem {
  id: string;
  position: TPoint;
  angle: number = 0;
  rotation: boolean = false;
  color: TShadeColor;
  type: TShadeType = "circle";
  filled: boolean = false;
  lineCap: "butt" | "round" | "square" = "butt";

  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions = {}
  ) {
    // random id
    this.id = Math.random().toString(36).slice(2, 10);
    this.position = { x, y };
    this.color = color;

    // Apply options with defaults
    this.filled = options.filled ?? false;
    this.rotation = options.rotation ?? false;
    this.lineCap = options.lineCap ?? "butt";
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: TShadeConfig,
    offset: TPoint
  ) => {
    console.warn("draw method not implemented");
  };

  drawPath = (ctx: CanvasRenderingContext2D) => {
    const savedLineCap = ctx.lineCap;
    ctx.lineCap = this.lineCap;

    if (this.filled) ctx.fill();
    else ctx.stroke();
    ctx.lineCap = savedLineCap;
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
