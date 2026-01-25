import { useQuery, useMutation } from "convex/react";
import { api, Id } from "./api";

export interface AIModel {
  _id: Id<"aiModels">;
  name: string;
  provider: string;
  version: string;
  releaseDate: string;
  description: string;
  parameters?: string;
  contextWindow?: string;
  pricing?: string;
  category: string;
  benchmarks?: Record<string, number>;
  createdAt: number;
  updatedAt: number;
}

export function useModels() {
  const models = useQuery(api.models.getAll);
  return {
    data: models,
    isLoading: models === undefined,
  };
}

export function useModel(id: Id<"aiModels"> | undefined) {
  const model = useQuery(api.models.getById, id ? { id } : "skip");
  return {
    data: model,
    isLoading: model === undefined,
  };
}

export function useModelsByProvider(provider: string) {
  const models = useQuery(api.models.getByProvider, { provider });
  return {
    data: models,
    isLoading: models === undefined,
  };
}

export function useModelsByCategory(category: string) {
  const models = useQuery(api.models.getByCategory, { category });
  return {
    data: models,
    isLoading: models === undefined,
  };
}

export function useCreateModel() {
  const createMutation = useMutation(api.models.create);
  return {
    mutateAsync: createMutation,
    isPending: false,
  };
}

export function useUpdateModel() {
  const updateMutation = useMutation(api.models.update);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useDeleteModel() {
  const deleteMutation = useMutation(api.models.remove);
  return {
    mutateAsync: (id: Id<"aiModels">) => deleteMutation({ id }),
    isPending: false,
  };
}
