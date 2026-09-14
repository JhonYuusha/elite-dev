import axios from "axios";

import { api } from "./api";

export type PaymentResult =
  | "APPROVED"
  | "DECLINED";

export type ProcessPaymentInput = {
  reservationId: string;
  result: PaymentResult;
};

async function processPayment(
  input: ProcessPaymentInput,
) {
  try {
    const { data } = await api.post(
      `/payments/reservations/${input.reservationId}/pay`,
      {
        result: input.result,
      },
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Não foi possível processar o pagamento.",
        {
          cause: error,
        },
      );
    }

    throw new Error(
      "Não foi possível processar o pagamento.",
      {
        cause: error,
      },
    );
  }
}

export const paymentService = {
  processPayment,
};
