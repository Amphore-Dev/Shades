import {
  ShadesEngine,
  TShadesEngineOptions,
} from "../../src/classes/ShadesEngine";
import { TextShape } from "../../src/classes/shapes/TextShape";
import { ShadeItem } from "../../src/classes/shapes/BaseShape";
import { TShadeColor, TShadesPreset, TShapeOptions } from "../../src/types";
import { MAX_SHADES_NBR } from "../../src/constants";

// Without document.fonts, generate() runs the first generation synchronously
const originalFonts = document.fonts;

beforeAll(() => {
  (document as any).fonts = undefined;
  Object.defineProperty(document.body, "clientWidth", {
    value: 800,
    writable: true,
  });
  Object.defineProperty(document.body, "clientHeight", {
    value: 600,
    writable: true,
  });
});

afterAll(() => {
  (document as any).fonts = originalFonts;
});

const createEngine = (options: TShadesEngineOptions = {}) => {
  const canvas = document.createElement("canvas");
  const engine = new ShadesEngine(canvas, options);
  return { canvas, engine };
};

// A single text item, like the former built-in intro
const TEXT_INTRO: TShadesPreset = { type: "text", nbrItemsX: 1, nbrItemsY: 1 };

// Plays the next generation without waiting for the fade out
const advance = (engine: ShadesEngine) => {
  engine.next();
  (engine as any).fade.onDone();
};

