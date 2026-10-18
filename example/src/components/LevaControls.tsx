import { useEffect, useState } from "react";
import { ShadesEngine } from "@amphore-dev/shades";
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

function useLevaControls() {
  // Function form: also returns `set`, used by the reset button
  return useControls(() => ({
    State: folder({
      isPlaying: initial.isPlaying,
      debug: initial.debug,
      fadeDuration: {
        value: initial.fadeDuration,
        min: 100,
        max: 5000,
        step: 100,
      },
    }),
    "Auto move": folder(
      {
        autoMove: initial.autoMove,
        path: {
          value: initial.path,
          options: ["drift", "circle", "figure8"],
        },
        amplitude: {
          value: initial.amplitude,
          min: 0,
          max: 0.5,
          step: 0.01,
        },
        speed: {
          value: initial.speed,
          min: 0.1,
          max: 10,
          step: 0.1,
        },
        resumeDelay: {
          value: initial.resumeDelay,
          min: 0,
          max: 20000,
          step: 500,
        },
      },
      { collapsed: false }
    ),
    "Auto next": folder(
      {
        autoNext: initial.autoNext,
        autoNextDelay: {
          value: initial.autoNextDelay,
          min: 1000,
          max: 60000,
          step: 500,
        },
      },
      { collapsed: false }
    ),
  }));
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
}: {
  engineRef: React.RefObject<ShadesEngine | null>;
  isModalOpen: boolean;
}) {
  useLevaEffects(engineRef, isModalOpen);

  return <Leva hidden={isModalOpen} />;
}
