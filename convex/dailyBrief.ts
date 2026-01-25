import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get daily brief items for a specific date
export const getByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("dailyBriefItems")
      .withIndex("by_briefDate", (q) => q.eq("briefDate", args.date))
      .collect();
    
    return items.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Get today's brief
export const getToday = query({
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const items = await ctx.db
      .query("dailyBriefItems")
      .withIndex("by_briefDate", (q) => q.eq("briefDate", today))
      .collect();
    
    return items.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});

// Get all daily brief items (for admin)
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("dailyBriefItems").order("desc").collect();
  },
});

// Create daily brief item
export const create = mutation({
  args: {
    content: v.string(),
    briefDate: v.string(),
    orderIndex: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dailyBriefItems", {
      content: args.content,
      briefDate: args.briefDate,
      orderIndex: args.orderIndex,
      createdAt: Date.now(),
    });
  },
});

// Update daily brief item
export const update = mutation({
  args: {
    id: v.id("dailyBriefItems"),
    content: v.optional(v.string()),
    briefDate: v.optional(v.string()),
    orderIndex: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete daily brief item
export const remove = mutation({
  args: {
    id: v.id("dailyBriefItems"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
