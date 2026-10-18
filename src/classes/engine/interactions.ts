import type { ShadesEngine } from "../ShadesEngine.js";

/** Event type received by each interaction. */
export type TShadesInteractionEvents = {
  click: MouseEvent;
  wheel: WheelEvent;
  mouseMove: MouseEvent;
  touchMove: TouchEvent;
  /** A plain "resize" Event: the canvas is watched with a ResizeObserver when available. */
  resize: Event;
};

/**
 * Replaces the engine's default behavior for an interaction.
 * Call `defaultHandler(event)` to keep (or wrap) the built-in behavior.
 */
export type TShadesInteractionHandler<E extends Event> = (
  event: E,
  engine: ShadesEngine,
  defaultHandler: (event: E) => void
) => void;

/** `true` (default): built-in behavior, `false`: disabled, function: custom handler. */
export type TShadesInteraction<E extends Event> =
  | boolean
  | TShadesInteractionHandler<E>;

export type TShadesEngineInteractions = {
  [K in keyof TShadesInteractionEvents]?: TShadesInteraction<
    TShadesInteractionEvents[K]
  >;
};

type TInteractionKey = keyof TShadesInteractionEvents;

/**
 * Attaches each interaction's default handler, the user's override, or
 * nothing when disabled, and removes them all on `detach()`.
 */
export class InteractionBinder {
  private listeners: {
    target: EventTarget;
    type: string;
    handler: EventListener;
  }[] = [];
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private engine: ShadesEngine,
    private interactions: TShadesEngineInteractions = {}
  ) {}

  bind<K extends TInteractionKey>(
    target: EventTarget,
    type: string,
    key: K,
    defaultHandler: (event: TShadesInteractionEvents[K]) => void
  ): void {
    const handler = this.resolve(key, defaultHandler);
    if (!handler) return;

    target.addEventListener(type, handler);
    this.listeners.push({ target, type, handler });
  }

  /**
   * Watches `element` itself, so container resizes (not only window ones)
   * are caught. Falls back to the window resize event.
   */
  bindResize(element: Element, defaultHandler: (event: Event) => void): void {
    const handler = this.resolve("resize", defaultHandler);
    if (!handler) return;

    if (typeof ResizeObserver === "undefined") {
      this.bind(window, "resize", "resize", defaultHandler);
      return;
    }

    this.resizeObserver = new ResizeObserver(() =>
      handler(new Event("resize"))
    );
    this.resizeObserver.observe(element);
  }

  detach(): void {
    this.listeners.forEach(({ target, type, handler }) =>
      target.removeEventListener(type, handler)
    );
    this.listeners = [];
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  /** The handler to run for an interaction: default, user override, or none if disabled. */
  private resolve<K extends TInteractionKey>(
    key: K,
    defaultHandler: (event: TShadesInteractionEvents[K]) => void
  ): EventListener | null {
    const interaction = this.interactions[key] ?? true;
    if (interaction === false) return null;

    return typeof interaction === "function"
      ? (event: Event) =>
          interaction(
            event as TShadesInteractionEvents[K],
            this.engine,
            defaultHandler
          )
      : (event: Event) => defaultHandler(event as TShadesInteractionEvents[K]);
  }
}
