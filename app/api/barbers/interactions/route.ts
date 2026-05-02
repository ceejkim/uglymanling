import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  getBarberInteractionSummary,
  listBarberInteractionSummaries,
  makeAuthorLabel,
  saveBarberComment,
  saveBarberVote
} from "@/lib/barber-community";
import { syncSignedInUser } from "@/lib/clerk-supabase";
import { getKnownBarberIds } from "@/lib/barber-data";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  try {
    const knownBarberIds = await getKnownBarberIds();
    const summaries = await listBarberInteractionSummaries({
      barberIds: knownBarberIds,
      userId
    });

    return NextResponse.json({ summaries });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load barber interactions." },
      { status: 500 }
    );
  }
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

  try {
    await syncSignedInUser(userId);

    if (body.type === "vote") {
      if (body.value !== 1 && body.value !== -1) {
        return NextResponse.json({ error: "Invalid vote value." }, { status: 400 });
      }

      const summary = await saveBarberVote({
        barberId: body.barberId,
        userId,
        value: body.value
      });

      return NextResponse.json({ summary });
    }

    if (body.type === "comment") {
      const trimmedBody = body.body.trim();

      if (trimmedBody.length < 10) {
        return NextResponse.json({ error: "Comment must be at least 10 characters." }, { status: 400 });
      }

      if (trimmedBody.length > 400) {
        return NextResponse.json({ error: "Comment must stay under 400 characters." }, { status: 400 });
      }

      const summary = await saveBarberComment({
        authorLabel: makeAuthorLabel(userId),
        barberId: body.barberId,
        body: trimmedBody,
        id: randomUUID(),
        userId
      });

      return NextResponse.json({ summary });
    }

    return NextResponse.json({ error: "Unsupported interaction." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save interaction." },
      { status: 500 }
    );
  }
}
