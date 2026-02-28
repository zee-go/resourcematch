import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileSearch, ClipboardCheck, Video, UserCheck, CheckCircle } from "lucide-react";
import Link from "next/link";

const vettingLayers = [
  {
    number: 1,
    title: "Resume & Career Analysis",
    description: "AI parses resumes and LinkedIn profiles to score career trajectory, detect red flags, and verify experience depth. Only candidates with 5+ years relevant experience proceed.",
    icon: FileSearch,
    color: "from-[#2D5F3F] to-[#3a7a50]",
  },
  {
    number: 2,
    title: "Scenario Assessments",
    description: "AI-generated role-specific scenarios for each vertical. E-commerce candidates handle inventory crises. Healthcare admins navigate compliance scenarios. Real judgment, not multiple choice.",
    icon: ClipboardCheck,
    color: "from-[#D97642] to-[#c26638]",
  },
  {
    number: 3,
    title: "Video Interview Analysis",
    description: "Speech-to-text transcription analyzed by AI for communication clarity, problem-solving approach, and cultural fit. Video clips are included in candidate profiles.",
    icon: Video,
    color: "from-[#2D5F3F] to-[#3a7a50]",
  },
  {
    number: 4,
    title: "Reference Verification",
    description: "AI-generated reference questions tailored to each candidate's claimed experience. Automated outreach with structured feedback collection and cross-verification.",
    icon: UserCheck,
    color: "from-[#D97642] to-[#c26638]",
  },
];

export function AIComparison() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-semibold border-primary/30 bg-primary/5 text-primary">
            Our Vetting Process
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            4-Layer AI{" "}
            <span className="text-primary">Vetting Pipeline</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Every professional on ResourceMatch passes rigorous AI-powered evaluation before their profile goes live.
          </p>
        </div>

        {/* Vetting Layers */}
        <div className="space-y-6">
          {vettingLayers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-6">
                  {/* Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${layer.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="text-xs font-bold">
                        Layer {layer.number}
                      </Badge>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {layer.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {layer.description}
                    </p>
                  </div>

                  {/* Check */}
                  <div className="flex-shrink-0 hidden sm:flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center space-y-4 animate-fade-in">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Only candidates who pass all 4 layers appear on the platform. No exceptions.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-[#2D5F3F] hover:bg-[#1a3a26] text-white px-8 h-14 text-lg group"
            >
              Browse Vetted Professionals
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
