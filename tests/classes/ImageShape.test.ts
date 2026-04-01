import { ImageShape } from "../../src/classes/shapes/ImageShape";
import { setupShapeTest } from "./shapes-test-utils";
import { TShadeColor } from "../../src/types/index";

describe("ImageShape", () => {
  let mockCtx: any;
  let testColor: any;
  let testConfig: any;

  beforeEach(() => {
    const setup = setupShapeTest();
    mockCtx = setup.mockCtx;
    testColor = setup.testColor;
    testConfig = setup.testConfig;

    // Mock document.getElementById for ImageShape fallback
    jest.spyOn(document, "getElementById").mockReturnValue(null);

    // Mock document.body dimensions
    Object.defineProperty(document.body, "clientWidth", {
      value: 800,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(document.body, "clientHeight", {
      value: 600,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create an image shape with correct properties", () => {
    const image = new ImageShape(10, 20, testColor);

    expect(image.type).toBe("image");
    expect(image.filled).toBe(true); // ImageShape defaults to filled
    expect(image.rotation).toBe(false); // ImageShape defaults to no rotation
    expect(image.position).toEqual({ x: 10, y: 20 });
    expect(image.color).toEqual(testColor);
    expect(image.hasImageLoaded).toBe(false);
    expect(image.hexColor).toBe("#ff0000"); // Red color in hex
  });

  it("should accept image URL as option", () => {
    const imageUrl = "https://example.com/image.png";
    const image = new ImageShape(0, 0, testColor, { imageSource: imageUrl });

    expect(image.imageUrl).toBe(imageUrl);
  });

  it("should accept HTMLImageElement as option", () => {
    const mockImageElement = document.createElement("img");
    mockImageElement.src = "test.png";
    Object.defineProperty(mockImageElement, "complete", { value: true });

    const image = new ImageShape(0, 0, testColor, {
      imageSource: mockImageElement,
    });

    expect(image.image).toBe(mockImageElement);
    expect(image.hasImageLoaded).toBe(true);
  });

  it("should convert color to hex correctly", () => {
    const blueColor: TShadeColor = { r: 0, g: 0, b: 255 };
    const image = new ImageShape(0, 0, blueColor);

    expect(image.hexColor).toBe("#0000ff");
  });

  it("should draw when image is loaded", () => {
    const image = new ImageShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    // Simulate loaded image
    const mockImage = document.createElement("img");
    Object.defineProperty(mockImage, "width", { value: 100 });
    Object.defineProperty(mockImage, "height", { value: 100 });
    image.hasImageLoaded = true;
    image.image = mockImage;

    image.draw(mockCtx, testConfig, offset);

    // Should call drawing methods when image is loaded
    expect(mockCtx.beginPath).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.fillRect).toHaveBeenCalledTimes(testConfig.nbrShades);
    expect(mockCtx.closePath).toHaveBeenCalledTimes(testConfig.nbrShades);
  });

  it("should handle missing image source gracefully", () => {
    const image = new ImageShape(0, 0, testColor);
    const offset = { x: 0, y: 0 };

    expect(() => {
      image.draw(mockCtx, testConfig, offset);
    }).not.toThrow();
  });

  it("should load image from DOM element when fallback is used", () => {
    const mockSVG = document.createElement("div");
    mockSVG.id = "Logo";

    jest.spyOn(document, "getElementById").mockReturnValue(mockSVG);

    const image = new ImageShape(0, 0, testColor);

    expect(document.getElementById).toHaveBeenCalledWith("Logo");
  });

  it("should handle image loading from URL", () => {
    const imageUrl = "https://example.com/image.png";
    const image = new ImageShape(0, 0, testColor, { imageSource: imageUrl });

    expect(image.imageUrl).toBe(imageUrl);
    expect(image.hasImageLoaded).toBe(false); // Should start as false
  });

  it("should update hex color correctly with setColors", () => {
    const image = new ImageShape(0, 0, testColor);
    const initialHexColor = image.hexColor;

    image.setColors(mockCtx, 10, 2);

    expect(image.hexColor).not.toBe(initialHexColor);
    expect(image.hexColor).toContain("#ff0000"); // Should contain base color
  });
});
