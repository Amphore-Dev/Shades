export type TShadesEngineDebugOptions = {
  className?: string;
};

/** Text panel shown over the canvas with the engine's live stats. */
export class DebugOverlay {
  private element: HTMLPreElement;

  constructor(
    canvas: HTMLCanvasElement,
    options: boolean | TShadesEngineDebugOptions
  ) {
    const element = document.createElement("pre");
    element.className =
      typeof options === "object" && options.className
        ? options.className
        : "shades-debug";
    element.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 10;
      color: white;
      text-align: left;
      font-family: monospace;
      font-size: 12px;
      background: rgba(0,0,0,0.5);
      padding: 10px;
      pointer-events: none;
    `;

    // Inserted right before the canvas
    canvas.parentNode?.insertBefore(element, canvas);
    this.element = element;
  }

  /** Shows one `label: value` line per entry. */
  update(stats: Record<string, string | number | boolean>): void {
    this.element.innerHTML = Object.entries(stats)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n");
  }

  remove(): void {
    this.element.remove();
  }
}
