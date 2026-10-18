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

const saved = loadSavedControls();

function useLevaControls() {
  return useControls({
    State: folder({
      isPlaying: (saved.isPlaying as boolean) ?? true,
      debug: (saved.debug as boolean) ?? false,
    }),
    "Auto move": folder(
      {
        autoMove: (saved.autoMove as boolean) ?? true,
        path: {
          value: (saved.path as string) ?? "drift",
          options: ["drift", "circle", "figure8"],
        },
        amplitude: {
          value: (saved.amplitude as number) ?? 0.15,
          min: 0,
          max: 0.5,
          step: 0.01,
        },
        speed: {
          value: (saved.speed as number) ?? 1,
          min: 0.1,
          max: 10,
          step: 0.1,
        },
        resumeDelay: {
          value: (saved.resumeDelay as number) ?? 5000,
          min: 0,
          max: 20000,
          step: 500,
        },
      },
      { collapsed: false }
    ),
    "Auto next": folder(
      {
        autoNext: (saved.autoNext as boolean) ?? true,
        autoNextDelay: {
          value: (saved.autoNextDelay as number) ?? 10000,
          min: 1000,
          max: 60000,
          step: 500,
        },
      },
      { collapsed: false }
    ),
  });
}

/**
 * Applies the panel values to the engine once the intro modal is closed,
 * so nothing moves or changes while it is open.
 */
function useLevaEffects(
  engineRef: React.RefObject<ShadesEngine | null>,
  isModalOpen: boolean
) {
  const controls = useLevaControls();
  const {
    isPlaying,
    debug,
    autoMove,
    path,
    amplitude,
    speed,
    resumeDelay,
    autoNext,
    autoNextDelay,
  } = controls;

  const [nextTrigger, setNextTrigger] = useState(0);
  useControls({
    "Next shape": button(() => setNextTrigger((n) => n + 1)),
  });
  useEffect(() => {
    if (nextTrigger === 0) return;
    engineRef.current?.next();
  }, [nextTrigger, engineRef]);

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
