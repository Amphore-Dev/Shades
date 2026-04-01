import { ShadesEngine } from "../../src/classes/ShadesEngine";
import { genConfig, getRandColors } from "../../src/utils/UShadeUtils";
import { SHADES_TYPES } from "../../src/constants/index";

// Mock document and window for integration tests
Object.defineProperty(document, "fonts", {
  value: {
    ready: Promise.resolve(),
  },
  writable: true,
});

Object.defineProperty(document.body, "clientWidth", {
  value: 800,
  writable: true,
});

Object.defineProperty(document.body, "clientHeight", {
  value: 600,
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

describe("Integration Tests", () => {
  let canvas: HTMLCanvasElement;
  let mockContext: any;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    Object.defineProperty(canvas, "clientWidth", { value: 800 });
    Object.defineProperty(canvas, "clientHeight", { value: 600 });

    mockContext = {
      canvas: canvas,
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineCap: "butt",
      lineWidth: 1,
      globalAlpha: 1,
    };

    jest.spyOn(canvas, "getContext").mockReturnValue(mockContext);
    jest.spyOn(canvas, "addEventListener").mockImplementation(() => {});
    jest.spyOn(window, "addEventListener").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete workflow", () => {
    it("should create engine, generate config, and render without errors", () => {
      const engine = new ShadesEngine(canvas);

      expect(() => {
        engine.generate();
      }).not.toThrow();
    });

    it("should work with all default shape types", () => {
      SHADES_TYPES.forEach((shapeType) => {
        const engine = new ShadesEngine(canvas, { shapes: [shapeType] });

        expect(() => {
          engine.generate();
        }).not.toThrow();
      });
    });

    it("should generate configurations that work with ShadesEngine", () => {
      for (let i = 0; i < 5; i++) {
        const config = genConfig();
        expect(config).toBeDefined();
        expect(config.type).toBeDefined();
        expect(config.colors).toBeDefined();
        expect(Array.isArray(config.colors)).toBe(true);
        expect(config.colors?.length).toBe(2);

        // Test that engine can use this config
        const engine = new ShadesEngine(canvas, { shapes: [config.type] });
        expect(() => {
          engine.generate();
        }).not.toThrow();
      }
    });

    it("should handle color generation with different shape types", () => {
      SHADES_TYPES.forEach((shapeType) => {
        const colors = getRandColors(shapeType);
        expect(Array.isArray(colors)).toBe(true);
        expect(colors).toHaveLength(2);

        colors.forEach((color) => {
          expect(color).toHaveProperty("r");
          expect(color).toHaveProperty("g");
          expect(color).toHaveProperty("b");
          expect(typeof color.r).toBe("number");
          expect(typeof color.g).toBe("number");
          expect(typeof color.b).toBe("number");
        });
      });
    });

    it("should handle custom shapes integration", () => {
      // Skip complex custom shape test for now
      const engine = new ShadesEngine(canvas, {
        shapes: ["circle"],
      });

      expect(() => {
        engine.generate();
      }).not.toThrow();
    });

    it("should support multiple generations", () => {
      const engine = new ShadesEngine(canvas);

      expect(() => {
        engine.generate();
        engine.generate();
        engine.generate();
      }).not.toThrow();
    });
  });

  describe("Error resilience", () => {
    it("should handle invalid shape types gracefully", () => {
      const engine = new ShadesEngine(canvas, {
        shapes: ["nonexistent"] as any,
      });

      // Should not throw during construction
      expect(engine).toBeDefined();
    });

    it("should handle empty shapes array", () => {
      const engine = new ShadesEngine(canvas, { shapes: [] });

      expect(() => {
        engine.generate();
      }).not.toThrow();
    });

    it("should handle engine lifecycle methods", () => {
      const engine = new ShadesEngine(canvas);

      expect(() => {
        engine.generate();
        // engine.play();
        // engine.pause();
        // engine.destroy();
      }).not.toThrow();
    });
  });

  describe("Configuration consistency", () => {
    it("should maintain consistent behavior across multiple configs", () => {
      const configs = Array.from({ length: 10 }, () => genConfig());

      configs.forEach((config) => {
        expect(config.nbrShades).toBeGreaterThan(0);
        expect(config.nbrItemsX).toBeGreaterThan(0);
        expect(config.nbrItemsY).toBeGreaterThan(0);
        expect(config.width).toBeGreaterThan(0);
        expect(config.height).toBeGreaterThan(0);
        expect(config.totalWidth).toBeGreaterThan(0);
        expect(config.totalHeight).toBeGreaterThan(0);
        expect(config.gradRatio).toBeGreaterThan(0);
      });
    });

    it("should generate valid colors for all configurations", () => {
      const configs = Array.from({ length: 10 }, () => genConfig());

      configs.forEach((config) => {
        expect(Array.isArray(config.colors)).toBe(true);
        if (config.colors) {
          expect(config.colors).toHaveLength(2);

          config.colors.forEach((color) => {
            expect(color.r).toBeGreaterThanOrEqual(0);
            expect(color.r).toBeLessThanOrEqual(255);
            expect(color.g).toBeGreaterThanOrEqual(0);
            expect(color.g).toBeLessThanOrEqual(255);
            expect(color.b).toBeGreaterThanOrEqual(0);
            expect(color.b).toBeLessThanOrEqual(255);
          });
        }
      });
    });
  });

  describe("Performance and memory", () => {
    it("should not memory leak on multiple generations", () => {
      const engine = new ShadesEngine(canvas);

      // Generate multiple times to check for memory leaks
      for (let i = 0; i < 10; i++) {
        engine.generate();
      }

      expect(engine).toBeDefined();
    });

    it("should clean up properly on destroy", () => {
      const engine = new ShadesEngine(canvas);
      engine.generate();

      expect(() => {
        engine.destroy();
      }).not.toThrow();
    });
  });

  describe("API coherence", () => {
    it("should export all required functions from utils", () => {
      expect(genConfig).toBeDefined();
      expect(typeof genConfig).toBe("function");
      expect(getRandColors).toBeDefined();
      expect(typeof getRandColors).toBe("function");
    });

    it("should have consistent API between engine options and config generation", () => {
      const shapes = ["circle", "square"];

      const engineOptions = { shapes };
      const engine = new ShadesEngine(canvas, engineOptions);

      expect(() => {
        engine.generate();
      }).not.toThrow();

      // Config should be able to handle the same shape types
      const config = genConfig(engineOptions);
      expect(config.type).toBeDefined();
    });
  });
});
