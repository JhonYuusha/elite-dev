import { useQuery } from "@tanstack/react-query";

import {
  ticketService,
} from "../../services/ticket.service";

import {
  waitForMinimumDuration,
} from "../../utils/minimum-delay";

export function useSharedTicket(
  token: string | undefined,
) {
  return useQuery({
    queryKey: [
      "tickets",
      "shared",
      token,
    ],

    enabled: Boolean(token),

    queryFn: async () => {
      if (!token) {
        throw new Error(
          "Link de ingresso inválido.",
        );
      }

      const startedAt =
        performance.now();

      try {
        return await ticketService
          .getSharedTicket(token);
      } finally {
        await waitForMinimumDuration(
          startedAt,
        );
      }
    },
  });
}
