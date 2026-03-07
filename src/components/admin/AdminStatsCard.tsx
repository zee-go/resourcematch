import type { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function AdminStatsCard({ label, value, icon: Icon, description }: AdminStatsCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {description && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </div>
  );
}
