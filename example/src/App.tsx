import { useRef, useEffect } from "react";
import { ShadesEngine } from "@amphore-dev/shades";
import { StarShape } from "./shapes/StarShape";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ShadesEngine | null>(null);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleFullScreenToggle = (e: KeyboardEvent) => {
    if (e.key === "f") {
      toggleFullScreen();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    window.addEventListener("keydown", handleFullScreenToggle);

    // Initialize ShadesEngine with custom shape
    engineRef.current = new ShadesEngine(canvasRef.current, {
      fadeDuration: 1000,
      debug: false,
      customShapes: {
        // Register custom shape
        star: StarShape,
      },
    });

    // Generate and start the engine
    engineRef.current.generate();
    engineRef.current.start();

    // Cleanup
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
      window.removeEventListener("keydown", handleFullScreenToggle);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: "black",
        }}
      />
    </div>
  );
}

export default App;
