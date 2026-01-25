import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, ConvexReactClient } from "convex/react";
import { api, Id } from "./api";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

export const convex = new ConvexReactClient(CONVEX_URL);

interface User {
  id: Id<"users">;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "convex_session_id";

export function ConvexAuthProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored as Id<"sessions"> | null;
  });
  const [loading, setLoading] = useState(true);

  const user = useQuery(api.auth.getCurrentUser, 
    sessionId ? { sessionId } : "skip"
  );

  const signInMutation = useMutation(api.auth.signIn);
  const signUpMutation = useMutation(api.auth.signUp);
  const signOutMutation = useMutation(api.auth.signOut);

  useEffect(() => {
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation({ email, password });
      localStorage.setItem(SESSION_KEY, result.sessionId);
      setSessionId(result.sessionId);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const result = await signUpMutation({ email, password, fullName });
      localStorage.setItem(SESSION_KEY, result.sessionId);
      setSessionId(result.sessionId);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    if (sessionId) {
      try {
        await signOutMutation({ sessionId });
      } catch (e) {
        console.error("Sign out error:", e);
      }
    }
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
  };

  const contextValue: AuthContextType = {
    user: user ? {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
    } : null,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a ConvexAuthProvider");
  }
  return context;
}

export function useSessionId(): Id<"sessions"> | null {
  const stored = localStorage.getItem(SESSION_KEY);
  return stored as Id<"sessions"> | null;
}
