import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get user role
export const getUserRole = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return role?.role ?? null;
  },
});

// Check if user has editorial access (admin or editor)
export const hasEditorialAccess = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return role?.role === "admin" || role?.role === "editor";
  },
});

// Check if user is admin
export const isAdmin = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    return role?.role === "admin";
  },
});

// Get all users with roles (admin only)
export const getAllUsersWithRoles = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const roles = await ctx.db.query("userRoles").collect();

    return users.map((user) => {
      const userRole = roles.find((r) => r.userId === user._id);
      return {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: userRole?.role ?? null,
        createdAt: user.createdAt,
      };
    });
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("contributor")),
  },
  handler: async (ctx, args) => {
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingRole) {
      await ctx.db.patch(existingRole._id, { role: args.role });
    } else {
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        createdAt: Date.now(),
      });
    }
  },
});

// Remove user role (admin only)
export const removeUserRole = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const role = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (role) {
      await ctx.db.delete(role._id);
    }
  },
});

// Get user profile
export const getProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      fullName: args.fullName,
      avatarUrl: args.avatarUrl,
      updatedAt: Date.now(),
    });
  },
});
