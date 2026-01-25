/* eslint-disable */
/**
 * Generated `api` utility.
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

// Define types for the API
interface ArticlesFunctions {
  getAll: FunctionReference<"query", "public">;
  getPublished: FunctionReference<"query", "public">;
  getBySlug: FunctionReference<"query", "public", { slug: string }>;
  getById: FunctionReference<"query", "public", { id: string }>;
  getByCategory: FunctionReference<"query", "public", { category: string }>;
  getFeatured: FunctionReference<"query", "public">;
  getBreaking: FunctionReference<"query", "public">;
  getPendingReview: FunctionReference<"query", "public">;
  create: FunctionReference<"mutation", "public">;
  update: FunctionReference<"mutation", "public">;
  remove: FunctionReference<"mutation", "public", { id: string }>;
}

interface AuthFunctions {
  signUp: FunctionReference<"mutation", "public", { email: string; password: string; fullName?: string }>;
  signIn: FunctionReference<"mutation", "public", { email: string; password: string }>;
  signOut: FunctionReference<"mutation", "public", { sessionId: string }>;
  getCurrentUser: FunctionReference<"query", "public", { sessionId?: string }>;
  validateSession: FunctionReference<"query", "public", { sessionId: string }>;
}

interface BreakingNewsFunctions {
  getActive: FunctionReference<"query", "public">;
  getAll: FunctionReference<"query", "public">;
  create: FunctionReference<"mutation", "public">;
  update: FunctionReference<"mutation", "public">;
  remove: FunctionReference<"mutation", "public", { id: string }>;
}

interface DailyBriefFunctions {
  getByDate: FunctionReference<"query", "public", { date: string }>;
  getToday: FunctionReference<"query", "public">;
  getAll: FunctionReference<"query", "public">;
  create: FunctionReference<"mutation", "public">;
  update: FunctionReference<"mutation", "public">;
  remove: FunctionReference<"mutation", "public", { id: string }>;
}

interface LiveStreamsFunctions {
  getAll: FunctionReference<"query", "public">;
  getById: FunctionReference<"query", "public", { id: string }>;
  getLive: FunctionReference<"query", "public">;
  getUpcoming: FunctionReference<"query", "public">;
  create: FunctionReference<"mutation", "public">;
  update: FunctionReference<"mutation", "public">;
  remove: FunctionReference<"mutation", "public", { id: string }>;
  getMessages: FunctionReference<"query", "public", { streamId: string }>;
  sendMessage: FunctionReference<"mutation", "public">;
}

interface ModelsFunctions {
  getAll: FunctionReference<"query", "public">;
  getById: FunctionReference<"query", "public", { id: string }>;
  getByProvider: FunctionReference<"query", "public", { provider: string }>;
  getByCategory: FunctionReference<"query", "public", { category: string }>;
  create: FunctionReference<"mutation", "public">;
  update: FunctionReference<"mutation", "public">;
  remove: FunctionReference<"mutation", "public", { id: string }>;
}

interface NewslettersFunctions {
  getAllSubscribers: FunctionReference<"query", "public">;
  getActiveSubscribers: FunctionReference<"query", "public">;
  subscribe: FunctionReference<"mutation", "public", { email: string }>;
  confirmSubscription: FunctionReference<"mutation", "public", { token: string }>;
  unsubscribe: FunctionReference<"mutation", "public", { email: string }>;
  removeSubscriber: FunctionReference<"mutation", "public", { id: string }>;
  getAllNewsletters: FunctionReference<"query", "public">;
  getPendingNewsletters: FunctionReference<"query", "public">;
  createNewsletter: FunctionReference<"mutation", "public">;
  updateNewsletter: FunctionReference<"mutation", "public">;
  removeNewsletter: FunctionReference<"mutation", "public", { id: string }>;
}

interface PodcastsFunctions {
  getAll: FunctionReference<"query", "public">;
  getById: FunctionReference<"query", "public", { id: string }>;
  getPublic: FunctionReference<"query", "public">;
  create: FunctionReference<"mutation", "public">;
  update: FunctionReference<"mutation", "public">;
  remove: FunctionReference<"mutation", "public", { id: string }>;
}

interface SubmissionsFunctions {
  getAll: FunctionReference<"query", "public">;
  getBySubmitter: FunctionReference<"query", "public", { submitterId: string }>;
  getPending: FunctionReference<"query", "public">;
  create: FunctionReference<"mutation", "public">;
  review: FunctionReference<"mutation", "public">;
  remove: FunctionReference<"mutation", "public", { id: string }>;
}

interface UsersFunctions {
  getUserRole: FunctionReference<"query", "public", { userId: string }>;
  hasEditorialAccess: FunctionReference<"query", "public", { userId: string }>;
  isAdmin: FunctionReference<"query", "public", { userId: string }>;
  getAllUsersWithRoles: FunctionReference<"query", "public">;
  updateUserRole: FunctionReference<"mutation", "public">;
  removeUserRole: FunctionReference<"mutation", "public", { userId: string }>;
  getProfile: FunctionReference<"query", "public", { userId: string }>;
  updateProfile: FunctionReference<"mutation", "public">;
}

export const api: {
  articles: ArticlesFunctions;
  auth: AuthFunctions;
  breakingNews: BreakingNewsFunctions;
  dailyBrief: DailyBriefFunctions;
  liveStreams: LiveStreamsFunctions;
  models: ModelsFunctions;
  newsletters: NewslettersFunctions;
  podcasts: PodcastsFunctions;
  submissions: SubmissionsFunctions;
  users: UsersFunctions;
} = {
  articles: {} as ArticlesFunctions,
  auth: {} as AuthFunctions,
  breakingNews: {} as BreakingNewsFunctions,
  dailyBrief: {} as DailyBriefFunctions,
  liveStreams: {} as LiveStreamsFunctions,
  models: {} as ModelsFunctions,
  newsletters: {} as NewslettersFunctions,
  podcasts: {} as PodcastsFunctions,
  submissions: {} as SubmissionsFunctions,
  users: {} as UsersFunctions,
};

export const internal = {} as any;
