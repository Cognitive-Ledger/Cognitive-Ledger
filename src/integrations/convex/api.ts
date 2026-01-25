/**
 * Convex API types for the project.
 */

// Brand type for document IDs
export type Id<TableName extends string> = string & { __tableName: TableName };

// Placeholder API - will be replaced when Convex is deployed
export const api = {
  articles: {
    getAll: "articles:getAll",
    getPublished: "articles:getPublished", 
    getBySlug: "articles:getBySlug",
    getById: "articles:getById",
    getByCategory: "articles:getByCategory",
    getFeatured: "articles:getFeatured",
    getBreaking: "articles:getBreaking",
    getPendingReview: "articles:getPendingReview",
    create: "articles:create",
    update: "articles:update",
    remove: "articles:remove",
  },
  auth: {
    signUp: "auth:signUp",
    signIn: "auth:signIn",
    signOut: "auth:signOut",
    getCurrentUser: "auth:getCurrentUser",
    validateSession: "auth:validateSession",
  },
  breakingNews: {
    getActive: "breakingNews:getActive",
    getAll: "breakingNews:getAll",
    create: "breakingNews:create",
    update: "breakingNews:update",
    remove: "breakingNews:remove",
  },
  dailyBrief: {
    getByDate: "dailyBrief:getByDate",
    getToday: "dailyBrief:getToday",
    getAll: "dailyBrief:getAll",
    create: "dailyBrief:create",
    update: "dailyBrief:update",
    remove: "dailyBrief:remove",
  },
  liveStreams: {
    getAll: "liveStreams:getAll",
    getById: "liveStreams:getById",
    getLive: "liveStreams:getLive",
    getUpcoming: "liveStreams:getUpcoming",
    create: "liveStreams:create",
    update: "liveStreams:update",
    remove: "liveStreams:remove",
    getMessages: "liveStreams:getMessages",
    sendMessage: "liveStreams:sendMessage",
  },
  models: {
    getAll: "models:getAll",
    getById: "models:getById",
    getByProvider: "models:getByProvider",
    getByCategory: "models:getByCategory",
    create: "models:create",
    update: "models:update",
    remove: "models:remove",
  },
  newsletters: {
    getAllSubscribers: "newsletters:getAllSubscribers",
    getActiveSubscribers: "newsletters:getActiveSubscribers",
    subscribe: "newsletters:subscribe",
    confirmSubscription: "newsletters:confirmSubscription",
    unsubscribe: "newsletters:unsubscribe",
    removeSubscriber: "newsletters:removeSubscriber",
    getAllNewsletters: "newsletters:getAllNewsletters",
    getPendingNewsletters: "newsletters:getPendingNewsletters",
    createNewsletter: "newsletters:createNewsletter",
    updateNewsletter: "newsletters:updateNewsletter",
    removeNewsletter: "newsletters:removeNewsletter",
  },
  podcasts: {
    getAll: "podcasts:getAll",
    getById: "podcasts:getById",
    getPublic: "podcasts:getPublic",
    create: "podcasts:create",
    update: "podcasts:update",
    remove: "podcasts:remove",
  },
  submissions: {
    getAll: "submissions:getAll",
    getBySubmitter: "submissions:getBySubmitter",
    getPending: "submissions:getPending",
    create: "submissions:create",
    review: "submissions:review",
    remove: "submissions:remove",
  },
  users: {
    getUserRole: "users:getUserRole",
    hasEditorialAccess: "users:hasEditorialAccess",
    isAdmin: "users:isAdmin",
    getAllUsersWithRoles: "users:getAllUsersWithRoles",
    updateUserRole: "users:updateUserRole",
    removeUserRole: "users:removeUserRole",
    getProfile: "users:getProfile",
    updateProfile: "users:updateProfile",
  },
} as const;
