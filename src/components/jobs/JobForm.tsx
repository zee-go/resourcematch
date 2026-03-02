import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";

interface JobFormData {
  title: string;
  description: string;
  vertical: string;
  availability: string;
  experienceMin: string;
  experienceMax: string;
  salaryMin: string;
  salaryMax: string;
  skills: string[];
  location: string;
  expiresInDays: string;
}

interface JobFormProps {
  initialData?: Partial<JobFormData>;
  onSubmit: (data: JobFormData, status: "DRAFT" | "OPEN") => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function JobForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Publish Job",
}: JobFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [vertical, setVertical] = useState(initialData?.vertical || "");
  const [availability, setAvailability] = useState(
    initialData?.availability || ""
  );
  const [experienceMin, setExperienceMin] = useState(
    initialData?.experienceMin || "5"
  );
  const [experienceMax, setExperienceMax] = useState(
    initialData?.experienceMax || ""
  );
  const [salaryMin, setSalaryMin] = useState(initialData?.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(initialData?.salaryMax || "");
  const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [location, setLocation] = useState(initialData?.location || "Remote");
  const [expiresInDays, setExpiresInDays] = useState(
    initialData?.expiresInDays || "90"
  );
  const [error, setError] = useState("");

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (status: "DRAFT" | "OPEN") => {
    setError("");

    if (!title.trim()) {
      setError("Job title is required");
      return;
    }
    if (!description.trim()) {
      setError("Job description is required");
      return;
    }
    if (!vertical) {
      setError("Vertical is required");
      return;
    }
    if (!availability) {
      setError("Availability type is required");
      return;
    }

    await onSubmit(
      {
        title,
        description,
        vertical,
        availability,
        experienceMin,
        experienceMax,
        salaryMin,
        salaryMax,
        skills,
        location,
        expiresInDays,
      },
      status
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Senior Operations Manager"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Job Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the role, responsibilities, and what you're looking for..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={8}
        />
      </div>

      {/* Vertical + Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <SelectValue placeholder="Select vertical..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ecommerce">Operations Management</SelectItem>
              <SelectItem value="accounting">Accounting & Finance</SelectItem>
            </SelectContent>
          </Select>
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
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL_TIME">Full-time</SelectItem>
              <SelectItem value="PART_TIME">Part-time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="experienceMin">
            Min Experience (years) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="experienceMin"
            type="number"
            min="1"
            value={experienceMin}
            onChange={(e) => setExperienceMin(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experienceMax">Max Experience (years)</Label>
          <Input
            id="experienceMax"
            type="number"
            min="1"
            placeholder="Optional"
            value={experienceMax}
            onChange={(e) => setExperienceMax(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Salary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salaryMin">Min Salary (USD/month)</Label>
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
          <Label htmlFor="salaryMax">Max Salary (USD/month)</Label>
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

      {/* Skills */}
      <div className="space-y-2">
        <Label>Required Skills</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill..."
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
            onClick={addSkill}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="gap-1 cursor-pointer hover:bg-red-50 hover:text-red-600"
                onClick={() => removeSkill(skill)}
              >
                {skill}
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g., Remote, Manila, Philippines"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Expiration */}
      <div className="space-y-2">
        <Label>Job Expires In</Label>
        <Select
          value={expiresInDays}
          onValueChange={setExpiresInDays}
          disabled={isLoading}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="60">60 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit("DRAFT")}
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit("OPEN")}
          disabled={isLoading}
          className="flex-1 bg-[#04443C] hover:bg-[#022C27] text-white"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </div>
  );
}
