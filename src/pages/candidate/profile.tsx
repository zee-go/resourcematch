import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
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
import { Loader2, Save, Plus, X, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, candidate, loading: authLoading, refreshCandidate } = useAuth();

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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/candidate/profile");
    }
  }, [authLoading, user, router]);

  // Pre-populate from candidate profile
  useEffect(() => {
    if (candidate) {
      setFullName(candidate.fullName || "");
      setTitle(candidate.title || "");
      setVertical(candidate.vertical || "");
      setExperience(String(candidate.experience || ""));
      setAvailability(candidate.availability || "");
      setSkills(candidate.skills || []);
      setTools(candidate.tools || []);
      setLocation(candidate.location || "");
      setSummary(candidate.summary || "");
      setSalaryMin(candidate.salaryMin ? String(candidate.salaryMin) : "");
      setSalaryMax(candidate.salaryMax ? String(candidate.salaryMax) : "");
    }
  }, [candidate]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const addTool = () => {
    const trimmed = toolInput.trim();
    if (trimmed && !tools.includes(trimmed)) {
      setTools([...tools, trimmed]);
    }
    setToolInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/candidate/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          title,
          vertical,
          experience,
          availability,
          skills,
          tools,
          location,
          summary,
          salaryMin: salaryMin || null,
          salaryMax: salaryMax || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
        return;
      }

      await refreshCandidate();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#04443C]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="My Profile — ResourceMatch"
        description="Edit your professional profile on ResourceMatch."
      />

      <div className="min-h-screen bg-slate-50">
        <DashboardHeader />

        <div className="container mx-auto px-4 max-w-2xl py-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            My Profile
          </h1>
          <p className="text-slate-600 mb-6">
            Keep your profile updated to get matched with the best opportunities.
          </p>

          <form onSubmit={handleSave}>
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              {/* Personal Info */}
              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Manila, Philippines"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Professional Details */}
              <h2 className="text-lg font-semibold text-slate-900">
                Professional Details
              </h2>

              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Accountant"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Vertical</Label>
                  <Select value={vertical} onValueChange={setVertical} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce Ops</SelectItem>
                      <SelectItem value="accounting">Accounting & Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select value={availability} onValueChange={setAvailability} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full-time</SelectItem>
                      <SelectItem value="PART_TIME">Part-time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief overview of your experience..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              <hr className="border-slate-200" />

              {/* Skills & Tools */}
              <h2 className="text-lg font-semibold text-slate-900">
                Skills & Tools
              </h2>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                    }}
                    disabled={isLoading}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addSkill} disabled={isLoading}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {skills.map((s) => (
                      <Badge key={s} variant="secondary" className="gap-1 cursor-pointer hover:bg-red-50" onClick={() => setSkills(skills.filter(x => x !== s))}>
                        {s} <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tools & Software</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tool..."
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addTool(); }
                    }}
                    disabled={isLoading}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addTool} disabled={isLoading}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tools.map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1 cursor-pointer hover:bg-red-50" onClick={() => setTools(tools.filter(x => x !== t))}>
                        {t} <X className="w-3 h-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <hr className="border-slate-200" />

              {/* Salary */}
              <h2 className="text-lg font-semibold text-slate-900">
                Salary Expectations
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Min (USD/month)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    min="0"
                    placeholder="e.g., 1500"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Max (USD/month)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    min="0"
                    placeholder="e.g., 3000"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Status messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#04443C]" />
                  <p className="text-sm text-[#04443C]">Profile updated successfully!</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#04443C] hover:bg-[#022C27] text-white"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
