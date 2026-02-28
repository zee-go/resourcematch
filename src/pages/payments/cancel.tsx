import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowRight } from "lucide-react";

export default function PaymentCancel() {
  return (
    <>
      <SEO
        title="Payment Cancelled - ResourceMatch"
        description="Your payment was cancelled."
      />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-slate-400" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-slate-600 mb-6">
              No charges were made. You can try again whenever you're ready.
            </p>

            <div className="flex flex-col gap-3">
              <Link href="/hire">
                <Button className="w-full bg-[#04443C] hover:bg-[#022C27] text-white">
                  View Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
