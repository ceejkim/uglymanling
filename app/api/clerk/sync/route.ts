import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { syncSignedInUser } from "@/lib/clerk-supabase";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await syncSignedInUser(userId);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Clerk sync failed"
      },
      { status: 500 }
    );
  }
}
