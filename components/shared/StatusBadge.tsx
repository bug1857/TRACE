import React from 'react';

export type BadgeStatus = 'critical' | 'warning' | 'pass' | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
}

const statusConfig: Record<BadgeStatus, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-[var(--trace-danger-light)]', text: 'text-[var(--destructive)]', label: 'Critical' },
  warning: { bg: 'bg-[var(--trace-warning-light)]', text: 'text-[var(--trace-warning)]', label: 'Warning' },
  pass: { bg: 'bg-[var(--trace-success-light)]', text: 'text-[var(--trace-success)]', label: 'Pass' },
  info: { bg: 'bg-[var(--accent)]', text: 'text-[var(--primary)]', label: 'Info' }
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${config.bg} ${config.text} border border-transparent select-none shrink-0`}>
      {label || config.label}
    </span>
  );
}
