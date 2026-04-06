import { currentUser } from "@clerk/nextjs/server";
import { upsertSupabaseRow } from "@/lib/supabase";

type ClerkUser = Awaited<ReturnType<typeof currentUser>>;

export type ProfileRow = {
  clerk_user_id: string;
  email: string | null;
  first_name: string | null;
  image_url: string | null;
  last_name: string | null;
  last_sign_in_at: string;
  username: string | null;
};

function getPrimaryEmail(user: ClerkUser) {
  if (!user) {
    return null;
  }

  const primaryEmailId = user.primaryEmailAddressId;
  return (
    user.emailAddresses.find((email) => email.id === primaryEmailId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null
  );
}

export async function syncSignedInUser(userId: string) {
  const user = await currentUser();

  if (!user) {
    throw new Error("Unable to load Clerk user for Supabase sync.");
  }

  const profile: ProfileRow = {
    clerk_user_id: userId,
    email: getPrimaryEmail(user),
    first_name: user.firstName,
    image_url: user.imageUrl,
    last_name: user.lastName,
    last_sign_in_at: new Date().toISOString(),
    username: user.username
  };

  await upsertSupabaseRow({
    table: "profiles",
    values: profile,
    onConflict: "clerk_user_id"
  });

  return profile;
}
