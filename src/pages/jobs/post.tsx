import { useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { JobForm } from "@/components/jobs/JobForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  Globe,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function PostJob() {
  const router = useRouter();
  const { user, company, loading, refreshCompany } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push("/login?redirect=/jobs/post");
    return null;
  }

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyError("");

    try {
      const res = await fetch("/api/companies/verify-ai", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setVerifyError(
          data.error || "Verification failed. Please try again later."
        );
        return;
      }

      // Refresh company data to pick up new verification status
      await refreshCompany();
    } catch {
      setVerifyError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (
    formData: {
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
    },
    status: "DRAFT" | "OPEN"
  ) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create job");
      }

      router.push("/jobs/manage");
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <SEO title="Post a Job — ResourceMatch" />
        <div className="min-h-screen bg-slate-50">
          <DashboardHeader />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#04443C] mx-auto" />
          </div>
        </div>
      </>
    );
  }

  // Verification gate
  const isVerified = company?.verificationStatus === "VERIFIED";

  return (
    <>
      <SEO
        title="Post a Job — ResourceMatch"
        description="Post a job to connect with AI-vetted senior Filipino professionals on ResourceMatch."
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isVerified ? (
            /* Verification Gate */
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#04443C] to-[#022C27] flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mb-3">
                Verify Your Company
              </h1>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                To protect our professionals from scams, we verify all companies
                before they can post jobs.
              </p>

              {!company?.companyWebsite ? (
                /* No website — prompt to add one */
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-amber-800">
                      Website Required
                    </span>
                  </div>
                  <p className="text-sm text-amber-700 mb-4">
                    Please add a company website to your profile so we can
                    verify your business.
                  </p>
                  <Link href="/billing">
                    <Button
                      variant="outline"
                      className="border-amber-400 text-amber-700 hover:bg-amber-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                </div>
              ) : isVerifying ? (
                /* Verifying state */
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#04443C]" />
                  <p className="text-slate-600">
                    Verifying your company...
                  </p>
                </div>
              ) : (
                /* Verify button */
                <Button
                  onClick={handleVerify}
                  className="bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white px-8 py-3 text-base"
                >
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verify My Company
                </Button>
              )}

              {verifyError && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-700">
                      Verification Failed
                    </span>
                  </div>
                  <p className="text-sm text-red-600">{verifyError}</p>
                  <p className="text-xs text-red-500 mt-2">
                    Contact support if you believe this is an error.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Job Form */
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  Post a Job
                </h1>
                <p className="text-slate-600">
                  Create a job listing to attract AI-vetted senior Filipino
                  professionals.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <JobForm onSubmit={handleSubmit} isLoading={isSubmitting} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
