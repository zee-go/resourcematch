import { useState } from "react";
import { useRouter } from "next/router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthProvider";
import {
  Unlock,
  CheckCircle2,
  Mail,
  Phone,
  FileText,
  Shield,
  ShieldCheck,
  Clock,
  Users,
  Download,
  Sparkles,
  AlertCircle,
  CreditCard,
  Coins,
} from "lucide-react";

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: number;
    name: string;
    title: string;
    avatar: string;
    vettingScore?: number;
  };
  onUnlockSuccess: (contactInfo: {
    email: string;
    phone: string;
    fullName: string;
  }) => void;
}

export function UnlockModal({ isOpen, onClose, candidate, onUnlockSuccess }: UnlockModalProps) {
  const router = useRouter();
  const { user, company, refreshCompany } = useAuth();
  const [step, setStep] = useState<"confirm" | "success" | "error">("confirm");
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ email: string; phone: string; fullName: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorAction, setErrorAction] = useState("");

  const credits = company?.credits ?? 0;
  const hasSubscription = company?.subscriptionTier && company?.subscriptionStatus === "ACTIVE";
  const subscriptionUnlocksLeft = hasSubscription && company?.monthlyUnlocksLimit
    ? company.monthlyUnlocksLimit - company.monthlyUnlocksUsed
    : hasSubscription && company?.subscriptionTier === "ENTERPRISE"
      ? Infinity
      : 0;
  const canUnlock = credits > 0 || (subscriptionUnlocksLeft ?? 0) > 0;

  const handleUnlock = async () => {
    if (!user) {
      router.push(`/login?redirect=/profile/${candidate.id}`);
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/unlocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setErrorMessage(data.message || "You need credits to unlock profiles.");
          setErrorAction("buy_credits");
          setStep("error");
        } else if (res.status === 403) {
          setErrorMessage(data.message || "Unable to unlock this profile.");
          setErrorAction(data.action || "");
          setStep("error");
        } else if (res.status === 409) {
          // Already unlocked — just redirect
          router.push(`/profile/${candidate.id}`);
          handleClose();
        } else {
          setErrorMessage(data.error || "Something went wrong. Please try again.");
          setStep("error");
        }
        return;
      }

      // Success
      const { unlock } = data;
      const info = {
        email: unlock.candidate.email || "",
        phone: unlock.candidate.phone || "",
        fullName: unlock.candidate.fullName || candidate.name,
      };
      setContactInfo(info);
      setStep("success");

      // Refresh credit balance
      await refreshCompany();

      // Notify parent
      onUnlockSuccess(info);
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setErrorMessage("");
    setErrorAction("");
    setContactInfo(null);
    onClose();
  };

  const handleBuyCredits = () => {
    handleClose();
    router.push("/hire");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Unlock Candidate Profile</DialogTitle>
            </DialogHeader>

            {/* Candidate Preview */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#04443C] to-[#022C27] flex items-center justify-center text-white font-semibold text-xl">
                {candidate.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <p className="text-slate-600 text-sm">{candidate.title}</p>
                {candidate.vettingScore && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-[#04443C] hover:bg-green-100 text-xs">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {candidate.vettingScore}/100 Vetted
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* What You'll Get */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">What You&apos;ll Get:</h4>
              <div className="grid gap-2">
                {[
                  { icon: Mail, text: "Full contact information (email & phone)" },
                  { icon: FileText, text: "Complete resume and work history" },
                  { icon: Users, text: "Verified references" },
                  { icon: Shield, text: "AI vetting results and scores" },
                  { icon: Clock, text: "30-day contact guarantee" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-[#04443C]" />
                    </div>
                    <span className="text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Balance */}
            {user ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-[#04443C]" />
                    <span className="text-slate-700 font-medium">Your Balance</span>
                  </div>
                  <span className="text-lg font-bold text-[#04443C]">
                    {credits} credit{credits !== 1 ? "s" : ""}
                  </span>
                </div>
                {hasSubscription && (
                  <p className="text-xs text-slate-600">
                    {company?.subscriptionTier === "ENTERPRISE"
                      ? "Unlimited unlocks (Enterprise plan)"
                      : `${subscriptionUnlocksLeft} subscription unlocks remaining this month`}
                  </p>
                )}
                {!canUnlock && (
                  <p className="text-xs text-red-600 mt-1">
                    Not enough credits. Purchase a credit pack to continue.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm text-slate-600 text-center">
                  Sign in to unlock this profile
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                { icon: Shield, text: "Secure & Instant" },
                { icon: CheckCircle2, text: "Credits Never Expire" },
                { icon: CreditCard, text: "Powered by Stripe" },
              ].map((badge, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                  <badge.icon className="w-4 h-4 text-[#04443C]" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user ? (
                canUnlock ? (
                  <Button
                    onClick={handleUnlock}
                    className="w-full bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white shadow-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Profile (1 Credit)
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleBuyCredits}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Buy Credits to Unlock
                  </Button>
                )
              ) : (
                <Button
                  onClick={() => router.push(`/login?redirect=/profile/${candidate.id}`)}
                  className="w-full bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white shadow-lg"
                >
                  Sign In to Unlock
                </Button>
              )}
            </div>
          </>
        )}

        {step === "success" && contactInfo && (
          <>
            {/* Success State */}
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Profile Unlocked!
              </h3>
              <p className="text-slate-600 mb-6">
                You now have full access to {contactInfo.fullName}&apos;s complete profile
              </p>

              {/* Contact Information */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border-2 border-green-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#04443C]" />
                    <span className="text-sm text-slate-600">Email:</span>
                  </div>
                  <a href={`mailto:${contactInfo.email}`} className="font-semibold text-slate-900 hover:text-[#04443C]">
                    {contactInfo.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#04443C]" />
                    <span className="text-sm text-slate-600">Phone:</span>
                  </div>
                  <span className="font-semibold text-slate-900">{contactInfo.phone}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-green-300 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Resume
                </Button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white"
                  onClick={() => {
                    handleClose();
                    router.push(`/profile/${candidate.id}`);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "error" && (
          <>
            {/* Error State */}
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Unable to Unlock
              </h3>
              <p className="text-slate-600 mb-6">{errorMessage}</p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("confirm")} className="flex-1">
                  Go Back
                </Button>
                {errorAction === "buy_credits" && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    onClick={handleBuyCredits}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Buy Credits
                  </Button>
                )}
                {errorAction === "verify" && (
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#04443C] to-[#022C27] text-white"
                    onClick={() => {
                      handleClose();
                      router.push("/billing");
                    }}
                  >
                    Complete Verification
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
