import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

import type {
  CreateReservationInput,
} from "../schemas/reservation.schema.js";

async function createReservation(
  clientId: string,
  input: CreateReservationInput,
) {
  const { eventId, quantity } = input;

  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findFirst({
      where: {
        id: eventId,

        status: "PUBLISHED",

        startsAt: {
          gte: new Date(),
        },
      },
    });

    if (!event) {
      throw new AppError(
        "Evento não encontrado ou indisponível.",
        404,
        "EVENT_NOT_FOUND",
      );
    }

    const updated = await tx.event.updateMany({
      where: {
        id: eventId,

        availableTickets: {
          gte: quantity,
        },
      },

      data: {
        availableTickets: {
          decrement: quantity,
        },
      },
    });

    if (updated.count === 0) {
      throw new AppError(
        "Quantidade de ingressos indisponível.",
        409,
        "INSUFFICIENT_TICKETS",
      );
    }

    return tx.reservation.create({
      data: {
        clientId,
        eventId,
        quantity,

        totalCents:
          event.priceCents * quantity,

        status: "PENDING",
      },

      include: {
        event: {
          select: {
            id: true,
            title: true,
            startsAt: true,
            venueName: true,
            priceCents: true,
          },
        },
      },
    });
  });
}

async function getReservationById(
  clientId: string,
  reservationId: string,
) {
  const reservation =
    await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        clientId,
      },

      include: {
        event: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            startsAt: true,
            venueName: true,
            venueAddress: true,
            priceCents: true,
          },
        },
      },
    });

  if (!reservation) {
    throw new AppError(
      "Reserva não encontrada.",
      404,
      "RESERVATION_NOT_FOUND",
    );
  }

  return reservation;
}

export const reservationService = {
  createReservation,
  getReservationById,
};
