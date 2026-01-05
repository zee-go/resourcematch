import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, Users, CreditCard, Home, Unlock } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2D5F3F] to-[#1a3a26] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#2D5F3F]">ResourceMatch</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-700 hover:text-[#2D5F3F] hover:bg-green-50">
                <Users className="w-4 h-4 mr-2" />
                Find Candidates
              </Button>
            </Link>
            <Link href="/unlocks">
              <Button variant="ghost" className="text-slate-700 hover:text-[#2D5F3F] hover:bg-green-50">
                <Unlock className="w-4 h-4 mr-2" />
                My Unlocks
              </Button>
            </Link>
            <Link href="/billing">
              <Button variant="ghost" className="text-slate-700 hover:text-[#2D5F3F] hover:bg-green-50">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </Button>
            </Link>
          </nav>

          {/* Back to Home */}
          <Link href="/">
            <Button variant="outline" className="border-[#2D5F3F] text-[#2D5F3F] hover:bg-green-50">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}