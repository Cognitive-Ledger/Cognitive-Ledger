import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "admin" | "editor" | "contributor";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as UserRole | null;
    },
    enabled: !!user,
  });
}

export function useHasEditorialAccess() {
  const { data: userRole, isLoading } = useUserRole();

  return {
    hasAccess: userRole?.role === "admin" || userRole?.role === "editor",
    isAdmin: userRole?.role === "admin",
    isEditor: userRole?.role === "editor",
    isContributor: userRole?.role === "contributor",
    role: userRole?.role ?? null,
    isLoading,
  };
}
