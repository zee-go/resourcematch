import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, ChevronDown, ChevronUp, Loader2, Check } from "lucide-react";

interface CompanyMatching {
  matchingEnabled: boolean;
  matchingVertical: string | null;
  matchingExperience: string | null;
  matchingSkills: string[];
}

interface MatchingPreferencesProps {
  company: CompanyMatching;
  onSave: (prefs: Partial<CompanyMatching>) => Promise<void>;
}

const SKILLS = [
  "Shopify",
  "Amazon Seller Central",
  "QuickBooks",
  "Financial Modeling",
  "Inventory Management",
  "Supply Chain",
  "Xero",
  "Bookkeeping",
  "Team Leadership",
  "Operations Management",
];

export function MatchingPreferences({ company, onSave }: MatchingPreferencesProps) {
  const [expanded, setExpanded] = useState(false);
  const [enabled, setEnabled] = useState(company.matchingEnabled);
  const [vertical, setVertical] = useState(company.matchingVertical || "");
  const [experience, setExperience] = useState(company.matchingExperience || "");
  const [skills, setSkills] = useState<string[]>(company.matchingSkills || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setSaved(false);
  };

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    setSaving(true);
    try {
      await onSave({ matchingEnabled: checked });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        matchingEnabled: enabled,
        matchingVertical: vertical || null,
        matchingExperience: experience || null,
        matchingSkills: skills,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900 text-sm">Weekly Talent Alerts</h3>
            <p className="text-xs text-slate-500">
              {enabled
                ? "Get notified when new candidates match your criteria"
                : "Enable to receive weekly talent matches by email"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {enabled && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
              Active
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Enable weekly email digest
            </label>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={saving}
            />
          </div>

          {enabled && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Vertical</label>
                  <Select value={vertical} onValueChange={(v) => { setVertical(v); setSaved(false); }}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Any vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">Operations Management</SelectItem>
                      <SelectItem value="accounting">Finance & Accounting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600">Experience</label>
                  <Select value={experience} onValueChange={(v) => { setExperience(v); setSaved(false); }}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Any level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-7">5-7 years</SelectItem>
                      <SelectItem value="8-10">8-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Skills (optional)</label>
                <div className="flex flex-wrap gap-1.5">
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        skills.includes(skill)
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="bg-primary hover:bg-primary-dark text-white"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : saved ? (
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                ) : null}
                {saved ? "Saved" : "Save Preferences"}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
