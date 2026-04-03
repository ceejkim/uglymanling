export type ChatRole = "explorer" | "guide";

export type ChatParticipant = {
  id: string;
  name: string;
  role: ChatRole;
  avatarInitial: string;
};

export type ChatThreadStatus = "open" | "awaiting_reply" | "scheduled";

export type ChatThreadSummary = {
  id: string;
  title: string;
  explorer: ChatParticipant;
  guide: ChatParticipant;
  lastMessagePreview: string;
  lastMessageAt: string;
  status: ChatThreadStatus;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderRole: ChatRole;
  body: string;
  sentAt: string;
};

export type ChatThread = {
  summary: ChatThreadSummary;
  messages: ChatMessage[];
};

const threadSummaries: ChatThreadSummary[] = [
  {
    id: "austin-morning-routine",
    title: "Austin morning routine",
    explorer: { id: "exp-1", name: "Jamie Carter", role: "explorer", avatarInitial: "J" },
    guide: { id: "g-1", name: "Maya Torres", role: "guide", avatarInitial: "M" },
    lastMessagePreview: "I can map a coffee + trail run + taco stop in 2 hours.",
    lastMessageAt: "Today, 9:24 AM",
    status: "open",
  },
  {
    id: "pickleball-spots",
    title: "Best local pickleball spots",
    explorer: { id: "exp-2", name: "Alex Rivera", role: "explorer", avatarInitial: "A" },
    guide: { id: "g-2", name: "Chris Nguyen", role: "guide", avatarInitial: "C" },
    lastMessagePreview: "Tomorrow 7am has the best open play in East Austin.",
    lastMessageAt: "Yesterday",
    status: "awaiting_reply",
  },
  {
    id: "chef-coaching-session",
    title: "Chef coaching session",
    explorer: { id: "exp-3", name: "Jordan Lee", role: "explorer", avatarInitial: "J" },
    guide: { id: "g-3", name: "Sofia Park", role: "guide", avatarInitial: "S" },
    lastMessagePreview: "Booked for Saturday at 11:00 AM. See you then.",
    lastMessageAt: "2 days ago",
    status: "scheduled",
  },
];

const threadMessages: Record<string, ChatMessage[]> = {
  "austin-morning-routine": [
    {
      id: "m-1",
      threadId: "austin-morning-routine",
      senderRole: "explorer",
      body: "I want a local morning routine this weekend with food + movement.",
      sentAt: "9:10 AM",
    },
    {
      id: "m-2",
      threadId: "austin-morning-routine",
      senderRole: "guide",
      body: "I can map a coffee + trail run + taco stop in 2 hours.",
      sentAt: "9:24 AM",
    },
  ],
  "pickleball-spots": [
    {
      id: "m-3",
      threadId: "pickleball-spots",
      senderRole: "guide",
      body: "Tomorrow 7am has the best open play in East Austin.",
      sentAt: "Yesterday",
    },
  ],
  "chef-coaching-session": [
    {
      id: "m-4",
      threadId: "chef-coaching-session",
      senderRole: "explorer",
      body: "Can we lock a knife skills session for Saturday morning?",
      sentAt: "3 days ago",
    },
    {
      id: "m-5",
      threadId: "chef-coaching-session",
      senderRole: "guide",
      body: "Booked for Saturday at 11:00 AM. See you then.",
      sentAt: "2 days ago",
    },
  ],
};

export function listChatThreads() {
  return threadSummaries;
}

export function getThreadById(threadId: string): ChatThread | null {
  const summary = threadSummaries.find((thread) => thread.id === threadId);
  if (!summary) {
    return null;
  }

  return {
    summary,
    messages: threadMessages[threadId] ?? [],
  };
}
