import { useState } from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ApplicationCard } from "@/components/jobs/ApplicationCard";
import { UnlockModal } from "@/components/UnlockModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { JobApplicationData } from "@/lib/job-types";
import {
  Briefcase,
  Users,
  Clock,
  Plus,
  Edit3,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  FileText,
} from "lucide-react";

interface JobWithApplications {
  id: string;
  title: string;
  status: "DRAFT" | "OPEN" | "CLOSED";
  vertical: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  _count: {
    applications: number;
  };
  applications: JobApplicationData[];
}

interface ManageJobsProps {
  jobs: JobWithApplications[];
  isVerified: boolean;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700",
  },
  OPEN: {
    label: "Open",
    className: "bg-green-100 text-green-700",
  },
  CLOSED: {
    label: "Closed",
    className: "bg-red-100 text-red-700",
  },
};

const verticalLabels: Record<string, string> = {
  ecommerce: "Operations Management",
  accounting: "Accounting & Finance",
};

export const getServerSideProps: GetServerSideProps<ManageJobsProps> = async (
  context
) => {
  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    if (!session?.user?.id) {
      return {
        redirect: {
          destination: "/login?redirect=/jobs/manage",
          permanent: false,
        },
      };
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return {
        props: { jobs: [], isVerified: false },
      };
    }

    const isVerified = company.verificationStatus === "VERIFIED";

    // Fetch company's jobs with applications and candidate details
    const dbJobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                fullName: true,
                title: true,
                avatar: true,
                vertical: true,
                experience: true,
                skills: true,
                location: true,
                vettingScore: true,
                verified: true,
                summary: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Check which candidates are unlocked by this company
    const candidateIds = dbJobs.flatMap((j) =>
      j.applications.map((a) => a.candidateId)
    );
    const unlocks = await prisma.unlock.findMany({
      where: {
        companyId: company.id,
        candidateId: { in: candidateIds },
      },
      select: { candidateId: true },
    });
    const unlockedSet = new Set(unlocks.map((u) => u.candidateId));

    const jobs: JobWithApplications[] = dbJobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status as "DRAFT" | "OPEN" | "CLOSED",
      vertical: job.vertical,
      publishedAt: job.publishedAt?.toISOString() || null,
      expiresAt: job.expiresAt?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
      _count: { applications: job._count.applications },
      applications: job.applications.map((app) => ({
        id: app.id,
        coverLetter: app.coverLetter,
        status: app.status as JobApplicationData["status"],
        createdAt: app.createdAt.toISOString(),
        candidate: {
          id: app.candidate.id,
          name: app.candidate.name,
          fullName: app.candidate.fullName,
          title: app.candidate.title,
          avatar: app.candidate.avatar,
          vertical: app.candidate.vertical,
          experience: app.candidate.experience,
          skills: app.candidate.skills,
          location: app.candidate.location,
          vettingScore: app.candidate.vettingScore,
          verified: app.candidate.verified,
          summary: app.candidate.summary,
        },
        isUnlocked: unlockedSet.has(app.candidateId),
        isVetted: app.candidate.verified && app.candidate.vettingScore >= 70,
      })),
    }));

    return {
      props: { jobs: JSON.parse(JSON.stringify(jobs)), isVerified },
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return { props: { jobs: [], isVerified: false } };
  }
};

