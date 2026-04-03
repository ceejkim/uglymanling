import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        variant === "primary" &&
          "bg-[var(--color-accent)] text-white hover:opacity-90 focus-visible:ring-[var(--color-accent)]",
        variant === "secondary" &&
          "bg-white text-[var(--color-ink)] border border-[var(--color-line)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-accent)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] focus-visible:ring-[var(--color-accent)]",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
