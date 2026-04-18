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
  "Build the knowledge of the flock",
  "Share verified wins and lessons",
  "Help everyone look their best",
  "Turn community proof into better next steps"
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
    status: "Live now",
    href: "/community",
    cta: "Join community",
    items: [
      "Verified success stories",
      "Personalized recommendations",
      "Topic threads"
    ]
  },
  {
    title: "Style",
    status: "Live now",
    href: "/style/barbers",
    cta: "Find barbers",
    items: [
      "Barber recommendations",
      "Norwood-aligned cuts",
      "Best hats by head shape"
    ]
  },
  {
    title: "Access",
    status: "Coming soon",
    items: [
      "Specialized dermatologists",
      "Transplant consultations",
      "1:1 consultations"
    ]
  },
  {
    title: "Research",
    status: "Coming soon",
    items: [
      "Industry news",
      "Study participation",
      "Next-gen therapies"
    ]
  },
  {
    title: "Products",
    status: "Coming soon",
    items: [
      "Grooming essentials",
      "Curated bundles",
      "Headwear that fits"
    ]
  }
] as const;
