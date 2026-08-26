import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { prisma } from "../lib/prisma.js";

export async function processPayment(req: Request<{ id: string }>, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const { id } = req.params;
  const { result } = req.body;

  if (result !== "APPROVED" && result !== "DECLINED") {
    return res.status(400).json({
      message: "Resultado do pagamento inválido.",
    });
  }

  try {
    const response = await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findFirst({
        where: {
          id,
          clientId: req.user!.id,
        },
      });

      if (!reservation) {
        throw new Error("RESERVATION_NOT_FOUND");
      }

      if (reservation.status !== "PENDING") {
        throw new Error("RESERVATION_ALREADY_PROCESSED");
      }

      if (result === "DECLINED") {
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

        const updatedReservation = await tx.reservation.update({
          where: {
            id: reservation.id,
          },
          data: {
            status: "PAYMENT_FAILED",
          },
        });

        return {
          paymentStatus: "DECLINED",
          reservation: updatedReservation,
        };
      }

      const updatedReservation = await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "PAID",
        },
      });

      const tickets = await Promise.all(
        Array.from({ length: reservation.quantity }).map(() =>
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
        paymentStatus: "APPROVED",
        reservation: updatedReservation,
        tickets,
      };
    });

    return res.json(response);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "RESERVATION_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Reserva não encontrada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "RESERVATION_ALREADY_PROCESSED"
    ) {
      return res.status(409).json({
        message: "Esta reserva já foi processada.",
      });
    }

    throw error;
  }
}
