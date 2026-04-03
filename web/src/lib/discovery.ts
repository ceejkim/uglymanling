export type DiscoveryGuide = {
  id: string;
  name: string;
  city: string;
  specialty: string;
  responseTime: string;
  rating: number;
  sessionType: "guided" | "self-guided" | "coaching";
  threadId: string;
};

const guides: DiscoveryGuide[] = [
  {
    id: "guide-maya",
    name: "Maya Torres",
    city: "Austin",
    specialty: "Morning routines and food trails",
    responseTime: "~4 min",
    rating: 4.9,
    sessionType: "guided",
    threadId: "austin-morning-routine",
  },
  {
    id: "guide-chris",
    name: "Chris Nguyen",
    city: "Austin",
    specialty: "Pickleball communities and open play",
    responseTime: "~9 min",
    rating: 4.8,
    sessionType: "coaching",
    threadId: "pickleball-spots",
  },
  {
    id: "guide-sofia",
    name: "Sofia Park",
    city: "Austin",
    specialty: "Chef training and private kitchen coaching",
    responseTime: "~7 min",
    rating: 5,
    sessionType: "guided",
    threadId: "chef-coaching-session",
  },
];

export function listGuides() {
  return guides;
}
