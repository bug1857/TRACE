"use client";
import { useRef, useCallback } from "react";

export function useMouseGlow() {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    cardRef.current.style.setProperty("--glow-x", `${x}%`);
    cardRef.current.style.setProperty("--glow-y", `${y}%`);
    cardRef.current.style.setProperty("--glow-opacity", "1");
  }, []);

  const onMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--glow-opacity", "0");
  }, []);

  return { cardRef, onMouseMove, onMouseLeave };
}
