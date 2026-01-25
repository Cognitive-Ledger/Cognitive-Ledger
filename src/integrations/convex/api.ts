/**
 * Convex API types for the project.
 * This file re-exports the generated API from Convex.
 */

// Re-export the generated API - this will have proper types when Convex is deployed
// For now, we use type assertions to satisfy TypeScript
export { api } from "../../_convex_generated/api";
export type { Id } from "../../_convex_generated/dataModel";
