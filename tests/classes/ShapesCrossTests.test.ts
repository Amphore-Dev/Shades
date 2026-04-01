import { CircleShape } from "../../src/classes/shapes/CircleShape";
import { SquaredShape } from "../../src/classes/shapes/SquaredShape";
import { HeartShape } from "../../src/classes/shapes/HeartShape";
import { TriangleShape } from "../../src/classes/shapes/TriangleShape";
import { SpiralShape } from "../../src/classes/shapes/SpiralShape";
import { TextShape } from "../../src/classes/shapes/TextShape";
import { ImageShape } from "../../src/classes/shapes/ImageShape";
import { setupShapeTest } from "./shapes-test-utils";

describe("Shape inheritance and polymorphism", () => {
  let mockCtx: any;
  let testColor: any;
  let testConfig: any;

  beforeEach(() => {
    const setup = setupShapeTest();
    mockCtx = setup.mockCtx;
    testColor = setup.testColor;
    testConfig = setup.testConfig;

    // Mock document for ImageShape tests
    jest.spyOn(document, "getElementById").mockReturnValue(null);
    Object.defineProperty(document.body, "clientWidth", {
      value: 800,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, "clientHeight", {
      value: 600,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should all extend from ShadeItem base class", () => {
    const shapes = [
      new CircleShape(0, 0, testColor),
      new SquaredShape(0, 0, testColor),
      new HeartShape(0, 0, testColor),
      new TriangleShape(0, 0, testColor),
      new SpiralShape(0, 0, testColor),
      new TextShape(0, 0, testColor),
      new ImageShape(0, 0, testColor),
    ];

    shapes.forEach((shape) => {
      expect(shape).toHaveProperty("id");
      expect(shape).toHaveProperty("position");
      expect(shape).toHaveProperty("angle");
      expect(shape).toHaveProperty("rotation");
      expect(shape).toHaveProperty("color");
      expect(shape).toHaveProperty("type");
      expect(shape).toHaveProperty("filled");
      expect(shape).toHaveProperty("lineCap");
      expect(typeof shape.draw).toBe("function");
      expect(typeof shape.drawPath).toBe("function");
      expect(typeof shape.setColors).toBe("function");
    });
  });

  it("should have unique type identifiers", () => {
    const shapes = [
      new CircleShape(0, 0, testColor),
      new SquaredShape(0, 0, testColor),
      new HeartShape(0, 0, testColor),
      new TriangleShape(0, 0, testColor),
      new SpiralShape(0, 0, testColor),
      new TextShape(0, 0, testColor),
      new ImageShape(0, 0, testColor),
    ];

    const types = shapes.map((shape) => shape.type);
    const uniqueTypes = new Set(types);

    expect(uniqueTypes.size).toBe(shapes.length);
    expect(types).toEqual([
      "circle",
      "square",
      "heart",
      "triangle",
      "spiral",
      "text",
      "image",
    ]);
  });

  it("should all implement draw method without throwing errors", () => {
    const shapes = [
      new CircleShape(0, 0, testColor),
      new SquaredShape(0, 0, testColor),
      new HeartShape(0, 0, testColor),
      new TriangleShape(0, 0, testColor),
      new SpiralShape(0, 0, testColor),
      new TextShape(0, 0, testColor),
      new ImageShape(0, 0, testColor),
    ];

    const offset = { x: 0, y: 0 };

    shapes.forEach((shape) => {
      expect(() => {
        shape.draw(mockCtx, testConfig, offset);
      }).not.toThrow();
    });
  });

  it("should handle different default filled states correctly", () => {
    const filledByDefault = [
      new CircleShape(0, 0, testColor),
      new HeartShape(0, 0, testColor),
      new TriangleShape(0, 0, testColor),
      new TextShape(0, 0, testColor),
      new ImageShape(0, 0, testColor),
    ];

    const notFilledByDefault = [
      new SquaredShape(0, 0, testColor),
      new SpiralShape(0, 0, testColor),
    ];

    filledByDefault.forEach((shape) => {
      expect(shape.filled).toBe(true);
    });

    notFilledByDefault.forEach((shape) => {
      expect(shape.filled).toBe(false);
    });
  });

  it("should handle rotation settings correctly", () => {
    const rotationByDefault = [
      new TriangleShape(0, 0, testColor),
      new SpiralShape(0, 0, testColor),
    ];

    const noRotationByDefault = [
      new CircleShape(0, 0, testColor),
      new SquaredShape(0, 0, testColor),
      new HeartShape(0, 0, testColor),
      new TextShape(0, 0, testColor),
      new ImageShape(0, 0, testColor),
    ];

    rotationByDefault.forEach((shape) => {
      expect(shape.rotation).toBe(true);
    });

    noRotationByDefault.forEach((shape) => {
      expect(shape.rotation).toBe(false);
    });
  });
});

describe("Shape configuration and options", () => {
  let mockCtx: any;
  let testColor: any;
  let testConfig: any;

  beforeEach(() => {
    const setup = setupShapeTest();
    mockCtx = setup.mockCtx;
    testColor = setup.testColor;
    testConfig = setup.testConfig;

    // Mock document for ImageShape tests
    jest.spyOn(document, "getElementById").mockReturnValue(null);
    Object.defineProperty(document.body, "clientWidth", {
      value: 800,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, "clientHeight", {
      value: 600,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should accept and respect custom options for all shapes", () => {
    const customOptions = {
      filled: true,
      rotation: false,
      lineCap: "round" as const,
    };

    const shapes = [
      new CircleShape(0, 0, testColor, customOptions),
      new SquaredShape(0, 0, testColor, customOptions),
      new HeartShape(0, 0, testColor, customOptions),
      new TriangleShape(0, 0, testColor, customOptions),
      new SpiralShape(0, 0, testColor, customOptions),
    ];

    shapes.forEach((shape) => {
      expect(shape.lineCap).toBe("round");
    });
  });

  it("should work with different color values", () => {
    const colors = [
      { r: 0, g: 0, b: 0 }, // Black
      { r: 255, g: 255, b: 255 }, // White
      { r: 128, g: 64, b: 192 }, // Purple
      { r: 255, g: 165, b: 0 }, // Orange
    ];

    colors.forEach((color) => {
      const shapes = [
        new CircleShape(0, 0, color),
        new SquaredShape(0, 0, color),
        new HeartShape(0, 0, color),
        new TriangleShape(0, 0, color),
        new SpiralShape(0, 0, color),
        new TextShape(0, 0, color),
        new ImageShape(0, 0, color),
      ];

      shapes.forEach((shape) => {
        expect(shape.color).toEqual(color);
      });
    });
  });
});
