import { TShadeColor, TShadeConfig } from "../../src/types/index";

/**
 * Shared test utilities for shape testing
 */

export function createMockContext(): any {
  return {
    beginPath: jest.fn(),
    arc: jest.fn(),
    rect: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    fillStyle: "",
    strokeStyle: "",
    lineCap: "butt",
    lineWidth: 1,
    font: "16px Arial",
    textBaseline: "middle",
    textAlign: "center",
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
  };
}

export function createTestColor(): TShadeColor {
  return { r: 255, g: 0, b: 0 };
}

export function createTestConfig(): TShadeConfig {
  return {
    gradRatio: 10,
    nbrShades: 3,
    totalWidth: 100,
    totalHeight: 100,
    center: { x: 400, y: 300 },
    width: 20,
    height: 20,
    nbrItemsX: 5,
    nbrItemsY: 5,
    spacing: 10,
    thickness: 2,
    offsetX: 0,
    offsetY: 0,
    type: "circle",
    colors: [createTestColor()],
    rotationFilter: () => true,
    fillFilter: () => true,
    lineCap: "butt",
  };
}

export function setupShapeTest() {
  const mockCtx = createMockContext();
  const testColor = createTestColor();
  const testConfig = createTestConfig();

  return { mockCtx, testColor, testConfig };
}
