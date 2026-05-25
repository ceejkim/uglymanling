import { auth } from "@clerk/nextjs/server";
import { AssessmentResultsView } from "@/components/assessment/assessment-results-view";
import { getAssessmentAnswers, getAssessmentSession } from "@/lib/assessment/server";
import {
  buildAndPersistAssessmentResult,
  getAssessmentResultSnapshot,
  resultVersion
} from "@/lib/assessment/results";

type AssessmentResultsPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
  searchParams: Promise<{
    rt?: string;
  }>;
};

export default async function AssessmentResultsPage({
  params,
  searchParams
}: AssessmentResultsPageProps) {
  const { sessionId } = await params;
  const { rt } = await searchParams;
  const { userId } = await auth();
  const session = await getAssessmentSession(sessionId);

  if (!session) {
    return (
      <main className="page-shell assessment-page">
        <div className="assessment-loading grain-card">
          <span className="eyebrow">Assessment results</span>
          <h1>We could not find that result.</h1>
          <p>The session may have expired or the link is incomplete.</p>
        </div>
      </main>
    );
  }

  const hasAccess =
    (userId && session.clerk_user_id === userId) || (rt && session.resume_token === rt);

  if (!hasAccess) {
    return (
      <main className="page-shell assessment-page">
        <div className="assessment-loading grain-card">
          <span className="eyebrow">Assessment results</span>
          <h1>This result is private.</h1>
          <p>Use the original results link or sign in to the matching account.</p>
        </div>
      </main>
    );
  }

  const answers = await getAssessmentAnswers(sessionId);
  let snapshot = await getAssessmentResultSnapshot(sessionId, answers);

  if (!snapshot || snapshot.resultVersion !== resultVersion) {
    snapshot = await buildAndPersistAssessmentResult(sessionId, answers);
  }

  return (
    <main className="page-shell assessment-page">
      <AssessmentResultsView resumeToken={rt ?? null} sessionId={sessionId} snapshot={snapshot} />
    </main>
  );
}
