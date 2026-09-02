export type Event = {
  id: string;

  title: string;
  description: string | null;
  imageUrl: string | null;

  startsAt: string;

  venueName: string;
  venueAddress: string | null;

  capacity?: number;
  availableTickets: number;

  priceCents: number;
};

export type OrganizerEvent = {
  id: string;

  title: string;
  imageUrl: string | null;

  startsAt: string;

  venueName: string;
  venueAddress: string | null;

  capacity: number;
  availableTickets: number;

  priceCents: number;

  status:
    | "DRAFT"
    | "PUBLISHED"
    | "CANCELLED";

  createdAt: string;
};

export type CreateEventResponse =
  OrganizerEvent & {
    externalProvider: string;
    externalId: string;
    description: string | null;
  };