import { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User, Session } from "@supabase/supabase-js";

interface CompanyProfile {
  id: string;
  email: string;
  companyName: string | null;
  companyWebsite: string | null;
  companySize: string | null;
  industry: string | null;
  monthlyBudgetMin: number | null;
  verified: boolean;
  credits: number;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  monthlyUnlocksUsed: number;
  monthlyUnlocksLimit: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  company: CompanyProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  company: null,
  loading: true,
  signOut: async () => {},
  refreshCompany: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company);
      } else {
        setCompany(null);
      }
    } catch {
      setCompany(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        await fetchCompany();
      }

      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchCompany();
      } else {
        setCompany(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCompany(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        company,
        loading,
        signOut,
        refreshCompany: fetchCompany,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
