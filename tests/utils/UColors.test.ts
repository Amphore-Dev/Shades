import {
  rgbToHex,
  intToHex,
  hexToRgb,
  randomColor,
} from "../../src/utils/UColors";
import { TShadeColor } from "../../src/types/index";

describe("UColors", () => {
  describe("rgbToHex", () => {
    it("should convert RGB to hex correctly", () => {
      const color: TShadeColor = { r: 255, g: 0, b: 0 };
      expect(rgbToHex(color)).toBe("#ff0000");
    });

    it("should handle black color", () => {
      const color: TShadeColor = { r: 0, g: 0, b: 0 };
      expect(rgbToHex(color)).toBe("#000000");
    });

    it("should handle white color", () => {
      const color: TShadeColor = { r: 255, g: 255, b: 255 };
      expect(rgbToHex(color)).toBe("#ffffff");
    });

    it("should pad single digit hex values with zero", () => {
      const color: TShadeColor = { r: 1, g: 15, b: 255 };
      expect(rgbToHex(color)).toBe("#010fff");
    });

    it("should handle null/undefined color", () => {
      expect(rgbToHex(null as any)).toBe("#000000");
      expect(rgbToHex(undefined as any)).toBe("#000000");
    });

    it("should round decimal values", () => {
      const color: TShadeColor = { r: 255.4, g: 128.3, b: 0.9 };
      expect(rgbToHex(color)).toBe("#ff8001");
    });
  });

  describe("intToHex", () => {
    it("should convert integer to hex string", () => {
      expect(intToHex(255)).toBe("ff");
      expect(intToHex(0)).toBe("00");
      expect(intToHex(15)).toBe("0f");
      expect(intToHex(128)).toBe("80");
    });

    it("should pad single digit values", () => {
      expect(intToHex(1)).toBe("01");
      expect(intToHex(9)).toBe("09");
    });

    it("should round decimal values", () => {
      expect(intToHex(15.7)).toBe("10");
      expect(intToHex(255.3)).toBe("ff");
    });
  });

  describe("hexToRgb", () => {
    it("should convert hex to RGB correctly", () => {
      const result = hexToRgb("#ff0000");
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should handle hex without # prefix", () => {
      const result = hexToRgb("ff0000");
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should handle lowercase hex", () => {
      const result = hexToRgb("#ff00aa");
      expect(result).toEqual({ r: 255, g: 0, b: 170 });
    });

    it("should handle uppercase hex", () => {
      const result = hexToRgb("#FF00AA");
      expect(result).toEqual({ r: 255, g: 0, b: 170 });
    });

    it("should return null for invalid hex", () => {
      expect(hexToRgb("#gg0000")).toBeNull();
      expect(hexToRgb("#ff00")).toBeNull();
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("")).toBeNull();
    });

    it("should handle white and black", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe("randomColor", () => {
    it("should generate random RGB color", () => {
      const color = randomColor();
      expect(color).toHaveProperty("r");
      expect(color).toHaveProperty("g");
      expect(color).toHaveProperty("b");
      expect(typeof color.r).toBe("number");
      expect(typeof color.g).toBe("number");
      expect(typeof color.b).toBe("number");
    });

    it("should generate colors within valid RGB range", () => {
      for (let i = 0; i < 10; i++) {
        const color = randomColor();
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
      }
    });

    it("should generate different colors on multiple calls", () => {
      const colors = Array.from({ length: 10 }, () => randomColor());
      // It's very unlikely all colors are the same
      const allSame = colors.every(
        (color) =>
          color.r === colors[0].r &&
          color.g === colors[0].g &&
          color.b === colors[0].b
      );
      expect(allSame).toBe(false);
    });

    it("should generate integer values", () => {
      const color = randomColor();
      expect(Number.isInteger(color.r)).toBe(true);
      expect(Number.isInteger(color.g)).toBe(true);
      expect(Number.isInteger(color.b)).toBe(true);
    });
  });

  describe("roundtrip conversion", () => {
    it("should convert RGB to hex and back correctly", () => {
      const originalColor: TShadeColor = { r: 123, g: 234, b: 45 };
      const hex = rgbToHex(originalColor);
      const convertedBack = hexToRgb(hex);
      expect(convertedBack).toEqual(originalColor);
    });
  });
});
