import Link from "next/link";
import { LogoIcon } from "@/components/LogoIcon";

export function Footer() {
  return (
    <footer className="bg-[#04443C] text-white">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <LogoIcon className="w-8 h-8" color="accent" />
              <span className="text-xl font-bold">ResourceMatch</span>
            </Link>
            <p className="text-white/70 text-sm max-w-sm">
              AI-vetted senior Filipino professionals with 5-10+ years experience.
              Finance & accounting and operations management specialists.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-3 text-white/90">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">
                  Browse Talent
                </Link>
              </li>
              <li>
                <Link href="/hire" className="text-white/60 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-white/60 hover:text-white transition-colors">
                  Job Board
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-white/60 hover:text-white transition-colors">
                  Apply as Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3 text-white/90">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/60 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:hello@resourcematch.ph" className="text-white/60 hover:text-white transition-colors">
                  hello@resourcematch.ph
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
          &copy; {new Date().getFullYear()} ResourceMatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
