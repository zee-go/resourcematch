import { Users, ShieldCheck, DollarSign } from "lucide-react";

export function StatsCards() {
  const stats = [
    {
      icon: Users,
      value: "500+",
      label: "Vetted Candidates",
      description: "Pre-screened professionals",
      gradient: "from-[#2D5F3F] to-[#1a3a26]",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: "Pre-Screened",
      description: "Skills verified & background checked",
      gradient: "from-[#D97642] to-[#c26638]",
    },
    {
      icon: DollarSign,
      value: "$3",
      label: "Per Contact",
      description: "Unlock full profiles instantly",
      gradient: "from-[#2D5F3F] to-[#1a3a26]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-300 group"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500">{stat.description}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}