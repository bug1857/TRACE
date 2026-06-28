"use client";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
}: AnimatedNumberProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  return (
    <span ref={ref}>
      {inView ? (
        <CountUp
          end={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
          duration={duration}
          separator=","
          useEasing
          easingFn={(t, b, c, d) => {
            // ease-out-expo
            return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
          }}
        />
      ) : (
        <span style={{ opacity: 0 }}>0</span>
      )}
    </span>
  );
}
