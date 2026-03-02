import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  experienceLevel: string;
  setExperienceLevel: (value: string) => void;
  availability: string;
  setAvailability: (value: string) => void;
  vertical: string;
  setVertical: (value: string) => void;
  selectedSkills: string[];
  setSelectedSkills: (skills: string[]) => void;
}

export function SearchFilters({
  searchQuery,
  setSearchQuery,
  experienceLevel,
  setExperienceLevel,
  availability,
  setAvailability,
  vertical,
  setVertical,
  selectedSkills,
  setSelectedSkills,
}: SearchFiltersProps) {
  const [skillInput, setSkillInput] = useState("");

  const availableSkills = [
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

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter((skill) => skill !== skillToRemove));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setExperienceLevel("all");
    setAvailability("all");
    setVertical("all");
    setSelectedSkills([]);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    experienceLevel !== "all" ||
    availability !== "all" ||
    vertical !== "all" ||
    selectedSkills.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search by name, job title, or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base border-slate-300 focus:border-[#04443C] focus:ring-[#04443C]"
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Experience Level
          </label>
          <Select value={experienceLevel} onValueChange={setExperienceLevel}>
            <SelectTrigger className="border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="5-7">5-7 years</SelectItem>
              <SelectItem value="8-10">8-10 years</SelectItem>
              <SelectItem value="10+">10+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Vertical
          </label>
          <Select value={vertical} onValueChange={setVertical}>
            <SelectTrigger className="border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verticals</SelectItem>
              <SelectItem value="ecommerce">Operations Management</SelectItem>
              <SelectItem value="accounting">Accounting & Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Availability
          </label>
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger className="border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full">Full-time</SelectItem>
              <SelectItem value="part">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1.5 block">
            Add Skills
          </label>
          <Select value={skillInput} onValueChange={addSkill}>
            <SelectTrigger className="border-slate-300">
              <SelectValue placeholder="Select skills..." />
            </SelectTrigger>
            <SelectContent>
              {availableSkills.map((skill) => (
                <SelectItem
                  key={skill}
                  value={skill}
                  disabled={selectedSkills.includes(skill)}
                >
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="bg-green-100 text-[#04443C] hover:bg-green-200 px-3 py-1 text-sm"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-2 hover:text-[#022C27]"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-slate-600 hover:text-[#04443C] hover:bg-green-50"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
