import Link from "next/link";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { LogoIcon } from "@/components/LogoIcon";

export default function PrivacyPolicy() {
  return (
    <>
      <SEO
        title="Privacy Policy - ResourceMatch"
        description="ResourceMatch privacy policy. Learn how we collect, use, and protect your personal information."
      />
      <LandingHeader />

      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <LogoIcon className="w-8 h-8" color="primary" />
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              Last updated: March 6, 2026
            </p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
                <p className="text-slate-600 leading-relaxed">
                  ResourceMatch (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the ResourceMatch platform at resourcematch.ph.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                  use our platform to connect with or be connected to senior Filipino professionals.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>

                <h3 className="text-lg font-medium text-slate-800 mb-2">Account Information</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                  <li>Name, email address, and password when you create an account</li>
                  <li>Company name, website, industry, and size (for employer accounts)</li>
                  <li>Professional experience, skills, and career history (for candidate accounts)</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">Vetting Data</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                  <li>Resume and career documents submitted for AI analysis</li>
                  <li>Responses to scenario-based assessments</li>
                  <li>Video interview recordings and transcripts</li>
                  <li>Professional references and verification results</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">Payment Information</h3>
                <p className="text-slate-600 leading-relaxed">
                  Payment processing is handled entirely by Stripe. We do not store credit card numbers,
                  CVVs, or other sensitive payment details on our servers. We retain transaction records
                  (amounts, dates, credit pack purchased) for billing purposes.
                </p>

                <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">Usage Data</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                  <li>Pages visited, search queries, and feature interactions</li>
                  <li>Device type, browser, IP address, and general location</li>
                  <li>Referral source and session duration</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                  <li>To operate and maintain the ResourceMatch platform</li>
                  <li>To process candidate vetting through our AI pipeline</li>
                  <li>To match employers with qualified professionals</li>
                  <li>To process payments and manage credit balances</li>
                  <li>To send transactional emails (account updates, application notifications)</li>
                  <li>To improve our services and develop new features</li>
                  <li>To prevent fraud and enforce our Terms of Service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">4. AI Processing</h2>
                <p className="text-slate-600 leading-relaxed">
                  Our platform uses artificial intelligence to evaluate candidate qualifications through
                  a 4-layer vetting pipeline (resume analysis, scenario assessments, video interview evaluation,
                  and reference verification). AI-generated scores and assessments are used to rank and present
                  candidates. These evaluations supplement, but do not replace, human judgment in hiring decisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Information Sharing</h2>
                <p className="text-slate-600 leading-relaxed mb-2">
                  We do not sell your personal information. We may share information with:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                  <li><strong>Employers</strong> — Candidate profiles (excluding locked contact details) are visible to registered employers. Full contact information is shared only after an employer unlocks a profile.</li>
                  <li><strong>Service providers</strong> — Stripe (payments), Anthropic (AI processing), Resend (email delivery), Google Cloud Platform (hosting and database).</li>
                  <li><strong>Legal compliance</strong> — When required by law, court order, or to protect our rights.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Data Security</h2>
                <p className="text-slate-600 leading-relaxed">
                  We implement industry-standard security measures including HTTPS encryption, secure password
                  hashing, authenticated API access, and rate limiting. Our infrastructure is hosted on
                  Google Cloud Platform with managed database security. However, no method of transmission
                  over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Retention</h2>
                <p className="text-slate-600 leading-relaxed">
                  We retain your account data for as long as your account is active. Candidate vetting data is
                  retained to maintain profile accuracy. You may request deletion of your account and associated
                  data by contacting us at hello@resourcematch.ph.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Your Rights</h2>
                <p className="text-slate-600 leading-relaxed mb-2">You have the right to:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account and data</li>
                  <li>Object to or restrict certain processing activities</li>
                  <li>Withdraw consent for optional data processing</li>
                </ul>
                <p className="text-slate-600 leading-relaxed mt-2">
                  To exercise these rights, contact us at hello@resourcematch.ph.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Cookies</h2>
                <p className="text-slate-600 leading-relaxed">
                  We use essential cookies for authentication and session management. These are necessary for
                  the platform to function and cannot be disabled. We do not use third-party tracking cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Changes to This Policy</h2>
                <p className="text-slate-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of material changes
                  by posting the updated policy on this page with a revised &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Contact Us</h2>
                <p className="text-slate-600 leading-relaxed">
                  If you have questions about this Privacy Policy, contact us at{" "}
                  <a href="mailto:hello@resourcematch.ph" className="text-primary hover:underline">
                    hello@resourcematch.ph
                  </a>
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Back to ResourceMatch
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
