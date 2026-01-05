import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";

interface AIMatchModalProps {
  open: boolean;
  onClose: () => void;
  onMatch: (data: MatchFormData) => void;
  isMatching: boolean;
}

export interface MatchFormData {
  jobTitle: string;
  jobDescription: string;
  budgetRange: string;
}

export function AIMatchModal({
  open,
  onClose,
  onMatch,
  isMatching,
}: AIMatchModalProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [budgetRange, setBudgetRange] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim() || !budgetRange) {
      return;
    }
    onMatch({ jobTitle, jobDescription, budgetRange });
  };

  const handleClose = () => {
    if (!isMatching) {
      setJobTitle("");
      setJobDescription("");
      setBudgetRange("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D97642] to-[#c26638] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI-Powered Candidate Matching
          </DialogTitle>
          <DialogDescription className="text-base">
            Describe your ideal candidate and our AI will analyze skills,
            experience, and availability to find your best matches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Job Title */}
          <div className="space-y-2">
            <label
              htmlFor="jobTitle"
              className="text-sm font-medium text-slate-900"
            >
              Job Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="jobTitle"
              placeholder="e.g., Senior Full-Stack Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isMatching}
              className="h-11"
            />
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <label
              htmlFor="jobDescription"
              className="text-sm font-medium text-slate-900"
            >
              Job Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="jobDescription"
              placeholder="Describe the role, required skills, responsibilities, and qualifications..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isMatching}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-slate-500">
              Include key skills, technologies, and experience requirements for
              best results
            </p>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <label
              htmlFor="budget"
              className="text-sm font-medium text-slate-900"
            >
              Budget Range ($/hour) <span className="text-red-500">*</span>
            </label>
            <Select
              value={budgetRange}
              onValueChange={setBudgetRange}
              disabled={isMatching}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select your hourly budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="8-15">$8 - $15 per hour</SelectItem>
                <SelectItem value="15-20">$15 - $20 per hour</SelectItem>
                <SelectItem value="20-25">$20 - $25 per hour</SelectItem>
                <SelectItem value="25-30">$25 - $30 per hour</SelectItem>
                <SelectItem value="30+">$30+ per hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">How AI Matching Works:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Analyzes skills, experience, and expertise</li>
                  <li>• Matches budget with candidate rates</li>
                  <li>• Evaluates availability and timezone fit</li>
                  <li>• Returns candidates ranked by match score</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isMatching}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isMatching ||
                !jobTitle.trim() ||
                !jobDescription.trim() ||
                !budgetRange
              }
              className="flex-1 bg-gradient-to-r from-[#D97642] to-[#c26638] hover:from-[#c26638] hover:to-[#D97642] text-white"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Candidates...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find Matches
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}