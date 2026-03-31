/**
 * Generate random integer between min and max (inclusive)
 */
export function random(
  min: number,
  max: number,
  integer: boolean = false
): number {
  const rand = Math.random() * (max - min) + min;
  return integer ? Math.round(rand) : rand;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
