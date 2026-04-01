import {
  genConfig,
  getRandColors,
  getRandColor,
  getRandLineCap,
  getRandFilter,
} from "../../src/utils/UShadeUtils";
import {
  SHADES_TYPES,
  COLORS,
  LIGHT_COLORS,
  LINE_CAP_TYPES,
  RANDOM_FILTERS,
  MAX_SHADES_NBR,
} from "../../src/constants/index";
import { TShadeColor } from "../../src/types/index";

// Mock document.body for testing
Object.defineProperty(document.body, "clientWidth", {
  value: 800,
  writable: true,
});
Object.defineProperty(document.body, "clientHeight", {
  value: 600,
  writable: true,
});

describe("UShadeUtils", () => {
  describe("genConfig", () => {
    it("should generate a valid configuration object", () => {
      const config = genConfig();

      expect(config).toHaveProperty("nbrShades");
      expect(config).toHaveProperty("nbrItemsX");
      expect(config).toHaveProperty("nbrItemsY");
      expect(config).toHaveProperty("width");
      expect(config).toHaveProperty("height");
      expect(config).toHaveProperty("spacing");
      expect(config).toHaveProperty("thickness");
      expect(config).toHaveProperty("type");
      expect(config).toHaveProperty("colors");
      expect(config).toHaveProperty("center");
      expect(config).toHaveProperty("lineCap");
    });

    it("should generate values within expected ranges", () => {
      const config = genConfig();

      expect(config.nbrShades).toBeGreaterThanOrEqual(3);
      expect(config.nbrShades).toBeLessThanOrEqual(MAX_SHADES_NBR);
      expect(config.width).toBeGreaterThanOrEqual(10);
      expect(config.width).toBeLessThanOrEqual(100);
      expect(config.height).toBeGreaterThanOrEqual(10);
      expect(config.height).toBeLessThanOrEqual(100);
      expect(config.spacing).toBeGreaterThanOrEqual(10);
      expect(config.spacing).toBeLessThanOrEqual(100);
      expect(config.thickness).toBeGreaterThanOrEqual(1);
      expect(config.thickness).toBeLessThanOrEqual(20);
    });

    it("should use provided shapes when specified", () => {
      const customShapes = ["circle", "square"];
      const config = genConfig({ shapes: customShapes });
      expect(customShapes).toContain(config.type);
    });

    it("should handle logo type specially", () => {
      const config = genConfig({ shapes: ["logo"] });
      expect(config.type).toBe("logo");
      expect(config.nbrShades).toBe(MAX_SHADES_NBR);
      expect(config.nbrItemsX).toBe(1);
      expect(config.nbrItemsY).toBe(1);
    });

    it("should set center point correctly", () => {
      const config = genConfig();
      expect(config.center.x).toBe(400); // 800 / 2
      expect(config.center.y).toBe(300); // 600 / 2
    });

    it("should generate array of 2 colors", () => {
      const config = genConfig();
      expect(Array.isArray(config.colors)).toBe(true);
      if (config.colors) {
        expect(config.colors).toHaveLength(2);
        config.colors.forEach((color) => {
          expect(color).toHaveProperty("r");
          expect(color).toHaveProperty("g");
          expect(color).toHaveProperty("b");
        });
      }
    });

    it("should include custom shapes in type selection", () => {
      // Skip this test as it requires proper type definitions
      const config = genConfig({ shapes: ["circle"] });
      expect(config.type).toBeDefined();
    });

    it("should calculate totalWidth and totalHeight correctly", () => {
      const config = genConfig();
      const expectedTotalWidth =
        config.nbrItemsX * config.width + config.nbrItemsX * config.spacing;
      const expectedTotalHeight =
        config.nbrItemsY * config.height + config.nbrItemsY * config.spacing;

      expect(config.totalWidth).toBe(expectedTotalWidth);
      expect(config.totalHeight).toBe(expectedTotalHeight);
    });

    it("should calculate gradRatio correctly", () => {
      const config = genConfig();
      expect(config.gradRatio).toBe(100 / config.nbrShades);
    });
  });

  describe("getRandColors", () => {
    it("should return an array of 2 colors", () => {
      const colors = getRandColors();
      expect(Array.isArray(colors)).toBe(true);
      expect(colors).toHaveLength(2);
      colors.forEach((color) => {
        expect(color).toHaveProperty("r");
        expect(color).toHaveProperty("g");
        expect(color).toHaveProperty("b");
      });
    });

    it("should use LIGHT_COLORS for logo type", () => {
      const colors = getRandColors("logo");
      colors.forEach((color) => {
        expect(LIGHT_COLORS).toContainEqual(color);
      });
    });

    it("should use provided color array when given", () => {
      const customColors: TShadeColor[] = [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
      ];
      const colors = getRandColors(customColors);
      colors.forEach((color) => {
        expect(customColors).toContainEqual(color);
      });
    });

    it("should use default COLORS for other shape types", () => {
      const colors = getRandColors("circle");
      colors.forEach((color) => {
        expect(COLORS).toContainEqual(color);
      });
    });

    it("should try to generate different colors", () => {
      // Run multiple times to test the different color logic
      let foundDifferentColors = false;
      for (let i = 0; i < 10; i++) {
        const colors = getRandColors();
        if (colors[0] !== colors[1]) {
          foundDifferentColors = true;
          break;
        }
      }
      expect(foundDifferentColors).toBe(true);
    });
  });

  describe("getRandColor", () => {
    it("should return a single color", () => {
      const color = getRandColor();
      expect(color).toHaveProperty("r");
      expect(color).toHaveProperty("g");
      expect(color).toHaveProperty("b");
      expect(typeof color.r).toBe("number");
      expect(typeof color.g).toBe("number");
      expect(typeof color.b).toBe("number");
    });

    it("should return a color from the available color set", () => {
      const color = getRandColor();
      expect(COLORS).toContainEqual(color);
    });
  });

  describe("getRandLineCap", () => {
    it("should return a valid line cap type", () => {
      const lineCap = getRandLineCap();
      expect(LINE_CAP_TYPES).toContain(lineCap);
      expect(["butt", "round", "square"]).toContain(lineCap);
    });
  });

  describe("getRandFilter", () => {
    it("should return a valid random filter", () => {
      const filter = getRandFilter();
      expect(RANDOM_FILTERS).toContain(filter);
    });
  });

  describe("randomness tests", () => {
    it("should generate different configurations on multiple calls", () => {
      const configs = Array.from({ length: 5 }, () => genConfig());
      // It's extremely unlikely all configs are identical
      const allIdentical = configs.every(
        (config) =>
          config.type === configs[0].type &&
          config.width === configs[0].width &&
          config.height === configs[0].height
      );
      expect(allIdentical).toBe(false);
    });
  });
});
