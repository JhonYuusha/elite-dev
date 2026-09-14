import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";

async function main() {
  const reservations =
    await prisma.reservation.findMany({
      select: {
        id: true,
        quantity: true,
        totalCents: true,

        event: {
          select: {
            priceCents: true,
          },
        },
      },
    });

  console.log(
    `Reservas encontradas: ${reservations.length}`,
  );

  for (
    const reservation
    of reservations
  ) {
    const ticketUnitPriceCents =
      reservation.event
        .priceCents;

    const ticketsSubtotalCents =
      reservation.totalCents;

    await prisma.reservation.update({
      where: {
        id: reservation.id,
      },

      data: {
        ticketUnitPriceCents,
        ticketsSubtotalCents,
        productsSubtotalCents: 0,
      },
    });

    console.log(
      [
        reservation.id,
        `${reservation.quantity} ingresso(s)`,
        `unit=${ticketUnitPriceCents}`,
        `tickets=${ticketsSubtotalCents}`,
      ].join(" | "),
    );
  }

  console.log(
    "Backfill concluído.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
