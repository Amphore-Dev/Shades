import { IShadeColor, IShadeConfig } from "../../interfaces/index.js";
import { IPoint } from "../../interfaces/Points.js";
import { degToRad } from "../../utils/maths.js";
import { ShadeItem } from "./BaseShape.js";

/**
 * Triangle shape implementation with rotation animation
 */
export class TriangleShape extends ShadeItem {
  constructor(
    x: number,
    y: number,
    color: IShadeColor,
    filled: boolean = true,
    rotation: boolean = true
  ) {
    super(x, y, color);
    this.rotation = rotation;
    this.type = "triangle";
    this.filled = filled;
    this.angle = degToRad(90);
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

      ctx.lineTo(
        center.x +
          Math.cos(this.angle) * width +
          (this.position.x - totalWidth / 2 + width / 2) +
          offset.x * (1 - (gradRatio * i) / 100),
        center.y +
          Math.sin(this.angle) * width +
          (this.position.y - totalHeight / 2 + width / 2) +
          offset.y * (1 - (gradRatio * i) / 100)
      );

      this.drawPath(ctx);
      ctx.closePath();

      if (this.rotation) {
        this.angle += ((0.3 / nbrShades) * Math.PI) / 180;
      }
    }
  };
}
