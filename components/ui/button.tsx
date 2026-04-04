import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--primary)",
    color: "var(--ink-strong)",
    borderColor: "var(--primary-deep)"
  },
  secondary: {
    background: "var(--blue)",
    color: "#fff",
    borderColor: "var(--blue)"
  },
  ghost: {
    background: "transparent",
    color: "var(--ink)",
    borderColor: "var(--line-strong)"
  }
};

export function Button({ href, children, variant = "primary" }: ButtonProps) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        minHeight: "3rem",
        padding: "0.8rem 1.15rem",
        border: "1px solid",
        borderRadius: "var(--radius-pill)",
        fontSize: "0.94rem",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        transition: "transform 140ms ease, box-shadow 140ms ease, background 140ms ease",
        boxShadow: "0 10px 24px rgba(15, 31, 46, 0.08)",
        ...variantStyles[variant]
      }}
    >
      {children}
    </Link>
  );
}
