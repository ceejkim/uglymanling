type AssessmentProgressProps = {
  currentQuestionNumber: number;
  currentSectionIndex: number;
  progressPercent: number;
  remainingQuestions: number;
  sections: Array<{
    id: string;
    title: string;
  }>;
  statusLabel: string;
  totalQuestions: number;
};

export function AssessmentProgress({
  currentQuestionNumber,
  currentSectionIndex,
  progressPercent,
  remainingQuestions,
  sections,
  statusLabel,
  totalQuestions
}: AssessmentProgressProps) {
  const activeSection = sections[Math.max(currentSectionIndex, 0)];
  const safeTotalQuestions = Math.max(totalQuestions, 0);
  const safeCurrentQuestionNumber =
    safeTotalQuestions === 0
      ? 0
      : Math.min(Math.max(currentQuestionNumber, 1), safeTotalQuestions);
  const safeCurrentSectionNumber =
    sections.length === 0
      ? 0
      : Math.min(Math.max(currentSectionIndex + 1, 1), sections.length);
  const questionProgressLabel =
    safeTotalQuestions > 0
      ? `Question ${safeCurrentQuestionNumber} of ${safeTotalQuestions}`
      : "Survey setup";
  const unansweredLabel = `${remainingQuestions} ${
    remainingQuestions === 1 ? "question" : "questions"
  } to answer`;
  const answeredQuestions = Math.max(safeTotalQuestions - remainingQuestions, 0);
  const completionValueText =
    safeTotalQuestions > 0
      ? `${answeredQuestions} of ${safeTotalQuestions} questions answered`
      : "Survey progress loading";

  return (
    <div className="assessment-progress-card" aria-label="Survey progress">
      <div className="assessment-progress-topline">
        <div className="assessment-progress-context">
          <strong>{questionProgressLabel}</strong>
          <span>{activeSection ? activeSection.title : "Survey"}</span>
        </div>
        <div className="assessment-progress-meta">
          <span>
            Section {safeCurrentSectionNumber} of {sections.length}
          </span>
          <span>
            {unansweredLabel} - {statusLabel}
          </span>
        </div>
      </div>
      <div
        className="assessment-progress-track"
        role="progressbar"
        aria-label="Survey completion"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progressPercent}
        aria-valuetext={completionValueText}
      >
        <span style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
}
