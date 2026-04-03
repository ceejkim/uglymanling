import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-line)] bg-white p-6 shadow-[0_8px_40px_-20px_rgba(20,20,20,0.3)]",
        className,
      )}
      {...props}
    />
  );
}
