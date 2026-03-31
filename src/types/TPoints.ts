/**
 * Represents a 2D point with x and y coordinates
 */
export type TPoint = {
  x: number;
  y: number;
};

/**
 * Create a new point
 */
export function createPoint(x: number, y: number): TPoint {
  return { x, y };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: TPoint, p2: TPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Add two points
 */
export function addPoints(p1: TPoint, p2: TPoint): TPoint {
  return {
    x: p1.x + p2.x,
    y: p1.y + p2.y,
  };
}

/**
 * Subtract two points
 */
export function subtractPoints(p1: TPoint, p2: TPoint): TPoint {
  return {
    x: p1.x - p2.x,
    y: p1.y - p2.y,
  };
}
