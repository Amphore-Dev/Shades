import { TextShape } from "../../src/classes/shapes/TextShape";
import { setupShapeTest } from "./shapes-test-utils";

describe("TextShape", () => {
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

  it("should create a text shape with correct properties", () => {
    const text = new TextShape(10, 20, testColor);

    expect(text.type).toBe("text");
    expect(text.filled).toBe(true); // TextShape defaults to filled
    expect(text.position).toEqual({ x: 10, y: 20 });
    expect(text.color).toEqual(testColor);
    expect(text.text).toBe("SHADES"); // Default text
    expect(text.font).toBe("Remained"); // Default font
  });

  it("should accept custom text and font", () => {
    const customText = new TextShape(0, 0, testColor, {
      text: "Custom Text",
      font: "Arial",
    });

    expect(customText.text).toBe("Custom Text");
    expect(customText.font).toBe("Arial");
  });

  it("should draw text using fillText method", () => {
    const text = new TextShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    text.draw(mockCtx, testConfig, offset);

    expect(mockCtx.fillText).toHaveBeenCalledTimes(testConfig.nbrShades);

    // Check that text and font are set correctly
    expect(mockCtx.font).toContain(testConfig.width.toString());
    expect(mockCtx.font).toContain("Remained");
    expect(mockCtx.textBaseline).toBe("middle");
    expect(mockCtx.textAlign).toBe("center");
  });

  it("should render custom text content", () => {
    const customText = new TextShape(0, 0, testColor, { text: "TEST" });
    const offset = { x: 0, y: 0 };

    customText.draw(mockCtx, testConfig, offset);

    const fillTextCalls = mockCtx.fillText.mock.calls;
    fillTextCalls.forEach((call: any) => {
      expect(call[0]).toBe("TEST"); // First parameter is the text
    });
  });

  it("should set font size based on config width", () => {
    const text = new TextShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    text.draw(mockCtx, testConfig, offset);

    expect(mockCtx.font).toBe(`${testConfig.width}px Remained`);
  });
});
