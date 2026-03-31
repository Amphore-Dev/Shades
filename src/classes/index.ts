// Export all shapes from individual files
export * from "./shapes/index.js";

// Maintain backward compatibility by also exporting from ShadeItem
// (in case someone imports directly from ShadeItem.ts)
export * from "./ShadeItem.js";
