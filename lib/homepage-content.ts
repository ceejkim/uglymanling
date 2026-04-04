export const quickPaths = [
  { label: "I want a plan", href: "/assessment", note: "Start with the thing that stops the spiraling." },
  { label: "I want treatment help", href: "/assessment#treatments", note: "See real options, not panic-buy nonsense." },
  { label: "I want a better haircut", href: "/assessment#style", note: "A good cut can do a lot of emotional heavy lifting." },
  { label: "I want to talk to an expert", href: "/consult", note: "Human guidance beats Reddit roulette." },
  { label: "I want products", href: "/shop", note: "Useful tools, fewer fake miracles." },
  { label: "I want answers", href: "/research", note: "What works, what is hype, what is expensive coping." }
] as const;

export const offerings = [
  {
    title: "Guidance and planning",
    body: "Figure out where you are, what matters, and what to do next.",
    cta: "Get my plan",
    href: "/assessment",
    proof: "Built to turn panic into a next step."
  },
  {
    title: "Expert access",
    body: "Talk to someone credible before you make a dumb expensive move.",
    cta: "Request a consult",
    href: "/consult",
    proof: "Human help, not forum archaeology."
  },
  {
    title: "Treatment and service access",
    body: "Cut through the noise and find real options worth considering.",
    cta: "See treatment options",
    href: "/assessment#treatments",
    proof: "Evidence-backed where claims matter."
  },
  {
    title: "Barber and style support",
    body: "Look better fast, without the panic haircut.",
    cta: "Find my style",
    href: "/assessment#style",
    proof: "Confidence can start before regrowth does."
  },
  {
    title: "Shop",
    body: "Buy products that solve real problems, not junk with fake confidence.",
    cta: "Shop essentials",
    href: "/shop",
    proof: "Curated, not cluttered."
  },
  {
    title: "Research and education",
    body: "Understand what matters, what works, and what is hype.",
    cta: "See what actually works",
    href: "/research",
    proof: "No miracle-hair cult energy."
  }
] as const;

export const communityBullets = [
  "Ask honest questions",
  "Compare notes with men going through it",
  "Share progress and wins",
  "Get feedback without shame"
] as const;

export const testimonials = [
  {
    quote: "I finally knew what to do instead of doom-scrolling hair transplant forums at 1:14 a.m.",
    label: "Plan-first user"
  },
  {
    quote: "The haircut advice alone saved me from another six months of lying to myself.",
    label: "Style support"
  },
  {
    quote: "It felt like someone explained the landscape without trying to sell me fear.",
    label: "Treatment path"
  }
] as const;

export const howItWorks = [
  "Assess",
  "Get your plan",
  "Choose your path",
  "Take action",
  "Come back stronger"
] as const;

export const connectOptions = [
  { title: "Contact us", body: "Have a question? Send it to a human, not the void.", href: "/contact" },
  { title: "Request a consult", body: "Calendly comes later. Intent comes now.", href: "/consult" },
  { title: "Talk to the team", body: "If you're stuck, ask. We built this for that exact moment.", href: "/contact" },
  { title: "Join community", body: "For men comparing notes without the usual internet garbage.", href: "/community" }
] as const;
