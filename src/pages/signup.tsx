import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Loader2,
  Mail,
  Lock,
  Building2,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { signIn } from "next-auth/react";

type Step = "credentials" | "company";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");

  // Step 1: Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Company Details
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [monthlyBudgetMin, setMonthlyBudgetMin] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setStep("company");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!companyName.trim() || !monthlyBudgetMin) {
      setError("Company name and monthly budget are required");
      setIsLoading(false);
      return;
    }

    // Register user + company via API
    const registerRes = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        companyName,
        companyWebsite,
        companySize,
        industry,
        monthlyBudgetMin: parseInt(monthlyBudgetMin),
      }),
    });

    if (!registerRes.ok) {
      const data = await registerRes.json();
      setError(data.error || "Registration failed");
      setIsLoading(false);
      return;
    }

    // Auto-login after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Account created but login failed. Please try logging in.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <>
      <SEO
        title="Sign Up - ResourceMatch"
        description="Create your ResourceMatch account to hire AI-vetted senior Filipino talent."
      />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#04443C] to-[#022C27] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">
                ResourceMatch
              </span>
            </Link>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex-1 h-1 rounded-full ${step === "credentials" || step === "company" ? "bg-[#04443C]" : "bg-slate-200"}`}
            />
            <div
              className={`flex-1 h-1 rounded-full ${step === "company" ? "bg-[#04443C]" : "bg-slate-200"}`}
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {step === "credentials" ? (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Create your account
                </h1>
                <p className="text-slate-600 mb-6">
                  Step 1: Set up your login credentials
                </p>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Use your business email for faster verification
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Company details
                </h1>
                <p className="text-slate-600 mb-6">
                  Step 2: Tell us about your company
                </p>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="companyName"
                        placeholder="Acme Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Company Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="companyWebsite"
                        placeholder="https://acme.com"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Matching your email domain to your website auto-verifies your account
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select
                      value={companySize}
                      onValueChange={setCompanySize}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SOLO">Solo / Freelancer</SelectItem>
                        <SelectItem value="SMALL">2-10 employees</SelectItem>
                        <SelectItem value="MEDIUM">11-50 employees</SelectItem>
                        <SelectItem value="LARGE">51-200 employees</SelectItem>
                        <SelectItem value="ENTERPRISE">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select
                      value={industry}
                      onValueChange={setIndustry}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ecommerce">E-commerce / Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance / Accounting</SelectItem>
                        <SelectItem value="saas">SaaS / Technology</SelectItem>
                        <SelectItem value="agency">Agency / Consulting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Monthly Hiring Budget <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={monthlyBudgetMin}
                      onValueChange={setMonthlyBudgetMin}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1500">$1,500 - $2,500/mo</SelectItem>
                        <SelectItem value="2500">$2,500 - $3,500/mo</SelectItem>
                        <SelectItem value="3500">$3,500 - $5,000/mo</SelectItem>
                        <SelectItem value="5000">$5,000+/mo</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      This ensures you're matched with professionals in your budget range
                    </p>
                  </div>

                  {/* Why we ask */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#04443C] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#04443C]">
                        We verify companies to protect our talent from lowball offers.
                        Verified employers get priority access and a trusted badge.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep("credentials");
                        setError("");
                      }}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-[#04443C] to-[#022C27] hover:from-[#022C27] hover:to-[#04443C] text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#04443C] font-semibold hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
