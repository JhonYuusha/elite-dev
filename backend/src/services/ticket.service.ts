import jwt from "jsonwebtoken";

import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

function generateTicketCode(
  ticketId: string,
  eventId: string,
) {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET não definida.",
    );
  }

  return jwt.sign(
    {
      ticketId,
      eventId,
      type: "TICKET",
    },
    secret,
  );
}

const seatSelect = {
  id: true,
  row: true,
  number: true,
  label: true,
  type: true,
} as const;

async function listMyTickets(
  ownerId: string,
) {
  const tickets =
    await prisma.ticket.findMany({
      where: {
        ownerId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        event: {
          select: {
            id: true,
            title: true,
            startsAt: true,
            venueName: true,
            venueAddress: true,
          },
        },

        seat: {
          select: seatSelect,
        },
      },
    });

  return tickets.map(
    (ticket) => ({
      id: ticket.id,
      status: ticket.status,

      shareToken:
        ticket.shareToken,

      validatedAt:
        ticket.validatedAt,

      createdAt:
        ticket.createdAt,

      event: ticket.event,
      seat: ticket.seat,

      qrCode:
        generateTicketCode(
          ticket.id,
          ticket.eventId,
        ),
    }),
  );
}

async function getSharedTicket(
  shareToken: string,
) {
  const ticket =
    await prisma.ticket.findUnique({
      where: {
        shareToken,
      },

      include: {
        event: {
          select: {
            title: true,
            startsAt: true,
            venueName: true,
            venueAddress: true,
          },
        },

        seat: {
          select: seatSelect,
        },

        owner: {
          select: {
            name: true,
          },
        },
      },
    });

  if (!ticket) {
    throw new AppError(
      "Ingresso compartilhado não encontrado.",
      404,
      "SHARED_TICKET_NOT_FOUND",
    );
  }

  return {
    id: ticket.id,
    status: ticket.status,
    ownerName:
      ticket.owner.name,

    event:
      ticket.event,

    seat:
      ticket.seat,
  };
}

export const ticketService = {
  listMyTickets,
  getSharedTicket,
};