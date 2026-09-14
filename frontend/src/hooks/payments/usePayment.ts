import { useMutation } from "@tanstack/react-query";

import {
  paymentService,
  type ProcessPaymentInput,
} from "../../services/payment.service";

export function usePayment() {
  return useMutation({
    mutationFn: (
      input: ProcessPaymentInput,
    ) =>
      paymentService.processPayment(
        input,
      ),
  });
}
