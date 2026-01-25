/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generated Convex API - placeholder until Convex is deployed.
 * This provides type-safe function references for the frontend.
 */

import { FunctionReference, DefaultFunctionArgs } from "convex/server";

// Helper type for creating typed function references
type TypedQuery<Args extends DefaultFunctionArgs = any, Returns = any> = FunctionReference<"query", "public", Args, Returns>;
type TypedMutation<Args extends DefaultFunctionArgs = any, Returns = any> = FunctionReference<"mutation", "public", Args, Returns>;

// Create typed API object that matches Convex's expected structure
export const api = {
  articles: {
    getAll: "articles:getAll" as unknown as TypedQuery,
    getPublished: "articles:getPublished" as unknown as TypedQuery,
    getBySlug: "articles:getBySlug" as unknown as TypedQuery<{ slug: string }>,
    getById: "articles:getById" as unknown as TypedQuery<{ id: string }>,
    getByCategory: "articles:getByCategory" as unknown as TypedQuery<{ category: string }>,
    getFeatured: "articles:getFeatured" as unknown as TypedQuery,
    getBreaking: "articles:getBreaking" as unknown as TypedQuery,
    getPendingReview: "articles:getPendingReview" as unknown as TypedQuery,
    create: "articles:create" as unknown as TypedMutation,
    update: "articles:update" as unknown as TypedMutation,
    remove: "articles:remove" as unknown as TypedMutation<{ id: string }>,
  },
  auth: {
    signUp: "auth:signUp" as unknown as TypedMutation<{ email: string; password: string; fullName?: string }>,
    signIn: "auth:signIn" as unknown as TypedMutation<{ email: string; password: string }>,
    signOut: "auth:signOut" as unknown as TypedMutation<{ sessionId: string }>,
    getCurrentUser: "auth:getCurrentUser" as unknown as TypedQuery<{ sessionId?: string }>,
    validateSession: "auth:validateSession" as unknown as TypedQuery<{ sessionId: string }>,
  },
  breakingNews: {
    getActive: "breakingNews:getActive" as unknown as TypedQuery,
    getAll: "breakingNews:getAll" as unknown as TypedQuery,
    create: "breakingNews:create" as unknown as TypedMutation,
    update: "breakingNews:update" as unknown as TypedMutation,
    remove: "breakingNews:remove" as unknown as TypedMutation<{ id: string }>,
  },
  dailyBrief: {
    getByDate: "dailyBrief:getByDate" as unknown as TypedQuery<{ date: string }>,
    getToday: "dailyBrief:getToday" as unknown as TypedQuery,
    getAll: "dailyBrief:getAll" as unknown as TypedQuery,
    create: "dailyBrief:create" as unknown as TypedMutation,
    update: "dailyBrief:update" as unknown as TypedMutation,
    remove: "dailyBrief:remove" as unknown as TypedMutation<{ id: string }>,
  },
  liveStreams: {
    getAll: "liveStreams:getAll" as unknown as TypedQuery,
    getById: "liveStreams:getById" as unknown as TypedQuery<{ id: string }>,
    getLive: "liveStreams:getLive" as unknown as TypedQuery,
    getUpcoming: "liveStreams:getUpcoming" as unknown as TypedQuery,
    create: "liveStreams:create" as unknown as TypedMutation,
    update: "liveStreams:update" as unknown as TypedMutation,
    remove: "liveStreams:remove" as unknown as TypedMutation<{ id: string }>,
    getMessages: "liveStreams:getMessages" as unknown as TypedQuery<{ streamId: string }>,
    sendMessage: "liveStreams:sendMessage" as unknown as TypedMutation,
  },
  models: {
    getAll: "models:getAll" as unknown as TypedQuery,
    getById: "models:getById" as unknown as TypedQuery<{ id: string }>,
    getByProvider: "models:getByProvider" as unknown as TypedQuery<{ provider: string }>,
    getByCategory: "models:getByCategory" as unknown as TypedQuery<{ category: string }>,
    create: "models:create" as unknown as TypedMutation,
    update: "models:update" as unknown as TypedMutation,
    remove: "models:remove" as unknown as TypedMutation<{ id: string }>,
  },
  newsletters: {
    getAllSubscribers: "newsletters:getAllSubscribers" as unknown as TypedQuery,
    getActiveSubscribers: "newsletters:getActiveSubscribers" as unknown as TypedQuery,
    subscribe: "newsletters:subscribe" as unknown as TypedMutation<{ email: string }>,
    confirmSubscription: "newsletters:confirmSubscription" as unknown as TypedMutation<{ token: string }>,
    unsubscribe: "newsletters:unsubscribe" as unknown as TypedMutation<{ email: string }>,
    removeSubscriber: "newsletters:removeSubscriber" as unknown as TypedMutation<{ id: string }>,
    getAllNewsletters: "newsletters:getAllNewsletters" as unknown as TypedQuery,
    getPendingNewsletters: "newsletters:getPendingNewsletters" as unknown as TypedQuery,
    createNewsletter: "newsletters:createNewsletter" as unknown as TypedMutation,
    updateNewsletter: "newsletters:updateNewsletter" as unknown as TypedMutation,
    removeNewsletter: "newsletters:removeNewsletter" as unknown as TypedMutation<{ id: string }>,
  },
  podcasts: {
    getAll: "podcasts:getAll" as unknown as TypedQuery,
    getById: "podcasts:getById" as unknown as TypedQuery<{ id: string }>,
    getPublic: "podcasts:getPublic" as unknown as TypedQuery,
    create: "podcasts:create" as unknown as TypedMutation,
    update: "podcasts:update" as unknown as TypedMutation,
    remove: "podcasts:remove" as unknown as TypedMutation<{ id: string }>,
  },
  submissions: {
    getAll: "submissions:getAll" as unknown as TypedQuery,
    getBySubmitter: "submissions:getBySubmitter" as unknown as TypedQuery<{ submitterId: string }>,
    getPending: "submissions:getPending" as unknown as TypedQuery,
    create: "submissions:create" as unknown as TypedMutation,
    review: "submissions:review" as unknown as TypedMutation,
    remove: "submissions:remove" as unknown as TypedMutation<{ id: string }>,
  },
  users: {
    getUserRole: "users:getUserRole" as unknown as TypedQuery<{ userId: string }>,
    hasEditorialAccess: "users:hasEditorialAccess" as unknown as TypedQuery<{ userId: string }>,
    isAdmin: "users:isAdmin" as unknown as TypedQuery<{ userId: string }>,
    getAllUsersWithRoles: "users:getAllUsersWithRoles" as unknown as TypedQuery,
    updateUserRole: "users:updateUserRole" as unknown as TypedMutation,
    removeUserRole: "users:removeUserRole" as unknown as TypedMutation<{ userId: string }>,
    getProfile: "users:getProfile" as unknown as TypedQuery<{ userId: string }>,
    updateProfile: "users:updateProfile" as unknown as TypedMutation,
  },
} as const;
