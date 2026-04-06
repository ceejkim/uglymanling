import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type BarberVoteValue = -1 | 1;

export type BarberComment = {
  id: string;
  userId: string;
  authorLabel: string;
  body: string;
  createdAt: string;
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
  currentUserVote: BarberVoteValue | 0;
};

const STORE_PATH = path.join(process.cwd(), "data", "barber-community.json");

const emptyStore: BarberCommunityStore = {
  votes: {},
  comments: {}
};

async function ensureStoreFile() {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(emptyStore, null, 2));
  }
}

export async function readBarberCommunityStore() {
  await ensureStoreFile();

  const content = await readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(content) as BarberCommunityStore;

  return {
    votes: parsed.votes ?? {},
    comments: parsed.comments ?? {}
  } satisfies BarberCommunityStore;
}

export async function writeBarberCommunityStore(store: BarberCommunityStore) {
  await ensureStoreFile();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export function makeAuthorLabel(userId: string) {
  return `Member ${userId.slice(-4).toUpperCase()}`;
}

export function buildBarberInteractionSummary({
  barberId,
  store,
  userId
}: {
  barberId: string;
  store: BarberCommunityStore;
  userId?: string | null;
}): BarberInteractionSummary {
  const barberVotes = store.votes[barberId] ?? {};
  const comments = store.comments[barberId] ?? [];
  const voteValues = Object.values(barberVotes);
  const upvotes = voteValues.filter((value) => value === 1).length;
  const downvotes = voteValues.filter((value) => value === -1).length;
  const currentUserVote = userId ? barberVotes[userId] ?? 0 : 0;

  return {
    barberId,
    upvotes,
    downvotes,
    score: upvotes - downvotes,
    commentCount: comments.length,
    comments,
    currentUserVote
  };
}
