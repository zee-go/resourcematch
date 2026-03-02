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
  verificationStatus: string;
  credits: number;
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  monthlyUnlocksUsed: number;
  monthlyUnlocksLimit: number | null;
}

interface CandidateProfile {
  id: number;
  fullName: string;
  name: string;
  title: string;
  vertical: string;
  experience: number;
  availability: string;
  skills: string[];
  tools: string[];
  location: string;
  summary: string;
  vettingScore: number;
  verified: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
}

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  company: CompanyProfile | null;
  candidate: CandidateProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshCompany: () => Promise<void>;
  refreshCandidate: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  company: null,
  candidate: null,
  loading: true,
  signOut: async () => {},
  refreshCompany: async () => {},
  refreshCandidate: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);

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

  const fetchCandidate = useCallback(async () => {
    try {
      const res = await fetch("/api/candidate/me");
      if (res.ok) {
        const data = await res.json();
        setCandidate(data.candidate);
      } else {
        setCandidate(null);
      }
    } catch {
      setCandidate(null);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = session.user.role;
      if (role === "CANDIDATE") {
        fetchCandidate();
      } else {
        fetchCompany();
      }
    } else if (status === "unauthenticated") {
      setCompany(null);
      setCandidate(null);
    }
  }, [status, session, fetchCompany, fetchCandidate]);

  const user: AuthUser | null =
    session?.user
      ? {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name,
          role: session.user.role,
        }
      : null;

  const signOut = async () => {
    setCompany(null);
    setCandidate(null);
    await nextAuthSignOut({ callbackUrl: "/" });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        candidate,
        loading: status === "loading",
        signOut,
        refreshCompany: fetchCompany,
        refreshCandidate: fetchCandidate,
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
