import { useQuery } from "@tanstack/react-query";

import { reservationService } from "../../services/reservation.service";
import { waitForMinimumDuration } from "../../utils/minimum-delay";

export function useReservationDetails(
  reservationId: string | undefined,
) {
  return useQuery({
    queryKey: [
      "reservations",
      "details",
      reservationId,
    ],
    enabled: Boolean(reservationId),

    queryFn: async () => {
      if (!reservationId) {
        throw new Error(
          "Identificador da reserva não informado.",
        );
      }

      const startedAt =
        performance.now();

      try {
        return await reservationService.getReservationById(
          reservationId,
        );
      } finally {
        await waitForMinimumDuration(
          startedAt,
        );
      }
    },
  });
}
