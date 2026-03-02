import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Briefcase,
  Calendar,
  Building2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import type { CandidateApplicationData } from "@/lib/job-types";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  SHORTLISTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  SHORTLISTED: "Shortlisted",
  REJECTED: "Not Selected",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CandidateApplicationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<CandidateApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/candidate/applications");
    }
  }, [authLoading, user, router]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/candidate/applications?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.data);
        setTotalPages(data.totalPages);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#04443C]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="My Applications — ResourceMatch"
        description="Track your job applications on ResourceMatch."
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        <div className="container mx-auto px-4 max-w-4xl py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            My Applications
          </h1>
          <p className="text-slate-600 mb-6">
            Track the status of your job applications.
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#04443C]" />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No applications yet
              </h3>
              <p className="text-slate-600 mb-4">
                Browse open positions and apply to get started.
              </p>
              <Link href="/jobs">
                <Button className="bg-[#04443C] hover:bg-[#022C27] text-white">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {applications.map((app) => (
                  <Link key={app.id} href={`/jobs/${app.job.id}`}>
                    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">
                            {app.job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{app.job.company.companyName || "Company"}</span>
                            {app.job.company.verified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Applied {formatDate(app.createdAt)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {app.job.vertical === "ecommerce"
                                ? "E-commerce"
                                : "Accounting"}
                            </Badge>
                          </div>
                        </div>

                        <Badge className={statusColors[app.status] || ""}>
                          {statusLabels[app.status] || app.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
