import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PlaceholderPage } from "@/components/placeholder-page";

export default async function CommunitySpacePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <PlaceholderPage
      eyebrow="Community members"
      title="Members-only community space."
      body="You made it past the gate. This route is where protected community features, discussion, progress sharing, and feedback loops will live."
      primaryHref="/contact"
      primaryLabel="Ask a question"
      secondaryHref="/community"
      secondaryLabel="Back to community preview"
    />
  );
}
