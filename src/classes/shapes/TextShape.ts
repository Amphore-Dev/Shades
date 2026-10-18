import { TShadeColor, TShadeConfig, TShapeOptions } from "../../types/index.js";
import { TPoint } from "../../types/TPoints.js";
import { ShadeItem } from "./BaseShape.js";

// Shades doesn't ship a font: pass `font` (loaded by the page) to change it
const DEFAULT_FONT = "sans-serif";

/**
 * Text shape implementation for displaying text
 */
export class TextShape extends ShadeItem {
  text: string;
  font: string;

  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions & { text?: string; font?: string } = {}
  ) {
    super(x, y, color, { ...options, filled: true });
    this.type = "text";
    this.text = options.text ?? "SHADES";
    this.font = options.font ?? DEFAULT_FONT;
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: TShadeConfig,
    offset: TPoint
  ) => {
    const { gradRatio, nbrShades, totalWidth, totalHeight, center, width } =
      config;

    const text = this.text; // Use the text from the options
    ctx.font = `${width}px ${this.font}`;
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
