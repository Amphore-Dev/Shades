import { ShadeItem } from "../../src/classes/shapes/BaseShape";
import {
  TShadeColor,
  TShadeConfig,
  TShapeOptions,
} from "../../src/types/index";

// Mock console.warn to test the warning
const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

describe("BaseShape (ShadeItem)", () => {
  beforeEach(() => {
    consoleWarnSpy.mockClear();
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  const testColor: TShadeColor = { r: 255, g: 0, b: 0 };

  describe("constructor", () => {
    it("should create a ShadeItem with default values", () => {
      const item = new ShadeItem(10, 20, testColor);

      expect(item.position).toEqual({ x: 10, y: 20 });
      expect(item.color).toEqual(testColor);
      expect(item.angle).toBe(0);
      expect(item.rotation).toBe(false);
      expect(item.type).toBe("circle");
      expect(item.filled).toBe(false);
      expect(item.lineCap).toBe("butt");
      expect(typeof item.id).toBe("string");
      expect(item.id.length).toBe(8);
    });

    it("should apply options when provided", () => {
      const options: TShapeOptions = {
        filled: true,
        rotation: true,
        lineCap: "round",
      };
      const item = new ShadeItem(5, 15, testColor, options);

      expect(item.filled).toBe(true);
      expect(item.rotation).toBe(true);
      expect(item.lineCap).toBe("round");
    });

    it("should generate unique IDs for different instances", () => {
      const item1 = new ShadeItem(0, 0, testColor);
      const item2 = new ShadeItem(0, 0, testColor);

      expect(item1.id).not.toBe(item2.id);
    });

    it("should handle partial options", () => {
      const options: TShapeOptions = {
        filled: true,
        // rotation and lineCap should use defaults
      };
      const item = new ShadeItem(0, 0, testColor, options);

      expect(item.filled).toBe(true);
      expect(item.rotation).toBe(false); // default
      expect(item.lineCap).toBe("butt"); // default
    });

    it("should handle empty options object", () => {
      const item = new ShadeItem(0, 0, testColor, {});

      expect(item.filled).toBe(false);
      expect(item.rotation).toBe(false);
      expect(item.lineCap).toBe("butt");
    });
  });

  describe("draw method", () => {
    it("should warn that draw method is not implemented", () => {
      const item = new ShadeItem(0, 0, testColor);
      const mockCtx = {} as CanvasRenderingContext2D;
      const mockConfig = {} as TShadeConfig;
      const mockOffset = { x: 0, y: 0 };

      item.draw(mockCtx, mockConfig, mockOffset);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "draw method not implemented"
      );
    });
  });

  describe("drawPath method", () => {
    let mockCtx: any;

    beforeEach(() => {
      mockCtx = {
        lineCap: "butt",
        fill: jest.fn(),
        stroke: jest.fn(),
      };
    });

    it("should call fill when item is filled", () => {
      const item = new ShadeItem(0, 0, testColor, { filled: true });

      item.drawPath(mockCtx);

      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).not.toHaveBeenCalled();
    });

    it("should call stroke when item is not filled", () => {
      const item = new ShadeItem(0, 0, testColor, { filled: false });

      item.drawPath(mockCtx);

      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.fill).not.toHaveBeenCalled();
    });

    it("should preserve and restore lineCap setting", () => {
      const item = new ShadeItem(0, 0, testColor, { lineCap: "round" });
      mockCtx.lineCap = "square";

      item.drawPath(mockCtx);

      expect(mockCtx.lineCap).toBe("square"); // restored to original
    });

    it("should apply custom lineCap during drawing", () => {
      const item = new ShadeItem(0, 0, testColor, { lineCap: "round" });
      const originalLineCap = "square";
      mockCtx.lineCap = originalLineCap;

      // Mock the lineCap setter to capture when it's changed
      const lineCapSetter = jest.fn();
      Object.defineProperty(mockCtx, "lineCap", {
        get: () => mockCtx._lineCap,
        set: lineCapSetter,
      });
      mockCtx._lineCap = originalLineCap;

      item.drawPath(mockCtx);

      expect(lineCapSetter).toHaveBeenCalledWith("round");
      expect(lineCapSetter).toHaveBeenCalledWith(originalLineCap);
    });
  });

  describe("setColors method", () => {
    let mockCtx: CanvasRenderingContext2D;

    beforeEach(() => {
      mockCtx = {
        fillStyle: "",
        strokeStyle: "",
      } as CanvasRenderingContext2D;
    });

    it("should set fillStyle when item is filled", () => {
      const item = new ShadeItem(0, 0, testColor, { filled: true });

      item.setColors(mockCtx, 10, 2);

      expect(mockCtx.fillStyle).toBe("rgba(255, 0, 0, 0.8)"); // 1 - (10 * 2) / 100 = 0.8
      expect(mockCtx.strokeStyle).toBe("");
    });

    it("should set strokeStyle when item is not filled", () => {
      const item = new ShadeItem(0, 0, testColor, { filled: false });

      item.setColors(mockCtx, 5, 3);

      expect(mockCtx.strokeStyle).toBe("rgba(255, 0, 0, 0.85)"); // 1 - (5 * 3) / 100 = 0.85
      expect(mockCtx.fillStyle).toBe("");
    });

    it("should handle null/undefined color gracefully", () => {
      const item = new ShadeItem(0, 0, null as unknown as TShadeColor);

      expect(() => {
        item.setColors(mockCtx, 10, 2);
      }).not.toThrow();

      expect(mockCtx.fillStyle).toBe("");
      expect(mockCtx.strokeStyle).toBe("");
    });

    it("should calculate alpha correctly with different gradRatio and i values", () => {
      const item = new ShadeItem(0, 0, testColor);

      item.setColors(mockCtx, 20, 1); // 1 - (20 * 1) / 100 = 0.8
      expect(mockCtx.strokeStyle).toBe("rgba(255, 0, 0, 0.8)");

      item.setColors(mockCtx, 25, 2); // 1 - (25 * 2) / 100 = 0.5
      expect(mockCtx.strokeStyle).toBe("rgba(255, 0, 0, 0.5)");

      item.setColors(mockCtx, 10, 5); // 1 - (10 * 5) / 100 = 0.5
      expect(mockCtx.strokeStyle).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("should work with different RGB values", () => {
      const blueColor: TShadeColor = { r: 0, g: 0, b: 255 };
      const item = new ShadeItem(0, 0, blueColor);

      item.setColors(mockCtx, 10, 1);

      expect(mockCtx.strokeStyle).toBe("rgba(0, 0, 255, 0.9)");
    });
  });

  describe("property types", () => {
    it("should have correct property types", () => {
      const item = new ShadeItem(0, 0, testColor);

      expect(typeof item.id).toBe("string");
      expect(typeof item.position).toBe("object");
      expect(typeof item.angle).toBe("number");
      expect(typeof item.rotation).toBe("boolean");
      expect(typeof item.color).toBe("object");
      expect(typeof item.type).toBe("string");
      expect(typeof item.filled).toBe("boolean");
      expect(typeof item.lineCap).toBe("string");
    });
  });
});
