"use client";
import { Handle, Position, NodeProps } from "reactflow";
import { motion } from "framer-motion";

export function AnimatedFlowNode({ data, isConnectable }: NodeProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.06,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(61,138,122,0.25)",
        transition: { type: "spring", stiffness: 400, damping: 25 },
      }}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "8px 12px",
        minWidth: "120px",
        cursor: "pointer",
        willChange: "transform",
      }}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--foreground)" }}>
        {data.label}
      </div>
      {data.freq && (
        <div style={{ fontSize: "9px", color: "var(--muted-foreground)", marginTop: 2 }}>
          Freq: {data.freq}
        </div>
      )}
      {data.duration && (
        <div style={{ fontSize: "9px", color: "var(--muted-foreground)" }}>
          Duration: {data.duration}
        </div>
      )}
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </motion.div>
  );
}
