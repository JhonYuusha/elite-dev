import { prisma } from "../src/lib/prisma.js";

async function main() {
  const events = await prisma.event.findMany({
    orderBy: {
      startsAt: "asc",
    },

    select: {
      id: true,
      title: true,
      capacity: true,
      availableTickets: true,

      seats: {
        select: {
          status: true,
        },
      },

      reservations: {
        select: {
          id: true,
          quantity: true,
          status: true,

          _count: {
            select: {
              tickets: true,
            },
          },
        },
      },

      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  for (const event of events) {
    const availableSeats =
      event.seats.filter(
        (seat) =>
          seat.status === "AVAILABLE",
      ).length;

    const reservedSeats =
      event.seats.filter(
        (seat) =>
          seat.status === "RESERVED",
      ).length;

    const soldSeats =
      event.seats.filter(
        (seat) =>
          seat.status === "SOLD",
      ).length;

    const pendingReservations =
      event.reservations
        .filter(
          (reservation) =>
            reservation.status ===
            "PENDING",
        )
        .reduce(
          (total, reservation) =>
            total +
            reservation.quantity,
          0,
        );

    const paidReservations =
      event.reservations
        .filter(
          (reservation) =>
            reservation.status ===
            "PAID",
        )
        .reduce(
          (total, reservation) =>
            total +
            reservation.quantity,
          0,
        );

    const consistent =
      event.capacity ===
        event.seats.length &&
      event.availableTickets ===
        availableSeats;

    console.log(
      [
        "",
        `EVENTO: ${event.title}`,
        `ID: ${event.id}`,
        `CAPACIDADE: ${event.capacity}`,
        `AVAILABLE_TICKETS: ${event.availableTickets}`,
        `ASSENTOS: ${event.seats.length}`,
        `AVAILABLE: ${availableSeats}`,
        `RESERVED: ${reservedSeats}`,
        `SOLD: ${soldSeats}`,
        `PENDING RESERVATIONS: ${pendingReservations}`,
        `PAID RESERVATIONS: ${paidReservations}`,
        `TICKETS: ${event._count.tickets}`,
        `STATUS: ${consistent ? "OK" : "RECONCILIAR"}`,
      ].join("\n"),
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
