import { random } from "../../utils/UMaths.js";
import { TShadeColor, TShadeConfig, TShapeOptions } from "../../types/index.js";
import { TPoint } from "../../types/TPoints.js";
import { ShadeItem } from "./BaseShape.js";

const fontList = ["Remained"];
const curFont = fontList[random(0, fontList.length - 1, true)]; // Default to monospace for better compatibility

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
    this.font = options.font ?? curFont;
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
