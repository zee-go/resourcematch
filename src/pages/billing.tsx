import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";
import {
  CreditCard,
  Coins,
  Clock,
  ExternalLink,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface CreditPurchase {
  id: string;
  credits: number;
  amountCents: number;
  type: string;
  createdAt: string;
}

export default function BillingPage() {
  const router = useRouter();
  const { user, company, loading: authLoading } = useAuth();
  const [purchases, setPurchases] = useState<CreditPurchase[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/billing");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/credits/history")
        .then((r) => r.json())
        .then((data) => setPurchases(data.purchases || []))
        .catch(() => {})
        .finally(() => setLoadingHistory(false));
    }
  }, [user]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/payments/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // ignore
    } finally {
      setPortalLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Billing - ResourceMatch"
        description="Manage your ResourceMatch credits, subscription, and billing."
      />

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-6">Billing</h1>

          {/* Credit Balance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Credit Balance</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {company?.credits ?? 0}
                  </p>
                </div>
              </div>
              <Link href="/hire">
                <Button className="bg-[#04443C] hover:bg-[#022C27] text-white">
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Subscription</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {company?.subscriptionTier
                      ? `${company.subscriptionTier} Plan`
                      : "No active subscription"}
                  </p>
                  {company?.subscriptionTier && (
                    <p className="text-sm text-slate-500">
                      {company.monthlyUnlocksUsed}/{company.monthlyUnlocksLimit}{" "}
                      monthly unlocks used
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {company?.subscriptionTier ? (
                  <Button
                    variant="outline"
                    onClick={openPortal}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Manage
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Link href="/hire">
                    <Button variant="outline">View Plans</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${company?.verified ? "bg-green-100" : "bg-slate-100"}`}
              >
                <ShieldCheck
                  className={`w-5 h-5 ${company?.verified ? "text-green-600" : "text-slate-400"}`}
                />
              </div>
              <div>
                <p className="text-sm text-slate-600">Company Verification</p>
                <p className="text-lg font-semibold text-slate-900">
                  {company?.verified ? "Verified" : "Not Verified"}
                </p>
                {!company?.verified && (
                  <p className="text-sm text-slate-500">
                    Verify your company to unlock profiles
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Purchase History
            </h2>

            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : purchases.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No purchases yet.{" "}
                <Link
                  href="/hire"
                  className="text-[#04443C] font-semibold hover:underline"
                >
                  Buy your first credits
                </Link>
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {purchases.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {p.credits} credit{p.credits > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(p.createdAt).toLocaleDateString()} &middot;{" "}
                        {p.type === "CREDIT_PACK"
                          ? "Credit Pack"
                          : "Subscription"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      ${(p.amountCents / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
