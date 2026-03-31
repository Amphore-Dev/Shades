import { TShadeColor, TShadeConfig, TShapeOptions } from "../../types/index.js";
import { TPoint } from "../../types/TPoints.js";
import { ShadeItem } from "./BaseShape.js";

/**
 * Circle shape implementation
 */
export class CircleShape extends ShadeItem {
  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions = {}
  ) {
    super(x, y, color, { filled: true, ...options });
    this.type = "circle";
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: TShadeConfig,
    offset: TPoint
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
        0,
        2 * Math.PI
      );

      this.drawPath(ctx);
      ctx.closePath();
    }
  };
}