describe("ShadesEngine options", () => {
  describe("text", () => {
    it("uses the given string for the intro", () => {
      const { engine } = createEngine({ text: "AMPHORE", intro: TEXT_INTRO });
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.text).toBe("AMPHORE");
    });

    it("uses the first string of an array for the intro", () => {
      const { engine } = createEngine({
        text: ["FIRST", "SECOND"],
        intro: TEXT_INTRO,
      });
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.text).toBe("FIRST");
    });

    it("picks each text item's string from the array", () => {
      const texts = ["A", "B", "C"];
      const { engine } = createEngine({
        text: texts,
        presets: [{ type: "text", nbrItemsX: 5, nbrItemsY: 5 }],
      });
      engine.generate();

      const items = engine.getItems() as TextShape[];
      expect(items).toHaveLength(25);
      items.forEach((item) => expect(texts).toContain(item.text));
    });

    it("keeps the default text when no text option is given", () => {
      const { engine } = createEngine({ intro: TEXT_INTRO });
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.text).toBe("SHADES");
    });

    it("passes the font option to text shapes", () => {
      const { engine } = createEngine({ font: "Arial", intro: TEXT_INTRO });
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.font).toBe("Arial");
    });
  });

  describe("intro", () => {
    it("starts with the presets when no intro is given", () => {
      const onGenerate = jest.fn();
      const { engine } = createEngine({
        presets: [{ type: "square" }],
        onGenerate,
      });
      engine.generate();

      expect(engine.getShadesConfig().type).toBe("square");
      expect(onGenerate).toHaveBeenCalledWith(expect.any(Object), {
        generation: 0,
        intro: false,
        presetIndex: 0,
      });
    });

    it("plays the intro preset first, then the presets", () => {
      const onGenerate = jest.fn();
      const color: TShadeColor = { r: 193, g: 66, b: 93 };
      const { engine } = createEngine({
        intro: { ...TEXT_INTRO, colors: [color], nbrShades: 10 },
        presets: [{ type: "square" }],
        onGenerate,
      });
      engine.generate();

      const [item] = engine.getItems();
      expect(item).toBeInstanceOf(TextShape);
      expect(item.color).toEqual(color);
      expect(engine.getShadesConfig().nbrShades).toBe(10);
      expect(onGenerate).toHaveBeenCalledWith(expect.any(Object), {
        generation: 0,
        intro: true,
        presetIndex: null,
      });

      advance(engine);
      expect(engine.getShadesConfig().type).toBe("square");
    });

    it("randomizes the intro fields left out", () => {
      const { engine } = createEngine({ intro: { type: "circle" } });
      engine.generate();

      const config = engine.getShadesConfig();
      expect(config.type).toBe("circle");
      expect(config.nbrShades).toBeGreaterThan(0);
    });
  });

  describe("presets", () => {
    const presets = [
      { type: "square", nbrShades: 10, nbrItemsX: 2, nbrItemsY: 3 },
      { type: "circle", width: 40 },
    ];

    it("plays presets in order after the intro", () => {
      const { engine } = createEngine({ presets, intro: TEXT_INTRO });
      engine.generate();

      advance(engine);
      let config = engine.getShadesConfig();
      expect(config.type).toBe("square");
      expect(config.nbrShades).toBe(10);
      expect(config.gradRatio).toBe(10);
      expect(engine.getItems()).toHaveLength(6);

      advance(engine);
      config = engine.getShadesConfig();
      expect(config.type).toBe("circle");
      expect(config.width).toBe(40);
      expect(config.height).toBe(40);
    });

    it("switches to random generations after the last preset by default", () => {
      const onGenerate = jest.fn();
      const { engine } = createEngine({
        presets,
        onGenerate,
        intro: TEXT_INTRO,
      });
      engine.generate();

      advance(engine);
      advance(engine);
      advance(engine);

      expect(onGenerate).toHaveBeenLastCalledWith(expect.any(Object), {
        generation: 3,
        intro: false,
        presetIndex: null,
      });
    });

    it("loops over presets when presetsEnd is loop", () => {
      const onGenerate = jest.fn();
      const { engine } = createEngine({
        presets,
        presetsEnd: "loop",
        onGenerate,
        intro: TEXT_INTRO,
      });
      engine.generate();

      advance(engine);
      advance(engine);
      advance(engine);

      expect(engine.getShadesConfig().type).toBe("square");
      expect(onGenerate).toHaveBeenLastCalledWith(expect.any(Object), {
        generation: 3,
        intro: false,
        presetIndex: 0,
      });
    });

    it("keeps preset colors on every generation", () => {
      const colors = [{ r: 1, g: 2, b: 3 }];
      const { engine } = createEngine({
        intro: TEXT_INTRO,
        presets: [
          { type: "square", colors },
          { type: "square", colors },
          { type: "square", colors },
        ],
      });
      engine.generate();

      advance(engine);
      advance(engine);
      advance(engine);

      expect(engine.getShadesConfig().colors).toEqual(colors);
      engine
        .getItems()
        .forEach((item) => expect(item.color).toEqual(colors[0]));
    });

    it("uses logo defaults when the preset only sets a logo type", () => {
      const { engine } = createEngine({
        presets: [{ type: "logo" }],
        customShapes: { logo: TextShape },
      });
      engine.generate();

      const config = engine.getShadesConfig();
      expect(config.nbrItemsX).toBe(1);
      expect(config.nbrShades).toBe(MAX_SHADES_NBR);
    });
  });

  describe("interactions", () => {
    const listenedTypes = (target: EventTarget) =>
      (target.addEventListener as jest.Mock).mock.calls.map(([type]) => type);

    beforeEach(() => {
      jest.spyOn(document, "addEventListener");
      jest.spyOn(window, "addEventListener");
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("does not attach disabled interactions", () => {
      const { canvas, engine } = createEngine({
        interactions: { wheel: false, mouseMove: false },
      });
      jest.spyOn(canvas, "addEventListener");
      engine.generate();

      expect(listenedTypes(canvas)).toEqual(["click"]);
      expect(listenedTypes(document)).not.toContain("mousemove");
      expect(listenedTypes(document)).toContain("touchmove");
    });

    it("calls a custom handler with the event, engine and default handler", () => {
      const wheel = jest.fn();
      const { canvas, engine } = createEngine({ interactions: { wheel } });
      engine.generate();

      const event = new WheelEvent("wheel", { deltaY: -1 });
      canvas.dispatchEvent(event);

      expect(wheel).toHaveBeenCalledWith(event, engine, expect.any(Function));
    });

    it("lets a custom handler fall back to the default behavior", () => {
      const { canvas, engine } = createEngine({
        intro: TEXT_INTRO,
        interactions: {
          wheel: (event, _engine, defaultHandler) => defaultHandler(event),
        },
      });
      engine.generate();
      const before = engine.getShadesConfig().nbrShades;

      canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: -1 }));

      expect(engine.getShadesConfig().nbrShades).toBeCloseTo(before + 0.1);
    });

    it("removes every attached listener on destroy", () => {
      const { canvas, engine } = createEngine();
      const remove = jest.spyOn(canvas, "removeEventListener");
      engine.generate();
      engine.destroy();

      expect(remove.mock.calls.map(([type]) => type)).toEqual([
        "click",
        "wheel",
      ]);
    });
  });
  describe("autoMove", () => {
    let now = 0;

    const frame = (engine: ShadesEngine, time: number) => {
      now = time;
      (engine as any).isPlaying = true;
      (engine as any).animate();
    };

    beforeEach(() => {
      now = 0;
      jest.spyOn(performance, "now").mockImplementation(() => now);
      global.requestAnimationFrame = jest.fn(() => 1);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      delete (window as any).matchMedia;
    });

    const createAutoMoveEngine = (options: TShadesEngineOptions = {}) => {
      const { canvas, engine } = createEngine({ autoMove: true, ...options });
      Object.defineProperty(canvas, "clientWidth", { value: 800 });
      Object.defineProperty(canvas, "clientHeight", { value: 600 });
      return engine;
    };

    it("drives the target offset within the amplitude", () => {
      const engine = createAutoMoveEngine();
      // 0.15 of the smallest side
      const maxRange = 600 * 0.15;

      [1000, 20000, 60000].forEach((time) => {
        frame(engine, time);
        const { x, y } = (engine as any).targetOffset;
        expect(Math.abs(x)).toBeLessThanOrEqual(maxRange);
        expect(Math.abs(y)).toBeLessThanOrEqual(maxRange);
      });

      const first = { ...(engine as any).targetOffset };
      frame(engine, 90000);
      expect((engine as any).targetOffset).not.toEqual(first);
    });

    it.each(["drift", "circle", "figure8"] as const)(
      "keeps the %s path within amplitude and speed",
      (path) => {
        const engine = createAutoMoveEngine({
          autoMove: { path, amplitude: 0.5, speed: 3 },
        });
        const maxRange = 600 * 0.5;

        for (let time = 0; time < 120000; time += 7000) {
          frame(engine, time);
          const { x, y } = (engine as any).targetOffset;
          expect(Math.abs(x)).toBeLessThanOrEqual(maxRange + 1e-9);
          expect(Math.abs(y)).toBeLessThanOrEqual(maxRange + 1e-9);
        }
      }
    );

    it("follows the circle path at a constant distance", () => {
      const engine = createAutoMoveEngine({ autoMove: { path: "circle" } });

      [10000, 40000].forEach((time) => {
        frame(engine, time);
        const { x, y } = (engine as any).targetOffset;
        expect(Math.hypot(x, y)).toBeCloseTo(600 * 0.15);
      });
    });

    it("calls a custom path with the time scaled by speed", () => {
      const path = jest.fn((_t: number) => ({ x: 1, y: -0.5 }));
      const engine = createAutoMoveEngine({
        autoMove: { path, speed: 2, amplitude: 0.1 },
      });

      frame(engine, 5000);
      frame(engine, 5100);

      // 0.1s elapsed, times speed 2
      expect(path.mock.calls.at(-1)?.[0]).toBeCloseTo(0.2);
      expect((engine as any).targetOffset).toEqual({ x: 60, y: -30 });
    });

    it("doesn't jump when speed or path settings change", () => {
      const engine = createAutoMoveEngine({ autoMove: { resumeDelay: 0 } });

      frame(engine, 1000);
      frame(engine, 1016);
      const before = { ...(engine as any).targetOffset };

      engine.setAutoMove({ resumeDelay: 0, speed: 10 });
      frame(engine, 1032);
      const after = (engine as any).targetOffset;

      // One 16ms frame at speed 10 moves ~1px; a jump would be tens of px
      expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeLessThan(
        5
      );
    });

    it("moves both axes smoothly instead of snapping one at a time", () => {
      const engine = createAutoMoveEngine({
        autoMove: { resumeDelay: 0, path: "circle", speed: 5 },
      });
      // Start on the target so only the tracking itself is measured
      frame(engine, 0);
      (engine as any).offset = { ...(engine as any).targetOffset };

      for (let time = 16; time < 20000; time += 16) {
        const previous = { ...(engine as any).offset };
        frame(engine, time);
        const { offset, targetOffset } = engine as any;

        // A per-axis snap would land exactly on the target
        if (offset.x !== previous.x) expect(offset.x).not.toBe(targetOffset.x);
        if (offset.y !== previous.y) expect(offset.y).not.toBe(targetOffset.y);
      }
    });

    it("lets the pointer take over, then resumes after resumeDelay", () => {
      const engine = createAutoMoveEngine({
        autoMove: { resumeDelay: 1000 },
      });

      now = 5000;
      (engine as any).handleMouseMove({ clientX: 500, clientY: 400 });
      frame(engine, 5500);
      expect((engine as any).targetOffset).toEqual({ x: 100, y: 100 });

      frame(engine, 6500);
      expect((engine as any).targetOffset).not.toEqual({ x: 100, y: 100 });
    });

    it("waits resumeDelay after start before moving", () => {
      const engine = createAutoMoveEngine({
        autoMove: { resumeDelay: 1000 },
      });

      now = 10000;
      engine.start();
      frame(engine, 10500);
      expect((engine as any).targetOffset).toEqual({ x: 0, y: 0 });

      frame(engine, 11500);
      expect((engine as any).targetOffset).not.toEqual({ x: 0, y: 0 });
    });

    it("can be enabled at runtime, after resumeDelay", () => {
      const engine = createAutoMoveEngine({ autoMove: false });

      frame(engine, 1000);
      expect((engine as any).targetOffset).toEqual({ x: 0, y: 0 });

      now = 2000;
      engine.setAutoMove({ resumeDelay: 1000 });
      frame(engine, 2500);
      expect((engine as any).targetOffset).toEqual({ x: 0, y: 0 });

      frame(engine, 3500);
      expect((engine as any).targetOffset).not.toEqual({ x: 0, y: 0 });
    });

    it("can be disabled at runtime", () => {
      const engine = createAutoMoveEngine();
      engine.setAutoMove(false);

      frame(engine, 60000);
      expect((engine as any).targetOffset).toEqual({ x: 0, y: 0 });
    });

    it("holds a target set with setTargetOffset until resumeDelay", () => {
      const engine = createAutoMoveEngine({
        autoMove: { resumeDelay: 1000 },
      });

      now = 5000;
      engine.setTargetOffset();
      frame(engine, 5500);
      expect((engine as any).targetOffset).toEqual({ x: 0, y: 0 });

      engine.setTargetOffset({ x: 10, y: -20 });
      frame(engine, 5600);
      expect((engine as any).targetOffset).toEqual({ x: 10, y: -20 });
    });

    it("stays off when the user prefers reduced motion", () => {
      (window as any).matchMedia = jest.fn(() => ({ matches: true }));
      const engine = createAutoMoveEngine();

      frame(engine, 20000);
      expect((engine as any).targetOffset).toEqual({ x: 0, y: 0 });
    });

    it("stays off by default", () => {
      const { engine } = createEngine();

      frame(engine, 20000);
      expect((engine as any).targetOffset).toEqual({ x: 0, y: 0 });
    });
  });

  describe("autoNext", () => {
    let now = 0;

    beforeEach(() => {
      now = 0;
      jest.spyOn(performance, "now").mockImplementation(() => now);
      global.requestAnimationFrame = jest.fn(() => 1);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("can be enabled at runtime, counted from the call", () => {
      const { engine } = createEngine();
      engine.generate();
      const next = jest.spyOn(engine, "next");
      (engine as any).fade.isFading = false;
      (engine as any).isPlaying = true;

      now = 10000;
      engine.setAutoNext(5000);
      now = 14000;
      (engine as any).animate();
      expect(next).not.toHaveBeenCalled();

      now = 15001;
      (engine as any).animate();
      expect(next).toHaveBeenCalledTimes(1);

      engine.setAutoNext();
      now = 60000;
      (engine as any).animate();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("waits for auto-move, then counts from when it took over", () => {
      const { engine } = createEngine({
        autoMove: { resumeDelay: 1000 },
        autoNext: 2000,
      });
      engine.generate();
      const next = jest.spyOn(engine, "next");
      (engine as any).fade.isFading = false;
      (engine as any).isPlaying = true;

      // Generated at 0, pointer moved at 10000: auto-move from 11000
      now = 10000;
      (engine as any).lastGenerationTime = 0;
      (engine as any).handleMouseMove({ clientX: 0, clientY: 0 });

      now = 12000;
      (engine as any).animate();
      expect(next).not.toHaveBeenCalled();

      now = 13001;
      (engine as any).animate();
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("plays the next generation once the delay is elapsed", () => {
      const { engine } = createEngine({ autoNext: 5000 });
      engine.generate();
      const next = jest.spyOn(engine, "next");
      (engine as any).fade.isFading = false;
      (engine as any).isPlaying = true;

      now = 4000;
      (engine as any).animate();
      expect(next).not.toHaveBeenCalled();

      now = 5001;
      (engine as any).animate();
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
  describe("setDebug", () => {
    it("adds a single debug element and removes it", () => {
      const parent = document.createElement("div");
      const canvas = document.createElement("canvas");
      parent.appendChild(canvas);
      const engine = new ShadesEngine(canvas, {
        debug: { className: "custom-debug" },
      });

      engine.setDebug({ className: "custom-debug" });
      expect(parent.querySelectorAll("pre")).toHaveLength(1);

      engine.setDebug(false);
      expect(parent.querySelectorAll("pre")).toHaveLength(0);
    });
  });
  describe("setFadeDuration", () => {
    it("applies the new duration to the next fade", () => {
      let now = 0;
      jest.spyOn(performance, "now").mockImplementation(() => now);
      global.requestAnimationFrame = jest.fn(() => 1);
      const { engine } = createEngine({ fadeDuration: 1000 });
      engine.generate();
      (engine as any).isPlaying = true;

      engine.setFadeDuration(4000);
      // Fades after the first generation last half the duration (out + in)
      (engine as any).fade = {
        ...(engine as any).fade,
        isFading: true,
        startOpacity: 0,
        targetOpacity: 1,
        startTime: 0,
      };
      now = 1000;
      (engine as any).animate();

      expect((engine as any).fade.opacity).toBeCloseTo(0.5);
      jest.restoreAllMocks();
    });
  });
  describe("FPS counter", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      global.requestAnimationFrame = jest.fn(() => 1);
      global.cancelAnimationFrame = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("runs a single interval across start/pause cycles", () => {
      const { engine } = createEngine();

      engine.start();
      engine.pause();
      engine.start();
      engine.start();
      expect(jest.getTimerCount()).toBe(1);

      engine.destroy();
      expect(jest.getTimerCount()).toBe(0);
    });
  });
  describe("canvas smaller than the page", () => {
    // Page is 800x600, canvas is 400x200 at (100, 50)
    const createSmallCanvasEngine = (options: TShadesEngineOptions = {}) => {
      const canvas = document.createElement("canvas");
      Object.defineProperty(canvas, "clientWidth", { value: 400 });
      Object.defineProperty(canvas, "clientHeight", { value: 200 });
      canvas.getBoundingClientRect = () =>
        ({ left: 100, top: 50, width: 400, height: 200 }) as DOMRect;
      return new ShadesEngine(canvas, options);
    };

    it("centers every generation on the canvas", () => {
      const engine = createSmallCanvasEngine();
      engine.generate();
      expect(engine.getShadesConfig().center).toEqual({ x: 200, y: 100 });

      advance(engine);
      expect(engine.getShadesConfig().center).toEqual({ x: 200, y: 100 });
    });

    it("measures the pointer from the canvas center", () => {
      const engine = createSmallCanvasEngine();

      // Canvas center is at (300, 150) in the page
      (engine as any).handleMouseMove({ clientX: 310, clientY: 140 });

      expect((engine as any).targetOffset).toEqual({ x: 10, y: -10 });
    });
  });
  describe("canvas sizing", () => {
    const originalDpr = window.devicePixelRatio;
    const OriginalResizeObserver = global.ResizeObserver;

    const createSizedCanvas = () => {
      const canvas = document.createElement("canvas");
      Object.defineProperty(canvas, "clientWidth", {
        value: 400,
        configurable: true,
      });
      Object.defineProperty(canvas, "clientHeight", { value: 200 });
      return canvas;
    };

    afterEach(() => {
      Object.defineProperty(window, "devicePixelRatio", {
        value: originalDpr,
        configurable: true,
      });
      global.ResizeObserver = OriginalResizeObserver;
    });

    it("scales the backing store to the device pixel ratio", () => {
      Object.defineProperty(window, "devicePixelRatio", {
        value: 2,
        configurable: true,
      });
      const canvas = createSizedCanvas();
      const engine = new ShadesEngine(canvas);
      const context = (engine as any).context;

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(400);
      expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    });

    it("resizes when the observed canvas changes size", () => {
      let onResize: () => void = () => {};
      const observe = jest.fn();
      const disconnect = jest.fn();
      global.ResizeObserver = jest.fn((callback: () => void) => {
        onResize = callback;
        return { observe, disconnect, unobserve: jest.fn() };
      }) as any;

      const canvas = createSizedCanvas();
      const engine = new ShadesEngine(canvas);
      engine.generate();
      expect(observe).toHaveBeenCalledWith(canvas);

      Object.defineProperty(canvas, "clientWidth", { value: 1000 });
      onResize();
      expect(engine.getShadesConfig().center.x).toBe(500);

      engine.destroy();
      expect(disconnect).toHaveBeenCalled();
    });

    it("falls back to the window resize event without ResizeObserver", () => {
      (global as any).ResizeObserver = undefined;
      const addEventListener = jest.spyOn(window, "addEventListener");

      const engine = new ShadesEngine(createSizedCanvas());
      engine.generate();

      expect(addEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
      addEventListener.mockRestore();
    });

    it("doesn't watch resizes when the resize interaction is disabled", () => {
      const engine = new ShadesEngine(createSizedCanvas(), {
        interactions: { resize: false },
      });
      (global.ResizeObserver as jest.Mock).mockClear();
      engine.generate();

      expect(global.ResizeObserver).not.toHaveBeenCalled();
    });
  });
  describe("customShapes typing", () => {
    // Fails to compile if custom shapes aren't accepted by the option type
    class StarShape extends ShadeItem {
      points: number;

      constructor(
        x: number,
        y: number,
        color: TShadeColor,
        options: TShapeOptions & { points?: number } = {}
      ) {
        super(x, y, color, options);
        this.type = "star";
        this.points = options.points ?? 5;
      }
    }

    it("accepts a class extending ShadeItem", () => {
      const { engine } = createEngine({
        customShapes: { star: StarShape },
        presets: [{ type: "star", nbrItemsX: 1, nbrItemsY: 1 }],
      });
      engine.generate();

      expect(engine.getItems()[0]).toBeInstanceOf(StarShape);
    });
  });
  describe("shades count", () => {
    it("sets an absolute count, clamped to [1, MAX_SHADES_NBR]", () => {
      const { engine } = createEngine();

      engine.setShadesCount(12);
      expect(engine.getShadesConfig().nbrShades).toBe(12);
      expect(engine.getShadesConfig().gradRatio).toBeCloseTo(100 / 12);

      engine.setShadesCount(0);
      expect(engine.getShadesConfig().nbrShades).toBe(1);

      engine.setShadesCount(1000);
      expect(engine.getShadesConfig().nbrShades).toBe(MAX_SHADES_NBR);
    });

    it("adjusts the count relatively", () => {
      const { engine } = createEngine();
      engine.setShadesCount(10);

      engine.adjustShadesCount(2);
      expect(engine.getShadesConfig().nbrShades).toBe(12);

      engine.adjustShadesCount(-5);
      expect(engine.getShadesConfig().nbrShades).toBe(7);
    });
  });
});
