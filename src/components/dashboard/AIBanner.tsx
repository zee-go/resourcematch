import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";

interface AIBannerProps {
  onMatchClick: () => void;
}

export function AIBanner({ onMatchClick }: AIBannerProps) {
  return (
    <div className="bg-gradient-to-r from-[#D97642] via-[#e88b5d] to-[#D97642] text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">AI-Powered Matching</h2>
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  NEW
                </span>
              </div>
              <p className="text-white/90 text-sm">
                Upload a job description and let our AI find the best candidates
              </p>
            </div>
          </div>
          <Button
            onClick={onMatchClick}
            className="bg-white text-[#D97642] hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Zap className="w-4 h-4 mr-2" />
            Match with AI
          </Button>
        </div>
      </div>
    </div>
  );
}