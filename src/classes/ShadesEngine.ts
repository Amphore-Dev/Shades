import { ShadeItem, TextShape, ImageShape } from "./index.js";
import {
  TPoint,
  TShadeColor,
  TShadeConfig,
  SHADES_TYPES_CONSTRUCTORS_LIST,
  TShadeTypeConstructor,
  TShadeType,
} from "../types/index.js";
import { HOME_COLORS, MAX_SHADES_NBR } from "../constants/index.js";
import { genConfig, getRandColors, random } from "../utils/index.js";

export type TShadesEngineDebugOptions = {
  className?: string;
};

export type TShadesEngineOptions = {
  shapes?: TShadeType[]; // Allows specifying a list of shape types to use for each generation (e.g., ["circle", "square"])
  customShapes?: Record<string, TShadeTypeConstructor>; // Allows providing custom shape classes (e.g., { "myShape": MyCustomShape })
  debug?: boolean | TShadesEngineDebugOptions;
  fadeDuration?: number; // Fade duration in milliseconds (default: 500ms)
};

export class ShadesEngine {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private options: TShadesEngineOptions;

  // Internal state (previously React useRef equivalents)
  private items: ShadeItem[] = [];
  private config: TShadeConfig;
  private offset: TPoint = { x: 0, y: 0 };
  private targetOffset: TPoint = { x: 0, y: 0 };
  private genCount = 0;
  private fade = {
    isFading: true,
    opacity: 0,
    targetOpacity: 1,
    startOpacity: 0,
    startTime: 0,
    onDone: () => {},
  };

  // Animation
  private animationFrameId: number | null = null;
  private isPlaying = false;
  private elapsedTime = 1;
  private framesCount = { count: 0, fps: 0 };
  private lastPinchDistance: number | null = null; // For pinch to adjust shades on touch devices

  // Event handlers
  private boundHandleClick: () => void;
  private boundHandleMouseMove: (e: MouseEvent) => void;
  private boundHandleTouchMove: (e: TouchEvent) => void;
  private boundHandleWheel: (e: WheelEvent) => void;
  private boundHandleResize: () => void;

  // Debug
  private debug: boolean | TShadesEngineDebugOptions = false;
  private debugContainer: HTMLPreElement | null = null;

  constructor(canvas: HTMLCanvasElement, options: TShadesEngineOptions = {}) {
    this.canvas = canvas;
    this.options = options;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Cannot get 2D context from canvas");
    }
    this.context = context;

    this.config = genConfig(this.options);

    // Initialize startTime and startOpacity for the first fade
    this.fade.startTime = performance.now();
    this.fade.startOpacity = 0;

    // Bind event handlers
    this.boundHandleClick = this.handleClick.bind(this);
    this.boundHandleMouseMove = this.handleMouseMove.bind(this);
    this.boundHandleTouchMove = this.handleTouchMove.bind(this); // For touch devices, we can use the same handler as mouse move
    this.boundHandleWheel = this.handleWheel.bind(this);
    this.boundHandleResize = this.handleResize.bind(this);

