import Link from "next/link";
import { LogoIcon } from "@/components/LogoIcon";

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <LogoIcon className="w-8 h-8" color="accent" />
              <span className="text-xl font-heading font-bold">ResourceMatch</span>
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
                <Link href="/jobs/post" className="text-white/60 hover:text-white transition-colors">
                  Post Open Role
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-white/60 hover:text-white transition-colors">
                  Apply as Talent
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white/60 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3 text-white/90">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog/why-hire-filipino-accountants" className="text-white/60 hover:text-white transition-colors">
                  Why Hire Filipino Accountants
                </Link>
              </li>
              <li>
                <Link href="/blog/cost-of-hiring-filipino-accountant-vs-us" className="text-white/60 hover:text-white transition-colors">
                  Filipino vs US Accountant Cost
                </Link>
              </li>
              <li>
                <Link href="/blog/how-to-hire-filipino-operations-manager" className="text-white/60 hover:text-white transition-colors">
                  Hire Filipino Ops Manager
                </Link>
              </li>
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
