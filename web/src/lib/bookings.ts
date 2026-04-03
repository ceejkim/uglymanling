export type BookingStatus = "upcoming" | "completed" | "cancelled";

export type Booking = {
  id: string;
  offerId: string;
  title: string;
  guideName: string;
  date: string;
  location: string;
  status: BookingStatus;
  amount: string;
};

const bookings: Booking[] = [
  {
    id: "booking-1",
    offerId: "offer-chef-knife-basics",
    title: "Knife Skills Studio Session",
    guideName: "Sofia Park",
    date: "Saturday, April 11, 2026 • 11:00 AM",
    location: "East Austin Test Kitchen",
    status: "upcoming",
    amount: "$180",
  },
  {
    id: "booking-2",
    offerId: "offer-austin-morning-routine",
    title: "Austin Morning Routine Sprint",
    guideName: "Maya Torres",
    date: "Sunday, March 29, 2026 • 8:00 AM",
    location: "South Lamar",
    status: "completed",
    amount: "$120",
  },
];

export function listBookings() {
  return bookings;
}
