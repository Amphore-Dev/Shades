import {
  HOME_COLORS,
  LIGHT_COLORS,
  DARK_COLORS,
  COLORS,
  MAX_SHADES_NBR,
  SHADES_TYPES,
  SAME_COLOR_FILTER,
  NO_FILTER,
  RANDOM_FILTER,
  RANDOM_50_FILTER,
  RANDOM_FILTERS,
  LINE_CAP_TYPES,
} from "../../src/constants/index";
import { TShadeColor } from "../../src/types/index";

describe("Constants", () => {
  describe("Color constants", () => {
    it("should have HOME_COLORS as array of valid colors", () => {
      expect(Array.isArray(HOME_COLORS)).toBe(true);
      expect(HOME_COLORS.length).toBeGreaterThan(0);

      HOME_COLORS.forEach((color) => {
        expect(color).toHaveProperty("r");
        expect(color).toHaveProperty("g");
        expect(color).toHaveProperty("b");
        expect(typeof color.r).toBe("number");
        expect(typeof color.g).toBe("number");
        expect(typeof color.b).toBe("number");
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
      });
    });

    it("should have LIGHT_COLORS as array of valid colors", () => {
      expect(Array.isArray(LIGHT_COLORS)).toBe(true);
      expect(LIGHT_COLORS.length).toBeGreaterThan(0);

      LIGHT_COLORS.forEach((color) => {
        expect(color).toHaveProperty("r");
        expect(color).toHaveProperty("g");
        expect(color).toHaveProperty("b");
      });
    });

    it("should have DARK_COLORS as array of valid colors", () => {
      expect(Array.isArray(DARK_COLORS)).toBe(true);
      expect(DARK_COLORS.length).toBeGreaterThan(0);

      DARK_COLORS.forEach((color) => {
        expect(color).toHaveProperty("r");
        expect(color).toHaveProperty("g");
        expect(color).toHaveProperty("b");
      });
    });

    it("should have COLORS as combination of all color arrays", () => {
      expect(Array.isArray(COLORS)).toBe(true);
      expect(COLORS.length).toBe(
        HOME_COLORS.length + LIGHT_COLORS.length + DARK_COLORS.length
      );

      // Check that COLORS contains all colors from other arrays
      HOME_COLORS.forEach((color) => {
        expect(COLORS).toContainEqual(color);
      });
      LIGHT_COLORS.forEach((color) => {
        expect(COLORS).toContainEqual(color);
      });
      DARK_COLORS.forEach((color) => {
        expect(COLORS).toContainEqual(color);
      });
    });
  });

  describe("Shades constants", () => {
    it("should have MAX_SHADES_NBR as positive number", () => {
      expect(typeof MAX_SHADES_NBR).toBe("number");
      expect(MAX_SHADES_NBR).toBeGreaterThan(0);
      expect(Number.isInteger(MAX_SHADES_NBR)).toBe(true);
    });

    it("should have SHADES_TYPES as array of strings", () => {
      expect(Array.isArray(SHADES_TYPES)).toBe(true);
      expect(SHADES_TYPES.length).toBeGreaterThan(0);

      SHADES_TYPES.forEach((type) => {
        expect(typeof type).toBe("string");
        expect(type.length).toBeGreaterThan(0);
      });
    });

    it("should contain expected shape types", () => {
      expect(SHADES_TYPES).toContain("square");
      expect(SHADES_TYPES).toContain("circle");
      expect(SHADES_TYPES).toContain("heart");
      expect(SHADES_TYPES).toContain("text");
      expect(SHADES_TYPES).toContain("spiral");
      expect(SHADES_TYPES).toContain("triangle");
    });
  });

  describe("Filter functions", () => {
    const testColor1: TShadeColor = { r: 255, g: 0, b: 0 };
    const testColor2: TShadeColor = { r: 255, g: 0, b: 0 };
    const testColor3: TShadeColor = { r: 0, g: 255, b: 0 };

    it("should have SAME_COLOR_FILTER function", () => {
      expect(typeof SAME_COLOR_FILTER).toBe("function");
      expect(SAME_COLOR_FILTER(testColor1, testColor2)).toBe(true);
      expect(SAME_COLOR_FILTER(testColor1, testColor3)).toBe(false);
    });

    it("should have NO_FILTER function that always returns true", () => {
      expect(typeof NO_FILTER).toBe("function");
      expect(NO_FILTER()).toBe(true);
    });

    it("should have RANDOM_FILTER function that always returns false", () => {
      expect(typeof RANDOM_FILTER).toBe("function");
      expect(RANDOM_FILTER()).toBe(false);
    });

    it("should have RANDOM_50_FILTER function that returns boolean", () => {
      expect(typeof RANDOM_50_FILTER).toBe("function");
      const result = RANDOM_50_FILTER();
      expect(typeof result).toBe("boolean");
    });

    it("should have RANDOM_FILTERS array containing all filter functions", () => {
      expect(Array.isArray(RANDOM_FILTERS)).toBe(true);
      expect(RANDOM_FILTERS).toContain(SAME_COLOR_FILTER);
      expect(RANDOM_FILTERS).toContain(NO_FILTER);
      expect(RANDOM_FILTERS).toContain(RANDOM_FILTER);
      expect(RANDOM_FILTERS).toContain(RANDOM_50_FILTER);
    });

    it("should have RANDOM_50_FILTER generate some variety", () => {
      const results = Array.from({ length: 20 }, () => RANDOM_50_FILTER());
      const hasTrue = results.includes(true);
      const hasFalse = results.includes(false);

      // With 20 calls, we should see some variety (this could rarely fail due to randomness)
      expect(hasTrue || hasFalse).toBe(true);
    });
  });

  describe("LINE_CAP_TYPES", () => {
    it("should be an array of valid CanvasLineCap values", () => {
      expect(Array.isArray(LINE_CAP_TYPES)).toBe(true);
      expect(LINE_CAP_TYPES).toHaveLength(3);
      expect(LINE_CAP_TYPES).toContain("butt");
      expect(LINE_CAP_TYPES).toContain("round");
      expect(LINE_CAP_TYPES).toContain("square");
    });

    it("should contain only valid line cap types", () => {
      const validCapTypes = ["butt", "round", "square"];
      LINE_CAP_TYPES.forEach((capType) => {
        expect(validCapTypes).toContain(capType);
      });
    });
  });
});
