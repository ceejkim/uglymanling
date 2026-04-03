export type ModerationItem = {
  id: string;
  category: "safety" | "quality" | "payment";
  threadId: string;
  summary: string;
  priority: "low" | "medium" | "high";
};

const moderationQueue: ModerationItem[] = [
  {
    id: "mod-1",
    category: "quality",
    threadId: "pickleball-spots",
    summary: "Explorer reported mismatch between promised and delivered coaching depth.",
    priority: "medium",
  },
  {
    id: "mod-2",
    category: "payment",
    threadId: "chef-coaching-session",
    summary: "Guide requested payout timing clarification after session completion.",
    priority: "low",
  },
  {
    id: "mod-3",
    category: "safety",
    threadId: "austin-morning-routine",
    summary: "Location handoff instructions were incomplete for early-morning meetup.",
    priority: "high",
  },
];

export function listModerationItems() {
  return moderationQueue;
}
