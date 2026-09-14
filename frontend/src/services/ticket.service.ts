import axios from "axios";

import { api } from "./api";

export type TicketStatus =
  | "VALID"
  | "USED"
  | "CANCELLED";

export type TicketSeatType =
  | "STANDARD"
  | "VIP"
  | "ACCESSIBLE"
  | "COMPANION";

export type TicketSeat = {
  id: string;
  row: string;
  number: number;
  label: string;
  type: TicketSeatType;
};

export type Ticket = {
  id: string;
  status: TicketStatus;
  shareToken: string | null;
  validatedAt: string | null;
  createdAt: string;
  qrCode: string;

  seat: TicketSeat | null;

  event: {
    id: string;
    title: string;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
  };
};

export type SharedTicket = {
  id: string;
  status: TicketStatus;
  ownerName: string;

  seat: TicketSeat | null;

  event: {
    title: string;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
  };
};

async function getMyTickets(): Promise<Ticket[]> {
  try {
    const { data } = await api.get<Ticket[]>(
      "/tickets/me",
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Não foi possível carregar seus ingressos.",
        { cause: error },
      );
    }

    throw new Error(
      "Não foi possível carregar seus ingressos.",
      { cause: error },
    );
  }
}

async function getSharedTicket(
  token: string,
): Promise<SharedTicket> {
  try {
    const { data } =
      await api.get<SharedTicket>(
        `/tickets/shared/${token}`,
      );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Este ingresso não está disponível.",
        { cause: error },
      );
    }

    throw new Error(
      "Este ingresso não está disponível.",
      { cause: error },
    );
  }
}

export const ticketService = {
  getMyTickets,
  getSharedTicket,
};