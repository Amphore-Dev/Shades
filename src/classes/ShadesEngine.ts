import { ShadeItem } from "./index.js";
import {
  TPoint,
  TShadeColor,
  TShadeConfig,
  SHADES_TYPES_CONSTRUCTORS_LIST,
  TShadeTypeConstructor,
  TShadeType,
  TBuiltinShadeType,
  TShadesPreset,
  TShapeOptions,
} from "../types/index.js";
import { MAX_ITEMS_NBR, MAX_SHADES_NBR } from "../constants/index.js";
import {
  genConfig,
  getGridSize,
  getItemPosition,
  getRandColors,
  random,
} from "../utils/index.js";
import {
  createAutoMovePhases,
  getAutoMovePoint,
  resolveAutoMove,
  TResolvedAutoMove,
  TShadesAutoMoveOptions,
} from "./engine/autoMove.js";
import {
  DebugOverlay,
  TShadesEngineDebugOptions,
} from "./engine/DebugOverlay.js";
import {
  InteractionBinder,
  TShadesEngineInteractions,
} from "./engine/interactions.js";

export type * from "./engine/autoMove.js";
export type * from "./engine/DebugOverlay.js";
export type * from "./engine/interactions.js";

export type TShadesGenerationInfo = {
  /** 0-based generation index (the intro, when given, is generation 0). */
  generation: number;
  intro: boolean;
  /** Index of the preset used, or `null` for the intro / a random generation. */
  presetIndex: number | null;
};

