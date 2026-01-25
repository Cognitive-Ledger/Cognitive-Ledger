import { useQuery, useMutation } from "convex/react";
import { api, Id } from "./api";

export interface ArticleSubmission {
  _id: Id<"articleSubmissions">;
  articleId?: Id<"articles">;
  submitterId: Id<"users">;
  reviewerId?: Id<"users">;
  status: string;
  feedback?: string;
  submittedAt: number;
  reviewedAt?: number;
  createdAt: number;
}

export function useSubmissions() {
  const submissions = useQuery(api.submissions.getAll);
  return {
    data: submissions,
    isLoading: submissions === undefined,
  };
}

export function useSubmissionsByUser(userId: Id<"users"> | undefined) {
  const submissions = useQuery(
    api.submissions.getBySubmitter,
    userId ? { submitterId: userId } : "skip"
  );
  return {
    data: submissions,
    isLoading: submissions === undefined,
  };
}

export function usePendingSubmissions() {
  const submissions = useQuery(api.submissions.getPending);
  return {
    data: submissions,
    isLoading: submissions === undefined,
  };
}

export function useCreateSubmission() {
  const createMutation = useMutation(api.submissions.create);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useReviewSubmission() {
  const reviewMutation = useMutation(api.submissions.review);
  return {
    mutateAsync: reviewMutation,
    isPending: false,
  };
}

export function useDeleteSubmission() {
  const deleteMutation = useMutation(api.submissions.remove);
  return {
    mutateAsync: (id: Id<"articleSubmissions">) => deleteMutation({ id }),
    isPending: false,
  };
}
