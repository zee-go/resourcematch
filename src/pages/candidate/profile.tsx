import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  Plus,
  X,
  CheckCircle2,
  Circle,
  Activity,
  Trash2,
  Pencil,
  ShieldCheck,
  Phone,
  Video,
  FileText,
  Camera,
  Award,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

interface CaseStudyItem {
  id?: number;
  title: string;
  outcome: string;
  metrics: string;
}

interface CertificationItem {
  id?: number;
  title: string;
  issuingBody: string;
  issuedDate: string;
  expiryDate: string;
  credentialUrl: string;
}

interface ReferenceItem {
  id?: number;
  name: string;
  company: string;
  role: string;
  quote: string;
  verified: boolean;
}

function calculateProfileHealth(data: {
  fullName: string;
  location: string;
  title: string;
  vertical: string;
  experience: string;
  availability: string;
  summary: string;
  skills: string[];
  tools: string[];
  phone: string;
  linkedIn: string;
  videoUrl: string;
  resumeUrl: string;
  caseStudies: CaseStudyItem[];
  certifications: CertificationItem[];
  references: ReferenceItem[];
}) {
  const sections = [
    { name: "Personal Info", complete: !!(data.fullName && data.location) },
    { name: "Contact Details", complete: !!(data.phone && data.linkedIn) },
    { name: "Professional Details", complete: !!(data.title && data.vertical && data.experience && data.availability && data.summary) },
    { name: "Skills & Tools", complete: data.skills.length > 0 && data.tools.length > 0 },
    { name: "Video Intro", complete: !!data.videoUrl },
    { name: "Resume", complete: !!data.resumeUrl },
    { name: "Case Studies", complete: data.caseStudies.filter(cs => cs.id).length > 0 },
    { name: "Certifications", complete: data.certifications.filter(c => c.id).length > 0 },
    { name: "References", complete: data.references.filter(r => r.id).length > 0 },
  ];

  const completed = sections.filter((s) => s.complete).length;
  const percentage = Math.round((completed / sections.length) * 100);

  return { sections, percentage };
}

