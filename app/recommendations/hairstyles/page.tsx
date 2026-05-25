import { PlaceholderPage } from "@/components/placeholder-page";

export default function HairstyleRecommendationsPage() {
  return (
    <PlaceholderPage
      eyebrow="Recommendations"
      title="Suggested hairstyles are coming next."
      body="This lane will map hairline, crown, density, and texture signals to lower-contrast cuts. Fewer heroic combovers. More clean geometry."
      primaryHref="/style/barbers"
      primaryLabel="Find a barber"
      secondaryHref="/assessment"
      secondaryLabel="Retake assessment"
    />
  );
}
