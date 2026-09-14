import {
  useQuery,
} from "@tanstack/react-query";

import {
  ticketService,
  type Ticket,
} from "../../services/ticket.service";

import {
  waitForMinimumDuration,
} from "../../utils/minimum-delay";

export type TicketWithQr =
  Ticket & {
    qrImage: string;
  };

export function useMyTickets(
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "tickets",
      "me",
    ],

    enabled,

    queryFn:
      async (): Promise<
        TicketWithQr[]
      > => {
        const startedAt =
          performance.now();

        try {
          const tickets =
            await ticketService.getMyTickets();

          const {
            default: QRCode,
          } = await import(
            "qrcode"
          );

          return Promise.all(
            tickets.map(
              async (
                ticket,
              ) => ({
                ...ticket,

                qrImage:
                  await QRCode.toDataURL(
                    ticket.qrCode,
                    {
                      width: 280,
                      margin: 1,
                    },
                  ),
              }),
            ),
          );
        } finally {
          await waitForMinimumDuration(
            startedAt,
          );
        }
      },
  });
}
