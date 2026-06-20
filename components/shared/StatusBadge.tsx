import React from 'react';

export type BadgeStatus = 'critical' | 'warning' | 'pass' | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
}

const statusConfig: Record<BadgeStatus, { bg: string; text: string; label: string }> = {
  critical: { bg: 'bg-[#FDECEA]', text: 'text-[#C0392B]', label: 'Critical' },
  warning: { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', label: 'Warning' },
  pass: { bg: 'bg-[#DCFCE7]', text: 'text-[#166534]', label: 'Pass' },
  info: { bg: 'bg-[#E8F0EB]', text: 'text-[#2D6A4F]', label: 'Info' }
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
