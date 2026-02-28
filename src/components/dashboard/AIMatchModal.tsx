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
  vertical: string;
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
  const [vertical, setVertical] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim() || !budgetRange) {
      return;
    }
    onMatch({ jobTitle, jobDescription, budgetRange, vertical });
  };

  const handleClose = () => {
    if (!isMatching) {
      setJobTitle("");
      setJobDescription("");
      setBudgetRange("");
      setVertical("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D38B53] to-[#B47646] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI-Powered Talent Matching
          </DialogTitle>
          <DialogDescription className="text-base">
            Describe your ideal candidate and our AI will match you with
            vetted senior professionals based on skills, experience, and vertical fit.
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
              placeholder="e.g., Senior E-commerce Operations Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isMatching}
              className="h-11"
            />
          </div>

          {/* Vertical */}
          <div className="space-y-2">
            <label
              htmlFor="vertical"
              className="text-sm font-medium text-slate-900"
            >
              Industry Vertical
            </label>
            <Select
              value={vertical}
              onValueChange={setVertical}
              disabled={isMatching}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select a vertical (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verticals</SelectItem>
                <SelectItem value="ecommerce">E-commerce Operations</SelectItem>
                <SelectItem value="healthcare">Healthcare Admin</SelectItem>
                <SelectItem value="accounting">Accounting & Finance</SelectItem>
                <SelectItem value="marketing">Digital Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <label
              htmlFor="jobDescription"
              className="text-sm font-medium text-slate-900"
            >
              Role Description <span className="text-red-500">*</span>
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
              Include key skills, domain experience, and leadership requirements for
              best results
            </p>
          </div>

          {/* Monthly Budget Range */}
          <div className="space-y-2">
            <label
              htmlFor="budget"
              className="text-sm font-medium text-slate-900"
            >
              Monthly Budget Range <span className="text-red-500">*</span>
            </label>
            <Select
              value={budgetRange}
              onValueChange={setBudgetRange}
              disabled={isMatching}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select your monthly budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1500-2500">$1,500 - $2,500/month</SelectItem>
                <SelectItem value="2500-3500">$2,500 - $3,500/month</SelectItem>
                <SelectItem value="3500-5000">$3,500 - $5,000/month</SelectItem>
                <SelectItem value="5000+">$5,000+/month</SelectItem>
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
                  <li>• Matches your requirements with candidate vetting scores</li>
                  <li>• Evaluates vertical and domain expertise fit</li>
                  <li>• Considers experience level and leadership capabilities</li>
                  <li>• Returns candidates ranked by overall match quality</li>
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
              className="flex-1 bg-gradient-to-r from-[#D38B53] to-[#B47646] hover:from-[#B47646] hover:to-[#D38B53] text-white"
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
