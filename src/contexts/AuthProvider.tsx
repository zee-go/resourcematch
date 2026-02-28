import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

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

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  company: CompanyProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  company: null,
  loading: true,
  signOut: async () => {},
  refreshCompany: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  const fetchCompany = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchCompany();
    } else if (status === "unauthenticated") {
      setCompany(null);
    }
  }, [status, session, fetchCompany]);

  const user: AuthUser | null =
    session?.user
      ? {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name,
        }
      : null;

  const signOut = async () => {
    setCompany(null);
    await nextAuthSignOut({ callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        loading: status === "loading",
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
