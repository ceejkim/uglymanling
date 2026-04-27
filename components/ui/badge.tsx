import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "ink" | "accent";
};

export function Badge({ children, tone = "ink" }: BadgeProps) {
  const styles =
    tone === "accent"
      ? { background: "rgba(255, 216, 77, 0.35)", color: "var(--ink-strong)", borderColor: "rgba(255, 216, 77, 0.9)" }
      : { background: "rgba(230, 240, 250, 0.9)", color: "var(--blue)", borderColor: "rgba(31, 58, 95, 0.15)" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: "1.95rem",
        padding: "0.2rem 0.7rem",
        borderRadius: "var(--radius-pill)",
        border: "1px solid",
        fontSize: "0.77rem",
        fontWeight: 800,
        letterSpacing: 0,
        textTransform: "uppercase",
        ...styles
      }}
    >
      {children}
    </span>
  );
}
