"use client";
import { useMouseGlow } from "@/hooks/useMouseGlow";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowCard({ children, className }: GlowCardProps) {
  const { cardRef, onMouseMove, onMouseLeave } = useMouseGlow();
  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("glow-card", className)}
    >
      {children}
    </div>
  );
}
