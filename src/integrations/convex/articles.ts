import { useQuery, useMutation } from "convex/react";
import { api, Id } from "./api";

export interface Article {
  _id: Id<"articles">;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  simpleContent?: string;
  technicalContent?: string;
  category: string;
  author: string;
  imageUrl?: string;
  videoUrl?: string;
  readingTime: number;
  isBreaking: boolean;
  isFeatured: boolean;
  businessImpact?: string;
  technicalImpact?: string;
  ethicalRisk?: string;
  publishedAt: number;
  status?: string;
  scheduledFor?: number;
  reviewerId?: Id<"users">;
  reviewedAt?: number;
  submitterId?: Id<"users">;
  reviewFeedback?: string;
  embeds?: any;
  createdAt: number;
  updatedAt: number;
}

export function useArticles() {
  const articles = useQuery(api.articles.getAll);
  return {
    data: articles,
    isLoading: articles === undefined,
  };
}

export function usePublishedArticles() {
  const articles = useQuery(api.articles.getPublished);
  return {
    data: articles,
    isLoading: articles === undefined,
  };
}

export function useArticle(slugOrId: string) {
  const article = useQuery(api.articles.getBySlug, { slug: slugOrId });
  return {
    data: article,
    isLoading: article === undefined,
  };
}

export function useArticleById(id: Id<"articles"> | undefined) {
  const article = useQuery(api.articles.getById, id ? { id } : "skip");
  return {
    data: article,
    isLoading: article === undefined,
  };
}

export function useArticlesByCategory(category: string) {
  const articles = useQuery(api.articles.getByCategory, { category });
  return {
    data: articles,
    isLoading: articles === undefined,
  };
}

export function useFeaturedArticles() {
  const articles = useQuery(api.articles.getFeatured);
  return {
    data: articles,
    isLoading: articles === undefined,
  };
}

export function useBreakingArticles() {
  const articles = useQuery(api.articles.getBreaking);
  return {
    data: articles,
    isLoading: articles === undefined,
  };
}

export function usePendingReviewArticles() {
  const articles = useQuery(api.articles.getPendingReview);
  return {
    data: articles,
    isLoading: articles === undefined,
  };
}

export function useCreateArticle() {
  const createMutation = useMutation(api.articles.create);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useUpdateArticle() {
  const updateMutation = useMutation(api.articles.update);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useDeleteArticle() {
  const deleteMutation = useMutation(api.articles.remove);
  return {
    mutateAsync: (id: Id<"articles">) => deleteMutation({ id }),
    isPending: false,
  };
}

// Breaking News hooks
export function useBreakingNews() {
  const news = useQuery(api.breakingNews.getActive);
  return {
    data: news,
    isLoading: news === undefined,
  };
}

export function useAllBreakingNews() {
  const news = useQuery(api.breakingNews.getAll);
  return {
    data: news,
    isLoading: news === undefined,
  };
}

export function useCreateBreakingNews() {
  const createMutation = useMutation(api.breakingNews.create);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useUpdateBreakingNews() {
  const updateMutation = useMutation(api.breakingNews.update);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useDeleteBreakingNews() {
  const deleteMutation = useMutation(api.breakingNews.remove);
  return {
    mutateAsync: (id: Id<"breakingNews">) => deleteMutation({ id }),
    isPending: false,
  };
}

// Daily Brief hooks
export function useDailyBrief() {
  const items = useQuery(api.dailyBrief.getToday);
  return {
    data: items,
    isLoading: items === undefined,
  };
}

export function useAllDailyBriefItems() {
  const items = useQuery(api.dailyBrief.getAll);
  return {
    data: items,
    isLoading: items === undefined,
  };
}

export function useCreateDailyBriefItem() {
  const createMutation = useMutation(api.dailyBrief.create);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useUpdateDailyBriefItem() {
  const updateMutation = useMutation(api.dailyBrief.update);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useDeleteDailyBriefItem() {
  const deleteMutation = useMutation(api.dailyBrief.remove);
  return {
    mutateAsync: (id: Id<"dailyBriefItems">) => deleteMutation({ id }),
    isPending: false,
  };
}
