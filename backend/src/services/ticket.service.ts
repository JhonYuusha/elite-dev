import jwt from "jsonwebtoken";

import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

function generateTicketCode(
  ticketId: string,
  eventId: string,
) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definida.");
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

async function listMyTickets(ownerId: string) {
  const tickets = await prisma.ticket.findMany({
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
    },
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    status: ticket.status,
    shareToken: ticket.shareToken,
    validatedAt: ticket.validatedAt,
    createdAt: ticket.createdAt,
    event: ticket.event,

    qrCode: generateTicketCode(
      ticket.id,
      ticket.eventId,
    ),
  }));
}

async function getSharedTicket(
  shareToken: string,
) {
  const ticket = await prisma.ticket.findUnique({
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
    ownerName: ticket.owner.name,
    event: ticket.event,
  };
}

export const ticketService = {
  listMyTickets,
  getSharedTicket,
};
