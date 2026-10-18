import { useEffect, useState } from "react";
import {
  getRandColors,
  MAX_ITEMS_NBR,
  MAX_SHADES_NBR,
  ShadesEngine,
  TShadeColor,
  TShadeConfig,
} from "@amphore-dev/shades";
import { button, folder, Leva, useControls } from "leva";

const STORAGE_KEY = "shades-leva-controls";

function loadSavedControls(): Record<string, unknown> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const DEFAULTS = {
  isPlaying: true,
  debug: false,
  fadeDuration: 3000,
  autoMove: true,
  path: "drift",
  amplitude: 0.3,
  speed: 1,
  resumeDelay: 5000,
  autoNext: true,
  autoNextDelay: 30000,
};

const initial = { ...DEFAULTS, ...loadSavedControls() };

// Panel layout, top to bottom: Playing, the generation on screen, transitions,
// auto move, settings, then the Next shape and Reset defaults buttons. Leva
// sorts by `order`; buttons can't take one and stay at 0, hence the negative
// orders above them
const ORDER = {
  playing: -5,
  currentShape: -4,
  transitions: -3,
  autoMove: -2,
  settings: -1,
};

function useLevaControls() {
  // Function form: also returns `set`, used by the reset button
  return useControls(() => ({
    isPlaying: {
      value: initial.isPlaying,
      label: "Playing",
      order: ORDER.playing,
    },
    Transitions: folder(
      {
        fadeDuration: {
          value: initial.fadeDuration,
          min: 100,
          max: 5000,
          step: 100,
          label: "Fade (ms)",
        },
        autoNext: { value: initial.autoNext, label: "Auto next" },
        autoNextDelay: {
          value: initial.autoNextDelay,
          min: 1000,
          max: 60000,
          step: 500,
          label: "Every (ms)",
        },
      },
      { order: ORDER.transitions }
    ),
    "Auto move": folder(
      {
        autoMove: { value: initial.autoMove, label: "Enabled" },
        path: {
          value: initial.path,
          options: ["drift", "circle", "figure8"],
          label: "Path",
        },
        amplitude: {
          value: initial.amplitude,
          min: 0,
          max: 0.5,
          step: 0.01,
          label: "Amplitude",
        },
        speed: {
          value: initial.speed,
          min: 0.1,
          max: 10,
          step: 0.1,
          label: "Speed",
        },
        resumeDelay: {
          value: initial.resumeDelay,
          min: 0,
          max: 20000,
          step: 500,
          label: "Resume (ms)",
        },
      },
      { order: ORDER.autoMove, collapsed: true }
    ),
    Settings: folder(
      { debug: { value: initial.debug, label: "Debug" } },
      { order: ORDER.settings, collapsed: true }
    ),
  }));
}

const toHex = ({ r, g, b }: TShadeColor) =>
  "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");

/** "#ff0000, #00f" style list to colors; invalid entries are skipped. */
const parseColors = (value: string): TShadeColor[] =>
  value
    .split(/[\s,]+/)
    .map((hex) => hex.replace("#", ""))
    .map((hex) =>
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex
    )
    .filter((hex) => /^[0-9a-f]{6}$/i.test(hex))
    .map((hex) => {
      const value = parseInt(hex, 16);
      return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
    });

/**
 * Grid, spacing, shades count and colors of the generation on screen. The
 * panel follows each new generation and each change (wheel included); only
 * edits made in the panel are sent to the engine, so syncing from the engine
 * doesn't rebuild the generation. Not persisted.
 */
