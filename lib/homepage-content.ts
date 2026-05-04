export const quickPaths = [
  { label: "Need a plan", href: "/assessment", note: "Start here. Breathe once." },
  { label: "Need treatment", href: "/assessment#treatments", note: "See what works." },
  { label: "Need a haircut", href: "/style/barbers", note: "Find a barber who gets it." },
  { label: "Need a human", href: "/consult", note: "Talk to someone real." }
] as const;

export const offerings = [
  {
    title: "Plan",
    body: "Figure out your next move.",
    cta: "Start assessment",
    href: "/assessment",
    proof: "Less spiraling. More direction."
  },
  {
    title: "Expert help",
    body: "Ask before you overspend.",
    cta: "Request consult",
    href: "/consult",
    proof: "Better than forum archaeology."
  },
  {
    title: "Style",
    body: "Look better fast.",
    cta: "Browse barber directory",
    href: "/style/barbers",
    proof: "No panic haircut required."
  }
] as const;

export const communityBullets = [
  "Find community verified barbers in your area",
  "Discounts and booking links",
  "Review your barber for our free community",
  "See what other balding men actually recommend"
] as const;

export const testimonials = [
  {
    quote: "I stopped doom-scrolling and made a plan.",
    label: "Plan-first user"
  },
  {
    quote: "The haircut advice saved me from myself.",
    label: "Style support"
  }
] as const;

export const howItWorks = [
  "Assess",
  "Pick a path",
  "Do the next thing"
] as const;

export const connectOptions = [
  { title: "Contact", body: "Ask a question. We answer.", href: "/contact" },
  { title: "Consult", body: "Talk before you buy something dumb.", href: "/consult" },
  { title: "Community", body: "Compare notes with the flock.", href: "/community" }
] as const;

type HomepageFeatureCard = {
  title: string;
  status: "Live now" | "Coming soon";
  description: string;
  note?: string;
};

export const homepageFeatureCards: readonly HomepageFeatureCard[] = [
  {
    title: "Find Your Barber",
    status: "Live now",
    description: "Find barbers who specialize in thinning hair and know how to work with your stage of hair loss."
  },
  {
    title: "Get 1:1 Advice (Coming Soon)",
    status: "Coming soon",
    description:
      "Get a personalized assessment of where you are in your hair loss journey, understand your options, and build an actionable plan — from styling to treatments to transplant considerations."
  },
  {
    title: "Engage with the Community",
    status: "Live now",
    description:
      "Explore verified success stories, join topic-specific discussions, and learn from others navigating the same journey."
  },
  {
    title: "Access Approved Products",
    status: "Coming soon",
    description:
      "Discover community-approved products — from minoxidil soap to styling products and scalp care — all curated through real results and trusted recommendations."
  }
] as const;
