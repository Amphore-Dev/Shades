import {
  ShadesEngine,
  TShadesEngineOptions,
} from "../../src/classes/ShadesEngine";
import { TextShape } from "../../src/classes/shapes/TextShape";
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

// Plays the next generation without waiting for the fade out
const advance = (engine: ShadesEngine) => {
  engine.next();
  (engine as any).fade.onDone();
};

describe("ShadesEngine options", () => {
  describe("text", () => {
    it("uses the given string for the intro", () => {
      const { engine } = createEngine({ text: "AMPHORE" });
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.text).toBe("AMPHORE");
    });

    it("uses the first string of an array for the intro", () => {
      const { engine } = createEngine({ text: ["FIRST", "SECOND"] });
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.text).toBe("FIRST");
    });

    it("picks each text item's string from the array", () => {
      const texts = ["A", "B", "C"];
      const { engine } = createEngine({
        text: texts,
        intro: false,
        presets: [{ type: "text", nbrItemsX: 5, nbrItemsY: 5 }],
      });
      engine.generate();

      const items = engine.getItems() as TextShape[];
      expect(items).toHaveLength(25);
      items.forEach((item) => expect(texts).toContain(item.text));
    });

    it("keeps the default text when no text option is given", () => {
      const { engine } = createEngine();
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.text).toBe("SHADES");
    });

    it("passes the font option to text shapes", () => {
      const { engine } = createEngine({ font: "Arial" });
      engine.generate();

      const [item] = engine.getItems() as TextShape[];
      expect(item.font).toBe("Arial");
    });
  });

  describe("intro", () => {
    it("starts with the text intro by default", () => {
      const onGenerate = jest.fn();
      const { engine } = createEngine({ onGenerate });
      engine.generate();

      expect(engine.getItems()[0]).toBeInstanceOf(TextShape);
      expect(onGenerate).toHaveBeenCalledWith(expect.any(Object), {
        generation: 0,
        intro: true,
        presetIndex: null,
      });
    });

    it("skips the intro when intro is false", () => {
      const { engine } = createEngine({
        intro: false,
        presets: [{ type: "square" }],
      });
      engine.generate();

      expect(engine.getShadesConfig().type).toBe("square");
    });
  });

  describe("presets", () => {
    const presets = [
      { type: "square", nbrShades: 10, nbrItemsX: 2, nbrItemsY: 3 },
      { type: "circle", width: 40 },
    ];

    it("plays presets in order after the intro", () => {
      const { engine } = createEngine({ presets });
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
      const { engine } = createEngine({ presets, onGenerate });
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
        intro: false,
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
      const path = jest.fn(() => ({ x: 1, y: -0.5 }));
      const engine = createAutoMoveEngine({
        autoMove: { path, speed: 2, amplitude: 0.1 },
      });

      frame(engine, 5000);

      expect(path).toHaveBeenCalledWith(10);
      expect((engine as any).targetOffset).toEqual({ x: 60, y: -30 });
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
});
