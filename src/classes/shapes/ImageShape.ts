import { TShadeColor, TShadeConfig, TShapeOptions } from "../../types/index.js";
import { TPoint } from "../../types/TPoints.js";
import { intToHex, rgbToHex } from "../../utils/UColors.js";
import { ShadeItem } from "./BaseShape.js";

/**
 * Image shape that displays images (SVG, PNG, JPG, etc.)
 * More flexible than the original LogoShape - accepts image URLs or HTMLImageElement
 */
export class ImageShape extends ShadeItem {
  image?: HTMLImageElement;
  imageUrl?: string;
  hasImageLoaded: boolean = false;
  hexColor: string;

  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions & {
      imageSource?: string | HTMLImageElement | HTMLElement;
    } = {}
  ) {
    super(x, y, color, { filled: true, rotation: false, ...options });
    this.type = "image";

    this.hexColor = rgbToHex(this.color);
    this.loadImage(options.imageSource);
  }

  private loadImage(
    imageSource?: string | HTMLImageElement | HTMLElement
  ): void {
    if (!imageSource) {
      // Fallback: try to find a Logo element in DOM
      const svg = document.getElementById("Logo") as HTMLElement;
      if (svg) {
        this.loadFromSVGElement(svg);
      }
      return;
    }

    if (typeof imageSource === "string") {
      // Load from URL
      this.imageUrl = imageSource;
      this.loadFromUrl(imageSource);
    } else if (imageSource instanceof HTMLImageElement) {
      // Use existing image element
      this.image = imageSource;
      this.hasImageLoaded = imageSource.complete;
      if (!this.hasImageLoaded) {
        imageSource.onload = () => {
          this.hasImageLoaded = true;
        };
      }
    } else {
      // Assume it's an SVG or other HTML element
      this.loadFromSVGElement(imageSource);
    }
  }

  private loadFromUrl(url: string): void {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS if needed
    img.onload = () => {
      this.hasImageLoaded = true;
    };
    img.onerror = () => {
      console.warn(`Failed to load image from URL: ${url}`);
    };
    img.src = url;
    this.image = img;
  }

  private loadFromSVGElement(element: HTMLElement): void {
    try {
      const serializedSVG = new XMLSerializer().serializeToString(element);
      const img = new Image();
      img.onload = () => {
        this.hasImageLoaded = true;
      };
      img.onerror = () => {
        console.warn("Failed to load SVG element as image");
      };
      img.src =
        "data:image/svg+xml;charset=utf-8;base64, " + btoa(serializedSVG);
      this.image = img;
    } catch (error) {
      console.warn("Failed to serialize SVG element:", error);
    }
  }

  setColors = (ctx: CanvasRenderingContext2D, gradRatio: number, i: number) => {
    this.hexColor =
      rgbToHex(this.color) +
      intToHex(Math.round(255 * ((gradRatio * i) / 100)));
  };

  draw = (
    ctx: CanvasRenderingContext2D,
    config: TShadeConfig,
    offset: TPoint
  ) => {
    const { gradRatio, nbrShades, center } = config;

    if (!this.hasImageLoaded || !this.image) return;

    const heightRatio = (document.body.clientHeight * 0.77) / this.image.height;

    const width = this.image.width * heightRatio;
    const height = this.image.height * heightRatio;

    for (let i = 0; i < nbrShades; i++) {
      this.setColors(ctx, gradRatio, i);
      ctx.fillStyle = this.hexColor;
      ctx.beginPath();
      ctx.drawImage(
        this.image,
        center.x +
          this.position.x -
          width / 2 +
          offset.x * (1 - (gradRatio * i) / 100),
        center.y +
          this.position.y -
          height / 2 +
          offset.y * (1 - (gradRatio * i) / 100),
        width,
        height
      );
      ctx.globalCompositeOperation = "source-in";
      ctx.fillRect(0, 0, document.body.clientWidth, document.body.clientHeight);
      ctx.globalCompositeOperation = "source-over";
      ctx.closePath();
    }
  };
}
