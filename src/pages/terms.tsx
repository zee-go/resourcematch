import Link from "next/link";
import { SEO } from "@/components/SEO";
import { LandingHeader } from "@/components/LandingHeader";
import { Footer } from "@/components/Footer";
import { LogoIcon } from "@/components/LogoIcon";

export default function TermsOfService() {
  return (
    <>
      <SEO
        title="Terms of Service - ResourceMatch"
        description="ResourceMatch terms of service. Read the terms governing use of our platform."
        url="https://resourcematch.ph/terms"
      />
      <LandingHeader />

      <main className="pt-24 pb-16 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-8">
              <LogoIcon className="w-8 h-8" color="primary" />
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              Last updated: March 6, 2026
            </p>

            <div className="prose prose-slate max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-slate-600 leading-relaxed">
                  By accessing or using ResourceMatch (&quot;the Platform&quot;), operated at resourcematch.ph,
                  you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description of Service</h2>
                <p className="text-slate-600 leading-relaxed">
                  ResourceMatch is a B2B marketplace that connects international companies with AI-vetted
                  senior Filipino professionals. We provide candidate discovery, AI-powered vetting assessments,
                  profile unlocking, job posting, and application management services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Account Types</h2>

                <h3 className="text-lg font-medium text-slate-800 mb-2">Employer Accounts</h3>
                <p className="text-slate-600 leading-relaxed">
                  Companies register to browse candidate profiles, unlock contact information, post job listings,
                  and manage applications. You must provide accurate company information during registration.
                </p>

                <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">Candidate Accounts</h3>
                <p className="text-slate-600 leading-relaxed">
                  Professionals register to create profiles, apply to jobs, and participate in our vetting process.
                  You must provide truthful information about your qualifications and experience.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Credits and Payments</h2>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-2">
                  <li>
                    <strong>Credit packs</strong> — Credits are purchased in packs (1, 5, or 15 credits) and
                    used to unlock candidate contact information. Credits do not expire.
                  </li>
                  <li>
                    <strong>Subscriptions</strong> — Monthly subscription plans include a set number of unlocks
                    per month, AI matching features, and priority support. Subscriptions renew automatically
                    until cancelled.
                  </li>
                  <li>
                    <strong>Refunds</strong> — Credit purchases are non-refundable once used to unlock a profile.
                    Unused credits from packs may be refunded within 30 days of purchase. Subscription refunds
                    are handled on a case-by-case basis.
                  </li>
                  <li>
                    <strong>Payment processing</strong> — All payments are processed securely through Stripe.
                    We do not store payment card details.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Job Postings</h2>
                <p className="text-slate-600 leading-relaxed">
                  Employers may post job listings at no cost. Job postings must accurately describe the role,
                  requirements, and compensation. We reserve the right to remove job postings that are
                  misleading, discriminatory, or violate these terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">6. AI Vetting</h2>
                <p className="text-slate-600 leading-relaxed">
                  Our AI vetting pipeline provides automated assessments of candidate qualifications. These
                  assessments are informational tools to assist hiring decisions and should not be the sole
                  basis for employment decisions. ResourceMatch does not guarantee the accuracy of AI-generated
                  evaluations or candidate-provided information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">7. User Conduct</h2>
                <p className="text-slate-600 leading-relaxed mb-2">You agree not to:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                  <li>Provide false or misleading information in your account or job postings</li>
                  <li>Scrape, harvest, or collect candidate data for unauthorized purposes</li>
                  <li>Share unlocked candidate contact information with third parties</li>
                  <li>Use the Platform for any unlawful purpose or to discriminate against candidates</li>
                  <li>Attempt to circumvent payment requirements or exploit system vulnerabilities</li>
                  <li>Interfere with the Platform&apos;s operation or other users&apos; experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Intellectual Property</h2>
                <p className="text-slate-600 leading-relaxed">
                  The ResourceMatch platform, including its design, branding, AI vetting methodology, and
                  software, is our proprietary property. You may not reproduce, modify, or distribute any
                  part of the Platform without our written consent.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Employment Relationship</h2>
                <p className="text-slate-600 leading-relaxed">
                  ResourceMatch is a marketplace platform only. We are not a staffing agency, employer of
                  record, or party to any employment agreement between employers and candidates. All
                  employment terms, compensation, and work arrangements are solely between the hiring
                  company and the professional.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Limitation of Liability</h2>
                <p className="text-slate-600 leading-relaxed">
                  ResourceMatch is provided &quot;as is&quot; without warranties of any kind. We are not liable for
                  hiring outcomes, employment disputes, candidate performance, or losses arising from use of
                  the Platform. Our total liability is limited to the amount you paid to ResourceMatch in the
                  12 months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Termination</h2>
                <p className="text-slate-600 leading-relaxed">
                  We may suspend or terminate your account at any time for violation of these terms or at our
                  discretion. You may close your account by contacting us. Upon termination, unused credits
                  from packs may be refunded per our refund policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Changes to Terms</h2>
                <p className="text-slate-600 leading-relaxed">
                  We may modify these Terms at any time. Continued use of the Platform after changes
                  constitutes acceptance. We will notify users of material changes via email or platform notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">13. Governing Law</h2>
                <p className="text-slate-600 leading-relaxed">
                  These Terms are governed by the laws of the Republic of the Philippines. Any disputes
                  shall be resolved through the courts of Metro Manila, Philippines.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-3">14. Contact</h2>
                <p className="text-slate-600 leading-relaxed">
                  For questions about these Terms, contact us at{" "}
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

      <Footer />
    </>
  );
}
