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
  return prisma.$transaction(
    async (tx) => {
      const reservation =
        await tx.reservation.findFirst({
          where: {
            id: reservationId,
            clientId,
          },

          include: {
            seats: {
              orderBy: [
                {
                  row: "asc",
                },
                {
                  number: "asc",
                },
              ],
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

      if (
        reservation.status !==
        "PENDING"
      ) {
        throw new AppError(
          "Esta reserva já foi processada.",
          409,
          "RESERVATION_ALREADY_PROCESSED",
        );
      }

      if (
        reservation.seats.length !==
        reservation.quantity
      ) {
        throw new AppError(
          "Os assentos desta reserva estão inconsistentes.",
          409,
          "SEAT_INVENTORY_CONFLICT",
        );
      }

      const nextStatus =
        input.result ===
        "APPROVED"
          ? "PAID"
          : "PAYMENT_FAILED";

      const updated =
        await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            clientId,
            status:
              "PENDING",
          },

          data: {
            status:
              nextStatus,
          },
        });

      if (
        updated.count === 0
      ) {
        throw new AppError(
          "Esta reserva já foi processada.",
          409,
          "RESERVATION_ALREADY_PROCESSED",
        );
      }

      if (
        input.result ===
        "DECLINED"
      ) {
        const releasedSeats =
          await tx.seat.updateMany({
            where: {
              reservationId:
                reservation.id,

              status:
                "RESERVED",
            },

            data: {
              status:
                "AVAILABLE",

              reservationId:
                null,
            },
          });

        if (
          releasedSeats.count !==
          reservation.quantity
        ) {
          throw new AppError(
            "Os assentos desta reserva estão inconsistentes.",
            409,
            "SEAT_INVENTORY_CONFLICT",
          );
        }

        await tx.event.update({
          where: {
            id: reservation.eventId,
          },

          data: {
            availableTickets: {
              increment:
                reservation.quantity,
            },
          },
        });

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

        return {
          paymentStatus:
            "DECLINED" as const,

          reservation:
            updatedReservation,
        };
      }

      const soldSeats =
        await tx.seat.updateMany({
          where: {
            reservationId:
              reservation.id,

            status:
              "RESERVED",
          },

          data: {
            status:
              "SOLD",
          },
        });

      if (
        soldSeats.count !==
        reservation.quantity
      ) {
        throw new AppError(
          "Os assentos desta reserva estão inconsistentes.",
          409,
          "SEAT_INVENTORY_CONFLICT",
        );
      }

      const tickets =
        await Promise.all(
          reservation.seats.map(
            (seat) =>
              tx.ticket.create({
                data: {
                  reservationId:
                    reservation.id,

                  eventId:
                    reservation.eventId,

                  ownerId:
                    reservation.clientId,

                  seatId:
                    seat.id,

                  shareToken:
                    randomUUID(),
                },

                include: {
                  seat: {
                    select: {
                      id: true,
                      row: true,
                      number: true,
                      label: true,
                      type: true,
                    },
                  },
                },
              }),
          ),
        );

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

      return {
        paymentStatus:
          "APPROVED" as const,

        reservation:
          updatedReservation,

        tickets,
      };
    },
  );
}

export const paymentService = {
  processPayment,
};