# Changelog

## 1.1.0

### Added

- `introColor` option: color of the text intro, instead of a random one
  from `HOME_COLORS`.

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
