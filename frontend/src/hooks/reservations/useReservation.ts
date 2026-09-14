import { useMutation } from "@tanstack/react-query";

import {
  reservationService,
  type CreateReservationInput,
} from "../../services/reservation.service";

export function useReservation() {
  return useMutation({
    mutationFn: (
      input: CreateReservationInput,
    ) =>
      reservationService.createReservation(
        input,
      ),
  });
}
