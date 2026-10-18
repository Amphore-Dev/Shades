# 🎨 Shades

Library for creating animated shape visualizations on canvas.

## 🚀 Live Demo

[View the interactive demo](https://amphore-dev.github.io/Shades/) (deployed from the [`example/`](./example/) directory)

## Features

✨ **Framework-agnostic** - Works with React, Vue, Angular, Svelte, or vanilla JavaScript  
🎯 **TypeScript** - Full type safety and IntelliSense support  
🎨 **Multiple shapes** - Circles, squares, triangles, text, spirals, and images  
🎭 **Smooth animations** - Buttery smooth 60fps animations  
⚡ **Performant** - Optimized canvas rendering  
🎮 **Interactive** - Mouse/touch controls and shades count adjustment  
🐛 **Debug mode** - Built-in performance monitoring

## Installation

```bash
npm install @amphore-dev/shades
# or
yarn add @amphore-dev/shades
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { ShadesEngine } from "@amphore-dev/shades";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

const shades = new ShadesEngine(canvas);

shades.generate(); // Generate shapes
shades.start(); // Start animation
```

### With React

```tsx
import { useEffect, useRef } from "react";
import { ShadesEngine } from "@amphore-dev/shades";

function ShadesComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadesRef = useRef<ShadesEngine>();

  useEffect(() => {
    if (canvasRef.current) {
      shadesRef.current = new ShadesEngine(canvasRef.current);

      shadesRef.current.generate();
      shadesRef.current.start();
    }

    return () => {
      shadesRef.current?.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
```

### With Vue 3

```vue
<template>
  <canvas ref="canvasRef" class="w-full h-full" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ShadesEngine } from "@amphore-dev/shades";

const canvasRef = ref<HTMLCanvasElement>();
let shades: ShadesEngine;

onMounted(() => {
  if (canvasRef.value) {
    shades = new ShadesEngine(canvasRef.value);

    shades.generate();
    shades.start();
  }
});

onUnmounted(() => {
  shades?.destroy();
});
</script>
```

## API Reference

### Constructor

```typescript
new ShadesEngine(canvas: HTMLCanvasElement, options?: TShadesEngineOptions)
```

#### Options

```typescript
interface TShadesEngineOptions {
  shapes?: TShadeType[]; // Shape types to use for generation (ex: ["circle", "square"])
  customShapes?: Record<string, TShadeTypeConstructor>; // Custom shape classes (ex: { "star": StarShape })
  debug?: boolean | TShadesEngineDebugOptions; // Show debug information or options
  fadeDuration?: number; // Fade duration in milliseconds (default: 1000ms)
  text?: string | string[]; // Text of text shapes (default: "SHADES")
  font?: string; // Font family of text shapes
  intro?: boolean; // Show the text intro first (default: true)
  presets?: TShadesPreset[]; // Generations played in order
  presetsEnd?: "loop" | "random"; // After the last preset (default: "random")
  interactions?: TShadesEngineInteractions; // Enable, disable or override interactions
  onGenerate?: (config: TShadeConfig, info: TShadesGenerationInfo) => void;
  autoMove?: boolean | TShadesAutoMoveOptions; // Parallax drifts on its own
  autoNext?: number; // Next generation every N ms
}
```

### Methods

| Method                          | Description                                               |
| ------------------------------- | --------------------------------------------------------- |
| `generate()`                    | Generate shapes and setup                                 |
| `start()`                       | Start animation                                           |
| `pause()`                       | Pause animation                                           |
| `next()`                        | Play the next generation                                  |
| `regenerate()`                  | Alias of `next()`                                         |
| `destroy()`                     | Cleanup and remove event listeners                        |
| `setShadesCount(scale: number)` | Adjust number of shades                                   |
| `setAutoMove(value)`            | Enable/disable/configure auto-move                        |
| `setTargetOffset(offset?)`      | Move parallax target (default: center)                    |
| `setFadeDuration(duration)`     | Fade duration in ms, from the next fade                   |
| `setAutoNext(delay?)`           | Auto next generation every `delay` ms (off without value) |
| `setDebug(enabled: boolean)`    | Toggle debug mode                                         |
| `getShadesConfig()`             | Get current configuration                                 |
| `isAnimating()`                 | Check if animation is running                             |

### Controls

- **Click** - Regenerate shapes
- **Mouse move** - Parallax effect
- **Mouse wheel** - Adjust number of shades

Each control can be disabled or overridden, see [Interactions](#interactions).

## Text

`text` replaces the text drawn by text shapes. With an array, the intro uses
the first string and every item of a text generation picks one at random.

```typescript
new ShadesEngine(canvas, {
  text: ["AMPHORE", "SHADES", "HELLO"],
  font: "Remained",
});
```

## Presets

`presets` plays predefined generations in order, one per click or `next()`
call, after the intro. Each preset is a partial config: any field left out
is randomized (`gradRatio` follows `nbrShades`, `height` follows `width`).
Once every preset was played, `presetsEnd` either starts over (`"loop"`) or
switches to random generations (`"random"`, default).

```typescript
new ShadesEngine(canvas, {
  intro: true,
  presets: [
    { type: "logo", nbrShades: 30, thickness: 1 },
    {
      type: "square",
      nbrShades: 10,
      nbrItemsX: 6,
      nbrItemsY: 14,
      width: 100,
      spacing: 30,
    },
    {
      type: "text",
      colors: [
        { r: 0, g: 0, b: 0 },
        { r: 255, g: 200, b: 87 },
      ],
    },
  ],
  presetsEnd: "loop",
  onGenerate: (config, { generation, intro, presetIndex }) => {
    console.log(generation, intro, presetIndex, config.type);
  },
});
```

## Interactions

Every interaction (`click`, `wheel`, `mouseMove`, `touchMove`, `resize`) is
enabled by default. Pass `false` to disable one, or a function to override
it. The function receives the event, the engine and the default handler,
so it can keep, wrap or replace the built-in behavior.

```typescript
new ShadesEngine(canvas, {
  interactions: {
    wheel: false, // let the page scroll over the canvas
    click: (event, engine, defaultHandler) => {
      if (event.shiftKey) defaultHandler(event);
    },
  },
});
```

## Auto-move

`autoMove` makes the parallax drift on its own along a slow looping path,
like the macOS screensaver, with a random starting point for each engine.
It starts `resumeDelay` ms after `start()`. Mouse and touch moves still take
over; auto-move resumes `resumeDelay` ms after the last one. It stays off when the user prefers reduced motion.
Combine it with `autoNext` for a hands-free, screensaver-like display:
generations then only change while auto-moving, `autoNext` ms after
auto-move took over, so they never change under the user's pointer.

```typescript
new ShadesEngine(canvas, {
  autoMove: {
    amplitude: 0.15, // max distance from the center, fraction of the smallest side
    speed: 1, // speed multiplier
    resumeDelay: 3000, // ms after the last pointer move
    path: "drift", // "drift" | "circle" | "figure8" | (time) => ({ x, y })
  },
  autoNext: 15000, // next generation every 15s
});
```

A custom `path` receives the time in seconds (multiplied by `speed`) and
returns a point within [-1, 1] on each axis, scaled by `amplitude`:

```typescript
autoMove: {
  path: (t) => ({ x: Math.sin(t * 0.2), y: 0 }), // horizontal sway
}
```

## Custom Shapes

Create your own custom shapes by extending the `ShadeItem` class:

### Creating a Custom Shape

```typescript
import {
  ShadeItem,
  TShadeColor,
  TShadeConfig,
  TShapeOptions,
  TPoint,
} from "@amphore-dev/shades";

export class StarShape extends ShadeItem {
  constructor(
    x: number,
    y: number,
    color: TShadeColor,
    options: TShapeOptions = {}
  ) {
    super(x, y, color, { filled: true, rotation: true, ...options });
    this.type = "star";
  }

  draw = (
    ctx: CanvasRenderingContext2D,
    config: TShadeConfig,
    offset: TPoint
  ) => {
    const { gradRatio, nbrShades, totalWidth, totalHeight, center, width } =
      config;

    for (let i = 0; i < nbrShades; i++) {
      this.setColors(ctx, gradRatio, i);
      ctx.beginPath();

      const x =
        center.x +
        (this.position.x - totalWidth / 2 + width / 2) +
        offset.x * (1 - (gradRatio * i) / 100);
      const y =
        center.y +
        (this.position.y - totalHeight / 2 + width / 2) +
        offset.y * (1 - (gradRatio * i) / 100);

      this.drawStar(ctx, x, y, width / 2, width / 4, 5);
      this.drawPath(ctx);
      ctx.closePath();

      if (this.rotation) {
        this.angle += ((0.5 / nbrShades) * Math.PI) / 180;
      }
    }
  };

  private drawStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    outer: number,
    inner: number,
    points: number
  ) {
    const step = Math.PI / points;
    let rot = (Math.PI / 2) * 3 + this.angle;

    ctx.moveTo(x, y - outer);
    for (let i = 0; i < points; i++) {
      ctx.lineTo(x + Math.cos(rot) * outer, y + Math.sin(rot) * outer);
      rot += step;
      ctx.lineTo(x + Math.cos(rot) * inner, y + Math.sin(rot) * inner);
      rot += step;
    }
    ctx.lineTo(x, y - outer);
  }
}
```

### Using Custom Shapes

```typescript
import { ShadesEngine } from "@amphore-dev/shades";
import { StarShape } from "./StarShape";

const engine = new ShadesEngine(canvas, {
  customShapes: {
    star: StarShape, // Register your custom shape
  },
  fadeDuration: 800,
});

engine.generate();
engine.start();
```

### Benefits

- ✅ **Full extensibility** - Create any imaginable shape
- ✅ **Seamless integration** - Mix with built-in shapes
- ✅ **Type safety** - Complete TypeScript support
- ✅ **Performance** - No overhead, direct compilation

## Advanced Usage

### Debug Mode

```typescript
import { ShadesEngine } from "@amphore-dev/shades";

// Simple debug mode
const shades = new ShadesEngine(canvas, {
  debug: true,
});

// Debug with custom styling
const shadesCustom = new ShadesEngine(canvas, {
  debug: {
    className: "my-debug-class",
  },
});
```

### Event Handling

The engine automatically handles:

- Canvas resize
- Mouse/touch events
- Animation frame management
- Memory cleanup

### Custom Fade Duration

```typescript
const shades = new ShadesEngine(canvas, {
  fadeDuration: 2000, // 2 seconds fade
});
```

## Examples

- **React Example**: See [`example/`](./example/) directory for a complete React implementation
- **Advanced Example**: Check [`example-with-custom-shape/`](./example-with-custom-shape/) for custom shapes
- **Vanilla JavaScript**: See [`example/example-vanilla.html`](./example/example-vanilla.html) for a pure JS example

Run them locally:

```bash
npm run example          # React example (Vite dev server)
npm run example:vanilla  # Vanilla example on http://localhost:8000/example/example-vanilla.html
```

## Building From Source

```bash
git clone <repository-url>
cd shades
npm install
npm run build
```

## License

MIT © Amphore Dev