export default function ManageJobs({ jobs: initialJobs, isVerified }: ManageJobsProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [togglingJob, setTogglingJob] = useState<string | null>(null);

  // Unlock modal state
  const [unlockCandidate, setUnlockCandidate] = useState<{
    id: number;
    name: string;
    title: string;
    avatar: string;
    vettingScore?: number;
  } | null>(null);

  const now = new Date();

  // Calculate stats
  const activeJobs = jobs.filter(
    (j) =>
      j.status === "OPEN" &&
      (!j.expiresAt || new Date(j.expiresAt) > now)
  ).length;
  const totalApplications = jobs.reduce(
    (sum, j) => sum + j._count.applications,
    0
  );
  const pendingReview = jobs.reduce(
    (sum, j) =>
      sum +
      j.applications.filter((a) => a.status === "PENDING").length,
    0
  );

  const toggleExpand = (jobId: string) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [jobId]: !prev[jobId],
    }));
  };

  const getDisplayStatus = (job: JobWithApplications) => {
    if (
      job.status === "OPEN" &&
      job.expiresAt &&
      new Date(job.expiresAt) < now
    ) {
      return "EXPIRED";
    }
    return job.status;
  };

  const getStatusBadge = (displayStatus: string) => {
    if (displayStatus === "EXPIRED") {
      return (
        <Badge className="bg-yellow-100 text-yellow-700">Expired</Badge>
      );
    }
    const config = statusConfig[displayStatus] || statusConfig.DRAFT;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleToggleStatus = async (
    jobId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    setTogglingJob(jobId);

    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update job status");
      }

      const data = await res.json();
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                status: data.job.status,
                publishedAt: data.job.publishedAt,
                expiresAt: data.job.expiresAt,
              }
            : j
        )
      );
    } catch (err) {
      console.error("Failed to toggle job status:", err);
    } finally {
      setTogglingJob(null);
    }
  };

  const handleApplicationStatusChange = async (
    applicationId: string,
    status: string
  ) => {
    // Find which job has this application
    const job = jobs.find((j) =>
      j.applications.some((a) => a.id === applicationId)
    );
    if (!job) return;

    try {
      const res = await fetch(
        `/api/jobs/${job.id}/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update application status");
      }

      // Update local state
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? {
                ...j,
                applications: j.applications.map((a) =>
                  a.id === applicationId
                    ? { ...a, status: status as JobApplicationData["status"] }
                    : a
                ),
              }
            : j
        )
      );
    } catch (err) {
      console.error("Failed to update application:", err);
    }
  };

  const handleUnlock = (candidateId: number) => {
    // Find the candidate across all job applications
    for (const job of jobs) {
      const app = job.applications.find(
        (a) => a.candidate.id === candidateId
      );
      if (app) {
        setUnlockCandidate({
          id: app.candidate.id,
          name: app.candidate.name,
          title: app.candidate.title,
          avatar: app.candidate.avatar,
          vettingScore: app.candidate.vettingScore,
        });
        break;
      }
    }
  };

  const handleUnlockSuccess = () => {
    // Mark the candidate as unlocked in local state
    if (unlockCandidate) {
      setJobs((prev) =>
        prev.map((j) => ({
          ...j,
          applications: j.applications.map((a) =>
            a.candidate.id === unlockCandidate.id
              ? { ...a, isUnlocked: true }
              : a
          ),
        }))
      );
    }
    setUnlockCandidate(null);
  };

  return (
    <>
      <SEO
        title="My Jobs — ResourceMatch"
        description="Manage your job listings and review applications from AI-vetted professionals on ResourceMatch."
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Verification Banner */}
          {!isVerified && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  Your company is not yet verified.
                </p>
                <p className="text-xs text-amber-700">
                  Verify your company to post jobs and attract top talent.
                </p>
              </div>
              <Link href="/jobs/post">
                <Button
                  size="sm"
                  className="bg-[#04443C] hover:bg-[#022C27] text-white shrink-0"
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  Verify Now
                </Button>
              </Link>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                My Jobs
              </h1>
              <p className="text-slate-600">
                Manage your job listings and review applications
              </p>
            </div>
            <Link href="/jobs/post">
              <Button className="bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Post a Job
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Active Jobs</span>
                <Briefcase className="w-5 h-5 text-[#04443C]" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {activeJobs}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Currently open positions
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Total Applications
                </span>
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {totalApplications}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Across all job listings
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  Pending Review
                </span>
                <Clock className="w-5 h-5 text-[#D38B53]" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {pendingReview}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Applications awaiting review
              </p>
            </div>
          </div>

          {/* Job List */}
          {jobs.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No jobs posted yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Post your first job to start receiving applications from
                AI-vetted senior professionals.
              </p>
              <Link href="/jobs/post">
                <Button className="bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const displayStatus = getDisplayStatus(job);
                const isExpanded = expandedJobs[job.id] || false;

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* Job Row */}
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900 truncate">
                            {job.title}
                          </h3>
                          {getStatusBadge(displayStatus)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>
                            {verticalLabels[job.vertical] || job.vertical}
                          </span>
                          {job.publishedAt && (
                            <span>
                              Published{" "}
                              {new Date(job.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {job._count.applications} application
                            {job._count.applications !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/jobs/${job.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>

                        {job.status !== "DRAFT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(job.id, job.status)
                            }
                            disabled={togglingJob === job.id}
                            className={
                              job.status === "OPEN"
                                ? "border-red-300 text-red-600 hover:bg-red-50"
                                : "border-green-300 text-green-600 hover:bg-green-50"
                            }
                          >
                            {togglingJob === job.id ? (
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : job.status === "OPEN" ? (
                              "Close"
                            ) : (
                              "Reopen"
                            )}
                          </Button>
                        )}

                        {job._count.applications > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(job.id)}
                            className="text-slate-500"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Applications */}
                    {isExpanded && job.applications.length > 0 && (
                      <div className="border-t border-slate-200 bg-slate-50 p-4 space-y-3">
                        <h4 className="text-sm font-medium text-slate-700 mb-2">
                          Applications ({job.applications.length})
                        </h4>
                        {job.applications.map((app) => (
                          <ApplicationCard
                            key={app.id}
                            application={app}
                            onStatusChange={
                              handleApplicationStatusChange
                            }
                            onUnlock={handleUnlock}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Unlock Modal */}
      {unlockCandidate && (
        <UnlockModal
          isOpen={!!unlockCandidate}
          onClose={() => setUnlockCandidate(null)}
          candidate={unlockCandidate}
          onUnlockSuccess={handleUnlockSuccess}
        />
      )}
    </>
  );
}
