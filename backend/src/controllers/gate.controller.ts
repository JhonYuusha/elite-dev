import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma.js";

type TicketPayload = {
  ticketId: string;
  eventId: string;
  type: string;
};

export async function validateTicket(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const { code, eventId } = req.body;

  if (!code || !eventId) {
    return res.status(400).json({
      status: "INVALID",
      message: "Código do ingresso e evento são obrigatórios.",
    });
  }

  const cleanCode = String(code).trim();

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definida.");
  }

  let ticketId: string;
  let tokenEventId: string | null = null;

  // Primeiro tenta interpretar como QR assinado.
  try {
    const payload = jwt.verify(
      cleanCode,
      secret,
    ) as TicketPayload;

    if (
      payload.type !== "TICKET" ||
      !payload.ticketId ||
      !payload.eventId
    ) {
      return res.status(400).json({
        status: "INVALID",
        message: "Ingresso inválido.",
      });
    }

    ticketId = payload.ticketId;
    tokenEventId = payload.eventId;
  } catch {
    // Se não for JWT, tratamos como código manual:
    // o ID completo do ingresso.
    ticketId = cleanCode;
  }

  if (tokenEventId && tokenEventId !== eventId) {
    return res.status(409).json({
      status: "WRONG_EVENT",
      message: "Este ingresso pertence a outro evento.",
    });
  }

  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!ticket) {
    return res.status(400).json({
      status: "INVALID",
      message: "Ingresso não encontrado ou código inválido.",
    });
  }

  if (ticket.eventId !== eventId) {
    return res.status(409).json({
      status: "WRONG_EVENT",
      message: "Este ingresso pertence a outro evento.",
    });
  }

  if (ticket.status === "USED") {
    return res.status(409).json({
      status: "ALREADY_USED",
      message: "Ingresso já utilizado.",
      validatedAt: ticket.validatedAt,
    });
  }

  if (ticket.status !== "VALID") {
    return res.status(400).json({
      status: "INVALID",
      message: "Ingresso inválido.",
    });
  }

  const updated = await prisma.ticket.updateMany({
    where: {
      id: ticket.id,
      status: "VALID",
    },
    data: {
      status: "USED",
      validatedAt: new Date(),
      validatedById: req.user.id,
    },
  });

  if (updated.count === 0) {
    return res.status(409).json({
      status: "ALREADY_USED",
      message: "Ingresso já utilizado.",
    });
  }

  return res.json({
    status: "VALID",
    message: "Ingresso validado com sucesso.",
    ticketId: ticket.id,
    eventId: ticket.eventId,
  });
}