import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  CreditCard,
  Unlock,
  LogIn,
  LogOut,
  ShieldCheck,
  Briefcase,
  FileText,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

export function DashboardHeader() {
  const { user, company, candidate, loading, signOut } = useAuth();

  const isCompany = user?.role === "COMPANY" || (!user?.role && !!company);
  const isCandidate = user?.role === "CANDIDATE";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#04443C] to-[#022C27] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#04443C]">
              ResourceMatch
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Browse Talent — visible to all except candidates */}
            {!isCandidate && (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-slate-700 hover:text-[#04443C] hover:bg-green-50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Browse Talent
                </Button>
              </Link>
            )}

            {/* Company-specific nav */}
            {user && isCompany && (
              <>
                <Link href="/unlocks">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:text-[#04443C] hover:bg-green-50"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    My Unlocks
                  </Button>
                </Link>
                <Link href="/jobs/manage">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:text-[#04443C] hover:bg-green-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    My Jobs
                  </Button>
                </Link>
                <Link href="/hire">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:text-[#04443C] hover:bg-green-50"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Buy Credits
                  </Button>
                </Link>
              </>
            )}

            {/* Candidate-specific nav */}
            {user && isCandidate && (
              <>
                <Link href="/jobs">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:text-[#04443C] hover:bg-green-50"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link href="/candidate/applications">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:text-[#04443C] hover:bg-green-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    My Applications
                  </Button>
                </Link>
                <Link href="/candidate/profile">
                  <Button
                    variant="ghost"
                    className="text-slate-700 hover:text-[#04443C] hover:bg-green-50"
                  >
                    <UserCircle className="w-4 h-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Company badges */}
                {isCompany && company && (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-[#04443C] hidden sm:flex"
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      {company.credits} credits
                    </Badge>
                    {company.verified && (
                      <Badge className="bg-blue-100 text-blue-700 hidden sm:flex">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </>
                )}

                {/* Candidate badge */}
                {isCandidate && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 hidden sm:flex"
                  >
                    <UserCircle className="w-3 h-3 mr-1" />
                    Professional
                  </Badge>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 hidden sm:inline">
                    {isCompany
                      ? company?.companyName || user.email
                      : candidate?.fullName || user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    className="border-slate-300 text-slate-600 hover:text-red-600 hover:border-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#04443C] text-[#04443C] hover:bg-green-50"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-[#04443C] hover:bg-[#022C27] text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
