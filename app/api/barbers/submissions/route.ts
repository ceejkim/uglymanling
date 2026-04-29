import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { makeAuthorLabel } from "@/lib/barber-community";
import { syncSignedInUser } from "@/lib/clerk-supabase";
import { upsertSupabaseRow } from "@/lib/supabase";

export const runtime = "nodejs";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = (await request.json()) as Partial<{
    barberName: string;
    barbershop: string;
  }>;
  const barberName = cleanText(body.barberName);
  const barbershop = cleanText(body.barbershop);

  if (barberName.length < 2 || barberName.length > 120) {
    return NextResponse.json({ error: "Barber name must be 2-120 characters." }, { status: 400 });
  }

  if (barbershop.length < 2 || barbershop.length > 140) {
    return NextResponse.json({ error: "Barbershop must be 2-140 characters." }, { status: 400 });
  }

  const submission = {
    id: randomUUID(),
    userId,
    authorLabel: makeAuthorLabel(userId),
    barberName,
    barbershop,
    status: "pending" as const,
    createdAt: new Date().toISOString()
  };

  try {
    await syncSignedInUser(userId);
    await upsertSupabaseRow({
      table: "barber_submissions",
      values: {
        id: submission.id,
        clerk_user_id: submission.userId,
        author_label: submission.authorLabel,
        barber_name: submission.barberName,
        barbershop: submission.barbershop,
        status: submission.status,
        created_at: submission.createdAt
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not submit barber." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, submission });
}
