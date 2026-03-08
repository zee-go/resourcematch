import { useState } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  CheckCircle2,
  Plus,
  X,
  Briefcase,
  Star,
} from "lucide-react";

export default function ApplyPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [vertical, setVertical] = useState("");
  const [experience, setExperience] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!fullName.trim() || !email.trim() || !vertical || !experience || !resumeText.trim() || skills.length === 0 || !bio.trim()) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    const expNum = parseInt(experience);
    if (isNaN(expNum) || expNum < 5) {
      setError("Minimum 5 years of experience required");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || "",
          linkedInUrl: linkedInUrl.trim() || "",
          vertical,
          experience: expNum,
          resumeText: resumeText.trim(),
          skills,
          bio: bio.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <SEO
          title="Application Submitted - ResourceMatch"
          description="Your application to join ResourceMatch has been submitted."
        />
        <LandingHeader />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 pt-20">
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">
                Application Received
              </h1>
              <p className="text-slate-600 mb-6">
                Thank you for applying to join ResourceMatch. Our team will review your application and reach out within 3-5 business days.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-primary">
                  If approved, you&apos;ll be invited to complete our 4-layer AI vetting process to verify your skills and build your profile.
                </p>
              </div>
              <Link href="/">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Apply as an Expert - ResourceMatch"
        description="Join ResourceMatch as a senior Filipino expert in operations management or finance & accounting. 5+ years experience required."
        url="https://resourcematch.ph/apply"
      />
      <LandingHeader />

      <div className="min-h-screen bg-slate-50 px-4 py-12 pt-24">
        <div className="w-full max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs font-semibold border-primary/30 bg-primary/5 text-primary mb-4"
            >
              <ShieldCheck className="w-3 h-3 mr-1.5" />
              AI-Vetted Talent Network
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Apply as an Expert
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Join our curated network of senior Filipino talent. We require a minimum of 5 years of experience in your field.
            </p>
          </div>

          {/* What we look for */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-4 flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">5+ Years Experience</h3>
                <p className="text-xs text-slate-500">Senior-level talent only</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">4-Layer AI Vetting</h3>
                <p className="text-xs text-slate-500">Rigorous quality assurance</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Phone & LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+63 912 345 6789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedInUrl"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedInUrl}
                    onChange={(e) => setLinkedInUrl(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Vertical & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Specialization <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={vertical}
                    onValueChange={setVertical}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vertical..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">Operations Management</SelectItem>
                      <SelectItem value="accounting">Finance & Accounting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Years of Experience <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min="5"
                    max="30"
                    placeholder="Min. 5 years"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>
                  Key Skills <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Financial Reporting, Shopify, QuickBooks"
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
                {skills.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Add at least one skill. Press Enter or click + to add.
                  </p>
                )}
              </div>

              {/* Resume / Work History */}
              <div className="space-y-2">
                <Label htmlFor="resumeText">
                  Resume / Work History <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="resumeText"
                  placeholder="Describe your professional background, key roles, and achievements. Include company names, job titles, and responsibilities..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  disabled={isLoading}
                  rows={6}
                  className="resize-y"
                />
                <p className="text-xs text-slate-500">
                  Minimum 50 characters. Be as detailed as possible.
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">
                  Brief Bio <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="A short summary of who you are, your expertise, and what you're looking for..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
                <p className="text-xs text-slate-500">
                  20-1000 characters. This will be visible on your profile.
                </p>
              </div>

              {/* Info */}
              <div className="bg-light border border-green-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-primary">
                    After review, approved applicants are invited to complete our 4-layer AI vetting process — resume analysis, scenario assessment, video interview, and reference verification.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-6 text-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer note */}
          <p className="text-center text-sm text-slate-500 mt-6">
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
    </>
  );
}
