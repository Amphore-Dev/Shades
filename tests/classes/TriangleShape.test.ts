import { TriangleShape } from "../../src/classes/shapes/TriangleShape";
import { setupShapeTest } from "./shapes-test-utils";

describe("TriangleShape", () => {
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

  it("should create a triangle shape with correct properties", () => {
    const triangle = new TriangleShape(10, 20, testColor);

    expect(triangle.type).toBe("triangle");
    expect(triangle.filled).toBe(true); // TriangleShape defaults to filled
    expect(triangle.rotation).toBe(true); // TriangleShape defaults to rotation enabled
    expect(triangle.position).toEqual({ x: 10, y: 20 });
    expect(triangle.color).toEqual(testColor);
    expect(triangle.angle).toBeCloseTo(Math.PI / 2); // 90 degrees in radians
  });

  it("should draw triangle using moveTo and lineTo", () => {
    const triangle = new TriangleShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    triangle.draw(mockCtx, testConfig, offset);

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.moveTo).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.lineTo).toHaveBeenCalledTimes(testConfig.nbrShades * 2); // Two lines per triangle
    expect(mockCtx.closePath).toHaveBeenCalledTimes(testConfig.nbrShades);
  });

  it("should update angle when rotation is enabled", () => {
    const triangle = new TriangleShape(0, 0, testColor, { rotation: true });
    const initialAngle = triangle.angle;
    const offset = { x: 0, y: 0 };

    triangle.draw(mockCtx, testConfig, offset);

    expect(triangle.angle).not.toBe(initialAngle);
    expect(triangle.angle).toBeGreaterThan(initialAngle);
  });

  it("should not update angle when rotation is disabled", () => {
    const triangle = new TriangleShape(0, 0, testColor, { rotation: false });
    const initialAngle = triangle.angle;
    const offset = { x: 0, y: 0 };

    triangle.draw(mockCtx, testConfig, offset);

    expect(triangle.angle).toBe(initialAngle);
  });

  it("should handle custom rotation setting", () => {
    const triangle = new TriangleShape(0, 0, testColor, { rotation: false });
    expect(triangle.rotation).toBe(false);
  });
});
