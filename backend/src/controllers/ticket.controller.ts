import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma.js";

function generateTicketCode(ticketId: string, eventId: string) {
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

export async function listMyTickets(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      ownerId: req.user.id,
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

  const response = tickets.map((ticket) => ({
    id: ticket.id,
    status: ticket.status,
    shareToken: ticket.shareToken,
    validatedAt: ticket.validatedAt,
    createdAt: ticket.createdAt,
    event: ticket.event,

    // O QR contém um JWT assinado pelo backend.
    // A validade real do ingresso é conferida no banco.
    qrCode: generateTicketCode(ticket.id, ticket.eventId),
  }));

  return res.json(response);
}

export async function getSharedTicket(
  req: Request<{ shareToken: string }>,
  res: Response,
) {
  const { shareToken } = req.params;

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
    return res.status(404).json({
      message: "Ingresso compartilhado não encontrado.",
    });
  }

  return res.json({
    id: ticket.id,
    status: ticket.status,
    ownerName: ticket.owner.name,
    event: ticket.event,
  });
}