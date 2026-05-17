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
  "Start with New York barbers who understand thinning hair",
  "Compare community signals before you book",
  "Use booking links and shop details to move fast",
  "Sign in to unlock the full barber shortlist"
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
    description: "Search the barber directory for people who understand thinning hair and can help you choose the right cut."
  },
  {
    title: "Compare Before You Book",
    status: "Live now",
    description: "Use community signals, shop details, and booking links to decide who is worth your next appointment."
  },
  {
    title: "Unlock the Full Shortlist",
    status: "Live now",
    description: "Create a free account to see every vetted New York barber we have available today."
  }
] as const;
