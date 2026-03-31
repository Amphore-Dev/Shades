import { IShadeColor, IShadeConfig } from "../../interfaces/index.js";
import { IPoint } from "../../interfaces/Points.js";
import { ShadeItem } from "./BaseShape.js";

// const fontList = ["NEON", "Remained"];
const curFont = "Remained";

/**
 * Text shape implementation for displaying text
 */
export class TextShape extends ShadeItem {
  constructor(x: number, y: number, color: IShadeColor) {
    super(x, y, color);
    this.type = "text";
    this.filled = true;
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: IShadeConfig,
    offset: IPoint
  ) => {
    const { gradRatio, nbrShades, totalWidth, totalHeight, center, width } =
      config;

    const text = "SHADES"; // Default text instead of i18n
    ctx.font = `${width}px ${curFont}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let i = 0; i < nbrShades; i++) {
      this.setColors(ctx, gradRatio, i);

      ctx.fillText(
        text,
        width / 2 +
          center.x +
          (this.position.x - totalWidth / 2) +
          offset.x * (1 - (gradRatio * i) / 100),
        config.height / 2 +
          center.y +
          (this.position.y - totalHeight / 2) +
          offset.y * (1 - (gradRatio * i) / 100)
      );
    }
  };
}
