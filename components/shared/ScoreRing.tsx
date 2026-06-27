import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreRing({ score, size = 120, label }: ScoreRingProps) {
  // Normalize score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Determine color based on threshold
  let color = 'var(--primary)'; // default green (>70)
  let bgColor = 'var(--accent)';
  if (normalizedScore < 40) {
    color = 'var(--destructive)'; // red
    bgColor = 'var(--trace-danger-light)';
  } else if (normalizedScore <= 70) {
    color = 'var(--trace-warning)'; // amber
    bgColor = 'var(--trace-warning-light)';
  }

  // SVG calculations
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2 select-none">
      <div 
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="square"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Centered value */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-[26px] font-mono font-medium text-[var(--foreground)] leading-none">
            {normalizedScore}
          </span>
          <span className="text-[10px] text-[var(--trace-subtle)] font-mono font-normal tracking-tight mt-0.5">
            / 100
          </span>
        </div>
      </div>

      {label && (
        <span className="text-[11px] font-sans font-medium text-[var(--muted-foreground)] uppercase tracking-wider text-center max-w-[140px]">
          {label}
        </span>
      )}
    </div>
  );
}
