import { useEffect, useState } from "react";
import { AdminStatsCard } from "./AdminStatsCard";
import { Badge } from "@/components/ui/badge";
import {
  Users, Building2, UserCheck, DollarSign,
  Briefcase, FileText, Unlock, CreditCard,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalCompanies: number;
  totalCandidates: number;
  totalRevenueCents: number;
  activeJobs: number;
  pendingApplications: number;
  recentSignups: Array<{
    id: string;
    email: string;
    role: string;
    name: string | null;
    createdAt: string;
  }>;
  activeSubscriptions: number;
  totalUnlocks: number;
  companiesByVerification: Record<string, number>;
}

export function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!stats) return <p className="text-slate-500 py-8">Failed to load stats.</p>;

  const formatCurrency = (cents: number) =>
    `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatsCard label="Total Users" value={stats.totalUsers} icon={Users} />
        <AdminStatsCard label="Companies" value={stats.totalCompanies} icon={Building2} />
        <AdminStatsCard label="Candidates" value={stats.totalCandidates} icon={UserCheck} />
        <AdminStatsCard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenueCents)}
          icon={DollarSign}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatsCard label="Active Jobs" value={stats.activeJobs} icon={Briefcase} />
        <AdminStatsCard
          label="Pending Applications"
          value={stats.pendingApplications}
          icon={FileText}
          description="Awaiting review"
        />
        <AdminStatsCard label="Total Unlocks" value={stats.totalUnlocks} icon={Unlock} />
        <AdminStatsCard
          label="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CreditCard}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Recent Signups</h3>
          {stats.recentSignups.length === 0 ? (
            <p className="text-sm text-slate-500">No signups yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSignups.map((user) => (
                <div key={user.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-900">
                      {user.name || user.email}
                    </span>
                    {user.name && (
                      <span className="text-slate-500 ml-2">{user.email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        user.role === "CANDIDATE"
                          ? "text-secondary border-secondary/30"
                          : "text-primary border-primary/30"
                      }
                    >
                      {user.role === "CANDIDATE" ? "Candidate" : "Company"}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Company Verification</h3>
          <div className="space-y-3">
            {Object.entries(stats.companiesByVerification).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <Badge
                  variant="outline"
                  className={
                    status === "VERIFIED"
                      ? "text-green-700 border-green-200 bg-green-50"
                      : status === "REJECTED"
                        ? "text-red-700 border-red-200 bg-red-50"
                        : status === "PENDING"
                          ? "text-yellow-700 border-yellow-200 bg-yellow-50"
                          : "text-slate-500 border-slate-200"
                  }
                >
                  {status}
                </Badge>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
