import { HeartShape } from "../../src/classes/shapes/HeartShape";
import { setupShapeTest } from "./shapes-test-utils";

describe("HeartShape", () => {
  let mockCtx: any;
  let testColor: any;
  let testConfig: any;

  beforeEach(() => {
    const setup = setupShapeTest();
    mockCtx = setup.mockCtx;
    testColor = setup.testColor;
    testConfig = setup.testConfig;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a heart shape with correct properties", () => {
    const heart = new HeartShape(10, 20, testColor);

    expect(heart.type).toBe("heart");
    expect(heart.filled).toBe(true); // HeartShape defaults to filled
    expect(heart.position).toEqual({ x: 10, y: 20 });
    expect(heart.color).toEqual(testColor);
  });

  it("should draw heart using bezier curves", () => {
    const heart = new HeartShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    heart.draw(mockCtx, testConfig, offset);

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.moveTo).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.bezierCurveTo).toHaveBeenCalledTimes(
      testConfig.nbrShades * 2
    ); // Two bezier curves per heart
    expect(mockCtx.closePath).toHaveBeenCalledTimes(testConfig.nbrShades);
  });

  it("should set lineCap to round and restore it", () => {
    const heart = new HeartShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };
    const originalLineCap = mockCtx.lineCap;

    heart.draw(mockCtx, testConfig, offset);

    expect(mockCtx.lineCap).toBe(originalLineCap); // Should be restored
  });

  it("should handle different line cap options", () => {
    const heart = new HeartShape(0, 0, testColor, { lineCap: "square" });
    expect(heart.lineCap).toBe("square");
  });
});
