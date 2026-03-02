import { useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { JobForm } from "@/components/jobs/JobForm";

interface JobFormData {
  title: string;
  description: string;
  vertical: string;
  availability: string;
  experienceMin: string;
  experienceMax: string;
  salaryMin: string;
  salaryMax: string;
  skills: string[];
  location: string;
  expiresInDays: string;
}

interface EditJobProps {
  job: {
    id: string;
    title: string;
    description: string;
    vertical: string;
    availability: string;
    experienceMin: number;
    experienceMax: number | null;
    salaryMin: number | null;
    salaryMax: number | null;
    skills: string[];
    location: string | null;
    status: string;
    expiresAt: string | null;
  };
}

export const getServerSideProps: GetServerSideProps<EditJobProps> = async (
  context
) => {
  const { id } = context.params || {};

  if (!id || typeof id !== "string") {
    return {
      redirect: {
        destination: "/jobs/manage",
        permanent: false,
      },
    };
  }

  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    if (!session?.user?.id) {
      return {
        redirect: {
          destination: `/login?redirect=/jobs/${id}/edit`,
          permanent: false,
        },
      };
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return {
        redirect: {
          destination: "/jobs/manage",
          permanent: false,
        },
      };
    }

    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        companyId: true,
        title: true,
        description: true,
        vertical: true,
        availability: true,
        experienceMin: true,
        experienceMax: true,
        salaryMin: true,
        salaryMax: true,
        skills: true,
        location: true,
        status: true,
        expiresAt: true,
      },
    });

    if (!job) {
      return {
        redirect: {
          destination: "/jobs/manage",
          permanent: false,
        },
      };
    }

    // Verify ownership
    if (job.companyId !== company.id) {
      return {
        redirect: {
          destination: "/jobs/manage",
          permanent: false,
        },
      };
    }

    return {
      props: {
        job: JSON.parse(
          JSON.stringify({
            id: job.id,
            title: job.title,
            description: job.description,
            vertical: job.vertical,
            availability: job.availability,
            experienceMin: job.experienceMin,
            experienceMax: job.experienceMax,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            skills: job.skills,
            location: job.location,
            status: job.status,
            expiresAt: job.expiresAt,
          })
        ),
      },
    };
  } catch (error) {
    console.error("Failed to load job:", error);
    return {
      redirect: {
        destination: "/jobs/manage",
        permanent: false,
      },
    };
  }
};

export default function EditJob({ job }: EditJobProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute remaining days from expiresAt for the form default
  const computeExpiresInDays = () => {
    if (!job.expiresAt) return "90";
    const remaining = Math.ceil(
      (new Date(job.expiresAt).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24)
    );
    if (remaining <= 30) return "30";
    if (remaining <= 60) return "60";
    return "90";
  };

  const initialData: Partial<JobFormData> = {
    title: job.title,
    description: job.description,
    vertical: job.vertical,
    availability: job.availability,
    experienceMin: String(job.experienceMin),
    experienceMax: job.experienceMax ? String(job.experienceMax) : "",
    salaryMin: job.salaryMin ? String(job.salaryMin) : "",
    salaryMax: job.salaryMax ? String(job.salaryMax) : "",
    skills: job.skills,
    location: job.location || "Remote",
    expiresInDays: computeExpiresInDays(),
  };

  const handleSubmit = async (
    formData: JobFormData,
    status: "DRAFT" | "OPEN"
  ) => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update job");
      }

      router.push("/jobs/manage");
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    }
  };

  return (
    <>
      <SEO
        title="Edit Job — ResourceMatch"
        description="Edit your job listing on ResourceMatch."
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Edit Job
            </h1>
            <p className="text-slate-600">
              Update your job listing details. Changes will be reflected
              immediately.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <JobForm
              initialData={initialData}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              submitLabel="Update Job"
            />
          </div>
        </div>
      </div>
    </>
  );
}
