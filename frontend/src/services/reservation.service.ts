import axios from "axios";

import { api } from "./api";

export type CreateReservationInput = {
  eventId: string;
  quantity: number;
};

export type Reservation = {
  id: string;
  quantity: number;
  totalCents: number;
  status:
    | "PENDING"
    | "PAID"
    | "PAYMENT_FAILED"
    | "CANCELLED";

  event: {
    id: string;
    title: string;
    imageUrl: string | null;
    startsAt: string;
    venueName: string;
    venueAddress: string | null;
    priceCents: number;
  };
};

export type ReservationResponse = {
  id: string;
  quantity: number;
  totalCents: number;
  status: string;
};

function getReservationErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
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
): Promise<ReservationResponse> {
  try {
    const { data } =
      await api.post<ReservationResponse>(
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

export const reservationService = {
  getReservationById,
  createReservation,
};