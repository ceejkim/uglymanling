export type OfferStatus = "pending" | "accepted" | "declined";

export type Offer = {
  id: string;
  threadId: string;
  title: string;
  guideName: string;
  format: "guided" | "self-guided" | "coaching";
  duration: string;
  price: string;
  summary: string;
  included: string[];
  status: OfferStatus;
};

const offers: Offer[] = [
  {
    id: "offer-austin-morning-routine",
    threadId: "austin-morning-routine",
    title: "Austin Morning Routine Sprint",
    guideName: "Maya Torres",
    format: "guided",
    duration: "2 hours",
    price: "$120",
    summary:
      "Coffee opener, trail run segment, and local taco finish with pacing recommendations.",
    included: ["Custom route", "Live guide", "Local food shortlist"],
    status: "pending",
  },
  {
    id: "offer-pickleball-fast-start",
    threadId: "pickleball-spots",
    title: "Pickleball Fast-Start Session",
    guideName: "Chris Nguyen",
    format: "coaching",
    duration: "90 minutes",
    price: "$95",
    summary:
      "Open-play timing strategy, partner matching tips, and shot selection feedback.",
    included: ["Court plan", "Warm-up guide", "Post-session notes"],
    status: "pending",
  },
  {
    id: "offer-chef-knife-basics",
    threadId: "chef-coaching-session",
    title: "Knife Skills Studio Session",
    guideName: "Sofia Park",
    format: "guided",
    duration: "2.5 hours",
    price: "$180",
    summary:
      "Knife safety, speed drills, and meal prep workflow with a pro chef.",
    included: ["Ingredient list", "Hands-on drills", "Take-home practice plan"],
    status: "accepted",
  },
];

export function listOffers() {
  return offers;
}

export function getOffer(offerId: string) {
  return offers.find((offer) => offer.id === offerId) ?? null;
}

export function getOfferByThreadId(threadId: string) {
  return offers.find((offer) => offer.threadId === threadId) ?? null;
}
