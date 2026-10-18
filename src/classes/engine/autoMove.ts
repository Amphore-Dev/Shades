import { TPoint } from "../../types/index.js";

/**
 * Auto-move trajectory: receives the time in seconds (already multiplied by
 * `speed`) and returns a point within [-1, 1] on each axis, scaled by
 * `amplitude`.
 */
export type TShadesAutoMovePathFn = (time: number) => TPoint;

export type TShadesAutoMovePath =
  | "drift"
  | "circle"
  | "figure8"
  | TShadesAutoMovePathFn;

export type TShadesAutoMoveOptions = {
  /** Max distance from the center, as a fraction of the canvas' smallest side. Defaults to 0.15. */
  amplitude?: number;
  /** Speed multiplier. Defaults to 1. */
  speed?: number;
  /** Delay (ms) after the last mouse/touch move before auto-move takes over again. Defaults to 3000. */
  resumeDelay?: number;
  /** Trajectory: "drift" (default, organic loop like the screensaver), "circle", "figure8", or a custom function. */
  path?: TShadesAutoMovePath;
};

export type TResolvedAutoMove = Required<TShadesAutoMoveOptions>;

/** Auto-move settings with their defaults, or `null` when off or when the user prefers reduced motion. */
export const resolveAutoMove = (
  value: boolean | TShadesAutoMoveOptions | undefined
): TResolvedAutoMove | null => {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!value || prefersReducedMotion) return null;

  return {
    amplitude: 0.15,
    speed: 1,
    resumeDelay: 3000,
    path: "drift",
    ...(typeof value === "object" ? value : {}),
  };
};

/** Random phases, so each engine instance follows its own path. */
export const createAutoMovePhases = (): number[] =>
  Array.from({ length: 4 }, () => Math.random() * Math.PI * 2);

/** Point of `path` at time `t`, within [-1, 1] on each axis. */
export const getAutoMovePoint = (
  path: TShadesAutoMovePath,
  t: number,
  [p1, p2, p3, p4]: number[]
): TPoint => {
  if (typeof path === "function") return path(t);

  if (path === "circle") {
    const angle = t * 0.1 + p1;
    return { x: Math.cos(angle), y: Math.sin(angle) };
  }

  if (path === "figure8") {
    const angle = t * 0.1 + p1;
    return { x: Math.sin(angle), y: Math.sin(angle * 2) };
  }

  // Slow sines with unrelated frequencies, same as the screensaver
  return {
    x: (Math.sin(t * 0.08 + p1) + Math.cos(t * 0.05 + p2) * 0.5) / 1.5,
    y: (Math.cos(t * 0.06 + p3) + Math.sin(t * 0.04 + p4) * 0.5) / 1.5,
  };
};
