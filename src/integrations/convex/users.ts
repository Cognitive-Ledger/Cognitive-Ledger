import { useQuery, useMutation } from "convex/react";
import { api, Id } from "./api";
import { useAuth } from "./auth";

export type AppRole = "admin" | "editor" | "contributor";

export function useUserRole() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const role = useQuery(
    api.users.getUserRole,
    userId ? { userId } : "skip"
  );

  return {
    data: role ? { role } : null,
    isLoading: role === undefined && !!userId,
  };
}

export function useHasEditorialAccess() {
  const { user } = useAuth();
  const userId = user?.id;
  
  const role = useQuery(
    api.users.getUserRole,
    userId ? { userId } : "skip"
  );

  const isAdmin = role === "admin";
  const isEditor = role === "editor";
  const isContributor = role === "contributor";

  return {
    hasAccess: isAdmin || isEditor,
    hasAnyRole: isAdmin || isEditor || isContributor,
    isAdmin,
    isEditor,
    isContributor,
    role: role ?? null,
    isLoading: role === undefined && !!userId,
  };
}

export function useAllUsersWithRoles() {
  const users = useQuery(api.users.getAllUsersWithRoles);
  return {
    data: users,
    isLoading: users === undefined,
  };
}

export function useUpdateUserRole() {
  const updateMutation = useMutation(api.users.updateUserRole);
  return {
    mutateAsync: updateMutation,
    isPending: false,
  };
}

export function useRemoveUserRole() {
  const removeMutation = useMutation(api.users.removeUserRole);
  return {
    mutateAsync: (userId: Id<"users">) => removeMutation({ userId }),
    isPending: false,
  };
}
