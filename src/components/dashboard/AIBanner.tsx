import { Button } from "@/components/ui/button";
import { Sparkles, Upload } from "lucide-react";

export function AIBanner() {
  return (
    <div className="bg-gradient-to-r from-[#2D5F3F] to-[#1a3a26] text-white">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-[#D97642]" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI-Powered Matching</h3>
              <p className="text-sm text-green-100">
                Upload job description for instant matches
              </p>
            </div>
          </div>

          <Button className="bg-[#D97642] hover:bg-[#c26638] text-white border-0">
            <Upload className="w-4 h-4 mr-2" />
            Upload Job Description
          </Button>
        </div>
      </div>
    </div>
  );
}