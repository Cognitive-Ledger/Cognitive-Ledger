import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all articles
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_publishedAt")
      .order("desc")
      .collect();
  },
});

// Get published articles
export const getPublished = query({
  handler: async (ctx) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    
    return articles.sort((a, b) => b.publishedAt - a.publishedAt);
  },
});

// Get article by slug
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get article by ID
export const getById = query({
  args: {
    id: v.id("articles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get articles by category
export const getByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Get featured articles
export const getFeatured = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    return articles.filter((a) => a.isFeatured && a.status === "published");
  },
});

// Get breaking articles
export const getBreaking = query({
  handler: async (ctx) => {
    const articles = await ctx.db.query("articles").collect();
    return articles.filter((a) => a.isBreaking && a.status === "published");
  },
});

// Create article
export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    simpleContent: v.optional(v.string()),
    technicalContent: v.optional(v.string()),
    category: v.string(),
    author: v.string(),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    readingTime: v.number(),
    isBreaking: v.boolean(),
    isFeatured: v.boolean(),
    businessImpact: v.optional(v.string()),
    technicalImpact: v.optional(v.string()),
    ethicalRisk: v.optional(v.string()),
    status: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    submitterId: v.optional(v.id("users")),
    embeds: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("articles", {
      ...args,
      status: args.status ?? "published",
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update article
export const update = mutation({
  args: {
    id: v.id("articles"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    simpleContent: v.optional(v.string()),
    technicalContent: v.optional(v.string()),
    category: v.optional(v.string()),
    author: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    readingTime: v.optional(v.number()),
    isBreaking: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    businessImpact: v.optional(v.string()),
    technicalImpact: v.optional(v.string()),
    ethicalRisk: v.optional(v.string()),
    status: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    reviewerId: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewFeedback: v.optional(v.string()),
    embeds: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete article
export const remove = mutation({
  args: {
    id: v.id("articles"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get pending review articles
export const getPendingReview = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_status", (q) => q.eq("status", "pending_review"))
      .collect();
  },
});
