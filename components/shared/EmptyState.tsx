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
    <div className="flex flex-col items-center justify-center text-center p-8 border border-[#E2E0D8] bg-[#FAFAF8] rounded-md min-h-[300px] w-full select-none">
      <div className="mb-4 text-[#E2E0D8] bg-[#F3F2EE] p-4 rounded-md border border-[#E2E0D8]">
        <Icon className="w-12 h-12" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-[16px] font-sans font-medium text-[#1A1917] mb-1">
        {title}
      </h3>
      
      <p className="text-[14px] text-[#6B6963] font-sans max-w-sm mb-5 leading-normal">
        {description}
      </p>
      
      {actionText && onAction && (
        <Button
          onClick={onAction}
          variant="outline"
          className="h-[32px] text-[13px] font-sans font-medium border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E8F0EB] hover:text-[#2D6A4F] rounded-md transition-colors"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
