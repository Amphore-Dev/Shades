import { TShadeColor, TShadeConfig, TShapeOptions } from "../../types/index.js";
import { TPoint } from "../../types/TPoints.js";
import { degToRad } from "../../utils/UMaths.js";
import { ShadeItem } from "./BaseShape.js";

/**
 * Triangle shape implementation with rotation animation
 */
export class TriangleShape extends ShadeItem {
  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions = {}
  ) {
    super(x, y, color, { filled: true, rotation: true, ...options });
    this.type = "triangle";
    this.angle = degToRad(90);
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

      ctx.moveTo(
        center.x +
          Math.cos(this.angle) * width +
          (this.position.x - totalWidth / 2 + width / 2) +
          offset.x * (1 - (gradRatio * i) / 100),
        center.y +
          Math.sin(this.angle) * width +
          (this.position.y - totalHeight / 2 + width / 2) +
          offset.y * (1 - (gradRatio * i) / 100)
      );

      ctx.lineTo(
        center.x +
          Math.cos(this.angle + (2 * Math.PI) / 3) * width +
          (this.position.x - totalWidth / 2 + width / 2) +
          offset.x * (1 - (gradRatio * i) / 100),
        center.y +
          Math.sin(this.angle + (2 * Math.PI) / 3) * width +
          (this.position.y - totalHeight / 2 + width / 2) +
          offset.y * (1 - (gradRatio * i) / 100)
      );

      ctx.lineTo(
        center.x +
          Math.cos(this.angle + (4 * Math.PI) / 3) * width +
          (this.position.x - totalWidth / 2 + width / 2) +
          offset.x * (1 - (gradRatio * i) / 100),
        center.y +
          Math.sin(this.angle + (4 * Math.PI) / 3) * width +
          (this.position.y - totalHeight / 2 + width / 2) +
          offset.y * (1 - (gradRatio * i) / 100)
      );

      ctx.closePath();
      this.drawPath(ctx);

      if (this.rotation) {
        this.angle += ((0.3 / nbrShades) * Math.PI) / 180;
      }
    }
  };
}
