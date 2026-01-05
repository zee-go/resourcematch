import { DollarSign, Shield, Target, Globe } from "lucide-react";

export function WhyChoose() {
  const features = [
    {
      icon: DollarSign,
      title: "Premium Rates, Zero Competition",
      benefits: [
        "Companies pre-qualified with $8-30/hr budgets",
        "No lowball offers or endless negotiations"
      ],
      gradient: "from-forest-primary/10 to-forest-accent/10"
    },
    {
      icon: Shield,
      title: "Verified Companies Only",
      benefits: [
        "Every client screened and verified",
        "Work with legitimate businesses, not scammers"
      ],
      gradient: "from-burnt-primary/10 to-burnt-accent/10"
    },
    {
      icon: Target,
      title: "Quality Over Quantity",
      benefits: [
        "Curated opportunities matching your skills",
        "No spam, no irrelevant projects"
      ],
      gradient: "from-forest-accent/10 to-forest-primary/10"
    },
    {
      icon: Globe,
      title: "Global Opportunities",
      benefits: [
        "Access to US, European, and Australian clients",
        "Seeking experienced Filipino talent"
      ],
      gradient: "from-burnt-accent/10 to-burnt-primary/10"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose <span className="text-forest-primary dark:text-forest-accent">ResourceMatch</span>?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A premium marketplace designed specifically for experienced Filipino professionals
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-forest-primary/50 dark:hover:border-forest-accent/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "backwards"
                }}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-forest-primary to-forest-accent dark:from-forest-accent dark:to-burnt-accent mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-forest-primary dark:group-hover:text-forest-accent transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Benefits List */}
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li
                        key={benefitIndex}
                        className="flex items-start gap-2 text-gray-600 dark:text-gray-400"
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest-primary dark:bg-forest-accent mt-2 flex-shrink-0"></span>
                        <span className="text-sm leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decorative Corner Element */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-forest-primary/5 to-burnt-primary/5 rounded-full blur-2xl group-hover:from-forest-primary/10 group-hover:to-burnt-primary/10 transition-all duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join 500+ verified professionals already working with premium clients
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-primary/10 to-burnt-primary/10 dark:from-forest-accent/10 dark:to-burnt-accent/10 rounded-full border border-forest-primary/20 dark:border-forest-accent/20">
            <Shield className="w-5 h-5 text-forest-primary dark:text-forest-accent" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Exclusive Network for Top 5% Filipino Talent
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}