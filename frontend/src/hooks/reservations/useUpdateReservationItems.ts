import {
  useMutation,
} from "@tanstack/react-query";

import {
  queryClient,
} from "../../lib/query-client";

import {
  reservationService,
  type UpdateReservationItemsInput,
} from "../../services/reservation.service";

export function useUpdateReservationItems() {
  return useMutation({
    mutationFn: (
      input:
        UpdateReservationItemsInput,
    ) =>
      reservationService.updateReservationItems(
        input,
      ),

    onSuccess: (
      reservation,
    ) => {
      queryClient.setQueryData(
        [
          "reservations",
          "details",
          reservation.id,
        ],
        reservation,
      );
    },
  });
}
