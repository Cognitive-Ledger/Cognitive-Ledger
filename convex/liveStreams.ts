import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all streams
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("liveStreams")
      .withIndex("by_scheduledAt")
      .order("desc")
      .collect();
  },
});

// Get stream by ID
export const getById = query({
  args: {
    id: v.id("liveStreams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get live streams (currently live)
export const getLive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("liveStreams")
      .withIndex("by_isLive", (q) => q.eq("isLive", true))
      .collect();
  },
});

// Get upcoming streams
export const getUpcoming = query({
  handler: async (ctx) => {
    const now = Date.now();
    const streams = await ctx.db.query("liveStreams").collect();
    return streams
      .filter((s) => s.scheduledAt > now && !s.isLive)
      .sort((a, b) => a.scheduledAt - b.scheduledAt);
  },
});

// Create stream
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    streamUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    scheduledAt: v.number(),
    isPremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("liveStreams", {
      ...args,
      isLive: false,
      viewersCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update stream
export const update = mutation({
  args: {
    id: v.id("liveStreams"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    streamUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    scheduledAt: v.optional(v.number()),
    isLive: v.optional(v.boolean()),
    isPremium: v.optional(v.boolean()),
    viewersCount: v.optional(v.number()),
    streamKey: v.optional(v.string()),
    playbackUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete stream
export const remove = mutation({
  args: {
    id: v.id("liveStreams"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get stream messages
export const getMessages = query({
  args: {
    streamId: v.id("liveStreams"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("liveStreamMessages")
      .withIndex("by_streamId", (q) => q.eq("streamId", args.streamId))
      .collect();
  },
});

// Send message to stream
export const sendMessage = mutation({
  args: {
    streamId: v.id("liveStreams"),
    userId: v.optional(v.id("users")),
    userName: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("liveStreamMessages", {
      streamId: args.streamId,
      userId: args.userId,
      userName: args.userName,
      message: args.message,
      createdAt: Date.now(),
    });
  },
});
