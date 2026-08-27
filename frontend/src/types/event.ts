export type Event = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  startsAt: string;
  venueName: string;
  venueAddress: string | null;
  priceCents: number;
  availableTickets: number;
};
