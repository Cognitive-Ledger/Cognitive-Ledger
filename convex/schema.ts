import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users and authentication
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_expiresAt", ["expiresAt"]),

  userRoles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("contributor")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  // Articles
  articles: defineTable({
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
    publishedAt: v.number(),
    status: v.optional(v.string()),
    scheduledFor: v.optional(v.number()),
    reviewerId: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    submitterId: v.optional(v.id("users")),
    reviewFeedback: v.optional(v.string()),
    embeds: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_publishedAt", ["publishedAt"]),

  // Article submissions for contributor workflow
  articleSubmissions: defineTable({
    articleId: v.optional(v.id("articles")),
    submitterId: v.id("users"),
    reviewerId: v.optional(v.id("users")),
    status: v.string(),
    feedback: v.optional(v.string()),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_submitterId", ["submitterId"])
    .index("by_status", ["status"]),

  // Breaking news
  breakingNews: defineTable({
    content: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  // Daily brief items
  dailyBriefItems: defineTable({
    content: v.string(),
    briefDate: v.string(),
    orderIndex: v.number(),
    createdAt: v.number(),
  }).index("by_briefDate", ["briefDate"]),

  // AI Models
  aiModels: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_provider", ["provider"])
    .index("by_category", ["category"]),

  // Podcasts
  podcasts: defineTable({
    title: v.string(),
    description: v.string(),
    audioUrl: v.string(),
    imageUrl: v.optional(v.string()),
    durationSeconds: v.number(),
    episodeNumber: v.optional(v.number()),
    seasonNumber: v.optional(v.number()),
    isPremium: v.boolean(),
    publishedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_publishedAt", ["publishedAt"]),

  // Live streams
  liveStreams: defineTable({
    title: v.string(),
    description: v.string(),
    streamUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    scheduledAt: v.number(),
    isLive: v.boolean(),
    isPremium: v.boolean(),
    viewersCount: v.number(),
    streamKey: v.optional(v.string()),
    playbackUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_scheduledAt", ["scheduledAt"])
    .index("by_isLive", ["isLive"]),

  // Live stream messages
  liveStreamMessages: defineTable({
    streamId: v.id("liveStreams"),
    userId: v.optional(v.id("users")),
    userName: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_streamId", ["streamId"]),

  // Newsletter subscribers
  newsletterSubscribers: defineTable({
    email: v.string(),
    isActive: v.boolean(),
    confirmationToken: v.optional(v.string()),
    confirmedAt: v.optional(v.number()),
    subscribedAt: v.number(),
    unsubscribedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_isActive", ["isActive"]),

  // Scheduled newsletters
  scheduledNewsletters: defineTable({
    subject: v.string(),
    content: v.string(),
    scheduledFor: v.number(),
    status: v.string(),
    sentAt: v.optional(v.number()),
    sentCount: v.number(),
    failedCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_scheduledFor", ["scheduledFor"]),

  // Subscriptions
  subscriptions: defineTable({
    userId: v.id("users"),
    planId: v.string(),
    status: v.string(),
    billingPeriod: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    autumnCustomerId: v.optional(v.string()),
    autumnSubscriptionId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // Notification preferences
  notificationPreferences: defineTable({
    userId: v.id("users"),
    liveStreams: v.boolean(),
    newArticles: v.boolean(),
    newsletters: v.boolean(),
    productUpdates: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
