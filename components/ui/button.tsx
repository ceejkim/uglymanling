import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
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

export function Button({ href, children, variant = "primary", onClick }: ButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        minHeight: "3.05rem",
        padding: "0.82rem 1.2rem",
        border: "1px solid",
        borderRadius: "var(--radius-pill)",
        fontSize: "0.92rem",
        fontWeight: 800,
        letterSpacing: "0.01em",
        transition: "transform 140ms ease, box-shadow 140ms ease, background 140ms ease",
        boxShadow: "0 6px 16px rgba(15, 31, 46, 0.06)",
        ...variantStyles[variant]
      }}
    >
      {children}
    </Link>
  );
}
