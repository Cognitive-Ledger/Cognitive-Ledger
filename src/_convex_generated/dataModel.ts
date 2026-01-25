/**
 * Generated Convex Data Model - placeholder until Convex is deployed.
 */

// Brand type for document IDs - ensures type safety for different tables
export type Id<TableName extends string> = string & { __tableName: TableName };

// Table names in the schema
export type TableNames = 
  | "articles"
  | "users"
  | "userRoles"
  | "sessions"
  | "articleSubmissions"
  | "breakingNews"
  | "dailyBriefItems"
  | "aiModels"
  | "podcasts"
  | "liveStreams"
  | "liveStreamMessages"
  | "newsletterSubscribers"
  | "scheduledNewsletters"
  | "subscriptions"
  | "notificationPreferences";
