import { randomUUID } from "node:crypto";

import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

import type {
  ProcessPaymentInput,
} from "../schemas/payment.schema.js";

async function processPayment(
  clientId: string,
  reservationId: string,
  input: ProcessPaymentInput,
) {
  return prisma.$transaction(async (tx) => {
    const reservation =
      await tx.reservation.findFirst({
        where: {
          id: reservationId,
          clientId,
        },
      });

    if (!reservation) {
      throw new AppError(
        "Reserva não encontrada.",
        404,
        "RESERVATION_NOT_FOUND",
      );
    }

    if (reservation.status !== "PENDING") {
      throw new AppError(
        "Esta reserva já foi processada.",
        409,
        "RESERVATION_ALREADY_PROCESSED",
      );
    }

    const nextStatus =
      input.result === "APPROVED"
        ? "PAID"
        : "PAYMENT_FAILED";

    const updated =
      await tx.reservation.updateMany({
        where: {
          id: reservation.id,
          clientId,
          status: "PENDING",
        },

        data: {
          status: nextStatus,
        },
      });

    if (updated.count === 0) {
      throw new AppError(
        "Esta reserva já foi processada.",
        409,
        "RESERVATION_ALREADY_PROCESSED",
      );
    }

    const updatedReservation =
      await tx.reservation.findUnique({
        where: {
          id: reservation.id,
        },
      });

    if (!updatedReservation) {
      throw new AppError(
        "Reserva não encontrada.",
        404,
        "RESERVATION_NOT_FOUND",
      );
    }

    if (input.result === "DECLINED") {
      await tx.event.update({
        where: {
          id: reservation.eventId,
        },

        data: {
          availableTickets: {
            increment: reservation.quantity,
          },
        },
      });

      return {
        paymentStatus: "DECLINED" as const,
        reservation: updatedReservation,
      };
    }

    const tickets = await Promise.all(
      Array.from({
        length: reservation.quantity,
      }).map(() =>
        tx.ticket.create({
          data: {
            reservationId: reservation.id,
            eventId: reservation.eventId,
            ownerId: reservation.clientId,
            shareToken: randomUUID(),
          },
        }),
      ),
    );

    return {
      paymentStatus: "APPROVED" as const,
      reservation: updatedReservation,
      tickets,
    };
  });
}

export const paymentService = {
  processPayment,
};
