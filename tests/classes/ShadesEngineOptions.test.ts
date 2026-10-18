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
});
