import { ShadeItem, TextShape, ImageShape } from "./index.js";
import {
  TPoint,
  TShadeColor,
  TShadeConfig,
  SHADES_TYPES_CONSTRUCTORS_LIST,
  TShadeTypeConstructor,
  TShadeType,
  TShadesPreset,
  TShapeOptions,
} from "../types/index.js";
import { HOME_COLORS, MAX_SHADES_NBR } from "../constants/index.js";
import { genConfig, getRandColors, random } from "../utils/index.js";

export type TShadesEngineDebugOptions = {
  className?: string;
};

/** Event type received by each interaction. */
export type TShadesInteractionEvents = {
  click: MouseEvent;
  wheel: WheelEvent;
  mouseMove: MouseEvent;
  touchMove: TouchEvent;
  resize: UIEvent;
};

/**
 * Replaces the engine's default behavior for an interaction.
 * Call `defaultHandler(event)` to keep (or wrap) the built-in behavior.
 */
export type TShadesInteractionHandler<E extends Event> = (
  event: E,
  engine: ShadesEngine,
  defaultHandler: (event: E) => void
) => void;

/** `true` (default): built-in behavior, `false`: disabled, function: custom handler. */
export type TShadesInteraction<E extends Event> =
  | boolean
  | TShadesInteractionHandler<E>;

export type TShadesEngineInteractions = {
  [K in keyof TShadesInteractionEvents]?: TShadesInteraction<
    TShadesInteractionEvents[K]
  >;
};

export type TShadesGenerationInfo = {
  /** 0-based generation index (the intro is generation 0 when enabled). */
  generation: number;
  intro: boolean;
  /** Index of the preset used, or `null` for the intro / a random generation. */
  presetIndex: number | null;
};

export type TShadesAutoMoveOptions = {
  /** Movement range, as a fraction of the canvas' smallest side. Defaults to 0.15. */
  amplitude?: number;
  /** Speed multiplier. Defaults to 1. */
  speed?: number;
  /** Delay (ms) after the last mouse/touch move before auto-move takes over again. Defaults to 3000. */
  resumeDelay?: number;
};

