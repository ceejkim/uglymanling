import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const storePath = path.join(repoRoot, "data", "barber-community.json");

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }

  return value;
}

async function readStore() {
  const content = await readFile(storePath, "utf8");
  return JSON.parse(content);
}

async function upsertRows({ onConflict, rows, table }) {
  if (!rows.length) {
    return;
  }

  const url = new URL(`${requireEnv("NEXT_PUBLIC_SUPABASE_URL")}/rest/v1/${table}`);

  if (onConflict) {
    url.searchParams.set("on_conflict", onConflict);
  }

  const apiKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(rows)
  });

  if (!response.ok) {
    throw new Error(`Supabase ${table} backfill failed: ${await response.text()}`);
  }
}

async function main() {
  const store = await readStore();
  const now = new Date().toISOString();

  const voteRows = Object.entries(store.votes ?? {}).flatMap(([barberId, votes]) =>
    Object.entries(votes ?? {}).map(([clerkUserId, value]) => ({
      barber_id: barberId,
      clerk_user_id: clerkUserId,
      value,
      created_at: now,
      updated_at: now
    }))
  );

  const commentRows = Object.entries(store.comments ?? {}).flatMap(([barberId, comments]) =>
    (comments ?? []).map((comment) => ({
      id: comment.id,
      barber_id: barberId,
      clerk_user_id: comment.userId,
      author_label: comment.authorLabel,
      body: comment.body,
      source_tag: comment.sourceTag ?? "mvp",
      status: "approved",
      created_at: comment.createdAt,
      updated_at: comment.createdAt
    }))
  );

  await upsertRows({
    table: "barber_votes",
    rows: voteRows,
    onConflict: "barber_id,clerk_user_id"
  });

  await upsertRows({
    table: "barber_comments",
    rows: commentRows,
    onConflict: "id"
  });

  console.log(`Backfilled ${voteRows.length} votes and ${commentRows.length} comments into Supabase.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
