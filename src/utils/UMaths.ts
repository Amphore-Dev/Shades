/**
 * Random number in [min, max). With `integer`, a uniformly distributed
 * integer in [min, max], both included.
 */
export function random(
  min: number,
  max: number,
  integer: boolean = false
): number {
  if (integer) return Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.random() * (max - min) + min;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
