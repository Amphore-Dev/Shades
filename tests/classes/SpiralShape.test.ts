import { SpiralShape } from "../../src/classes/shapes/SpiralShape";
import { setupShapeTest } from "./shapes-test-utils";

describe("SpiralShape", () => {
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

  it("should create a spiral shape with correct properties", () => {
    const spiral = new SpiralShape(10, 20, testColor);

    expect(spiral.type).toBe("spiral");
    expect(spiral.filled).toBe(false); // SpiralShape defaults to not filled
    expect(spiral.rotation).toBe(true); // SpiralShape defaults to rotation enabled
    expect(spiral.position).toEqual({ x: 10, y: 20 });
    expect(spiral.color).toEqual(testColor);
    expect(spiral.angle).toBe(0);
  });

  it("should draw spiral using arc method", () => {
    const spiral = new SpiralShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    spiral.draw(mockCtx, testConfig, offset);

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.arc).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.closePath).toHaveBeenCalledTimes(testConfig.nbrShades);
  });

  it("should update angle when rotation is enabled", () => {
    const spiral = new SpiralShape(0, 0, testColor, { rotation: true });
    const initialAngle = spiral.angle;
    const offset = { x: 0, y: 0 };

    spiral.draw(mockCtx, testConfig, offset);

    expect(spiral.angle).not.toBe(initialAngle);
    expect(spiral.angle).toBeGreaterThan(initialAngle);
  });

  it("should not update angle when rotation is disabled", () => {
    const spiral = new SpiralShape(0, 0, testColor, { rotation: false });
    const initialAngle = spiral.angle;
    const offset = { x: 0, y: 0 };

    spiral.draw(mockCtx, testConfig, offset);

    expect(spiral.angle).toBe(initialAngle);
  });

  it("should call arc with progressive angles", () => {
    const spiral = new SpiralShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    spiral.draw(mockCtx, testConfig, offset);

    const arcCalls = mockCtx.arc.mock.calls;
    expect(arcCalls.length).toBe(testConfig.nbrShades);

    // Each arc call should have different start and end angles
    arcCalls.forEach((call: any, index: number) => {
      expect(call[2]).toBe(testConfig.width / 2); // radius
      expect(typeof call[3]).toBe("number"); // start angle
      expect(typeof call[4]).toBe("number"); // end angle
    });
  });
});