    this.setupCanvas();
    this.initializeDebug();
  }

  private setupCanvas(): void {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  public generate(): void {
    this.attachEventListeners();

    // Wait for fonts to be ready (comme dans le code original)
    if (document.fonts) {
      document.fonts.ready.then(() => {
        this.config = {
          ...this.config,
          nbrItemsX: 1,
          nbrItemsY: 1,
          nbrShades: 10,
          gradRatio: 100 / 10,
          width: document.body.clientWidth / 6,
          height: document.body.clientWidth / 6,
        };

        this.genItems(
          TextShape,
          HOME_COLORS[random(0, HOME_COLORS.length - 1, true)]
        );
      });
    } else {
      this.initDefaultGeneration();
    }
  }

  private initDefaultGeneration(): void {
    this.config = {
      ...this.config,
      nbrItemsX: 1,
      nbrItemsY: 1,
      nbrShades: 10,
      gradRatio: 100 / 10,
      width: document.body.clientWidth / 6,
      height: document.body.clientWidth / 6,
    };

    this.genItems(
      TextShape,
      HOME_COLORS[random(0, HOME_COLORS.length - 1, true)]
    );
  }

  private getConfig(): TShadeConfig {
    const config = this.config;

    // maybe used later for external config provision, but for now we just return the current config

    return { ...config };
  }

  private genItems(
    constructor?: TShadeTypeConstructor,
    forceColor?: TShadeColor | TShadeColor[]
  ): void {
    const config = this.getConfig();
    const {
      width,
      height,
      spacing,
      nbrItemsX,
      nbrItemsY,
      type,
      rotationFilter,
      fillFilter,
      colors: configColors,
      mainColor: configMainColor,
    } = config;

    const items: ShadeItem[] = [];
    // For genCount > 1), ignore configColors and generate new colors
    const colors =
      this.genCount > 1
        ? getRandColors(type)
        : configColors?.length
          ? configColors
          : Array.isArray(forceColor)
            ? forceColor
            : getRandColors(type);

    const color =
      forceColor && !Array.isArray(forceColor) ? forceColor : undefined;

    const mainColor =
      configMainColor ?? colors[random(0, colors.length - 1, true)];

    const ShadeConstructor =
      constructor ??
      this.options.customShapes?.[type] ??
      SHADES_TYPES_CONSTRUCTORS_LIST[type];

    for (let x = 0; x < nbrItemsX; x++) {
      for (let y = 0; y < nbrItemsY; y++) {
        const index = random(0, colors.length - 1, true);
        const itemColor = colors[index];

        items.push(
          new ShadeConstructor(
            x * width + x * spacing,
            y * height + y * spacing,
            color ?? itemColor,
            {
              filled: fillFilter?.(mainColor, color ?? itemColor),
              rotation: rotationFilter?.(mainColor, color ?? itemColor),
              lineCap: config.lineCap,
              ...(constructor === ImageShape ? { imageSource: undefined } : {}),
            }
          )
        );
      }
    }

    this.config = {
      ...this.config,
      ...config,
      rotationFilter,
      fillFilter,
      colors,
      mainColor,
      totalWidth: nbrItemsX * width + (nbrItemsX - 1) * spacing,
      totalHeight: nbrItemsY * height + (nbrItemsY - 1) * spacing,
    };

    this.items = items;
    this.genCount++;
  }

  private animate(): void {
    if (!this.isPlaying) return;

    const start = performance.now();

    this.context.clearRect(0, 0, this.canvas.width + 2, this.canvas.height + 2);
    this.context.lineWidth = this.config.thickness;

    this.items.forEach((item) => {
      item.draw(this.context, this.config, this.offset);
    });

    // Smooth offset animation
    const step = 0.1;
    this.offset = {
      x: (this.targetOffset.x - this.offset.x) * step + this.offset.x,
      y: (this.targetOffset.y - this.offset.y) * step + this.offset.y,
    };

    if (
      this.offset.x !== this.targetOffset.x &&
      Math.abs(this.offset.x - this.targetOffset.x) < 1
    ) {
      this.offset.x = this.targetOffset.x;
    }
    if (
      this.offset.y !== this.targetOffset.y &&
      Math.abs(this.offset.y - this.targetOffset.y) < 1
    ) {
      this.offset.y = this.targetOffset.y;
    }

    // Fade animation
    if (this.fade.isFading) {
      const fadeDuration =
        (this.options.fadeDuration ?? 1000) / (this.genCount ? 2 : 1); // Speed up fade for subsequent generations (fade duration = fadeIn + fadeOut)
      const currentTime = performance.now();
      const { targetOpacity, startTime, onDone } = this.fade;

      // Calculate progress based on elapsed real time
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / fadeDuration, 1);

      // Interpolate between startOpacity and targetOpacity
      const { startOpacity } = this.fade;
      this.fade.opacity =
        startOpacity + (targetOpacity - startOpacity) * progress;

      // Fade completed
      if (progress >= 1) {
        this.fade.opacity = targetOpacity;
        this.fade.isFading = false;
        if (targetOpacity === 0) {
          onDone();
        }
      }
    }

    // Apply fade overlay
    this.context.fillStyle = `rgba(0,0,0,${1 - this.fade.opacity})`;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const stop = performance.now();
    this.elapsedTime = stop - start;
    this.framesCount.count++;

    if (this.options.debug) {
      this.updateDebug();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  private getCenter(): TPoint {
    return {
      x: this.canvas.clientWidth / 2,
      y: this.canvas.clientHeight / 2,
    };
  }

  private handleMouseMove(event: MouseEvent): void {
    const center = this.getCenter();
    this.targetOffset = {
      x: event.clientX - center.x,
      y: event.clientY - center.y,
    };
  }

  private handleTouchMove(event: TouchEvent): void {
    const [touch1, touch2] = event.touches;

    if (!touch1) {
      return;
    }

    if (touch1 && touch2) {
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (this.lastPinchDistance !== null) {
        this.adjustShadesCount(
          (currentDistance - this.lastPinchDistance) * 0.01
        );
      }

      this.lastPinchDistance = currentDistance;
    } else {
      this.lastPinchDistance = null;
    }

    const center = this.getCenter();

    this.targetOffset = {
      x: touch1.clientX - center.x,
      y: touch1.clientY - center.y,
    };
  }

  private adjustShadesCount(scale: number): void {
    const nbrShades = this.config.nbrShades;
    let newValue = nbrShades + scale;

    if (newValue < 1) newValue = 1;
    else if (newValue > MAX_SHADES_NBR) newValue = MAX_SHADES_NBR;

    this.config = {
      ...this.config,
      nbrShades: newValue,
      gradRatio: 100 / newValue,
    };
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    const forceScroll = event.deltaY;

    if (forceScroll < 0) return this.adjustShadesCount(0.1);
    if (forceScroll > 0) return this.adjustShadesCount(-0.1);
  }

  private handleClick(): void {
    if (this.fade.isFading && this.fade.targetOpacity === 0) return;

    // Keep current opacity as the starting point for fade out
    const currentOpacity = this.fade.opacity;

    this.fade = {
      ...this.fade,
      isFading: true,
      startOpacity: currentOpacity,
      targetOpacity: 0,
      startTime: performance.now(),
      onDone: () => {
        this.fade = {
          ...this.fade,
          isFading: true,
          startOpacity: 0,
          targetOpacity: 1,
          startTime: performance.now(),
          onDone: () => {},
        };
        this.config = genConfig(this.options);
        this.genItems();
      },
    };
  }

  private handleResize(): void {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.config = {
      ...this.config,
      center: this.getCenter(),
    };

    this.offset = { x: 0, y: 0 };
  }

  private attachEventListeners(): void {
    this.canvas.addEventListener("click", this.boundHandleClick);
    this.canvas.addEventListener("wheel", this.boundHandleWheel);
    document.addEventListener("mousemove", this.boundHandleMouseMove);
    document.addEventListener("touchmove", this.boundHandleTouchMove);
    window.addEventListener("resize", this.boundHandleResize);
  }

  private detachEventListeners(): void {
    this.canvas.removeEventListener("click", this.boundHandleClick);
    this.canvas.removeEventListener("wheel", this.boundHandleWheel);
    document.removeEventListener("mousemove", this.boundHandleMouseMove);
    document.removeEventListener("touchmove", this.boundHandleTouchMove);
    window.removeEventListener("resize", this.boundHandleResize);
  }

  // Public API methods for external interaction

  public start(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.animate();
    this.startFPSCounter();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy(): void {
    this.pause();
    this.detachEventListeners();

    // Clean up debug element
    if (this.debugContainer) {
      this.debugContainer.remove();
      this.debugContainer = null;
    }

    // Reset state
    this.items = [];
    this.genCount = 0;
    this.offset = { x: 0, y: 0 };
    this.targetOffset = { x: 0, y: 0 };
  }

  public regenerate(): void {
    this.handleClick();
  }

  public getShadesConfig(): TShadeConfig {
    return { ...this.config };
  }

  public getItems(): ShadeItem[] {
    return [...this.items];
  }

  public isAnimating(): boolean {
    return this.isPlaying;
  }

  public setShadesCount(scale: number): void {
    this.adjustShadesCount(scale);
  }

  // Debug methods

  private initializeDebug(): void {
    if (this.options.debug) {
      const debugElement = document.createElement("pre");
      debugElement.className =
        typeof this.options.debug === "object" && this.options.debug.className
          ? this.options.debug.className
          : "shades-debug";
      debugElement.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 10;
        color: white;
        text-align: left;
        font-family: monospace;
        font-size: 12px;
        background: rgba(0,0,0,0.5);
        padding: 10px;
        pointer-events: none;
      `;

      // Insert before canvas in DOM
      this.canvas.parentNode?.insertBefore(debugElement, this.canvas);
      this.debugContainer = debugElement;
    }
  }

  private startFPSCounter(): void {
    setInterval(() => {
      this.framesCount = {
        count: 0,
        fps: this.framesCount.count,
      };
    }, 1000);
  }

  private updateDebug(): void {
    const debugElement = this.debugContainer;
    if (debugElement) {
      debugElement.innerHTML = `
Width: ${this.canvas.width}
Height: ${this.canvas.height}
IsPlaying: ${this.isPlaying}
Elapsed Time: ${this.elapsedTime.toFixed(2)}ms
FPS: ${this.framesCount.fps}
Items: ${this.items.length}
Generation: ${this.genCount}
      `.trim();
    }
  }

  public getDebugInfo(): { genCount: number; config: TShadeConfig } {
    return {
      genCount: this.genCount,
      config: { ...this.config },
    };
  }

  public setDebug(value: boolean | TShadesEngineDebugOptions): void {
    this.options.debug = value;
    if (value) {
      this.initializeDebug();
    } else {
      const debugElement = document.querySelector(".shades-debug");
      if (debugElement) {
        debugElement.remove();
      }
    }
  }
}
