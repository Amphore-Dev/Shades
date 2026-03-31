import { TShadeColor, TShadeConfig, TShapeOptions } from "../../types/index.js";
import { TPoint } from "../../types/TPoints.js";
import { ShadeItem } from "./BaseShape.js";

/**
 * Heart shape implementation for drawing heart shapes
 */
export class HeartShape extends ShadeItem {
  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions = {}
  ) {
    super(x, y, color, { filled: true, ...options });
    this.type = "heart";
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: TShadeConfig,
    offset: TPoint
  ) => {
    const {
      gradRatio,
      nbrShades,
      totalWidth,
      totalHeight,
      center,
      width,
      height,
    } = config;
    const size = Math.min(width, height) / 2;

    const savedLineCap = ctx.lineCap;

    ctx.lineCap = "round";

    for (let i = 0; i < nbrShades; i++) {
      this.setColors(ctx, gradRatio, i);

      const x =
        this.position.x +
        center.x -
        totalWidth / 2 +
        offset.x * (1 - (gradRatio * i) / 100);
      const y =
        this.position.y +
        center.y -
        totalHeight / 2 +
        offset.y * (1 - (gradRatio * i) / 100);

      ctx.beginPath();

      // Left side of heart
      ctx.moveTo(x, y + size / 6);
      ctx.bezierCurveTo(
        x - size * 0.8,
        y - size * 0.8,
        x - size * 0.8,
        y + size * 0.6,
        x,
        y + size
      );

      // Right side of heart
      ctx.bezierCurveTo(
        x + size * 0.8,
        y + size * 0.6,
        x + size * 0.8,
        y - size * 0.8,
        x,
        y + size / 6
      );

      this.drawPath(ctx);
      ctx.closePath();
    }

    ctx.lineCap = savedLineCap;
  };
}
