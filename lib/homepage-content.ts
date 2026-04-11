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
  "Ask blunt questions",
  "Trade notes",
  "Share wins",
  "Skip the shame spiral"
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

export const productVisionRows = [
  {
    title: "Community",
    summary: "Join the flock early and grow with the platform.",
    status: "Live now",
    href: "/community",
    cta: "Enter community",
    items: [
      "Learn from vetted success stories",
      "Join our active Q&A chat",
      "Share wins, setbacks, and lessons"
    ]
  },
  {
    title: "Style",
    summary: "Fast confidence wins for the balding flock.",
    status: "Live now",
    href: "/style/barbers",
    cta: "Browse style support",
    items: [
      "Find vetted barbers for the flock",
      "Browse Norwood-aware style options",
      "Choose cuts aligned to head shape"
    ]
  },
  {
    title: "Access",
    summary: "Trusted paths when you need more than self-serve.",
    status: "Coming soon",
    items: [
      "Connect with vetted dermatologists",
      "Evaluate trusted transplant pathways",
      "Access higher-trust operators"
    ]
  },
  {
    title: "Research",
    summary: "Evidence translated into useful next steps.",
    status: "Coming soon",
    items: [
      "Read plain-English evidence summaries",
      "Filter hype from signal",
      "Understand what actually matters"
    ]
  },
  {
    title: "Products",
    summary: "Curated gear that fits the journey.",
    status: "Coming soon",
    items: [
      "Shop practical grooming essentials",
      "Buy curated bundles with intent",
      "Use brand-led accessories that fit"
    ]
  }
] as const;
