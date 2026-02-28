import Link from "next/link";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PaymentSuccess() {
  const router = useRouter();
  const sessionId = router.query.session_id;

  return (
    <>
      <SEO
        title="Payment Successful - ResourceMatch"
        description="Your payment was processed successfully."
      />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Payment Successful
            </h1>
            <p className="text-slate-600 mb-6">
              Your credits have been added to your account. You can now unlock
              senior professional profiles.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/dashboard">
                <Button className="w-full bg-[#04443C] hover:bg-[#022C27] text-white">
                  Browse Candidates
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/billing">
                <Button variant="outline" className="w-full">
                  View Billing
                </Button>
              </Link>
            </div>

            {sessionId && (
              <p className="mt-4 text-xs text-slate-400">
                Session: {String(sessionId).slice(0, 20)}...
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
