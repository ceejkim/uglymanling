import type { CSSProperties, ReactNode } from "react";

type CardProps = Readonly<{
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}>;

export function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={`grain-card ${className ?? ""}`.trim()}
      style={{
        borderRadius: "var(--radius-xl)",
        padding: "1.25rem",
        ...style
      }}
    >
      {children}
    </div>
  );
}
