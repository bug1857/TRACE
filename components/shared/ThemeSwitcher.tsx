/* eslint-disable */
'use client';

import { useTheme } from 'next-themes';
import { Palette } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[120px] h-[28px] bg-[var(--card)] rounded-md border border-[var(--border)]" />;
  }

  return (
    <div className="w-[120px]">
      <Select value={theme} onValueChange={(value) => value && setTheme(value)}>
        <SelectTrigger className="h-[28px] text-[12px] bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] font-sans px-2.5 rounded-md focus:ring-0 focus:ring-offset-0">
          <Palette className="w-3.5 h-3.5 mr-1 text-[var(--muted-foreground)]" />
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent className="bg-[var(--card)] border-[var(--border)] rounded-md shadow-sm">
          <SelectItem value="light" className="text-[12px] font-sans text-[var(--foreground)]">Corporate</SelectItem>
          <SelectItem value="green" className="text-[12px] font-sans text-[var(--foreground)]">Nature</SelectItem>
          <SelectItem value="dark" className="text-[12px] font-sans text-[var(--foreground)]">Dark</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
