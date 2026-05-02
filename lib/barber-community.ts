import { deleteSupabaseRows, selectSupabaseRows, upsertSupabaseRow } from "@/lib/supabase";

export type BarberVoteValue = -1 | 1;

export type BarberComment = {
  id: string;
  userId: string;
  authorLabel: string;
  body: string;
  createdAt: string;
  sourceTag: string | null;
};

export type BarberCommunityStore = {
  votes: Record<string, Record<string, BarberVoteValue>>;
  comments: Record<string, BarberComment[]>;
};

export type BarberInteractionSummary = {
  barberId: string;
  upvotes: number;
  downvotes: number;
  score: number;
  commentCount: number;
  comments: BarberComment[];
  commentSummary: string;
  currentUserVote: BarberVoteValue | 0;
};

type BarberVoteRow = {
  barber_id: string;
  clerk_user_id: string;
  value: BarberVoteValue;
};

type BarberCommentRow = {
  id: string;
  barber_id: string;
  clerk_user_id: string;
  author_label: string;
  body: string;
  created_at: string;
  source_tag?: string | null;
};

export function makeAuthorLabel(userId: string) {
  return `Member ${userId.slice(-4).toUpperCase()}`;
}

function normalizeCommentSnippet(body: string) {
  const normalized = body.replace(/\s+/g, " ").trim();

  if (normalized.length <= 120) {
    return normalized;
  }

  return `${normalized.slice(0, 117).trimEnd()}...`;
}

function buildCommentSummary(comments: BarberComment[]) {
  const snippets = comments
    .map((comment) => normalizeCommentSnippet(comment.body))
    .filter(Boolean)
    .slice(0, 2);

  if (snippets.length === 0) {
    return "No comments yet.";
  }

  return snippets.join(" / ");
}

function mapCommentRow(row: BarberCommentRow): BarberComment {
  return {
    id: row.id,
    userId: row.clerk_user_id,
    authorLabel: row.author_label,
    body: row.body,
    createdAt: row.created_at,
    sourceTag: row.source_tag ?? null
  };
}

function buildSummaryFromRows({
  barberId,
  comments,
  userId,
  votes
}: {
  barberId: string;
  comments: BarberComment[];
  userId?: string | null;
  votes: BarberVoteRow[];
}): BarberInteractionSummary {
  const currentUserVote = userId ? votes.find((vote) => vote.clerk_user_id === userId)?.value ?? 0 : 0;
  const voteValues = votes.map((vote) => vote.value);
  const upvotes = voteValues.filter((value) => value === 1).length;
  const downvotes = voteValues.filter((value) => value === -1).length;

  return {
    barberId,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    commentCount: comments.length,
    comments,
    commentSummary: buildCommentSummary(comments),
    currentUserVote
  };
}

async function readBarberVotes(barberId?: string) {
  return selectSupabaseRows<BarberVoteRow>({
    table: "barber_votes",
    filters: barberId ? [`barber_id=eq.${barberId}`] : [],
    orderBy: "updated_at"
  });
}

async function readBarberComments(barberId?: string) {
  return selectSupabaseRows<BarberCommentRow>({
    table: "barber_comments",
    filters: [
      ...(barberId ? [`barber_id=eq.${barberId}`] : []),
      "status=eq.approved",
      "deleted_at=is.null"
    ],
    orderBy: "created_at"
  });
}

export async function listBarberInteractionSummaries({
  barberIds,
  userId
}: {
  barberIds: string[];
  userId?: string | null;
}) {
  if (barberIds.length === 0) {
    return [];
  }

  const [voteRows, commentRows] = await Promise.all([readBarberVotes(), readBarberComments()]);

  return barberIds.map((barberId) => {
    const votes = voteRows.filter((row) => row.barber_id === barberId);
    const comments = commentRows.filter((row) => row.barber_id === barberId).map(mapCommentRow);

    return buildSummaryFromRows({
      barberId,
      comments,
      userId,
      votes
    });
  });
}

export async function getBarberInteractionSummary({
  barberId,
  userId
}: {
  barberId: string;
  userId?: string | null;
}) {
  const [voteRows, commentRows] = await Promise.all([readBarberVotes(barberId), readBarberComments(barberId)]);

  return buildSummaryFromRows({
    barberId,
    comments: commentRows.map(mapCommentRow),
    userId,
    votes: voteRows
  });
}

export async function saveBarberVote({
  barberId,
  userId,
  value
}: {
  barberId: string;
  userId: string;
  value: BarberVoteValue;
}) {
  const existingVotes = await readBarberVotes(barberId);
  const existingVote = existingVotes.find((vote) => vote.clerk_user_id === userId)?.value ?? 0;

  if (existingVote === value) {
    await deleteSupabaseRows({
      table: "barber_votes",
      filters: [`barber_id=eq.${barberId}`, `clerk_user_id=eq.${userId}`]
    });
  } else {
    await upsertSupabaseRow<BarberVoteRow>({
      table: "barber_votes",
      values: {
        barber_id: barberId,
        clerk_user_id: userId,
        value
      },
      onConflict: "barber_id,clerk_user_id"
    });
  }

  return getBarberInteractionSummary({ barberId, userId });
}

export async function saveBarberComment({
  authorLabel,
  barberId,
  body,
  id,
  sourceTag,
  userId
}: {
  authorLabel: string;
  barberId: string;
  body: string;
  id: string;
  sourceTag?: string | null;
  userId: string;
}) {
  await upsertSupabaseRow<BarberCommentRow>({
    table: "barber_comments",
    values: {
      id,
      barber_id: barberId,
      clerk_user_id: userId,
      author_label: authorLabel,
      body,
      source_tag: sourceTag ?? null,
      status: "approved",
      created_at: new Date().toISOString()
    } as BarberCommentRow & { status: string },
    onConflict: "id"
  });

  return getBarberInteractionSummary({ barberId, userId });
}
