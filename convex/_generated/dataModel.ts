/**
 * Generated data model types.
 */

// Brand type for document IDs
export type Id<TableName extends string> = string & { __tableName: TableName };

// Document types
export interface Doc<TableName extends string> {
  _id: Id<TableName>;
  _creationTime: number;
}

// Table names
export type TableNames = 
  | "users"
  | "sessions"
  | "userRoles"
  | "articles"
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
