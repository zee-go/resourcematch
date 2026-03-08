import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  UserCircle,
  Plus,
  X,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { LogoIcon } from "@/components/LogoIcon";
import { trackSignupStep, trackSignupComplete } from "@/lib/analytics";

type Role = "company" | "candidate";
type Step = "role" | "credentials" | "details";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<Role | null>(null);

  // Step 2: Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 3: Company Details
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [monthlyBudgetMin, setMonthlyBudgetMin] = useState("");

  // Step 3: Candidate Details
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [vertical, setVertical] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [tools, setTools] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setError("");
    setStep("credentials");
    trackSignupStep("role", selectedRole);
  };

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

    setStep("details");
    trackSignupStep("credentials", role || "");
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addTool = () => {
    const trimmed = toolInput.trim();
    if (trimmed && !tools.includes(trimmed)) {
      setTools([...tools, trimmed]);
    }
    setToolInput("");
  };

  const removeTool = (tool: string) => {
    setTools(tools.filter((t) => t !== tool));
  };

  const handleCompanySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!companyName.trim() || !monthlyBudgetMin) {
      setError("Company name and monthly budget are required");
      setIsLoading(false);
      return;
    }

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

    trackSignupStep("complete", "company");
    trackSignupComplete("company");
    router.push("/dashboard");
  };

  const handleCandidateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!fullName.trim() || !title.trim() || !vertical || !experience || !availability) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    const registerRes = await fetch("/api/auth/register-candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        fullName,
        title,
        vertical,
        experience: parseInt(experience),
        availability,
        skills,
        tools,
        location,
        summary,
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      }),
    });

    if (!registerRes.ok) {
      const data = await registerRes.json();
      setError(data.error || "Registration failed");
      setIsLoading(false);
      return;
    }

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

    trackSignupStep("complete", "candidate");
    trackSignupComplete("candidate");
    router.push("/jobs");
  };

  const stepIndex = step === "role" ? 0 : step === "credentials" ? 1 : 2;

  return (
    <>
      <SEO
        title="Sign Up - ResourceMatch"
        description="Create your ResourceMatch account to hire AI-vetted senior Filipino talent or showcase your professional skills."
        url="https://resourcematch.ph/signup"
      />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <LogoIcon className="w-10 h-10" color="accent" />
              <span className="text-2xl font-heading font-bold text-slate-900">
                ResourceMatch
              </span>
            </Link>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className={`flex-1 h-1 rounded-full ${stepIndex >= 0 ? "bg-primary" : "bg-slate-200"}`}
            />
            <div
              className={`flex-1 h-1 rounded-full ${stepIndex >= 1 ? "bg-primary" : "bg-slate-200"}`}
            />
            <div
              className={`flex-1 h-1 rounded-full ${stepIndex >= 2 ? "bg-primary" : "bg-slate-200"}`}
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {step === "role" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Join ResourceMatch
                </h1>
                <p className="text-slate-600 mb-6">
                  Step 1: How would you like to use ResourceMatch?
                </p>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("company")}
                    className="w-full text-left border-2 border-slate-200 rounded-xl p-5 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          I&apos;m Hiring
                        </h3>
                        <p className="text-sm text-slate-600">
                          Find senior Filipino talent for your team
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect("candidate")}
                    className="w-full text-left border-2 border-slate-200 rounded-xl p-5 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                        <UserCircle className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          I&apos;m a Professional
                        </h3>
                        <p className="text-sm text-slate-600">
                          Showcase your skills and find opportunities
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}

            {step === "credentials" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Create your account
                </h1>
                <p className="text-slate-600 mb-6">
                  Step 2: Set up your login credentials
                </p>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {role === "company" ? "Business Email" : "Email Address"}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={
                          role === "company"
                            ? "you@company.com"
                            : "you@email.com"
                        }
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                    {role === "company" && (
                      <p className="text-xs text-slate-500">
                        Use your business email for faster verification
                      </p>
                    )}
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

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep("role");
                        setError("");
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === "details" && role === "company" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Company details
                </h1>
                <p className="text-slate-600 mb-6">
                  Step 3: Tell us about your company
                </p>

                <form onSubmit={handleCompanySignup} className="space-y-4">
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
                        <SelectItem value="finance">Finance / Accounting</SelectItem>
                        <SelectItem value="saas">SaaS / Technology</SelectItem>
                        <SelectItem value="agency">Agency / Consulting</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing / Logistics</SelectItem>
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
                      This ensures you&apos;re matched with professionals in your budget range
                    </p>
                  </div>

                  {/* Why we ask */}
                  <div className="bg-light border border-green-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-primary">
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
                      className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white"
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

            {step === "details" && role === "candidate" && (
              <>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Professional profile
                </h1>
                <p className="text-slate-600 mb-6">
                  Step 3: Tell us about your experience
                </p>

                <form onSubmit={handleCandidateSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Juan dela Cruz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Professional Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Senior Accountant"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>
                        Vertical <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={vertical}
                        onValueChange={setVertical}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ecommerce">Operations Management</SelectItem>
                          <SelectItem value="accounting">Finance & Accounting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">
                        Years Exp. <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="experience"
                        type="number"
                        min="0"
                        max="50"
                        placeholder="e.g. 7"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Availability <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={availability}
                      onValueChange={setAvailability}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FULL_TIME">Full-time</SelectItem>
                        <SelectItem value="PART_TIME">Part-time</SelectItem>
                        <SelectItem value="CONTRACT">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skills tag input */}
                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Financial Reporting"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addSkill}
                        disabled={isLoading || !skillInput.trim()}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="pl-2.5 pr-1 py-1 gap-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-0.5 hover:bg-slate-300/50 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tools tag input */}
                  <div className="space-y-2">
                    <Label>Tools & Software</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. QuickBooks, Shopify"
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTool();
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addTool}
                        disabled={isLoading || !toolInput.trim()}
                        className="flex-shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tools.map((tool) => (
                          <Badge
                            key={tool}
                            variant="secondary"
                            className="pl-2.5 pr-1 py-1 gap-1"
                          >
                            {tool}
                            <button
                              type="button"
                              onClick={() => removeTool(tool)}
                              className="ml-0.5 hover:bg-slate-300/50 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. Manila, Philippines"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      placeholder="Brief overview of your experience and expertise..."
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      disabled={isLoading}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin">Min Salary (USD/mo)</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        min="0"
                        placeholder="e.g. 1500"
                        value={salaryMin}
                        onChange={(e) => setSalaryMin(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salaryMax">Max Salary (USD/mo)</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        min="0"
                        placeholder="e.g. 3000"
                        value={salaryMax}
                        onChange={(e) => setSalaryMax(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Info banner */}
                  <div className="bg-light border border-green-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-primary">
                        After signing up, you&apos;ll go through our AI vetting process
                        to verify your skills and get matched with top employers.
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
                      className="flex-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white"
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
                  className="text-primary font-semibold hover:underline"
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
