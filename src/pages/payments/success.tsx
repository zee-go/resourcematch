import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { trackPurchaseComplete } from "@/lib/analytics";

export default function PaymentSuccess() {
  const router = useRouter();
  const sessionId = router.query.session_id;
  const returnTo = typeof router.query.returnTo === "string" ? router.query.returnTo : null;
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (sessionId) trackPurchaseComplete("credit_pack");
  }, [sessionId]);

  useEffect(() => {
    if (!returnTo || !router.isReady) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(returnTo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [returnTo, router.isReady, router]);

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
              Your credits have been added to your account.
              {returnTo
                ? ` Redirecting back in ${countdown}...`
                : " You can now unlock senior professional profiles."}
            </p>

            <div className="flex flex-col gap-3">
              {returnTo ? (
                <Link href={returnTo}>
                  <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                    Return to Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button className="w-full bg-primary hover:bg-primary-dark text-white">
                    Browse Candidates
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
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
