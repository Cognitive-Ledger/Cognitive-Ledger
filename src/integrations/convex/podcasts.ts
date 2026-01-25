import { useQuery, useMutation } from "convex/react";
import { api, Id } from "./api";

export interface Podcast {
  _id: Id<"podcasts">;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  durationSeconds: number;
  episodeNumber?: number;
  seasonNumber?: number;
  isPremium: boolean;
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
}

export function usePodcasts() {
  const podcasts = useQuery(api.podcasts.getAll);
  return {
    data: podcasts,
    isLoading: podcasts === undefined,
  };
}

export function usePodcast(id: Id<"podcasts"> | undefined) {
  const podcast = useQuery(api.podcasts.getById, id ? { id } : "skip");
  return {
    data: podcast,
    isLoading: podcast === undefined,
  };
}

export function usePublicPodcasts() {
  const podcasts = useQuery(api.podcasts.getPublic);
  return {
    data: podcasts,
    isLoading: podcasts === undefined,
  };
}

export function useCreatePodcast() {
  const createMutation = useMutation(api.podcasts.create);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useUpdatePodcast() {
  const updateMutation = useMutation(api.podcasts.update);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useDeletePodcast() {
  const deleteMutation = useMutation(api.podcasts.remove);
  return {
    mutateAsync: (id: Id<"podcasts">) => deleteMutation({ id }),
    isPending: false,
  };
}