export type TShadesEngineOptions = {
  shapes?: TShadeType[]; // Allows specifying a list of shape types to use for each generation (e.g., ["circle", "square"])
  customShapes?: Record<string, TShadeTypeConstructor>; // Allows providing custom shape classes (e.g., { "myShape": MyCustomShape })
  debug?: boolean | TShadesEngineDebugOptions;
  fadeDuration?: number; // Fade duration in milliseconds (default: 1000ms)
  /** Text drawn by text shapes. With an array, each item picks a random string and the intro uses the first one. Defaults to "SHADES". */
  text?: string | string[];
  /** Font family used by text shapes. */
  font?: string;
  /** First generation, before the presets. Fields left out are randomized. Without it, the engine starts with the presets (or random generations). */
  intro?: TShadesPreset;
  /** Generations played in order, one per click/next(). Fields left out are randomized. */
  presets?: TShadesPreset[];
  /** What happens once every preset was played: start over ("loop") or switch to random generations ("random", default). */
  presetsEnd?: "loop" | "random";
  /** Enable, disable or override each user interaction. Every interaction is enabled by default. */
  interactions?: TShadesEngineInteractions;
  /** Called after each generation. */
  onGenerate?: (config: TShadeConfig, info: TShadesGenerationInfo) => void;
  /**
   * Called when the current generation changes without a new one starting:
   * shades count (wheel, pinch, setShadesCount), setItemsCount, setSpacing,
   * setColors.
   */
  onChange?: (config: TShadeConfig) => void;
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
  private isIntroGeneration = false;
  private lastGenerationTime = 0;

  // Auto-move
  private autoMove: TResolvedAutoMove | null = null;
  private autoMovePhases: number[] = [];
  private lastPointerMoveTime = -Infinity;
  // Bumped by destroy() so a generate() still waiting for fonts gives up
  private lifecycle = 0;
  // Path time (s), advanced by frame delta x speed so speed changes don't jump
  private autoMoveTime = 0;
  private lastFrameTime: number | null = null;
  // Drawn into while fading, then copied at the fade opacity: fading the
  // whole frame keeps overlapping layers as they are, on any background
  private fadeBuffer: HTMLCanvasElement | null = null;
  // Frames are only drawn when something changed or moves: set by any change
  // of the items or config, cleared once drawn
  private needsRender = true;
  private hasAnimatedItems = false;
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
  private fpsIntervalId: ReturnType<typeof setInterval> | null = null;
  private lastPinchDistance: number | null = null; // For pinch to adjust shades on touch devices

  // Set by attachEventListeners, cleared by destroy
  private interactions: InteractionBinder | null = null;
  private debugOverlay: DebugOverlay | null = null;

  constructor(canvas: HTMLCanvasElement, options: TShadesEngineOptions = {}) {
    this.canvas = canvas;
    // Own copy: setters (setAutoMove, setFadeDuration…) must not write into
    // the object the caller passed
    this.options = { ...options };

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Cannot get 2D context from canvas");
    }
    this.context = context;

    this.config = this.genConfig();

    // Initialize startTime and startOpacity for the first fade
    this.fade.startTime = performance.now();
    this.fade.startOpacity = 0;

    this.setupCanvas();
    this.initializeDebug();
    this.initializeAutoMove();
  }

  private initializeAutoMove(): void {
    this.autoMove = resolveAutoMove(this.options.autoMove);
    // Kept when reconfigured, so the path doesn't jump
    if (this.autoMove && !this.autoMovePhases.length) {
      this.autoMovePhases = createAutoMovePhases();
    }
  }

  private getAutoMoveOffset(): TPoint {
    const { amplitude, path } = this.autoMove!;
    const range =
      Math.min(this.canvas.clientWidth, this.canvas.clientHeight) * amplitude;
    const point = getAutoMovePoint(
      path,
      this.autoMoveTime,
      this.autoMovePhases
    );

    return { x: point.x * range, y: point.y * range };
  }

  /**
   * Sizes the backing store to the device pixel ratio (sharp on HiDPI
   * screens) and scales the context so drawing stays in CSS pixels.
   */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.round(this.canvas.clientWidth * dpr);
    this.canvas.height = Math.round(this.canvas.clientHeight * dpr);
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public generate(): void {
    this.attachEventListeners();

    if (!document.fonts) {
      this.initDefaultGeneration();
      return;
    }

    // Wait for fonts, so text shapes draw with the right one. The `font`
    // option is loaded explicitly: a font only used on a canvas is never
    // downloaded otherwise, and `ready` doesn't wait for it
    const { font } = this.options;
    const lifecycle = this.lifecycle;
    Promise.all([
      font ? document.fonts.load(`1em ${font}`).catch(() => undefined) : null,
      document.fonts.ready,
    ]).then(() => {
      if (lifecycle === this.lifecycle) this.initDefaultGeneration();
    });
  }

  private initDefaultGeneration(): void {
    const { intro } = this.options;

    if (!intro) {
      this.applyNextConfig();
      this.genItems();
      return;
    }

    this.currentPresetIndex = null;
    this.applyPreset(intro);
    this.genItems(true);
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
      this.config = this.genConfig();
      return;
    }

    this.currentPresetIndex = this.presetCursor;
    this.presetCursor++;
    this.applyPreset(preset);
  }

  /** Sets the config from a preset, randomizing the fields it leaves out. */
  private applyPreset(preset: TShadesPreset): void {
    const config: TShadeConfig = {
      ...this.genConfig(preset.type),
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

  /** Random config, centered on the canvas (not the page). */
  private genConfig(forcedType?: TShadeType): TShadeConfig {
    return {
      ...genConfig(this.options, forcedType),
      center: this.getCenter(),
    };
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

  /**
   * Builds the items from the current config. A new generation (the
   * default) is counted and reported to onGenerate; a rebuild of the current
   * one (`newGeneration: false`) is not.
   */
  private genItems(intro = false, newGeneration = true): void {
    const config = this.getConfig();
    const {
      nbrItemsX,
      nbrItemsY,
      type,
      rotationFilter,
      fillFilter,
      colors: configColors,
      mainColor: configMainColor,
    } = config;

    const items: ShadeItem[] = [];
    const colors = configColors?.length ? configColors : getRandColors();

    const mainColor =
      configMainColor ?? colors[random(0, colors.length - 1, true)];

    const ShadeConstructor =
      this.options.customShapes?.[type] ??
      SHADES_TYPES_CONSTRUCTORS_LIST[type as TBuiltinShadeType];
    if (!ShadeConstructor) {
      throw new Error(
        `Shades: unknown shape type "${type}". Use a built-in type or register it in customShapes.`
      );
    }

    for (let x = 0; x < nbrItemsX; x++) {
      for (let y = 0; y < nbrItemsY; y++) {
        const index = random(0, colors.length - 1, true);
        const itemColor = colors[index];
        // Text options are ignored by non-text shapes
        const shapeOptions: TShapeOptions & { text?: string; font?: string } = {
          filled: fillFilter?.(mainColor, itemColor),
          rotation: rotationFilter?.(mainColor, itemColor),
          lineCap: config.lineCap,
          text: this.pickText(intro),
          font: this.options.font,
        };

        const position = getItemPosition(config, x, y);
        items.push(
          new ShadeConstructor(position.x, position.y, itemColor, shapeOptions)
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
      ...getGridSize(config),
    };

    this.items = items;
    this.hasAnimatedItems = items.some((item) => item.isAnimated());
    items.forEach((item) => {
      item.requestRender = () => {
        this.needsRender = true;
      };
    });
    this.needsRender = true;
    if (!newGeneration) return;

    this.isIntroGeneration = intro;
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

    this.stepFade();

    // Auto-move drives the offset unless the pointer moved recently
    const isAutoMoving =
      !!this.autoMove &&
      start - this.lastPointerMoveTime > this.autoMove.resumeDelay;

    // Clamped so a long pause (hidden tab) doesn't skip along the path
    const deltaTime =
      this.lastFrameTime === null
        ? 0
        : Math.min((start - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = start;

    if (isAutoMoving) {
      this.autoMoveTime += deltaTime * this.autoMove!.speed;
      this.targetOffset = this.getAutoMoveOffset();
    }

    const previousOffset = this.offset;

    // Smooth offset animation, slower while auto-moving for a softer drift
    const step = isAutoMoving ? 0.02 : 0.1;
    this.offset = {
      x: (this.targetOffset.x - this.offset.x) * step + this.offset.x,
      y: (this.targetOffset.y - this.offset.y) * step + this.offset.y,
    };

    // Settle on a still target. Never per axis, nor while auto-moving:
    // snapping one axis at a time turns curves into stairs
    if (
      !isAutoMoving &&
      Math.hypot(
        this.offset.x - this.targetOffset.x,
        this.offset.y - this.targetOffset.y
      ) < 0.5
    ) {
      this.offset = { ...this.targetOffset };
    }

    const isMoving =
      this.offset.x !== previousOffset.x || this.offset.y !== previousOffset.y;

    // Animated items (rotating ones…) change on every draw: every frame
    if (
      this.needsRender ||
      this.fade.isFading ||
      isMoving ||
      this.hasAnimatedItems
    ) {
      this.draw();
      this.needsRender = false;
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

    const stop = performance.now();
    this.elapsedTime = stop - start;
    this.framesCount.count++;

    if (this.options.debug) {
      this.updateDebug();
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /** Advances the fade in or out, by elapsed real time. */
  private stepFade(): void {
    if (!this.fade.isFading) return;

    // Later generations fade out then in, each in half the duration
    const fadeDuration =
      (this.options.fadeDuration ?? 1000) / (this.genCount ? 2 : 1);
    const { targetOpacity, startOpacity, startTime, onDone } = this.fade;
    const progress = Math.min(
      (performance.now() - startTime) / fadeDuration,
      1
    );

    this.fade.opacity =
      startOpacity + (targetOpacity - startOpacity) * progress;

    if (progress >= 1) {
      this.fade.opacity = targetOpacity;
      this.fade.isFading = false;
      if (targetOpacity === 0) onDone();
    }
  }

  /** Draws the items, through the fade buffer while partly transparent. */
  private draw(): void {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    const { opacity } = this.fade;
    const target = opacity < 1 ? this.getFadeContext() : this.context;

    this.context.clearRect(0, 0, width, height);
    if (opacity <= 0) return;

    if (target !== this.context) target.clearRect(0, 0, width, height);
    target.lineWidth = this.config.thickness;
    this.items.forEach((item) => item.draw(target, this.config, this.offset));

    if (target === this.context) return;
    this.context.globalAlpha = opacity;
    this.context.drawImage(target.canvas, 0, 0, width, height);
    this.context.globalAlpha = 1;
  }

  /** The fade buffer's context, sized and scaled like the main canvas. */
  private getFadeContext(): CanvasRenderingContext2D {
    this.fadeBuffer ??= document.createElement("canvas");
    const buffer = this.fadeBuffer;

    if (
      buffer.width !== this.canvas.width ||
      buffer.height !== this.canvas.height
    ) {
      buffer.width = this.canvas.width;
      buffer.height = this.canvas.height;
    }

    const context = buffer.getContext("2d") ?? this.context;
    const dpr = window.devicePixelRatio || 1;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return context;
  }

  private getCenter(): TPoint {
    return {
      x: this.canvas.clientWidth / 2,
      y: this.canvas.clientHeight / 2,
    };
  }

  /** Pointer position relative to the canvas center, wherever the canvas sits in the page. */
  private getPointerOffset(clientX: number, clientY: number): TPoint {
    const rect = this.canvas.getBoundingClientRect();
    const center = this.getCenter();

    return {
      x: clientX - rect.left - center.x,
      y: clientY - rect.top - center.y,
    };
  }

  private handleMouseMove(event: MouseEvent): void {
    this.lastPointerMoveTime = performance.now();
    this.targetOffset = this.getPointerOffset(event.clientX, event.clientY);
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

    this.targetOffset = this.getPointerOffset(touch1.clientX, touch1.clientY);
  }

  /** Adds `delta` (can be negative) to the shades count, within [1, MAX_SHADES_NBR]. */
  public adjustShadesCount(delta: number): void {
    this.setShadesCount(this.config.nbrShades + delta);
  }

  /** Sets the shades count of the current generation, within [1, MAX_SHADES_NBR]. */
  public setShadesCount(count: number): void {
    const nbrShades = Math.min(Math.max(count, 1), MAX_SHADES_NBR);

    this.config = {
      ...this.config,
      nbrShades,
      gradRatio: 100 / nbrShades,
    };
    this.needsRender = true;
    this.options.onChange?.(this.getShadesConfig());
  }

  /** Rebuilds the current generation's items from the updated config. */
  private rebuildItems(changes: Partial<TShadeConfig>): void {
    this.config = { ...this.config, ...changes };
    this.genItems(this.isIntroGeneration, false);
    this.options.onChange?.(this.getShadesConfig());
  }

  /**
   * Sets the item grid of the current generation, each count within
   * [1, MAX_ITEMS_NBR], and rebuilds its items with the same type, colors and
   * sizes. `nbrItemsY` defaults to `nbrItemsX`.
   */
  public setItemsCount(nbrItemsX: number, nbrItemsY: number = nbrItemsX): void {
    const clamp = (count: number) =>
      Math.min(Math.max(Math.round(count), 1), MAX_ITEMS_NBR);

    this.rebuildItems({
      nbrItemsX: clamp(nbrItemsX),
      nbrItemsY: clamp(nbrItemsY),
    });
  }

  /**
   * Sets the gaps between the current generation's items (0 at least) and
   * moves them accordingly: the items themselves (colors, fill, rotation)
   * are kept. `spacingY` defaults to `spacingX`.
   */
  public setSpacing(spacingX: number, spacingY: number = spacingX): void {
    this.config = {
      ...this.config,
      spacing: Math.max(spacingX, 0),
      spacingY: Math.max(spacingY, 0),
    };
    this.config = { ...this.config, ...getGridSize(this.config) };

    // Items are built column by column: index = x * nbrItemsY + y
    const { nbrItemsY } = this.config;
    this.items.forEach((item, index) => {
      item.position = getItemPosition(
        this.config,
        Math.floor(index / nbrItemsY),
        index % nbrItemsY
      );
    });
    this.needsRender = true;
    this.options.onChange?.(this.getShadesConfig());
  }

  /**
   * Sets the colors of the current generation and rebuilds its items, each
   * picking one at random. `mainColor`, used by the fill and rotation
   * filters, defaults to a random one of `colors`. Ignored when empty.
   */
  public setColors(colors: TShadeColor[], mainColor?: TShadeColor): void {
    if (!colors.length) return;

    this.rebuildItems({
      colors: [...colors],
      mainColor: mainColor ?? colors[random(0, colors.length - 1, true)],
    });
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
    this.setupCanvas();

    this.config = {
      ...this.config,
      center: this.getCenter(),
    };

    this.offset = { x: 0, y: 0 };
    this.needsRender = true;
  }

  private attachEventListeners(): void {
    if (this.interactions) return;

    const binder = new InteractionBinder(this, this.options.interactions);
    binder.bind(this.canvas, "click", "click", () => this.handleClick());
    binder.bind(this.canvas, "wheel", "wheel", (e) => this.handleWheel(e));
    binder.bind(document, "mousemove", "mouseMove", (e) =>
      this.handleMouseMove(e)
    );
    binder.bind(document, "touchmove", "touchMove", (e) =>
      this.handleTouchMove(e)
    );
    binder.bindResize(this.canvas, () => this.handleResize());
    // A font arriving later (custom shapes' ones…) changes how text draws:
    // redraw, as still frames are skipped
    if (typeof document.fonts?.addEventListener === "function") {
      binder.listen(document.fonts, "loadingdone", () => {
        this.needsRender = true;
      });
    }
    this.interactions = binder;
  }

  // Public API methods for external interaction

  public start(): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.needsRender = true;
    // Auto-move waits resumeDelay before its first drift, as after a pointer move
    this.lastPointerMoveTime = performance.now();
    this.animate();
    this.startFPSCounter();
  }

  public pause(): void {
    this.isPlaying = false;
    this.lastFrameTime = null;
    this.stopFPSCounter();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy(): void {
    this.lifecycle++;
    this.pause();
    this.interactions?.detach();
    this.interactions = null;
    this.debugOverlay?.remove();
    this.debugOverlay = null;

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

  public getShadesConfig(): TShadeConfig {
    return { ...this.config };
  }

  public getItems(): ShadeItem[] {
    return [...this.items];
  }

  public isAnimating(): boolean {
    return this.isPlaying;
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

  /** Sets the fade duration (ms), applied from the next fade. */
  public setFadeDuration(duration: number): void {
    this.options.fadeDuration = duration;
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
    if (this.options.debug && !this.debugOverlay) {
      this.debugOverlay = new DebugOverlay(this.canvas, this.options.debug);
    }
  }

  private startFPSCounter(): void {
    if (this.fpsIntervalId !== null) return;

    this.fpsIntervalId = setInterval(() => {
      this.framesCount = {
        count: 0,
        fps: this.framesCount.count,
      };
    }, 1000);
  }

  private stopFPSCounter(): void {
    if (this.fpsIntervalId === null) return;

    clearInterval(this.fpsIntervalId);
    this.fpsIntervalId = null;
  }

  private updateDebug(): void {
    this.debugOverlay?.update({
      Width: this.canvas.width,
      Height: this.canvas.height,
      IsPlaying: this.isPlaying,
      "Elapsed Time": `${this.elapsedTime.toFixed(2)}ms`,
      FPS: this.framesCount.fps,
      Items: this.items.length,
      Generation: this.genCount,
    });
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
      this.debugOverlay?.remove();
      this.debugOverlay = null;
    }
  }
}
