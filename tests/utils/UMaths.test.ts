import { random, degToRad } from "../../src/utils/UMaths";

describe("UMaths", () => {
  describe("random", () => {
    it("should generate numbers between min and max", () => {
      for (let i = 0; i < 100; i++) {
        const result = random(10, 20);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(20);
      }
    });

    it("should generate integers when integer flag is true", () => {
      for (let i = 0; i < 50; i++) {
        const result = random(10, 20, true);
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(10);
        expect(result).toBeLessThanOrEqual(20);
      }
    });

    it("should generate floats when integer flag is false", () => {
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(random(10, 20, false));
      }
      // At least some results should be floats
      const hasFloats = results.some((result) => !Number.isInteger(result));
      expect(hasFloats).toBe(true);
    });

    it("should work with negative numbers", () => {
      const result = random(-10, -5);
      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-5);
    });

    it("should work when min and max are the same", () => {
      const result = random(5, 5);
      expect(result).toBe(5);
    });
  });

  describe("degToRad", () => {
    it("should convert degrees to radians correctly", () => {
      expect(degToRad(0)).toBe(0);
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(degToRad(270)).toBeCloseTo((3 * Math.PI) / 2);
      expect(degToRad(360)).toBeCloseTo(2 * Math.PI);
    });

    it("should handle negative degrees", () => {
      expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);
      expect(degToRad(-180)).toBeCloseTo(-Math.PI);
    });

    it("should handle decimal degrees", () => {
      expect(degToRad(45.5)).toBeCloseTo((45.5 * Math.PI) / 180);
    });
  });
});
