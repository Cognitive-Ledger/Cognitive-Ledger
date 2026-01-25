import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all podcasts
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("podcasts")
      .withIndex("by_publishedAt")
      .order("desc")
      .collect();
  },
});

// Get podcast by ID
export const getById = query({
  args: {
    id: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get public podcasts (non-premium or all for subscribers)
export const getPublic = query({
  handler: async (ctx) => {
    const podcasts = await ctx.db.query("podcasts").collect();
    return podcasts
      .filter((p) => !p.isPremium)
      .sort((a, b) => b.publishedAt - a.publishedAt);
  },
});

// Create podcast
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    audioUrl: v.string(),
    imageUrl: v.optional(v.string()),
    durationSeconds: v.number(),
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    isPremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("podcasts", {
      ...args,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update podcast
export const update = mutation({
  args: {
    id: v.id("podcasts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    isPremium: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete podcast
export const remove = mutation({
  args: {
    id: v.id("podcasts"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