function useCurrentShapeControls(
  engineRef: React.RefObject<ShadesEngine | null>,
  generation: TShadeConfig | null
) {
  const [randomColorsTrigger, setRandomColorsTrigger] = useState(0);
  const [, setShape] = useControls(
    "Current shape",
    () => ({
      nbrItemsX: {
        label: "Items X",
        value: 1,
        min: 1,
        max: MAX_ITEMS_NBR,
        step: 1,
        onChange: (value: number, _path, { fromPanel }) => {
          const engine = engineRef.current;
          if (!fromPanel || !engine) return;
          engine.setItemsCount(value, engine.getShadesConfig().nbrItemsY);
        },
        transient: false,
      },
      nbrItemsY: {
        label: "Items Y",
        value: 1,
        min: 1,
        max: MAX_ITEMS_NBR,
        step: 1,
        onChange: (value: number, _path, { fromPanel }) => {
          const engine = engineRef.current;
          if (!fromPanel || !engine) return;
          engine.setItemsCount(engine.getShadesConfig().nbrItemsX, value);
        },
        transient: false,
      },
      spacingX: {
        label: "Spacing X",
        value: 0,
        min: 0,
        max: 200,
        step: 1,
        onChange: (value: number, _path, { fromPanel }) => {
          const engine = engineRef.current;
          if (!fromPanel || !engine) return;
          const { spacing, spacingY = spacing } = engine.getShadesConfig();
          engine.setSpacing(value, spacingY);
        },
        transient: false,
      },
      spacingY: {
        label: "Spacing Y",
        value: 0,
        min: 0,
        max: 200,
        step: 1,
        onChange: (value: number, _path, { fromPanel }) => {
          const engine = engineRef.current;
          if (!fromPanel || !engine) return;
          engine.setSpacing(engine.getShadesConfig().spacing, value);
        },
        transient: false,
      },
      nbrShades: {
        label: "Shades",
        value: 1,
        min: 1,
        max: MAX_SHADES_NBR,
        step: 1,
        onChange: (value: number, _path, { fromPanel }) => {
          if (fromPanel) engineRef.current?.setShadesCount(value);
        },
        transient: false,
      },
      colors: {
        label: "Colors",
        value: "",
        hint: "Hex colors, comma separated",
        onChange: (value: string, _path, { fromPanel }) => {
          const colors = parseColors(value);
          if (fromPanel && colors.length) engineRef.current?.setColors(colors);
        },
        transient: false,
      },
      "Random colors": button(() => setRandomColorsTrigger((n) => n + 1)),
    }),
    { order: ORDER.currentShape }
  );

  useEffect(() => {
    const engine = engineRef.current;
    if (randomColorsTrigger === 0 || !engine) return;
    const colors = getRandColors();
    engine.setColors(colors);
    setShape({ colors: colors.map(toHex).join(", ") });
  }, [randomColorsTrigger, engineRef, setShape]);

  useEffect(() => {
    if (!generation) return;
    const {
      nbrItemsX,
      nbrItemsY,
      nbrShades,
      spacing,
      colors = [],
    } = generation;
    setShape({
      nbrItemsX,
      nbrItemsY,
      spacingX: spacing,
      spacingY: generation.spacingY ?? spacing,
      nbrShades,
      colors: colors.map(toHex).join(", "),
    });
  }, [generation, setShape]);
}

/**
 * Applies the panel values to the engine once the intro modal is closed,
 * so nothing moves or changes while it is open.
 */
function useLevaEffects(
  engineRef: React.RefObject<ShadesEngine | null>,
  isModalOpen: boolean
) {
  const [controls, setControls] = useLevaControls();
  const {
    isPlaying,
    debug,
    fadeDuration,
    autoMove,
    path,
    amplitude,
    speed,
    resumeDelay,
    autoNext,
    autoNextDelay,
  } = controls;

  const [nextTrigger, setNextTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  useControls({
    "Next shape": button(() => setNextTrigger((n) => n + 1)),
    "Reset defaults": button(() => setResetTrigger((n) => n + 1)),
  });
  useEffect(() => {
    if (nextTrigger === 0) return;
    engineRef.current?.next();
  }, [nextTrigger, engineRef]);
  // The persist effect below then saves the defaults
  useEffect(() => {
    if (resetTrigger === 0) return;
    setControls(DEFAULTS);
  }, [resetTrigger, setControls]);

  // Persist all control values to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(controls));
  }, [controls]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || isModalOpen) return;

    if (isPlaying) {
      engine.start();
    } else {
      engine.pause();
    }
  }, [isPlaying, isModalOpen, engineRef]);

  // Also re-run on modal close: the engine doesn't exist yet on first render
  useEffect(() => {
    engineRef.current?.setDebug(debug);
  }, [debug, isModalOpen, engineRef]);

  useEffect(() => {
    engineRef.current?.setFadeDuration(fadeDuration);
  }, [fadeDuration, isModalOpen, engineRef]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || isModalOpen) return;

    engine.setAutoMove(
      autoMove
        ? {
            path: path as "drift" | "circle" | "figure8",
            amplitude,
            speed,
            resumeDelay,
          }
        : false
    );
  }, [autoMove, path, amplitude, speed, resumeDelay, isModalOpen, engineRef]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || isModalOpen) return;

    engine.setAutoNext(autoNext ? autoNextDelay : undefined);
  }, [autoNext, autoNextDelay, isModalOpen, engineRef]);
}

export function LevaControls({
  engineRef,
  isModalOpen,
  generation,
}: {
  engineRef: React.RefObject<ShadesEngine | null>;
  isModalOpen: boolean;
  generation: TShadeConfig | null;
}) {
  useLevaEffects(engineRef, isModalOpen);
  useCurrentShapeControls(engineRef, generation);

  return (
    <Leva
      hidden={isModalOpen}
      // Wider panel and number fields, so 5-digit delays aren't cut
      theme={{ sizes: { rootWidth: "320px", numberInputMinWidth: "56px" } }}
    />
  );
}
