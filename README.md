# 🎨 Shades

A framework-agnostic TypeScript library for creating animated shape visualizations on canvas.

## Features

✨ **Framework-agnostic** - Works with React, Vue, Angular, Svelte, or vanilla JavaScript  
🎯 **TypeScript** - Full type safety and IntelliSense support  
🎨 **Multiple shapes** - Circles, squares, triangles, text, spirals, and images  
🎭 **Smooth animations** - Buttery smooth 60fps animations  
⚡ **Performant** - Optimized canvas rendering  
🎮 **Interactive** - Mouse/touch controls and zoom  
🐛 **Debug mode** - Built-in performance monitoring

## Installation

```bash
npm install @your-org/shades
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { ShadesEngine } from "@your-org/shades";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

const shades = new ShadesEngine(canvas, {
  randomized: true,
  debug: false,
});

shades.generate(); // Generate shapes
shades.start(); // Start animation
```

### With React

```tsx
import { useEffect, useRef } from "react";
import { ShadesEngine } from "@your-org/shades";

function ShadesComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shadesRef = useRef<ShadesEngine>();

  useEffect(() => {
    if (canvasRef.current) {
      shadesRef.current = new ShadesEngine(canvasRef.current, {
        randomized: true,
      });

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
import { ShadesEngine } from "@your-org/shades";

const canvasRef = ref<HTMLCanvasElement>();
let shades: ShadesEngine;

onMounted(() => {
  if (canvasRef.value) {
    shades = new ShadesEngine(canvasRef.value, {
      randomized: true,
    });

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
new ShadesEngine(canvas: HTMLCanvasElement, options?: IShadesEngineOptions)
```

#### Options

```typescript
interface IShadesEngineOptions {
  shapes?: TPartialIShadeConfig[]; // Custom shape configurations
  randomized?: boolean; // Enable randomized generation
  debug?: boolean; // Show debug information
}
```

### Methods

| Method                       | Description                        |
| ---------------------------- | ---------------------------------- |
| `generate()`                 | Generate shapes and setup          |
| `start()`                    | Start animation                    |
| `pause()`                    | Pause animation                    |
| `regenerate()`               | Generate new shapes                |
| `destroy()`                  | Cleanup and remove event listeners |
| `zoom(scale: number)`        | Zoom in/out                        |
| `setDebug(enabled: boolean)` | Toggle debug mode                  |
| `getShadesConfig()`          | Get current configuration          |
| `isAnimating()`              | Check if animation is running      |

### Controls

- **Click** - Regenerate shapes
- **Mouse move** - Parallax effect
- **Mouse wheel** - Zoom in/out

## Custom Shapes

```typescript
import { ShadesEngine } from "@your-org/shades";

const shades = new ShadesEngine(canvas, {
  shapes: [
    {
      type: "circle",
      nbrItemsX: 10,
      nbrItemsY: 10,
      spacing: 20,
      colors: [
        { r: 255, g: 100, b: 100 },
        { r: 100, g: 255, b: 100 },
      ],
    },
  ],
});
```

## Advanced Usage

### Custom Colors

```typescript
import { ShadesEngine, getRandColors } from "@your-org/shades";

const customColors = [
  { r: 255, g: 0, b: 0 }, // Red
  { r: 0, g: 255, b: 0 }, // Green
  { r: 0, g: 0, b: 255 }, // Blue
];

const shades = new ShadesEngine(canvas, {
  shapes: [{ colors: customColors }],
});
```

### Event Handling

The engine automatically handles:

- Canvas resize
- Mouse/touch events
- Animation frame management
- Memory cleanup

## Examples

Check out `example-vanilla.html` for a complete example with controls.

## Building From Source

```bash
git clone <your-repo>
cd shades
npm install
npm run build
```

## License

MIT © [Your Name]

---

**Framework-agnostic by design** 🚀
