import axios from "axios";

import { api } from "./api";

import type {
  EventSeat,
} from "../types/event";

export type ReservationStatus =
  | "PENDING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CANCELLED";

export type ReservationProductCategory =
  | "POPCORN"
  | "DRINK"
  | "COMBO";

export type ReservationItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;

  product: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category:
      ReservationProductCategory;
  };
};

export type CreateReservationInput = {
  eventId: string;
  seatIds: string[];
};

export type UpdateReservationItemInput = {
  productId: string;
  quantity: number;
};

export type UpdateReservationItemsInput = {
  reservationId: string;

  items:
    UpdateReservationItemInput[];
};

export type Reservation = {
  id: string;
  quantity: number;

  ticketUnitPriceCents: number;
  ticketsSubtotalCents: number;
  productsSubtotalCents: number;
  totalCents: number;

  status: ReservationStatus;

  event: {
    id: string;
    title: string;
    imageUrl: string | null;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
    priceCents: number;
  };

  seats: EventSeat[];
  items: ReservationItem[];
};

function getReservationErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (
    axios.isAxiosError(error)
  ) {
    return (
      error.response?.data
        ?.message ??
      fallbackMessage
    );
  }

  return fallbackMessage;
}

async function getReservationById(
  reservationId: string,
): Promise<Reservation> {
  try {
    const { data } =
      await api.get<Reservation>(
        `/reservations/${reservationId}`,
      );

    return data;
  } catch (error) {
    throw new Error(
      getReservationErrorMessage(
        error,
        "Não foi possível carregar esta reserva.",
      ),
      {
        cause: error,
      },
    );
  }
}

async function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  try {
    const { data } =
      await api.post<Reservation>(
        "/reservations",
        input,
      );

    return data;
  } catch (error) {
    throw new Error(
      getReservationErrorMessage(
        error,
        "Não foi possível realizar a reserva.",
      ),
      {
        cause: error,
      },
    );
  }
}

async function updateReservationItems(
  input:
    UpdateReservationItemsInput,
): Promise<Reservation> {
  try {
    const { data } =
      await api.put<Reservation>(
        `/reservations/${input.reservationId}/items`,
        {
          items:
            input.items,
        },
      );

    return data;
  } catch (error) {
    throw new Error(
      getReservationErrorMessage(
        error,
        "Não foi possível atualizar a bomboniere.",
      ),
      {
        cause: error,
      },
    );
  }
}

export const reservationService = {
  getReservationById,
  createReservation,
  updateReservationItems,
};