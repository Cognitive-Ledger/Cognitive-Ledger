import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all models
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("aiModels").order("desc").collect();
  },
});

// Get model by ID
export const getById = query({
  args: {
    id: v.id("aiModels"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get models by provider
export const getByProvider = query({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiModels")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .collect();
  },
});

// Get models by category
export const getByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiModels")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Create model
export const create = mutation({
  args: {
    name: v.string(),
    provider: v.string(),
    version: v.string(),
    releaseDate: v.string(),
    description: v.string(),
    parameters: v.optional(v.string()),
    contextWindow: v.optional(v.string()),
    pricing: v.optional(v.string()),
    category: v.string(),
    benchmarks: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("aiModels", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update model
export const update = mutation({
  args: {
    id: v.id("aiModels"),
    name: v.optional(v.string()),
    provider: v.optional(v.string()),
    version: v.optional(v.string()),
    releaseDate: v.optional(v.string()),
    description: v.optional(v.string()),
    parameters: v.optional(v.string()),
    contextWindow: v.optional(v.string()),
    pricing: v.optional(v.string()),
    category: v.optional(v.string()),
    benchmarks: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete model
export const remove = mutation({
  args: {
    id: v.id("aiModels"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
