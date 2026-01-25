import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all active breaking news
export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("breakingNews")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get all breaking news (for admin)
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("breakingNews").order("desc").collect();
  },
});

// Create breaking news
export const create = mutation({
  args: {
    content: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("breakingNews", {
      content: args.content,
      isActive: args.isActive,
      createdAt: Date.now(),
    });
  },
});

// Update breaking news
export const update = mutation({
  args: {
    id: v.id("breakingNews"),
    content: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete breaking news
export const remove = mutation({
  args: {
    id: v.id("breakingNews"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
