import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/homepage/brand-mark";

type AssessmentShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  progress: ReactNode;
};

export function AssessmentShell({ children, footer, progress }: AssessmentShellProps) {
  return (
    <div className="assessment-flow">
      <header className="assessment-topbar">
        <Link href="/" aria-label="Go back to the Ugly Manling homepage">
          <BrandMark compact />
        </Link>
        <div className="assessment-topbar-meta">
          <p>Private by default. Quick by design.</p>
          <Link href="/">Back to home</Link>
        </div>
      </header>
      {progress}
      <div className="assessment-stage">{children}</div>
      {footer ? <div className="assessment-mobile-bar">{footer}</div> : null}
    </div>
  );
}

