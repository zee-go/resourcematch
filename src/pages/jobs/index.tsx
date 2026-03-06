import { useState } from "react";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { JobCard } from "@/components/jobs/JobCard";
import { JobSearchFilters } from "@/components/jobs/JobSearchFilters";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import type { JobSummary } from "@/lib/job-types";

interface JobBoardProps {
  jobs: JobSummary[];
  page: number;
  totalPages: number;
  total: number;
}

export const getServerSideProps: GetServerSideProps<JobBoardProps> = async (
  context
) => {
  try {
    const { prisma } = await import("@/lib/prisma");

    const page = Math.max(1, parseInt((context.query.page as string) || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt((context.query.limit as string) || "20", 10) || 20));
    const skip = (page - 1) * limit;

    const verticalFilter = context.query.vertical as string | undefined;
    const availabilityFilter = context.query.availability as string | undefined;
    const searchFilter = context.query.search as string | undefined;

    const now = new Date();

    // Build the where clause
    const where: any = {
      status: "OPEN",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    };

    if (verticalFilter && verticalFilter !== "all") {
      where.vertical = verticalFilter;
    }

    if (availabilityFilter && availabilityFilter !== "all") {
      where.availability = availabilityFilter;
    }

    if (searchFilter && searchFilter.trim() !== "") {
      const term = searchFilter.trim();
      where.AND = [
        {
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { skills: { hasSome: [term] } },
          ],
        },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              verified: true,
              industry: true,
              companySize: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const serialized: JobSummary[] = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      vertical: job.vertical as "ecommerce" | "accounting",
      experienceMin: job.experienceMin,
      experienceMax: job.experienceMax,
      availability: job.availability,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      skills: job.skills,
      location: job.location,
      status: job.status as "DRAFT" | "OPEN" | "CLOSED",
      expiresAt: job.expiresAt?.toISOString() ?? null,
      publishedAt: job.publishedAt?.toISOString() ?? null,
      createdAt: job.createdAt.toISOString(),
      company: {
        id: job.company.id,
        companyName: job.company.companyName,
        verified: job.company.verified,
        industry: job.company.industry,
        companySize: job.company.companySize,
      },
      _count: {
        applications: job._count.applications,
      },
    }));

    return {
      props: JSON.parse(
        JSON.stringify({
          jobs: serialized,
          page,
          totalPages,
          total,
        })
      ),
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return {
      props: {
        jobs: [],
        page: 1,
        totalPages: 1,
        total: 0,
      },
    };
  }
};

export default function JobBoard({ jobs, page, totalPages, total }: JobBoardProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [vertical, setVertical] = useState("all");
  const [availability, setAvailability] = useState("all");

  // Client-side filtering of the server-fetched jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesVertical =
      vertical === "all" || job.vertical === vertical;

    const matchesAvailability =
      availability === "all" || job.availability === availability;

    return matchesSearch && matchesVertical && matchesAvailability;
  });

  return (
    <>
      <SEO
        title="Jobs — Senior Filipino Professionals | ResourceMatch"
        description="Browse open positions for senior Filipino professionals. Find full-time, part-time, and contract roles in accounting, finance, and operations management."
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="container mx-auto px-4 max-w-7xl py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Browse Open Positions
                  </h1>
                </div>
                <p className="text-green-100 text-lg max-w-xl">
                  Find your next opportunity with verified companies
                </p>
                {total > 0 && (
                  <p className="text-green-200 text-sm mt-2">
                    {total} open position{total !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* CTA based on user state */}
              {user?.role === "COMPANY" ? (
                <Link href="/jobs/post">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-light font-semibold"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post a Job — It&apos;s Free
                  </Button>
                </Link>
              ) : !user ? (
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-light font-semibold"
                  >
                    Sign up to apply
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 max-w-7xl py-8">
          {/* Filters */}
          <JobSearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            vertical={vertical}
            setVertical={setVertical}
            availability={availability}
            setAvailability={setAvailability}
          />

          {/* Job Grid */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No jobs found
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Try adjusting your search filters or check back later for new
                opportunities.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Link
                href={{
                  pathname: "/jobs",
                  query: { page: Math.max(1, page - 1) },
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  className="border-slate-300"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              </Link>

              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>

              <Link
                href={{
                  pathname: "/jobs",
                  query: { page: Math.min(totalPages, page + 1) },
                }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  className="border-slate-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
