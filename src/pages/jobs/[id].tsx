import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthProvider";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Send,
  ShieldCheck,
  Users,
  Building2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { verticalLabels, availabilityLabels } from "@/lib/candidates";

const employmentTypeMap: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatSalary(min: number | null, max: number | null): string | null {
  if (!min && !max) return null;
  if (min && max)
    return `$${min.toLocaleString()} - $${max.toLocaleString()}/mo`;
  if (min) return `From $${min.toLocaleString()}/mo`;
  return `Up to $${max!.toLocaleString()}/mo`;
}

interface JobDetailData {
  id: string;
  title: string;
  description: string;
  vertical: string;
  experienceMin: number;
  experienceMax: number | null;
  availability: string;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  location: string | null;
  status: string;
  expiresAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  company: {
    id: string;
    companyName: string | null;
    verified: boolean;
    industry: string | null;
    companySize: string | null;
  };
  _count: {
    applications: number;
  };
}

interface JobDetailProps {
  job: JobDetailData;
}

export const getServerSideProps: GetServerSideProps<JobDetailProps> = async (
  context
) => {
  const { id } = context.params!;

  if (!id || typeof id !== "string") {
    return { notFound: true };
  }

  try {
    const { prisma } = await import("@/lib/prisma");

    const job = await prisma.job.findUnique({
      where: { id },
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
    });

    if (!job) {
      return { notFound: true };
    }

    const serialized: JobDetailData = {
      id: job.id,
      title: job.title,
      description: job.description,
      vertical: job.vertical,
      experienceMin: job.experienceMin,
      experienceMax: job.experienceMax,
      availability: job.availability,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      skills: job.skills,
      location: job.location,
      status: job.status,
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
    };

    return {
      props: JSON.parse(JSON.stringify({ job: serialized })),
    };
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return { notFound: true };
  }
};

export default function JobDetail({ job }: JobDetailProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const companyName = job.company.companyName || "Company";

  const handleApply = async () => {
    setSubmitting(true);
    setApplyError(null);

    try {
      const res = await fetch(`/api/jobs/${job.id}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverLetter: coverLetter || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }

      setApplied(true);
      setShowApplyForm(false);
    } catch (err: any) {
      setApplyError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Build JSON-LD structured data for Google Jobs
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt,
    ...(job.expiresAt && { validThrough: job.expiresAt }),
    employmentType: employmentTypeMap[job.availability] || "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
    },
    jobLocation: {
      "@type": "Place",
      address: job.location || "Remote",
    },
    ...(salary && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "USD",
        value: {
          "@type": "QuantitativeValue",
          ...(job.salaryMin && { minValue: job.salaryMin }),
          ...(job.salaryMax && { maxValue: job.salaryMax }),
          unitText: "MONTH",
        },
      },
    }),
  };

  return (
    <>
      <SEO
        title={`${job.title} at ${companyName} — ResourceMatch`}
        description={`${job.title} position at ${companyName}. ${verticalLabels[job.vertical] || job.vertical} role requiring ${job.experienceMin}+ years experience. Apply now on ResourceMatch.`}
        url={`https://resourcematch.ph/jobs/${job.id}`}
      />

      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

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
                <div className="mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{companyName}</span>
                    {job.company.verified && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Meta badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-light text-primary"
                  >
                    {verticalLabels[job.vertical] || job.vertical}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {availabilityLabels[job.availability] || job.availability}
                  </Badge>
                  <Badge variant="outline">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {job.experienceMin}
                    {job.experienceMax
                      ? `-${job.experienceMax}`
                      : "+"}{" "}
                    years
                  </Badge>
                  {job.location && (
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location}
                    </Badge>
                  )}
                </div>

                {/* Posted date & applicant count */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  {job.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Posted {formatDate(job.publishedAt)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {job._count.applications} applicant
                    {job._count.applications !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Job Description
                </h2>
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </div>

              {/* Required Skills */}
              {job.skills.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Required Skills
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

              {/* Salary & Experience */}
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Compensation & Requirements
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {salary && (
                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Salary Range
                        </p>
                        <p className="text-primary font-semibold">
                          {salary}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Experience Required
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {job.experienceMin}
                        {job.experienceMax
                          ? `-${job.experienceMax}`
                          : "+"}{" "}
                        years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                    <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Work Type
                      </p>
                      <p className="text-slate-900 font-semibold">
                        {availabilityLabels[job.availability] ||
                          job.availability}
                      </p>
                    </div>
                  </div>
                  {job.location && (
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Location
                        </p>
                        <p className="text-slate-900 font-semibold">
                          {job.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Apply Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Apply for this Position
                </h2>

                {applied ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      Application Submitted!
                    </h3>
                    <p className="text-green-700 text-sm">
                      Your application has been sent to {companyName}. You will
                      be notified when they review it.
                    </p>
                  </div>
                ) : user?.role === "CANDIDATE" ? (
                  <>
                    {!showApplyForm ? (
                      <Button
                        size="lg"
                        onClick={() => setShowApplyForm(true)}
                        className="bg-primary hover:bg-primary-dark text-white font-semibold"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Apply Now
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="coverLetter"
                            className="block text-sm font-medium text-slate-700 mb-2"
                          >
                            Cover Letter{" "}
                            <span className="text-slate-400">(optional)</span>
                          </label>
                          <Textarea
                            id="coverLetter"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Tell the employer why you're a great fit for this role..."
                            rows={6}
                            className="resize-none"
                          />
                        </div>

                        {applyError && (
                          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {applyError}
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={handleApply}
                            disabled={submitting}
                            className="bg-primary hover:bg-primary-dark text-white font-semibold"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Application
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setShowApplyForm(false);
                              setApplyError(null);
                            }}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : user?.role === "COMPANY" ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-600">
                      This is a candidate-facing feature. Companies can browse
                      applications from their{" "}
                      <Link
                        href="/dashboard"
                        className="text-primary underline font-medium"
                      >
                        dashboard
                      </Link>
                      .
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                    <p className="text-slate-600 mb-4">
                      Join as a professional to apply for this position.
                    </p>
                    <Link href="/apply">
                      <Button className="bg-primary hover:bg-primary-dark text-white font-semibold">
                        Join as a Professional
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                  About the Company
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 font-medium">
                      {companyName}
                    </span>
                    {job.company.verified && (
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  {job.company.industry && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {job.company.industry}
                    </div>
                  )}
                  {job.company.companySize && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4 text-slate-400" />
                      {job.company.companySize === "SOLO"
                        ? "1 employee"
                        : job.company.companySize === "SMALL"
                        ? "2-10 employees"
                        : job.company.companySize === "MEDIUM"
                        ? "11-50 employees"
                        : job.company.companySize === "LARGE"
                        ? "51-200 employees"
                        : job.company.companySize === "ENTERPRISE"
                        ? "200+ employees"
                        : job.company.companySize}
                    </div>
                  )}
                </div>
              </div>

              {/* Hiring CTA Card */}
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-2">
                  Hiring? Post your job for free
                </h3>
                <p className="text-green-100 text-sm mb-4">
                  Reach senior Filipino professionals vetted by AI across
                  accounting, finance, and operations management.
                </p>
                <Link href="/jobs/post">
                  <Button
                    size="sm"
                    className="bg-white text-primary hover:bg-light font-semibold w-full"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Post a Job
                  </Button>
                </Link>
              </div>

              {/* Job expires notice */}
              {job.expiresAt && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        Expires on
                      </p>
                      <p className="text-sm text-amber-700">
                        {formatDate(job.expiresAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
