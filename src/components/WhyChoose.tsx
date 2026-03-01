import { ShieldCheck, Briefcase, Building2, FileText } from "lucide-react";

export function WhyChoose() {
  const features = [
    {
      icon: ShieldCheck,
      title: "AI-Vetted Expertise",
      benefits: [
        "Every candidate passes resume analysis, scenario assessments, and video interview evaluation",
        "Career trajectory scoring identifies top performers, not just job hoppers"
      ],
    },
    {
      icon: Briefcase,
      title: "Senior-Level Experience",
      benefits: [
        "Minimum 5 years domain experience in your target vertical",
        "Experts who have managed teams, built systems, and solved complex problems"
      ],
    },
    {
      icon: Building2,
      title: "Vertical Specialization",
      benefits: [
        "E-commerce operations and accounting & finance",
        "Role-specific vetting scenarios tailored to your industry"
      ],
    },
    {
      icon: FileText,
      title: "Portfolio-Style Profiles",
      benefits: [
        "Case studies, project outcomes, and verified references — not just a skills list",
        "Video introductions and communication assessments included"
      ],
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Companies Choose{" "}
            <span className="text-primary">ResourceMatch</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Senior talent, rigorously vetted, ready to deliver.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "backwards"
                }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#04443C] to-[#D38B53] mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Benefits List */}
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                        <span className="text-sm leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-2xl group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Every professional is vetted across resume analysis, scenario assessments, video interviews, and reference checks
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full border border-primary/20">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              AI-Vetted Senior Talent Network
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
