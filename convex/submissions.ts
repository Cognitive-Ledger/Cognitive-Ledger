import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all submissions
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("articleSubmissions").order("desc").collect();
  },
});

// Get submissions by submitter
export const getBySubmitter = query({
  args: {
    submitterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articleSubmissions")
      .withIndex("by_submitterId", (q) => q.eq("submitterId", args.submitterId))
      .collect();
  },
});

// Get pending submissions
export const getPending = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("articleSubmissions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// Create submission
export const create = mutation({
  args: {
    articleId: v.optional(v.id("articles")),
    submitterId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("articleSubmissions", {
      articleId: args.articleId,
      submitterId: args.submitterId,
      status: "pending",
      submittedAt: now,
      createdAt: now,
    });
  },
});

// Review submission (approve/reject)
export const review = mutation({
  args: {
    id: v.id("articleSubmissions"),
    reviewerId: v.id("users"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      reviewerId: args.reviewerId,
      status: args.status,
      feedback: args.feedback,
      reviewedAt: Date.now(),
    });
  },
});

// Delete submission
export const remove = mutation({
  args: {
    id: v.id("articleSubmissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
