import {
  ShadesEngine,
  TShadesEngineOptions,
} from "../../src/classes/ShadesEngine";

// Mock document.fonts
Object.defineProperty(document, "fonts", {
  value: {
    ready: Promise.resolve(),
    load: jest.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

// Mock document.body dimensions
Object.defineProperty(document.body, "clientWidth", {
  value: 800,
  writable: true,
});
Object.defineProperty(document.body, "clientHeight", {
  value: 600,
  writable: true,
});

describe("ShadesEngine", () => {
  let canvas: HTMLCanvasElement;
  let mockContext: any;

  beforeEach(() => {
    // Create canvas element with proper mock
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;

    // Mock clientWidth and clientHeight
    Object.defineProperty(canvas, "clientWidth", {
      value: 800,
      writable: true,
    });
    Object.defineProperty(canvas, "clientHeight", {
      value: 600,
      writable: true,
    });

    // Mock canvas event listeners
    canvas.addEventListener = jest.fn();
    canvas.removeEventListener = jest.fn();

    // Create comprehensive mock context
    mockContext = {
      canvas: canvas,
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      lineCap: "butt",
      globalAlpha: 1,
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      fill: jest.fn(),
      stroke: jest.fn(),
      beginPath: jest.fn(),
      closePath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      arc: jest.fn(),
      arcTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      quadraticCurveTo: jest.fn(),
      rect: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      transform: jest.fn(),
      setTransform: jest.fn(),
      resetTransform: jest.fn(),
      measureText: jest.fn(() => ({ width: 100 })),
      fillText: jest.fn(),
      strokeText: jest.fn(),
      createLinearGradient: jest.fn(),
      createRadialGradient: jest.fn(),
      createPattern: jest.fn(),
      getImageData: jest.fn(),
      putImageData: jest.fn(),
      drawImage: jest.fn(),
    };

    // Mock getContext directly
    canvas.getContext = jest.fn().mockReturnValue(mockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create ShadesEngine with canvas and default options", () => {
      const engine = new ShadesEngine(canvas);

      expect(engine).toBeDefined();
      expect(canvas.getContext).toHaveBeenCalledWith("2d");
    });

    it("should throw error if canvas context cannot be obtained", () => {
      canvas.getContext = jest.fn().mockReturnValue(null);

      expect(() => {
        new ShadesEngine(canvas);
      }).toThrow("Cannot get 2D context from canvas");
    });

    it("should accept options parameter", () => {
      const options: TShadesEngineOptions = {
        shapes: ["circle", "square"],
        debug: true,
        fadeDuration: 1000,
      };

      const engine = new ShadesEngine(canvas, options);
      expect(engine).toBeDefined();
    });

    it("should setup canvas dimensions correctly", () => {
      new ShadesEngine(canvas);

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it("should accept custom shapes option", () => {
      const engine = new ShadesEngine(canvas, { shapes: ["circle"] });
      expect(engine).toBeDefined();
    });

    it("should handle debug options", () => {
      const debugOptions = {
        debug: { className: "debug-class" },
      };

      const engine = new ShadesEngine(canvas, debugOptions);
      expect(engine).toBeDefined();
    });
  });

  describe("generate method", () => {
    let engine: ShadesEngine;

    beforeEach(() => {
      engine = new ShadesEngine(canvas);

      // Mock event listener methods
      jest.spyOn(canvas, "addEventListener").mockImplementation(() => {});
      jest.spyOn(window, "addEventListener").mockImplementation(() => {});
      jest.spyOn(document, "addEventListener").mockImplementation(() => {});

      // Mock requestAnimationFrame
      global.requestAnimationFrame = jest.fn((cb) => {
        setTimeout(() => cb(1000), 16);
        return 1;
      });
    });

    it("should call generate method without errors", () => {
      expect(() => {
        engine.generate();
      }).not.toThrow();
    });

    it("should attach event listeners when generate is called", () => {
      engine.generate();

      expect(canvas.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function)
      );
      expect(canvas.addEventListener).toHaveBeenCalledWith(
        "wheel",
        expect.any(Function)
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        "resize",
        expect.any(Function)
      );
    });

    it("should work with custom fade duration", () => {
      const customEngine = new ShadesEngine(canvas, { fadeDuration: 2000 });

      expect(() => {
        customEngine.generate();
      }).not.toThrow();
    });
  });

  describe("public API methods", () => {
    let engine: ShadesEngine;

    beforeEach(() => {
      engine = new ShadesEngine(canvas);

      // Mock globals
      global.requestAnimationFrame = jest.fn(() => 1);
      global.cancelAnimationFrame = jest.fn();
      global.setInterval = jest.fn();

      // Mock event listeners
      jest.spyOn(canvas, "addEventListener").mockImplementation(() => {});
      jest.spyOn(canvas, "removeEventListener").mockImplementation(() => {});
      jest.spyOn(window, "addEventListener").mockImplementation(() => {});
      jest.spyOn(window, "removeEventListener").mockImplementation(() => {});
      jest.spyOn(document, "addEventListener").mockImplementation(() => {});
      jest.spyOn(document, "removeEventListener").mockImplementation(() => {});
    });

    it("should start animation when called", () => {
      engine.start();

      expect(engine.isAnimating()).toBe(true);
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it("should pause animation when called", () => {
      engine.start();
      engine.pause();

      expect(engine.isAnimating()).toBe(false);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it("should cleanup engine state on destroy", () => {
      engine.start();
      engine.destroy();

      expect(engine.isAnimating()).toBe(false);
      expect(canvas.removeEventListener).toHaveBeenCalled();
      expect(engine.getItems()).toHaveLength(0);
    });

    it("should trigger regeneration", () => {
      expect(() => {
        engine.regenerate();
      }).not.toThrow();
    });

    it("should return config copy", () => {
      const config = engine.getShadesConfig();

      expect(config).toBeDefined();
      expect(typeof config).toBe("object");
    });

    it("should return items array copy", () => {
      const items = engine.getItems();

      expect(Array.isArray(items)).toBe(true);
    });

    it("should handle shades count adjustment operations", () => {
      expect(() => {
        engine.setShadesCount(0.5);
        engine.setShadesCount(-0.5);
      }).not.toThrow();
    });
  });

  describe("animation and rendering", () => {
    let engine: ShadesEngine;

    beforeEach(() => {
      engine = new ShadesEngine(canvas);

      global.performance = {
        now: jest.fn(() => 1000),
      } as any;

      global.requestAnimationFrame = jest.fn((cb) => {
        setTimeout(() => cb(1000), 16);
        return 1;
      });
    });

    it("should handle animation frame correctly", () => {
      engine.start();

      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it("should clear canvas during animation", () => {
      engine.start();

      const animateCallback = (global.requestAnimationFrame as jest.Mock).mock
        .calls[0][0];
      animateCallback(1000);

      expect(mockContext.clearRect).toHaveBeenCalled();
    });

    it("should not animate when not playing", () => {
      expect(engine.isAnimating()).toBe(false);
    });

    it("should apply fade overlay to canvas", () => {
      engine.start();

      const animateCallback = (global.requestAnimationFrame as jest.Mock).mock
        .calls[0][0];
      animateCallback(1000);

      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe("debug functionality", () => {
    beforeEach(() => {
      global.document.createElement = jest.fn(
        () =>
          ({
            style: {},
            className: "",
            innerHTML: "",
            remove: jest.fn(),
          }) as any
      );

      Object.defineProperty(canvas, "parentNode", {
        value: { insertBefore: jest.fn() },
        writable: true,
      });
    });

    it("should enable debug when debug option is true", () => {
      const engine = new ShadesEngine(canvas, { debug: true });

      expect(document.createElement).toHaveBeenCalledWith("pre");
    });

    it("should return debug info", () => {
      const engine = new ShadesEngine(canvas, { debug: true });
      const debugInfo = engine.getDebugInfo();

      expect(debugInfo).toHaveProperty("genCount");
      expect(debugInfo).toHaveProperty("config");
      expect(typeof debugInfo.genCount).toBe("number");
    });

    it("should set debug mode dynamically", () => {
      const engine = new ShadesEngine(canvas);

      expect(() => {
        engine.setDebug(true);
        engine.setDebug(false);
      }).not.toThrow();
    });
  });

  describe("configuration and options", () => {
    it("should handle different configurations", () => {
      const engine1 = new ShadesEngine(canvas, { shapes: ["circle"] });
      const engine2 = new ShadesEngine(canvas, { shapes: ["square"] });

      expect(engine1).toBeDefined();
      expect(engine2).toBeDefined();
    });

    it("should handle custom shapes configuration", () => {
      const customShapes = {
        custom: class CustomShape {} as any,
      };

      const engine = new ShadesEngine(canvas, {
        customShapes,
        shapes: ["custom"],
      });

      expect(engine).toBeDefined();
    });

    it("should handle different fade durations", () => {
      const fastEngine = new ShadesEngine(canvas, { fadeDuration: 100 });
      const slowEngine = new ShadesEngine(canvas, { fadeDuration: 5000 });

      expect(fastEngine).toBeDefined();
      expect(slowEngine).toBeDefined();
    });
  });

  describe("error handling", () => {
    it("should handle missing canvas gracefully", () => {
      expect(() => {
        new ShadesEngine(null as any);
      }).toThrow();
    });

    it("should handle invalid context gracefully", () => {
      const invalidCanvas = document.createElement("canvas");
      invalidCanvas.getContext = jest.fn().mockReturnValue(null);

      expect(() => {
        new ShadesEngine(invalidCanvas);
      }).toThrow("Cannot get 2D context from canvas");
    });
  });

  describe("generate with different scenarios", () => {
    it("should handle document.fonts not available", () => {
      const originalFonts = document.fonts;
      (document as any).fonts = undefined;

      try {
        const engine = new ShadesEngine(canvas);

        expect(() => {
          engine.generate();
        }).not.toThrow();
      } finally {
        (document as any).fonts = originalFonts;
      }
    });

    it("should call initDefaultGeneration when fonts not available", () => {
      const originalFonts = document.fonts;
      (document as any).fonts = null;

      try {
        const engine = new ShadesEngine(canvas);

        expect(() => {
          engine.generate();
        }).not.toThrow();

        const config = engine.getShadesConfig();
        expect(config).toBeDefined();
      } finally {
        (document as any).fonts = originalFonts;
      }
    });
  });

  describe("shades count adjustment functionality", () => {
    let engine: ShadesEngine;

    beforeEach(() => {
      engine = new ShadesEngine(canvas);
    });

    it("should increase shades count with positive scale", () => {
      const initialConfig = engine.getShadesConfig();
      engine.setShadesCount(0.1);
      const newConfig = engine.getShadesConfig();

      expect(newConfig.nbrShades).toBeGreaterThan(initialConfig.nbrShades);
    });

    it("should decrease shades count with negative scale", () => {
      engine.setShadesCount(2);
      const configAfterIncrease = engine.getShadesConfig();

      engine.setShadesCount(-1);
      const configAfterDecrease = engine.getShadesConfig();

      expect(configAfterDecrease.nbrShades).toBeLessThan(
        configAfterIncrease.nbrShades
      );
    });

    it("should respect shades count limits", () => {
      engine.setShadesCount(-100);
      const configMin = engine.getShadesConfig();
      expect(configMin.nbrShades).toBeGreaterThanOrEqual(1);

      engine.setShadesCount(1000);
      const configMax = engine.getShadesConfig();
      expect(configMax.nbrShades).toBeLessThanOrEqual(100);
    });
  });
});
