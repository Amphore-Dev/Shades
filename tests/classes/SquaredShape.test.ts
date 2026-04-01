import { SquaredShape } from "../../src/classes/shapes/SquaredShape";
import { setupShapeTest } from "./shapes-test-utils";

describe("SquaredShape", () => {
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

  it("should create a square shape with correct properties", () => {
    const square = new SquaredShape(10, 20, testColor);

    expect(square.type).toBe("square");
    expect(square.filled).toBe(false); // SquaredShape defaults to not filled
    expect(square.position).toEqual({ x: 10, y: 20 });
    expect(square.color).toEqual(testColor);
  });

  it("should draw rectangles using rect method", () => {
    const square = new SquaredShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    square.draw(mockCtx, testConfig, offset);

    expect(mockCtx.beginPath).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.rect).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.closePath).toHaveBeenCalledTimes(testConfig.nbrShades);
  });

  it("should call rect with correct dimensions", () => {
    const square = new SquaredShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    square.draw(mockCtx, testConfig, offset);

    const rectCalls = mockCtx.rect.mock.calls;
    rectCalls.forEach((call: any) => {
      expect(call[2]).toBe(testConfig.width); // width parameter
      expect(call[3]).toBe(testConfig.height); // height parameter
    });
  });

  it("should be configurable as filled", () => {
    const square = new SquaredShape(0, 0, testColor, { filled: true });
    expect(square.filled).toBe(true);
  });
});