export type TShadesEngineOptions = {
  shapes?: TShadeType[]; // Allows specifying a list of shape types to use for each generation (e.g., ["circle", "square"])
  customShapes?: Record<string, TShadeTypeConstructor>; // Allows providing custom shape classes (e.g., { "myShape": MyCustomShape })
  debug?: boolean | TShadesEngineDebugOptions;
  fadeDuration?: number; // Fade duration in milliseconds (default: 500ms)
  /** Text drawn by text shapes. With an array, each item picks a random string and the intro uses the first one. Defaults to "SHADES". */
  text?: string | string[];
  /** Font family used by text shapes. */
  font?: string;
  /** Show the text intro before the first generation. Defaults to true. */
  intro?: boolean;
  /** Generations played in order, one per click/next(). Fields left out are randomized. */
  presets?: TShadesPreset[];
  /** What happens once every preset was played: start over ("loop") or switch to random generations ("random", default). */
  presetsEnd?: "loop" | "random";
  /** Enable, disable or override each user interaction. Every interaction is enabled by default. */
  interactions?: TShadesEngineInteractions;
  /** Called after each generation. */
  onGenerate?: (config: TShadeConfig, info: TShadesGenerationInfo) => void;
  /**
   * Drifts the parallax offset on its own, like the screensaver. Mouse/touch
   * moves still take over, and auto-move resumes after `resumeDelay`.
   * Disabled when the user prefers reduced motion.
   */
  autoMove?: boolean | TShadesAutoMoveOptions;
  /**
   * Plays the next generation automatically every `autoNext` ms. With
   * `autoMove`, it only runs while auto-moving, counted from when auto-move
   * took over.
   */
  autoNext?: number;
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
  private presetCursor = 0;
  private currentPresetIndex: number | null = null;
  private lastGenerationTime = 0;

  // Auto-move
  private autoMove: Required<TShadesAutoMoveOptions> | null = null;
  private autoMovePhases: number[] = [];
  private lastPointerMoveTime = -Infinity;
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

  // Event handlers attached by attachEventListeners, kept for removal
  private listeners: {
    target: EventTarget;
    type: string;
    handler: EventListener;
  }[] = [];

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

    this.setupCanvas();
    this.initializeDebug();
    this.initializeAutoMove();
  }

  private initializeAutoMove(): void {
    const { autoMove } = this.options;
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!autoMove || prefersReducedMotion) {
      this.autoMove = null;
      return;
    }

    this.autoMove = {
      amplitude: 0.15,
      speed: 1,
      resumeDelay: 3000,
      ...(typeof autoMove === "object" ? autoMove : {}),
    };
    // Random phases so each instance follows its own path
    this.autoMovePhases = Array.from(
      { length: 4 },
      () => Math.random() * Math.PI * 2
    );
  }

  /** Smooth looping path (sum of slow sines, same as the screensaver). */
  private getAutoMoveOffset(time: number): TPoint {
    const { amplitude, speed } = this.autoMove!;
    const [p1, p2, p3, p4] = this.autoMovePhases;
    const range =
      Math.min(this.canvas.clientWidth, this.canvas.clientHeight) * amplitude;
    const t = (time / 1000) * speed;

    return {
      x:
        Math.sin(t * 0.08 + p1) * range + Math.cos(t * 0.05 + p2) * range * 0.5,
      y:
        Math.cos(t * 0.06 + p3) * range + Math.sin(t * 0.04 + p4) * range * 0.5,
    };
  }

  private setupCanvas(): void {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  public generate(): void {
    this.attachEventListeners();

    // Wait for fonts to be ready (comme dans le code original)
    if (document.fonts) {
      document.fonts.ready.then(() => this.initDefaultGeneration());
    } else {
      this.initDefaultGeneration();
    }
  }

  private initDefaultGeneration(): void {
    if (this.options.intro === false) {
      this.applyNextConfig();
      this.genItems();
      return;
    }

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
      HOME_COLORS[random(0, HOME_COLORS.length - 1, true)],
      true
    );
  }

  /**
   * Picks the config of the next generation: the next preset if any is
   * left (or looping), otherwise a random one.
   */
  private applyNextConfig(): void {
    const presets = this.options.presets ?? [];

    if (
      this.presetCursor >= presets.length &&
      this.options.presetsEnd === "loop"
    ) {
      this.presetCursor = 0;
    }

    const preset: TShadesPreset | undefined = presets[this.presetCursor];

    if (!preset) {
      this.currentPresetIndex = null;
      this.config = genConfig(this.options);
      return;
    }

    this.currentPresetIndex = this.presetCursor;
    this.presetCursor++;

    const config: TShadeConfig = {
      ...genConfig(this.options, preset.type),
      ...preset,
    };

    if (preset.nbrShades !== undefined && preset.gradRatio === undefined) {
      config.gradRatio = 100 / preset.nbrShades;
    }
    if (preset.width !== undefined && preset.height === undefined) {
      config.height = preset.width;
    }

    this.config = config;
  }

  private getTexts(): string[] {
    const { text } = this.options;
    if (text === undefined) return [];
    return Array.isArray(text) ? text : [text];
  }

  private pickText(intro: boolean): string | undefined {
    const texts = this.getTexts();
    if (!texts.length) return undefined;
    return intro ? texts[0] : texts[random(0, texts.length - 1, true)];
  }

  private getConfig(): TShadeConfig {
    const config = this.config;

    // maybe used later for external config provision, but for now we just return the current config

    return { ...config };
  }

  private genItems(
    constructor?: TShadeTypeConstructor,
    forceColor?: TShadeColor | TShadeColor[],
    intro = false
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
    const colors = configColors?.length
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
        // Text options are ignored by non-text shapes
        const shapeOptions: TShapeOptions & { text?: string; font?: string } = {
          filled: fillFilter?.(mainColor, color ?? itemColor),
          rotation: rotationFilter?.(mainColor, color ?? itemColor),
          lineCap: config.lineCap,
          text: this.pickText(intro),
          font: this.options.font,
          ...(constructor === ImageShape ? { imageSource: undefined } : {}),
        };

        items.push(
          new ShadeConstructor(
            x * width + x * spacing,
            y * height + y * spacing,
            color ?? itemColor,
            shapeOptions
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
    this.lastGenerationTime = performance.now();

    this.options.onGenerate?.(this.getShadesConfig(), {
      generation: this.genCount,
      intro,
      presetIndex: intro ? null : this.currentPresetIndex,
    });

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

    // Auto-move drives the offset unless the pointer moved recently
    const isAutoMoving =
      !!this.autoMove &&
      start - this.lastPointerMoveTime > this.autoMove.resumeDelay;

    if (isAutoMoving) {
      this.targetOffset = this.getAutoMoveOffset(start);
    }

    // Smooth offset animation, slower while auto-moving for a softer drift
    const step = isAutoMoving ? 0.02 : 0.1;
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

    // With auto-move, auto-next only runs while auto-moving, counted from
    // when auto-move took over
    const autoNextFrom = this.autoMove
      ? Math.max(
          this.lastGenerationTime,
          this.lastPointerMoveTime + this.autoMove.resumeDelay
        )
      : this.lastGenerationTime;

    if (
      this.options.autoNext &&
      this.genCount > 0 &&
      !this.fade.isFading &&
      (!this.autoMove || isAutoMoving) &&
      start - autoNextFrom > this.options.autoNext
    ) {
      this.next();
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
    this.lastPointerMoveTime = performance.now();
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

    this.lastPointerMoveTime = performance.now();

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
        this.applyNextConfig();
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
    if (this.listeners.length) return;

    this.bindInteraction(this.canvas, "click", "click", () =>
      this.handleClick()
    );
    this.bindInteraction(this.canvas, "wheel", "wheel", (e) =>
      this.handleWheel(e)
    );
    this.bindInteraction(document, "mousemove", "mouseMove", (e) =>
      this.handleMouseMove(e)
    );
    this.bindInteraction(document, "touchmove", "touchMove", (e) =>
      this.handleTouchMove(e)
    );
    this.bindInteraction(window, "resize", "resize", () => this.handleResize());
  }

  /**
   * Attaches the default handler of an interaction, a user override, or
   * nothing, depending on `options.interactions[key]`.
   */
  private bindInteraction<K extends keyof TShadesInteractionEvents>(
    target: EventTarget,
    type: string,
    key: K,
    defaultHandler: (event: TShadesInteractionEvents[K]) => void
  ): void {
    const interaction = this.options.interactions?.[key] ?? true;
    if (interaction === false) return;

    const handler =
      typeof interaction === "function"
        ? (event: Event) =>
            interaction(
              event as TShadesInteractionEvents[K],
              this,
              defaultHandler
            )
        : (event: Event) =>
            defaultHandler(event as TShadesInteractionEvents[K]);

    target.addEventListener(type, handler);
    this.listeners.push({ target, type, handler });
  }

  private detachEventListeners(): void {
    this.listeners.forEach(({ target, type, handler }) =>
      target.removeEventListener(type, handler)
    );
    this.listeners = [];
  }

  // Public API methods for external interaction

  public start(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    // Auto-move waits resumeDelay before its first drift, as after a pointer move
    this.lastPointerMoveTime = performance.now();
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
    this.presetCursor = 0;
    this.currentPresetIndex = null;
    this.offset = { x: 0, y: 0 };
    this.targetOffset = { x: 0, y: 0 };
  }

  /** Fades out and plays the next generation (next preset or random). */
  public next(): void {
    this.handleClick();
  }

  public regenerate(): void {
    this.next();
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

  /**
   * Enables, disables or reconfigures auto-move at runtime. Like on start,
   * the first drift waits `resumeDelay`.
   */
  public setAutoMove(value: boolean | TShadesAutoMoveOptions): void {
    this.options.autoMove = value;
    this.initializeAutoMove();
    this.lastPointerMoveTime = performance.now();
  }

  /**
   * Plays the next generation every `delay` ms, counted from now; `0` or
   * no value disables it.
   */
  public setAutoNext(delay?: number): void {
    this.options.autoNext = delay;
    this.lastGenerationTime = performance.now();
  }

  /**
   * Moves the parallax target, relative to the canvas center (defaults to
   * the center), as if the pointer moved there. Auto-move resumes after
   * `resumeDelay`.
   */
  public setTargetOffset(offset: TPoint = { x: 0, y: 0 }): void {
    this.targetOffset = { ...offset };
    this.lastPointerMoveTime = performance.now();
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