export default function CandidateProfilePage() {
  const router = useRouter();
  const { user, candidate, loading: authLoading, refreshCandidate } = useAuth();

  // Basic fields
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

  // Contact fields
  const [phone, setPhone] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  // Case studies
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [editingCaseStudy, setEditingCaseStudy] = useState<number | null>(null);
  const [csLoading, setCsLoading] = useState(false);

  // Certifications
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [editingCertification, setEditingCertification] = useState<number | null>(null);
  const [certLoading, setCertLoading] = useState(false);

  // References
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [editingReference, setEditingReference] = useState<number | null>(null);
  const [refLoading, setRefLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const health = useMemo(
    () =>
      calculateProfileHealth({
        fullName, location, title, vertical, experience, availability,
        summary, skills, tools, phone, linkedIn, videoUrl, resumeUrl,
        caseStudies, certifications, references,
      }),
    [fullName, location, title, vertical, experience, availability, summary, skills, tools, phone, linkedIn, videoUrl, resumeUrl, caseStudies, certifications, references]
  );

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
      setPhone(candidate.phone || "");
      setLinkedIn(candidate.linkedIn || "");
      setVideoUrl(candidate.videoUrl || "");
      setResumeUrl(candidate.resumeUrl || "");
    }
  }, [candidate]);

  // Fetch case studies and references
  useEffect(() => {
    if (!candidate) return;

    fetch("/api/candidate/case-studies")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCaseStudies(data.caseStudies.map((cs: CaseStudyItem) => ({ ...cs, metrics: cs.metrics || "" })));
      });

    fetch("/api/candidate/references")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setReferences(data.references);
      });

    fetch("/api/candidate/certifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCertifications(data.certifications.map((c: CertificationItem) => ({
          ...c,
          issuedDate: c.issuedDate ? c.issuedDate.split("T")[0] : "",
          expiryDate: c.expiryDate ? c.expiryDate.split("T")[0] : "",
          credentialUrl: c.credentialUrl || "",
        })));
      });
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setAvatarUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await fetch("/api/candidate/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to upload avatar");
        return;
      }
      await refreshCandidate();
    } catch {
      setError("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
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
          phone: phone || null,
          linkedIn: linkedIn || null,
          videoUrl: videoUrl || null,
          resumeUrl: resumeUrl || null,
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

  // Case study CRUD
  const addEmptyCaseStudy = () => {
    setCaseStudies([...caseStudies, { title: "", outcome: "", metrics: "" }]);
    setEditingCaseStudy(caseStudies.length);
  };

  const updateCaseStudy = (idx: number, field: keyof CaseStudyItem, value: string) => {
    const updated = [...caseStudies];
    updated[idx] = { ...updated[idx], [field]: value };
    setCaseStudies(updated);
  };

  const saveCaseStudy = async (idx: number) => {
    const cs = caseStudies[idx];
    if (!cs.title.trim() || !cs.outcome.trim()) {
      setError("Title and outcome are required for case studies");
      return;
    }
    setCsLoading(true);
    setError("");
    try {
      const method = cs.id ? "PUT" : "POST";
      const res = await fetch("/api/candidate/case-studies", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cs),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save case study");
        return;
      }
      const data = await res.json();
      const updated = [...caseStudies];
      updated[idx] = { ...data.caseStudy, metrics: data.caseStudy.metrics || "" };
      setCaseStudies(updated);
      setEditingCaseStudy(null);
    } catch {
      setError("Failed to save case study");
    } finally {
      setCsLoading(false);
    }
  };

  const deleteCaseStudy = async (idx: number) => {
    const cs = caseStudies[idx];
    if (cs.id) {
      setCsLoading(true);
      try {
        const res = await fetch("/api/candidate/case-studies", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: cs.id }),
        });
        if (!res.ok) {
          setError("Failed to delete case study");
          return;
        }
      } catch {
        setError("Failed to delete case study");
        return;
      } finally {
        setCsLoading(false);
      }
    }
    setCaseStudies(caseStudies.filter((_, i) => i !== idx));
    if (editingCaseStudy === idx) setEditingCaseStudy(null);
  };

  // Reference CRUD
  const addEmptyReference = () => {
    setReferences([...references, { name: "", company: "", role: "", quote: "", verified: false }]);
    setEditingReference(references.length);
  };

  const updateReference = (idx: number, field: keyof ReferenceItem, value: string) => {
    const updated = [...references];
    updated[idx] = { ...updated[idx], [field]: value };
    setReferences(updated);
  };

  const saveReference = async (idx: number) => {
    const ref = references[idx];
    if (!ref.name.trim() || !ref.company.trim() || !ref.role.trim() || !ref.quote.trim()) {
      setError("All reference fields are required");
      return;
    }
    setRefLoading(true);
    setError("");
    try {
      const method = ref.id ? "PUT" : "POST";
      const res = await fetch("/api/candidate/references", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ref),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save reference");
        return;
      }
      const data = await res.json();
      const updated = [...references];
      updated[idx] = data.reference;
      setReferences(updated);
      setEditingReference(null);
    } catch {
      setError("Failed to save reference");
    } finally {
      setRefLoading(false);
    }
  };

  const deleteReference = async (idx: number) => {
    const ref = references[idx];
    if (ref.id) {
      setRefLoading(true);
      try {
        const res = await fetch("/api/candidate/references", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: ref.id }),
        });
        if (!res.ok) {
          setError("Failed to delete reference");
          return;
        }
      } catch {
        setError("Failed to delete reference");
        return;
      } finally {
        setRefLoading(false);
      }
    }
    setReferences(references.filter((_, i) => i !== idx));
    if (editingReference === idx) setEditingReference(null);
  };

  // Certification CRUD
  const addEmptyCertification = () => {
    setCertifications([...certifications, { title: "", issuingBody: "", issuedDate: "", expiryDate: "", credentialUrl: "" }]);
    setEditingCertification(certifications.length);
  };

  const updateCertification = (idx: number, field: keyof CertificationItem, value: string) => {
    const updated = [...certifications];
    updated[idx] = { ...updated[idx], [field]: value };
    setCertifications(updated);
  };

  const saveCertification = async (idx: number) => {
    const cert = certifications[idx];
    if (!cert.title.trim() || !cert.issuingBody.trim()) {
      setError("Title and issuing body are required for certifications");
      return;
    }
    setCertLoading(true);
    setError("");
    try {
      const method = cert.id ? "PUT" : "POST";
      const res = await fetch("/api/candidate/certifications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...cert,
          issuedDate: cert.issuedDate || null,
          expiryDate: cert.expiryDate || null,
          credentialUrl: cert.credentialUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save certification");
        return;
      }
      const data = await res.json();
      const updated = [...certifications];
      updated[idx] = {
        ...data.certification,
        issuedDate: data.certification.issuedDate ? data.certification.issuedDate.split("T")[0] : "",
        expiryDate: data.certification.expiryDate ? data.certification.expiryDate.split("T")[0] : "",
        credentialUrl: data.certification.credentialUrl || "",
      };
      setCertifications(updated);
      setEditingCertification(null);
    } catch {
      setError("Failed to save certification");
    } finally {
      setCertLoading(false);
    }
  };

  const deleteCertification = async (idx: number) => {
    const cert = certifications[idx];
    if (cert.id) {
      setCertLoading(true);
      try {
        const res = await fetch("/api/candidate/certifications", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: cert.id }),
        });
        if (!res.ok) {
          setError("Failed to delete certification");
          return;
        }
      } catch {
        setError("Failed to delete certification");
        return;
      } finally {
        setCertLoading(false);
      }
    }
    setCertifications(certifications.filter((_, i) => i !== idx));
    if (editingCertification === idx) setEditingCertification(null);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

          {/* Profile Health */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary" />
                Profile Health
              </h2>
              <span
                className={`text-2xl font-bold ${
                  health.percentage >= 80
                    ? "text-green-600"
                    : health.percentage >= 50
                    ? "text-yellow-600"
                    : "text-red-500"
                }`}
              >
                {health.percentage}%
              </span>
            </div>
            <Progress value={health.percentage} className="h-3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {health.sections.map((section) => (
                <div
                  key={section.name}
                  className="flex items-center gap-1.5 text-sm"
                >
                  {section.complete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span
                    className={
                      section.complete ? "text-slate-600" : "text-slate-400"
                    }
                  >
                    {section.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Vetting Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              AI Vetting Status
            </h2>

            {candidate?.vettingProfile ? (
              <>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-sm text-slate-600">Composite Vetting Score</p>
                    <p className="text-3xl font-bold text-primary">
                      {candidate.vettingProfile.overallScore}/100
                    </p>
                  </div>
                  <Badge
                    className={
                      candidate.vettingProfile.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : candidate.vettingProfile.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                        : candidate.vettingProfile.status === "FAILED"
                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                    }
                  >
                    {candidate.vettingProfile.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "RESUME_ANALYSIS", label: "Resume Analysis" },
                    { key: "SCENARIO_ASSESSMENT", label: "Scenario Assessment" },
                    { key: "VIDEO_INTERVIEW", label: "Video Interview" },
                    { key: "REFERENCE_CHECK", label: "Reference Check" },
                  ].map(({ key, label }) => {
                    const layer = candidate.vettingLayers?.find(
                      (l) => l.layer === key
                    );
                    return (
                      <div
                        key={key}
                        className={`rounded-lg p-3 border ${
                          layer?.completedAt
                            ? layer.passed
                              ? "bg-green-50 border-green-200"
                              : "bg-red-50 border-red-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                        {layer?.completedAt ? (
                          <>
                            <p className="text-lg font-bold text-slate-900">
                              {layer.score}/100
                            </p>
                            <p className="text-xs text-slate-500">
                              {layer.passed ? "Passed" : "Below threshold"}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-slate-400">Not started</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Your vetting process has not started yet. Our team will initiate
                the 4-layer AI vetting pipeline once your profile is complete.
              </p>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
              {/* Personal Info */}
              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={candidate?.avatar || ""}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    {avatarUploading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="text-sm text-primary hover:underline"
                  >
                    {avatarUploading ? "Uploading..." : "Change photo"}
                  </button>
                  <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, or WebP. Max 5MB.</p>
                </div>
              </div>

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

              {/* Contact Details */}
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-slate-400" />
                Contact Details
              </h2>

              <div className="space-y-2 mb-4">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={candidate?.email || user?.email || ""}
                  disabled
                  className="bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400">
                  This is the email companies will see. Contact support to update it.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+63 917 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedIn">LinkedIn URL</Label>
                  <Input
                    id="linkedIn"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Video & Resume */}
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-slate-400" />
                Video & Resume
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video Introduction URL</Label>
                  <p className="text-xs text-slate-500">Loom, YouTube, or Google Drive link</p>
                  <Input
                    id="videoUrl"
                    type="url"
                    placeholder="https://www.loom.com/share/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resumeUrl">Resume URL</Label>
                  <p className="text-xs text-slate-500">Google Drive shareable link</p>
                  <Input
                    id="resumeUrl"
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
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
                      <SelectItem value="ecommerce">Operations Management</SelectItem>
                      <SelectItem value="accounting">Finance & Accounting</SelectItem>
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
              <div className="bg-light border border-green-200 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <p className="text-sm text-primary">Profile updated successfully!</p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary-dark text-white"
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

          {/* Case Studies (separate from main form) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Portfolio & Case Studies
              </h2>
              <span className="text-xs text-slate-400">{caseStudies.filter(cs => cs.id).length}/5</span>
            </div>
            <p className="text-sm text-slate-500">
              Showcase your work with up to 5 case studies. Include measurable outcomes.
            </p>

            {caseStudies.map((cs, idx) => (
              <div
                key={cs.id || `new-${idx}`}
                className="bg-slate-50 rounded-lg border border-slate-200 p-4"
              >
                {editingCaseStudy === idx ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={cs.title}
                        onChange={(e) => updateCaseStudy(idx, "title", e.target.value)}
                        placeholder="e.g., Scaled Shopify DTC Brand 10x in 18 Months"
                        disabled={csLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Outcome</Label>
                      <Textarea
                        value={cs.outcome}
                        onChange={(e) => updateCaseStudy(idx, "outcome", e.target.value)}
                        placeholder="Describe what you achieved..."
                        rows={2}
                        disabled={csLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Metrics (optional)</Label>
                      <Input
                        value={cs.metrics}
                        onChange={(e) => updateCaseStudy(idx, "metrics", e.target.value)}
                        placeholder="e.g., 15% cost reduction, $2M revenue increase"
                        disabled={csLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveCaseStudy(idx)}
                        disabled={csLoading}
                        className="bg-primary hover:bg-primary-dark text-white"
                      >
                        {csLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!cs.id) {
                            setCaseStudies(caseStudies.filter((_, i) => i !== idx));
                          }
                          setEditingCaseStudy(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900">{cs.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{cs.outcome}</p>
                      {cs.metrics && (
                        <p className="text-sm text-primary font-medium mt-1">{cs.metrics}</p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingCaseStudy(idx)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteCaseStudy(idx)}
                        disabled={csLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {caseStudies.length < 5 && editingCaseStudy === null && (
              <Button
                type="button"
                variant="outline"
                onClick={addEmptyCaseStudy}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Case Study
              </Button>
            )}
          </div>

          {/* Certifications (separate from main form) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-400" />
                Certifications
              </h2>
              <span className="text-xs text-slate-400">{certifications.filter(c => c.id).length}/10</span>
            </div>
            <p className="text-sm text-slate-500">
              Add up to 10 professional certifications to strengthen your profile.
            </p>

            {certifications.map((cert, idx) => (
              <div
                key={cert.id || `new-${idx}`}
                className="bg-slate-50 rounded-lg border border-slate-200 p-4"
              >
                {editingCertification === idx ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Certification Title</Label>
                      <Input
                        value={cert.title}
                        onChange={(e) => updateCertification(idx, "title", e.target.value)}
                        placeholder="e.g., AWS Solutions Architect"
                        disabled={certLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Body</Label>
                      <Input
                        value={cert.issuingBody}
                        onChange={(e) => updateCertification(idx, "issuingBody", e.target.value)}
                        placeholder="e.g., Amazon Web Services"
                        disabled={certLoading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Issued Date</Label>
                        <Input
                          type="date"
                          value={cert.issuedDate}
                          onChange={(e) => updateCertification(idx, "issuedDate", e.target.value)}
                          disabled={certLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date (optional)</Label>
                        <Input
                          type="date"
                          value={cert.expiryDate}
                          onChange={(e) => updateCertification(idx, "expiryDate", e.target.value)}
                          disabled={certLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Credential URL (optional)</Label>
                      <Input
                        value={cert.credentialUrl}
                        onChange={(e) => updateCertification(idx, "credentialUrl", e.target.value)}
                        placeholder="https://..."
                        disabled={certLoading}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveCertification(idx)}
                        disabled={certLoading}
                        className="bg-primary hover:bg-primary-dark text-white"
                      >
                        {certLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!cert.id) {
                            setCertifications(certifications.filter((_, i) => i !== idx));
                          }
                          setEditingCertification(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900">{cert.title}</h3>
                      <p className="text-sm text-slate-500">{cert.issuingBody}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        {cert.issuedDate && (
                          <span>Issued {new Date(cert.issuedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                        )}
                        {cert.expiryDate && (
                          <span>Expires {new Date(cert.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                        )}
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          View Credential <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingCertification(idx)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteCertification(idx)}
                        disabled={certLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {certifications.length < 10 && editingCertification === null && (
              <Button
                type="button"
                variant="outline"
                onClick={addEmptyCertification}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Certification
              </Button>
            )}
          </div>

          {/* References (separate from main form) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                Professional References
              </h2>
              <span className="text-xs text-slate-400">{references.filter(r => r.id).length}/5</span>
            </div>
            <p className="text-sm text-slate-500">
              Add up to 5 references. Our team will verify them and mark them with a checkmark.
            </p>

            {references.map((ref, idx) => (
              <div
                key={ref.id || `new-${idx}`}
                className="bg-slate-50 rounded-lg border border-slate-200 p-4"
              >
                {editingReference === idx ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={ref.name}
                          onChange={(e) => updateReference(idx, "name", e.target.value)}
                          placeholder="e.g., James Mitchell"
                          disabled={refLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={ref.company}
                          onChange={(e) => updateReference(idx, "company", e.target.value)}
                          placeholder="e.g., Acme Corp"
                          disabled={refLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={ref.role}
                        onChange={(e) => updateReference(idx, "role", e.target.value)}
                        placeholder="e.g., CEO"
                        disabled={refLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Testimonial</Label>
                      <Textarea
                        value={ref.quote}
                        onChange={(e) => updateReference(idx, "quote", e.target.value)}
                        placeholder="What would they say about working with you?"
                        rows={2}
                        disabled={refLoading}
                      />
                    </div>
                    {ref.id && ref.verified && (
                      <p className="text-xs text-yellow-600">
                        Editing will reset this reference&apos;s verified status.
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveReference(idx)}
                        disabled={refLoading}
                        className="bg-primary hover:bg-primary-dark text-white"
                      >
                        {refLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!ref.id) {
                            setReferences(references.filter((_, i) => i !== idx));
                          }
                          setEditingReference(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-slate-900">{ref.name}</h3>
                        {ref.verified ? (
                          <Badge className="bg-green-50 text-green-700 border-green-200 gap-1 text-xs">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 gap-1 text-xs">
                            Pending verification
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{ref.role}, {ref.company}</p>
                      <p className="text-sm text-slate-600 italic mt-1">&ldquo;{ref.quote}&rdquo;</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingReference(idx)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteReference(idx)}
                        disabled={refLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {references.length < 5 && editingReference === null && (
              <Button
                type="button"
                variant="outline"
                onClick={addEmptyReference}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Reference
              </Button>
            )}
          </div>

          <div className="h-8" />
        </div>
      </div>
    </>
  );
}
