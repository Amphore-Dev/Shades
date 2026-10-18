# Changelog

## 2.0.0

### Added

- `setItemsCount(nbrItemsX, nbrItemsY?)`: changes the item grid of the
  current generation on the fly, keeping its type, colors and sizes. Each
  count is clamped to [1, `MAX_ITEMS_NBR`] (exported, 50).
- `setSpacing(spacingX, spacingY?)`: moves the current items to new gaps,
  keeping each item as is.
- `setColors(colors, mainColor?)`: recolors the current generation.
- `spacingY` config field (presets included): vertical gap between items,
  `spacing` otherwise.
- `onChange` option: called when the current generation changes without a
  new one (shades count from the wheel, pinch or `setShadesCount`,
  `setItemsCount`, `setSpacing`, `setColors`).
- `ShadeItem.isAnimated()` and `ShadeItem.requestRender()`, see Changed.
- Example: a "Current shape" Leva folder to edit the grid, spacing, shades
  count and colors of the generation on screen; reorganized panel.

### Changed

- **Breaking:** `intro` is now a preset (`TShadesPreset`) played as the first
  generation, before `presets`, with every config field available (type,
  colors, sizes…). Without `intro`, the engine starts straight with the
  presets or random generations: the built-in "SHADES" text intro is gone.
  To keep it, pass the text intro shown in the README's Intro section.
- **Breaking:** frames where nothing changes are no longer drawn. Custom
  shapes that change on every draw by themselves (rotation…) must return
  `true` from `isAnimated()`; those whose look changes later on their own
  (an image loading…) call `this.requestRender()`.
- **Breaking:** `shapes`, when set, is the exact pool of random
  generations, custom shapes included. Without it, the pool is the built-in
  shapes plus every custom shape, as before.
- **Breaking:** text shapes default to `sans-serif` instead of "Remained",
  which isn't shipped: pass `font`.
- **Breaking:** `getRandColors(colors?)` only takes a palette, no shape type.
- **Breaking:** removed `regenerate()` (use `next()`), the unused
  `offsetX`/`offsetY` config fields, the "logo" special cases of random
  generations, and `ImageShape`'s fallback to a `#Logo` element.
- Fades now change the frame's opacity instead of painting black over it:
  same look on a black background, correct on any other.
- `TShadeType` autocompletes the built-in shapes; an unknown type throws a
  clear error.
- Each shade layer's color is computed once per item instead of on every
  frame.

### Fixed

- `ImageShape` erased everything drawn before it on the canvas.
- Setters (`setAutoMove`, `setFadeDuration`…) wrote into the options object
  passed to the constructor.
- `generate()` still generated when `destroy()` ran while waiting for fonts.
- Random integers picked their bounds half as often as other values.

## 1.0.0

### Added

- `text` option: a string, or an array of strings picked at random per text
  item (the intro uses the first one). Defaults to "SHADES".
- `font` option for text shapes.
- `intro` option to skip the text intro (default `true`).
- `presets` and `presetsEnd` options: generations played in order (partial
  configs, missing fields randomized), then looping or going random.
- `interactions` option: each of `click`, `wheel`, `mouseMove`, `touchMove`
  and `resize` can be disabled (`false`) or overridden with a function
  receiving the event, the engine and the default handler.
- `onGenerate` callback, called after each generation.
- `autoMove` option: screensaver-like parallax drift (`drift`, `circle`,
  `figure8` or custom path, `amplitude`, `speed`, `resumeDelay`), paused
  while the pointer moves, off when the user prefers reduced motion.
- `autoNext` option: next generation every N ms. With `autoMove`, it only
  runs while auto-moving.
- Methods: `next()`, `setAutoMove()`, `setAutoNext()`, `setFadeDuration()`,
  `setTargetOffset()`, `adjustShadesCount()`.
- Exports: `LIGHT_COLORS`, `DARK_COLORS`, `SAME_COLOR_FILTER`, `NO_FILTER`,
  `RANDOM_FILTER`, `RANDOM_50_FILTER`.

### Changed

- **Breaking:** `setShadesCount(count)` now sets the count. Use
  `adjustShadesCount(delta)` for the previous relative behavior.
- **Breaking:** `TShadeTypeConstructor` is now any `ShadeItem` constructor
  instead of a union of the built-in classes.
- **Breaking:** `ShadesTypesCodstructors` is renamed `TShadesTypesConstructors`.
- The canvas is sized to `devicePixelRatio` (sharp on HiDPI screens) and
  drawn in CSS pixels.
- Resizes are detected on the canvas itself with a `ResizeObserver` (window
  resize as fallback). The `resize` interaction receives a plain `Event`.
- Generations are centered and sized from the canvas instead of the page,
  and pointer offsets account for the canvas position.
- `destroy()` only removes the listeners it attached.

### Deprecated

- `regenerate()`: use `next()`.

### Fixed

- Config colors (e.g. from presets) were ignored from the 2nd generation.
- The FPS counter created a new interval on every `start()`, never cleared.
- `setDebug(true)` called twice added a second debug element, and
  `setDebug(false)` didn't remove one with a custom `className`.
- Published `.d.ts` files imported from an unresolvable `@/` alias.
- Package `exports`: `types` condition first, `default` condition added,
  `sideEffects: false` declared.
- `npm run example` served a file listing; it now starts the React example
  (`npm run example:vanilla` for the vanilla one).
