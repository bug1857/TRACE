import { forwardRef } from "react";
import { motion, MotionValue } from "framer-motion";

interface DockSidebarItemProps {
  scale: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const DockSidebarItem = forwardRef<HTMLDivElement, DockSidebarItemProps>(
  ({ scale, children, className = "", onClick }, ref) => {
    return (
      <motion.div
        ref={ref}
        style={{ scale, transformOrigin: "left center", willChange: "transform, opacity" }}
        className={className}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
);
DockSidebarItem.displayName = "DockSidebarItem";
