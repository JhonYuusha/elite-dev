import { useQuery } from "@tanstack/react-query";

import { eventService } from "../../services/event.service";
import { waitForMinimumDuration } from "../../utils/minimum-delay";

export function useEventDetails(
  eventId: string | undefined,
) {
  return useQuery({
    queryKey: ["events", "details", eventId],
    enabled: Boolean(eventId),

    queryFn: async () => {
      if (!eventId) {
        throw new Error(
          "Identificador do evento não informado.",
        );
      }

      const startedAt = performance.now();

      try {
        return await eventService.getEventById(
          eventId,
        );
      } finally {
        await waitForMinimumDuration(
          startedAt,
        );
      }
    },
  });
}
