import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

export async function createReservation(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const { eventId, quantity } = req.body;

  if (!eventId || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({
      message: "Evento e quantidade válida são obrigatórios.",
    });
  }

  try {
    const reservation = await prisma.$transaction(async (tx) => {
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
        throw new Error("EVENT_NOT_FOUND");
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
        throw new Error("INSUFFICIENT_TICKETS");
      }

      return tx.reservation.create({
        data: {
          clientId: req.user!.id,
          eventId,
          quantity,
          totalCents: event.priceCents * quantity,
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

    return res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof Error && error.message === "EVENT_NOT_FOUND") {
      return res.status(404).json({
        message: "Evento não encontrado ou indisponível.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "INSUFFICIENT_TICKETS"
    ) {
      return res.status(409).json({
        message: "Quantidade de ingressos indisponível.",
      });
    }

    throw error;
  }
}
