'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DemoDataBannerProps {
  show: boolean;
}

export default function DemoDataBanner({ show }: DemoDataBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!show || !visible) return null;

  return (
    <div className="no-print flex justify-between items-center p-3 bg-[var(--card)] border border-[var(--border)] rounded-md text-[12px] text-[var(--foreground)] font-sans select-none">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
        <span className="text-[var(--muted-foreground)]">
          Showing demo data — upload a CSV on the OCEL page to see your real numbers
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-md hover:bg-[var(--border)] transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
