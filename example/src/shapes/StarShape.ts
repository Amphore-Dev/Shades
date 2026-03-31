import { ShadeItem } from "@amphore-dev/shades";
import type {
  TShadeColor,
  TShadeConfig,
  TShapeOptions,
  TPoint,
} from "@amphore-dev/shades";

export class StarShape extends ShadeItem {
  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions = {}
  ) {
    super(x, y, color, { filled: true, rotation: true, ...options });
    this.type = "star"; // Custom shape type, must be unique
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: TShadeConfig,
    offset: TPoint
  ) => {
    const { gradRatio, nbrShades, totalWidth, totalHeight, center, width } =
      config;

    ctx.lineCap = "square";

    for (let i = 0; i < nbrShades; i++) {
      this.setColors(ctx, gradRatio, i);

      ctx.save();
      ctx.beginPath();

      // Compute star center position with offset and gradient effect
      const x =
        center.x +
        (this.position.x - totalWidth / 2 + width / 2) +
        offset.x * (1 - (gradRatio * i) / 100);
      const y =
        center.y +
        (this.position.y - totalHeight / 2 + width / 2) +
        offset.y * (1 - (gradRatio * i) / 100);

      // Apply rotation if enabled
      if (this.rotation) {
        ctx.translate(x, y);
        ctx.rotate(this.angle);
        ctx.translate(-x, -y);
      }

      const radius = width / 2;
      this.drawStar(ctx, x, y, radius, radius * 0.5, 5);

      this.drawPath(ctx);
      ctx.closePath();
      ctx.restore();

      // Update rotation angle for animation
      if (this.rotation) {
        this.angle += ((0.5 / nbrShades) * Math.PI) / 180;
      }
    }
  };

  private drawStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outerRadius: number,
    innerRadius: number,
    points: number
  ) {
    const step = Math.PI / points;
    let rot = (Math.PI / 2) * 3; // Start at the top point

    ctx.moveTo(x, y - outerRadius);

    for (let i = 0; i < points; i++) {
      ctx.lineTo(
        x + Math.cos(rot) * outerRadius,
        y + Math.sin(rot) * outerRadius
      );
      rot += step;
      ctx.lineTo(
        x + Math.cos(rot) * innerRadius,
        y + Math.sin(rot) * innerRadius
      );
      rot += step;
    }

    ctx.lineTo(x, y - outerRadius);
  }
}
