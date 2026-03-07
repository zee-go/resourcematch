import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { GetServerSideProps } from "next";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import { trackExternalJobView, trackExternalJobClick, trackExternalJobSignupCTA } from "@/lib/analytics";
import { verticalLabels, availabilityLabels, sourceLabels } from "@/lib/candidates";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ExternalJobData {
  id: string;
  title: string;
  description: string;
  companyName: string;
  companyLogo: string | null;
  vertical: string | null;
  availability: string | null;
  salary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  location: string | null;
  publishedAt: string | null;
  sourceName: string;
  sourceUrl: string;
}

interface ExternalJobDetailProps {
  job: ExternalJobData;
}

export const getServerSideProps: GetServerSideProps<ExternalJobDetailProps> = async (
  context
) => {
  const { id } = context.params!;

  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const job = await prisma.externalJob.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        companyName: true,
        companyLogo: true,
        vertical: true,
        availability: true,
        salary: true,
        salaryMin: true,
        salaryMax: true,
        skills: true,
        location: true,
        publishedAt: true,
        sourceName: true,
        sourceUrl: true,
        status: true,
      },
    });

    if (!job || job.status !== "ACTIVE") {
      return { notFound: true };
    }

    return {
      props: JSON.parse(JSON.stringify({
        job: {
          id: job.id,
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          companyLogo: job.companyLogo,
          vertical: job.vertical,
          availability: job.availability,
          salary: job.salary,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          skills: job.skills,
          location: job.location,
          publishedAt: job.publishedAt?.toISOString() ?? null,
          sourceName: job.sourceName,
          sourceUrl: job.sourceUrl,
        },
      })),
    };
  } catch (error) {
    console.error("Failed to fetch external job:", error);
    return { notFound: true };
  }
};

export default function ExternalJobDetail({ job }: ExternalJobDetailProps) {
  const sourceName = sourceLabels[job.sourceName] || job.sourceName;

  useEffect(() => {
    trackExternalJobView(job.sourceName, job.id);
  }, [job.sourceName, job.id]);

  const handleApplyClick = () => {
    trackExternalJobClick(job.sourceName, job.id);
  };

  return (
    <>
      <SEO
        title={`${job.title} at ${job.companyName} — ResourceMatch`}
        description={`${job.title} at ${job.companyName}. Remote opportunity sourced via ${sourceName}. Browse more jobs on ResourceMatch.`}
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        {/* Back navigation */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 max-w-7xl py-3">
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="text-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 max-w-7xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <div className="flex items-start gap-4 mb-4">
                  {job.companyLogo && (
                    <Image
                      src={job.companyLogo}
                      alt={job.companyName}
                      width={48}
                      height={48}
                      className="rounded-lg"
                      unoptimized
                    />
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                      {job.title}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-medium">{job.companyName}</span>
                      <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        via {sourceName}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.vertical && (
                    <Badge variant="secondary" className="bg-light text-primary">
                      {verticalLabels[job.vertical] || job.vertical}
                    </Badge>
                  )}
                  {job.availability && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {availabilityLabels[job.availability] || job.availability}
                    </Badge>
                  )}
                  {job.location && (
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </Badge>
                  )}
                  {job.salary && (
                    <Badge variant="outline" className="text-primary">
                      {job.salary}
                    </Badge>
                  )}
                </div>

                {job.publishedAt && (
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Posted {formatDate(job.publishedAt)}
                  </div>
                )}
              </div>

              {/* Description (HTML from Remotive) */}
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Job Description
                </h2>
                <div
                  className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>

              {/* Skills */}
              {job.skills.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Skills & Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-light text-primary border border-secondary/30 px-3 py-1.5 text-sm"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply externally */}
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Interested in this role?
                </h2>
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleApplyClick}
                >
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary-dark text-white font-semibold"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply on {sourceName}
                  </Button>
                </a>
                <p className="text-xs text-slate-400 mt-3">
                  This listing was sourced from {sourceName}. ResourceMatch does not manage applications for external listings.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* ResourceMatch CTA */}
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Get Matched</h3>
                </div>
                <p className="text-green-100 text-sm mb-4">
                  Join ResourceMatch to get AI-vetted and matched with top remote
                  opportunities from verified companies.
                </p>
                <Link
                  href="/apply"
                  onClick={() => trackExternalJobSignupCTA(job.sourceName)}
                >
                  <Button
                    size="sm"
                    className="bg-white text-primary hover:bg-light font-semibold w-full"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Join as a Professional
                  </Button>
                </Link>
              </div>

              {/* Post a job CTA */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  Hiring?
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Post your job for free and reach senior Filipino professionals vetted by AI.
                </p>
                <Link href="/jobs/post">
                  <Button variant="outline" size="sm" className="w-full">
                    Post a Job — Free
                  </Button>
                </Link>
              </div>

              {/* Source attribution */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs text-slate-500">
                  This listing was sourced from{" "}
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:underline"
                  >
                    {sourceName}
                  </a>
                  . Visit {sourceName.toLowerCase()}.com for more remote jobs.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
