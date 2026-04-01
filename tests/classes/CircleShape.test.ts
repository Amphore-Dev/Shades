import { CircleShape } from "../../src/classes/shapes/CircleShape";
import { setupShapeTest } from "./shapes-test-utils";

describe("CircleShape", () => {
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

  it("should create a circle shape with correct properties", () => {
    const circle = new CircleShape(10, 20, testColor);

    expect(circle.type).toBe("circle");
    expect(circle.filled).toBe(true); // CircleShape defaults to filled
    expect(circle.position).toEqual({ x: 10, y: 20 });
    expect(circle.color).toEqual(testColor);
  });

  it("should draw circles using arc method", () => {
    const circle = new CircleShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    circle.draw(mockCtx, testConfig, offset);

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.arc).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.closePath).toHaveBeenCalledTimes(testConfig.nbrShades);
  });

  it("should calculate position correctly with offset", () => {
    const circle = new CircleShape(50, 60, testColor);
    const offset = { x: 5, y: 10 };

    circle.draw(mockCtx, testConfig, offset);

    expect(mockCtx.arc).toHaveBeenCalled();
    const firstCall = mockCtx.arc.mock.calls[0];
    expect(firstCall[2]).toBe(testConfig.width / 2); // radius
  });

  it("should override filled option when specified", () => {
    const circle = new CircleShape(0, 0, testColor, { filled: false });
    expect(circle.filled).toBe(false);
  });
});
