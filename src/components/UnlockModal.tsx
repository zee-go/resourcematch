import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Unlock,
  CheckCircle2,
  Mail,
  Phone,
  FileText,
  Shield,
  Clock,
  Users,
  Download,
  Sparkles,
  CreditCard,
  Building2,
  X
} from "lucide-react";

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    title: string;
    avatar: string;
    hourlyRate: string;
    matchScore?: number;
  };
  onUnlockSuccess: (candidateId: string, contactInfo: {
    email: string;
    phone: string;
    fullName: string;
  }) => void;
}

export function UnlockModal({ isOpen, onClose, candidate, onUnlockSuccess }: UnlockModalProps) {
  const [step, setStep] = useState<"payment" | "success">("payment");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const contactInfo = {
    email: `${candidate.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    phone: "+63 917 123 4567",
    fullName: candidate.name,
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setStep("success");

    // Notify parent component
    setTimeout(() => {
      onUnlockSuccess(candidate.id, contactInfo);
    }, 2000);
  };

  const handleClose = () => {
    setStep("payment");
    setFormData({ cardNumber: "", expiry: "", cvv: "", name: "" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {step === "payment" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Unlock Candidate Profile</DialogTitle>
            </DialogHeader>

            {/* Candidate Preview */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-xl">
                {candidate.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <p className="text-slate-600 text-sm">{candidate.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {candidate.hourlyRate}
                  </Badge>
                  {candidate.matchScore && (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-xs">
                      ⭐ {candidate.matchScore}% Match
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">What You'll Get:</h4>
              <div className="grid gap-2">
                {[
                  { icon: Mail, text: "Full contact information (email & phone)" },
                  { icon: FileText, text: "Complete resume and work history" },
                  { icon: Users, text: "Verified manager references" },
                  { icon: Shield, text: "Personality assessment & DISC profile" },
                  { icon: Clock, text: "30-day contact guarantee" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700">One-time payment</span>
                <span className="text-3xl font-bold text-teal-600">$3</span>
              </div>
              <p className="text-xs text-slate-600">Instant access • No subscription required</p>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, cardNumber: e.target.value })
                    }
                    required
                    disabled={isProcessing}
                    className="pl-10"
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={formData.expiry}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry: e.target.value })
                    }
                    required
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    required
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Cardholder Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isProcessing}
                />
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3 pt-2">
                {[
                  { icon: Shield, text: "Secure Payment" },
                  { icon: CheckCircle2, text: "No Setup Fees" },
                  { icon: Building2, text: "Trusted by 200+ Companies" },
                ].map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    <badge.icon className="w-4 h-4 text-teal-600" />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Profile for $3
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Profile Unlocked Successfully!
              </h3>
              <p className="text-slate-600 mb-6">
                You now have full access to {candidate.name}'s complete profile
              </p>

              {/* Contact Information Revealed */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border-2 border-green-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-teal-600" />
                    <span className="text-sm text-slate-600">Email:</span>
                  </div>
                  <span className="font-semibold text-slate-900">{contactInfo.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-teal-600" />
                    <span className="text-sm text-slate-600">Phone:</span>
                  </div>
                  <span className="font-semibold text-slate-900">{contactInfo.phone}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-teal-300 hover:bg-teal-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Full Resume
                </Button>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                  onClick={() => {
                    handleClose();
                    window.location.href = `/profile/${candidate.id}`;
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}