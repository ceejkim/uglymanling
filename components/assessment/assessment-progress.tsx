type AssessmentProgressProps = {
  completedSectionIds: string[];
  completedQuestions: number;
  currentSectionIndex: number;
  progressPercent: number;
  remainingQuestions: number;
  sections: Array<{
    id: string;
    title: string;
  }>;
  statusLabel: string;
};

export function AssessmentProgress({
  completedSectionIds,
  completedQuestions,
  currentSectionIndex,
  progressPercent,
  remainingQuestions,
  sections,
  statusLabel
}: AssessmentProgressProps) {
  const activeSection = sections[Math.max(currentSectionIndex, 0)];
  const completedSectionSet = new Set(completedSectionIds);

  return (
    <div className="assessment-progress-card grain-card">
      <div className="assessment-progress-topline">
        <div>
          <span className="eyebrow">6-8 minute baseline report</span>
          <p className="assessment-progress-copy">
            {activeSection ? activeSection.title : "Survey"} - Section{" "}
            {Math.min(currentSectionIndex + 1, sections.length)} of {sections.length}
          </p>
        </div>
        <div className="assessment-progress-meta">
          <strong>{remainingQuestions} questions remaining</strong>
          <span>{statusLabel}</span>
        </div>
      </div>
      <div className="assessment-section-track" aria-label="Survey sections">
        {sections.map((section, index) => {
          const isComplete = completedSectionSet.has(section.id);
          const isActive = index === currentSectionIndex;
          const statusLabelText = isComplete ? "Complete" : isActive ? "Current" : "Upcoming";

          return (
            <div
              key={section.id}
              className={`assessment-section-step${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
            >
              <span>{isComplete ? "✓" : index + 1}</span>
              <strong>{section.title}</strong>
              <small>{statusLabelText}</small>
            </div>
          );
        })}
      </div>
      <div className="assessment-progress-track" aria-hidden="true">
        <span style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="assessment-progress-footnote">
        {completedQuestions} answered so far. Clearer answers improve your report and strengthen aggregate insights.
      </p>
    </div>
  );
}
