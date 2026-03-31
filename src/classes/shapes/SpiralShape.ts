import { IShadeColor, IShadeConfig } from "../../interfaces/index.js";
import { IPoint } from "../../interfaces/Points.js";
import { ShadeItem } from "./BaseShape.js";

/**
 * Spiral shape implementation with rotation animation
 */
export class SpiralShape extends ShadeItem {
  constructor(
    x: number,
    y: number,
    color: IShadeColor,
    filled: boolean = false,
    rotation: boolean = true
  ) {
    super(x, y, color);
    this.type = "spiral";
    this.angle = 0;
    this.rotation = rotation;
    this.filled = filled;
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: IShadeConfig,
    offset: IPoint
  ) => {
    const { gradRatio, nbrShades, totalWidth, totalHeight, center, width } =
      config;

    for (let i = 0; i < nbrShades; i++) {
      this.setColors(ctx, gradRatio, i);

      ctx.beginPath();
      ctx.arc(
        center.x +
          (this.position.x - totalWidth / 2 + width / 2) +
          offset.x * (1 - (gradRatio * i) / 100),
        center.y +
          (this.position.y - totalHeight / 2 + width / 2) +
          offset.y * (1 - (gradRatio * i) / 100),
        width / 2,
        this.angle + ((nbrShades - i) * 8 * Math.PI) / 180,
        this.angle + ((180 + (nbrShades - i) * 8) * Math.PI) / 180
      );

      this.drawPath(ctx);
      ctx.closePath();

      if (this.rotation) this.angle += ((2 / nbrShades) * Math.PI) / 180;
    }
  };
}
