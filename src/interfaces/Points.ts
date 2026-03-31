/**
 * Represents a 2D point with x and y coordinates
 */
export interface IPoint {
  x: number;
  y: number;
}

/**
 * Create a new point
 */
export function createPoint(x: number, y: number): IPoint {
  return { x, y };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: IPoint, p2: IPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Add two points
 */
export function addPoints(p1: IPoint, p2: IPoint): IPoint {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
}

/**
 * Subtract two points
 */
export function subtractPoints(p1: IPoint, p2: IPoint): IPoint {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}
