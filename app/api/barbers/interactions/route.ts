import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  buildBarberInteractionSummary,
  makeAuthorLabel,
  readBarberCommunityStore,
  writeBarberCommunityStore
} from "@/lib/barber-community";
import { getKnownBarberIds } from "@/lib/barber-data";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  const store = await readBarberCommunityStore();
  const knownBarberIds = await getKnownBarberIds();

  const summaries = knownBarberIds.map((barberId) =>
    buildBarberInteractionSummary({
      barberId,
      store,
      userId
    })
  );

  return NextResponse.json({ summaries });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  const knownBarberIds = new Set(await getKnownBarberIds());

  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as
    | { type: "vote"; barberId: string; value: -1 | 1 }
    | { type: "comment"; barberId: string; body: string };

  if (!body.barberId || !knownBarberIds.has(body.barberId)) {
    return NextResponse.json({ error: "Unknown barber." }, { status: 400 });
  }

  const store = await readBarberCommunityStore();

  if (body.type === "vote") {
    if (body.value !== 1 && body.value !== -1) {
      return NextResponse.json({ error: "Invalid vote value." }, { status: 400 });
    }

    const barberVotes = store.votes[body.barberId] ?? {};
    const existingVote = barberVotes[userId] ?? 0;

    if (existingVote === body.value) {
      delete barberVotes[userId];
    } else {
      barberVotes[userId] = body.value;
    }

    store.votes[body.barberId] = barberVotes;
    await writeBarberCommunityStore(store);

    return NextResponse.json({
      summary: buildBarberInteractionSummary({
        barberId: body.barberId,
        store,
        userId
      })
    });
  }

  if (body.type === "comment") {
    const trimmedBody = body.body.trim();

    if (trimmedBody.length < 10) {
      return NextResponse.json({ error: "Comment must be at least 10 characters." }, { status: 400 });
    }

    if (trimmedBody.length > 400) {
      return NextResponse.json({ error: "Comment must stay under 400 characters." }, { status: 400 });
    }

    const nextComment = {
      id: randomUUID(),
      userId,
      authorLabel: makeAuthorLabel(userId),
      body: trimmedBody,
      createdAt: new Date().toISOString()
    };

    const existingComments = store.comments[body.barberId] ?? [];
    store.comments[body.barberId] = [nextComment, ...existingComments].slice(0, 20);
    await writeBarberCommunityStore(store);

    return NextResponse.json({
      summary: buildBarberInteractionSummary({
        barberId: body.barberId,
        store,
        userId
      })
    });
  }

  return NextResponse.json({ error: "Unsupported interaction." }, { status: 400 });
}
