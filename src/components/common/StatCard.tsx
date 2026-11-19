import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlightColor?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlightColor = 'blue',
}) => {
  const colorMap = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
    slate: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
          {title}
        </span>
        <div className={`p-2 rounded-lg shrink-0 ${colorMap[highlightColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {trend && (
              <span
                className={`font-semibold tabular-nums ${
                  trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
            {trend && <span aria-hidden="true">·</span>}
            <span className="truncate">{subtitle || trend?.label}</span>
          </div>
        )}
      </div>
    </div>
  );
};
