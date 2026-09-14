import axios from "axios";

import { api } from "./api";

export type CreateReservationInput = {
  eventId: string;
  quantity: number;
};

export type ReservationResponse = {
  id: string;
  quantity: number;
  totalCents: number;
  status: string;
};

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
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Não foi possível realizar a reserva.",
        {
          cause: error,
        },
      );
    }

    throw new Error(
      "Não foi possível realizar a reserva.",
      {
        cause: error,
      },
    );
  }
}

export const reservationService = {
  createReservation,
};
