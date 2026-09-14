import { prisma } from "../src/lib/prisma.js";

async function main() {
  const events =
    await prisma.event.findMany({
      orderBy: {
        startsAt: "asc",
      },

      select: {
        id: true,
        title: true,
        capacity: true,
        availableTickets: true,

        seats: {
          orderBy: [
            {
              row: "asc",
            },
            {
              number: "asc",
            },
          ],

          select: {
            id: true,
            label: true,
            status: true,
            reservationId: true,
          },
        },

        reservations: {
          orderBy: {
            createdAt: "asc",
          },

          select: {
            id: true,
            quantity: true,
            status: true,
            createdAt: true,

            tickets: {
              orderBy: {
                createdAt: "asc",
              },

              select: {
                id: true,
                seatId: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

  for (const event of events) {
    const pendingReservations =
      event.reservations.filter(
        (reservation) =>
          reservation.status ===
          "PENDING",
      );

    const paidReservations =
      event.reservations.filter(
        (reservation) =>
          reservation.status ===
          "PAID",
      );

    const pendingQuantity =
      pendingReservations.reduce(
        (total, reservation) =>
          total +
          reservation.quantity,
        0,
      );

    const paidQuantity =
      paidReservations.reduce(
        (total, reservation) =>
          total +
          reservation.quantity,
        0,
      );

    const unavailableQuantity =
      event.capacity -
      event.availableTickets;

    const expectedUnavailable =
      pendingQuantity +
      paidQuantity;

    console.log("");
    console.log(
      `EVENTO: ${event.title}`,
    );

    if (
      event.seats.length !==
      event.capacity
    ) {
      console.log(
        `✗ ignorado: capacidade ${event.capacity}, mas existem ${event.seats.length} assentos`,
      );

      continue;
    }

    if (
      unavailableQuantity !==
      expectedUnavailable
    ) {
      console.log(
        `✗ ignorado: estoque indica ${unavailableQuantity} ocupados, mas reservas PAID/PENDING somam ${expectedUnavailable}`,
      );

      continue;
    }

    const alreadyAssigned =
      event.seats.some(
        (seat) =>
          seat.status !==
            "AVAILABLE" ||
          seat.reservationId !==
            null,
      ) ||
      event.reservations.some(
        (reservation) =>
          reservation.tickets.some(
            (ticket) =>
              ticket.seatId !==
              null,
          ),
      );

    if (alreadyAssigned) {
      const availableSeats =
        event.seats.filter(
          (seat) =>
            seat.status ===
            "AVAILABLE",
        ).length;

      if (
        availableSeats ===
        event.availableTickets
      ) {
        console.log(
          "✓ já reconciliado",
        );
      } else {
        console.log(
          "✗ existem atribuições parciais; nenhuma alteração foi feita",
        );
      }

      continue;
    }

    for (
      const reservation of
      paidReservations
    ) {
      if (
        reservation.tickets.length !==
        reservation.quantity
      ) {
        console.log(
          `✗ reserva PAID ${reservation.id}: quantity=${reservation.quantity}, tickets=${reservation.tickets.length}`,
        );

        throw new Error(
          `Reserva paga inconsistente no evento ${event.id}.`,
        );
      }
    }

    await prisma.$transaction(
      async (tx) => {
        let seatIndex = 0;

        for (
          const reservation of
          paidReservations
        ) {
          const reservedSeats =
            event.seats.slice(
              seatIndex,
              seatIndex +
                reservation.quantity,
            );

          if (
            reservedSeats.length !==
            reservation.quantity
          ) {
            throw new Error(
              `Assentos insuficientes para a reserva ${reservation.id}.`,
            );
          }

          for (
            let index = 0;
            index <
            reservedSeats.length;
            index += 1
          ) {
            const seat =
              reservedSeats[index];

            const ticket =
              reservation.tickets[
                index
              ];

            await tx.seat.update({
              where: {
                id: seat.id,
              },

              data: {
                status: "SOLD",
                reservationId:
                  reservation.id,
              },
            });

            await tx.ticket.update({
              where: {
                id: ticket.id,
              },

              data: {
                seatId: seat.id,
              },
            });
          }

          seatIndex +=
            reservation.quantity;
        }

        for (
          const reservation of
          pendingReservations
        ) {
          const reservedSeats =
            event.seats.slice(
              seatIndex,
              seatIndex +
                reservation.quantity,
            );

          if (
            reservedSeats.length !==
            reservation.quantity
          ) {
            throw new Error(
              `Assentos insuficientes para a reserva ${reservation.id}.`,
            );
          }

          await tx.seat.updateMany({
            where: {
              id: {
                in: reservedSeats.map(
                  (seat) =>
                    seat.id,
                ),
              },

              status:
                "AVAILABLE",
            },

            data: {
              status:
                "RESERVED",

              reservationId:
                reservation.id,
            },
          });

          seatIndex +=
            reservation.quantity;
        }

        const remainingAvailable =
          event.capacity -
          seatIndex;

        if (
          remainingAvailable !==
          event.availableTickets
        ) {
          throw new Error(
            `Inventário final inconsistente no evento ${event.id}.`,
          );
        }
      },
    );

    console.log(
      `✓ reconciliado: ${paidQuantity} SOLD + ${pendingQuantity} RESERVED + ${event.availableTickets} AVAILABLE`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
