type AssessmentProgressProps = {
  completedQuestions: number;
  currentSectionIndex: number;
  progressPercent: number;
  remainingQuestions: number;
  sectionCount: number;
  statusLabel: string;
};

export function AssessmentProgress({
  completedQuestions,
  currentSectionIndex,
  progressPercent,
  remainingQuestions,
  sectionCount,
  statusLabel
}: AssessmentProgressProps) {
  return (
    <div className="assessment-progress-card grain-card">
      <div className="assessment-progress-topline">
        <div>
          <span className="eyebrow">2 minute assessment</span>
          <p className="assessment-progress-copy">
            Section {Math.min(currentSectionIndex + 1, sectionCount)} of {sectionCount}
          </p>
        </div>
        <div className="assessment-progress-meta">
          <strong>{remainingQuestions} questions remaining</strong>
          <span>{statusLabel}</span>
        </div>
      </div>
      <div className="assessment-progress-track" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="assessment-progress-footnote">
        {completedQuestions} answered so far. Built to give you a clearer next move, not false hope.
      </p>
    </div>
  );
}

