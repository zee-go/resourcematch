import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface JobSearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  vertical: string;
  setVertical: (v: string) => void;
  availability: string;
  setAvailability: (a: string) => void;
}

export function JobSearchFilters({
  searchQuery,
  setSearchQuery,
  vertical,
  setVertical,
  availability,
  setAvailability,
}: JobSearchFiltersProps) {
  const hasActiveFilters =
    searchQuery !== "" || vertical !== "all" || availability !== "all";

  const clearAll = () => {
    setSearchQuery("");
    setVertical("all");
    setAvailability("all");
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search jobs by title, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Vertical */}
        <Select value={vertical} onValueChange={setVertical}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Verticals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            <SelectItem value="ecommerce">Operations Management</SelectItem>
            <SelectItem value="accounting">Finance & Accounting</SelectItem>
          </SelectContent>
        </Select>

        {/* Availability */}
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FULL_TIME">Full-time</SelectItem>
            <SelectItem value="PART_TIME">Part-time</SelectItem>
            <SelectItem value="CONTRACT">Contract</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-slate-500"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
