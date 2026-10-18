import { useRef, useEffect, useState } from "react";
import { ShadesEngine } from "@amphore-dev/shades";
import { Modal } from "./components/Modal/Modal";
import { Key } from "./components/Modal/Key";
import { LevaControls } from "./components/LevaControls";

// Custom shapes (uncomment if you want to use them, and make sure to import them at the top)
// import { StarShape } from "./shapes/StarShape";
// import { HeartShape } from "./shapes/HeartShape";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(true);
  // Read by the engine's interaction handlers, which are created once
  const isModalOpenRef = useRef(true);
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
    // Ignore keys typed in the Leva panel inputs
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === "f") {
      toggleFullScreen();
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    isModalOpenRef.current = false;
    // Recenter the parallax; auto-move and auto-next are applied from the
    // Leva panel once the modal is closed
    engineRef.current?.setTargetOffset();
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    window.addEventListener("keydown", handleFullScreenToggle);

    // Initialize ShadesEngine with custom shape
    engineRef.current = new ShadesEngine(canvasRef.current, {
      // Same as the Leva default, which only applies once the modal is closed
      fadeDuration: 3000,
      debug: false,
      // No parallax while the intro modal is open
      interactions: {
        mouseMove: (event, _engine, defaultHandler) => {
          if (!isModalOpenRef.current) defaultHandler(event);
        },
        touchMove: (event, _engine, defaultHandler) => {
          if (!isModalOpenRef.current) defaultHandler(event);
        },
      },
      customShapes: {
        // Register custom shape
        // star: StarShape,
        // heart: HeartShape,
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
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="SHADES"
        className="text-neutral-300"
        titleClassName="font-[Remained] text-[4rem] md:text-[7rem] duration-300"
      >
        <div className="max-w-lg">
          Shades is a canvas-based animation engine that creates dynamic, fading
          shapes. It allows you to easily generate stunning visual effects with
          customizable shapes, colors, and animation settings. Perfect for
          backgrounds, visualizations, and interactive art projects.
        </div>
        <table className="border-separate border-spacing-x-4 border-spacing-y-4">
          <tbody>
            <tr>
              <td className="justify-items-right">
                <Key value="Click" square={false} />
              </td>
              <td className="text-left">Change shape</td>
            </tr>
            <tr>
              <td className="justify-items-right">
                <Key value="Wheel" square={false} />
              </td>
              <td className="text-left">Increase/Decrease shades count</td>
            </tr>
            <tr>
              <td className="justify-items-right ">
                <Key value="F" />
              </td>
              <td className="text-left">Toggle full screen</td>
            </tr>
          </tbody>
        </table>
      </Modal>
      <LevaControls engineRef={engineRef} isModalOpen={isModalOpen} />
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
