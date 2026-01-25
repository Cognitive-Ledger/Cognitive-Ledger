import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ===== Subscribers =====

// Get all subscribers
export const getAllSubscribers = query({
  handler: async (ctx) => {
    return await ctx.db.query("newsletterSubscribers").collect();
  },
});

// Get active subscribers
export const getActiveSubscribers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Subscribe to newsletter
export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already subscribed
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      if (existing.isActive) {
        throw new Error("Already subscribed");
      }
      // Reactivate subscription
      await ctx.db.patch(existing._id, {
        isActive: true,
        unsubscribedAt: undefined,
      });
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("newsletterSubscribers", {
      email: args.email,
      isActive: true,
      confirmationToken: crypto.randomUUID(),
      subscribedAt: now,
    });
  },
});

// Confirm subscription
export const confirmSubscription = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const subscribers = await ctx.db.query("newsletterSubscribers").collect();
    const subscriber = subscribers.find((s) => s.confirmationToken === args.token);

    if (!subscriber) {
      throw new Error("Invalid token");
    }

    await ctx.db.patch(subscriber._id, {
      confirmedAt: Date.now(),
      confirmationToken: undefined,
    });
  },
});

// Unsubscribe
export const unsubscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscriber) {
      throw new Error("Not found");
    }

    await ctx.db.patch(subscriber._id, {
      isActive: false,
      unsubscribedAt: Date.now(),
    });
  },
});

// Delete subscriber
export const removeSubscriber = mutation({
  args: {
    id: v.id("newsletterSubscribers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ===== Scheduled Newsletters =====

// Get all scheduled newsletters
export const getAllNewsletters = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("scheduledNewsletters")
      .order("desc")
      .collect();
  },
});

// Get pending newsletters
export const getPendingNewsletters = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("scheduledNewsletters")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

// Create newsletter
export const createNewsletter = mutation({
  args: {
    subject: v.string(),
    content: v.string(),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("scheduledNewsletters", {
      subject: args.subject,
      content: args.content,
      scheduledFor: args.scheduledFor,
      status: "pending",
      sentCount: 0,
      failedCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update newsletter
export const updateNewsletter = mutation({
  args: {
    id: v.id("scheduledNewsletters"),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    status: v.optional(v.string()),
    sentAt: v.optional(v.number()),
    sentCount: v.optional(v.number()),
    failedCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete newsletter
export const removeNewsletter = mutation({
  args: {
    id: v.id("scheduledNewsletters"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
