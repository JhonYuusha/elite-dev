import { prisma } from "../src/lib/prisma.js";
import { generateSeatLayout } from "../src/utils/seat-layout.js";

async function main() {
  const events =
    await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        capacity: true,

        _count: {
          select: {
            seats: true,
          },
        },
      },
    });

  for (const event of events) {
    const existingSeats =
      event._count.seats;

    if (
      existingSeats >=
      event.capacity
    ) {
      console.log(
        `✓ ${event.title}: ${existingSeats}/${event.capacity} assentos`,
      );

      continue;
    }

    const missingSeats =
      event.capacity -
      existingSeats;

    const seats =
      generateSeatLayout(
        missingSeats,
        existingSeats,
      );

    await prisma.seat.createMany({
      data: seats.map(
        (seat) => ({
          eventId: event.id,
          row: seat.row,
          number: seat.number,
          label: seat.label,
          type: "STANDARD",
          status: "AVAILABLE",
        }),
      ),
    });

    console.log(
      `+ ${event.title}: ${missingSeats} assentos criados`,
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
