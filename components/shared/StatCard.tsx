import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | null;
  trendValue?: string | number;
  trendInverse?: boolean; // if true, down is green, up is red (e.g. emissions)
}

export default function StatCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  trendInverse = false
}: StatCardProps) {
  const renderTrend = () => {
    if (!trend || !trendValue) return null;

    const isUp = trend === 'up';
    // Decide color based on trend direction and trendInverse
    // Normal: up = green (good), down = red (bad)
    // Inverse: up = red (bad), down = green (good)
    const isPositiveOutcome = trendInverse ? !isUp : isUp;
    const colorClass = isPositiveOutcome ? 'text-[var(--trace-success)] bg-[var(--trace-success-light)]' : 'text-[var(--destructive)] bg-[var(--trace-danger-light)]';
    const Icon = isUp ? ArrowUpRight : ArrowDownRight;

    return (
      <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-[3px] text-[11px] font-mono font-medium ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{trendValue}</span>
      </div>
    );
  };

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-md p-5 flex flex-col justify-between shadow-sm min-h-[110px] w-full hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ease-out cursor-default">
      <div className="flex justify-between items-start gap-4">
        <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          {label}
        </span>
        {renderTrend()}
      </div>

      <div className="mt-3 flex items-baseline gap-1 select-all">
        <span className="text-[28px] font-mono font-medium text-[var(--foreground)] leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[14px] font-mono text-[var(--muted-foreground)] font-normal lowercase ml-0.5">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
