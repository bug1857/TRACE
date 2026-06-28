import { useRef, useCallback } from "react";
import { useMotionValue, useSpring, MotionValue } from "framer-motion";

const MAGNIFICATION = 1.55;
const RANGE         = 80;
const SPRING_CONFIG = { stiffness: 180, damping: 22, mass: 0.4 };

export function useDockMagnification(itemCount: number) {
  const mouseY = useMotionValue(Infinity);
  const rafRef = useRef<number | null>(null);

  const scaleValues: MotionValue<number>[] = Array.from({ length: itemCount }, () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMotionValue(1)
  );

  const springScales = scaleValues.map((sv) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSpring(sv, SPRING_CONFIG)
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>, itemRefs: Array<{ current: HTMLElement | null }>) => {
      if (rafRef.current !== null) return; // skip if frame already queued
      const cursorY = e.clientY;
      rafRef.current = requestAnimationFrame(() => {
        itemRefs.forEach((ref, i) => {
          if (!ref.current) return;
          const rect    = ref.current.getBoundingClientRect();
          const centerY = rect.top + rect.height / 2;
          const dist    = Math.abs(cursorY - centerY);
          const scale   = dist < RANGE
            ? 1 + (MAGNIFICATION - 1) * Math.exp(-(dist * dist) / (2 * (RANGE / 2.5) ** 2))
            : 1;
          scaleValues[i].set(scale);
        });
        rafRef.current = null;
      });
    },
    [scaleValues]
  );

  const onMouseLeave = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    mouseY.set(Infinity);
    scaleValues.forEach((sv) => sv.set(1));
  }, [mouseY, scaleValues]);

  return { springScales, onMouseMove, onMouseLeave };
}
