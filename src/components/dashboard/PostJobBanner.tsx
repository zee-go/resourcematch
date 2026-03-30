import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Megaphone, ArrowRight } from "lucide-react";

export function PostJobBanner() {
  return (
    <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Post Open Role</h2>
              <p className="text-white/90 text-sm">
                We&apos;ll promote your listing to our network of AI-vetted senior professionals
              </p>
            </div>
          </div>
          <Link href="/jobs/post">
            <Button className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Post a Role
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
