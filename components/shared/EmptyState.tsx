import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-[var(--border)] bg-[var(--background)] rounded-md min-h-[300px] w-full select-none">
      <div className="mb-4 text-[var(--border)] bg-[var(--card)] p-4 rounded-md border border-[var(--border)]">
        <Icon className="w-12 h-12" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-[16px] font-sans font-medium text-[var(--foreground)] mb-1">
        {title}
      </h3>
      
      <p className="text-[14px] text-[var(--muted-foreground)] font-sans max-w-sm mb-5 leading-normal">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="h-[32px] text-[13px] font-sans font-medium border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-[var(--primary)] rounded-md transition-colors"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
