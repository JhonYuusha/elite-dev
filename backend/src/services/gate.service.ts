import jwt from "jsonwebtoken";

import { GateError } from "../errors/gate-error.js";
import { prisma } from "../lib/prisma.js";

import type {
  ValidateTicketInput,
} from "../schemas/gate.schema.js";

type TicketPayload = {
  ticketId: string;
  eventId: string;
  type: string;
};

function resolveTicketCode(code: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não definida.");
  }

  const cleanCode = code.trim();

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
      throw new GateError(
        400,
        "INVALID",
        "Ingresso inválido.",
      );
    }

    return {
      ticketId: payload.ticketId,
      tokenEventId: payload.eventId,
    };
  } catch (error) {
    if (error instanceof GateError) {
      throw error;
    }

    return {
      ticketId: cleanCode,
      tokenEventId: null,
    };
  }
}

async function validateTicket(
  gatekeeperId: string,
  input: ValidateTicketInput,
) {
  const {
    ticketId,
    tokenEventId,
  } = resolveTicketCode(input.code);

  if (
    tokenEventId &&
    tokenEventId !== input.eventId
  ) {
    throw new GateError(
      409,
      "WRONG_EVENT",
      "Este ingresso pertence a outro evento.",
    );
  }

  const ticket =
    await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });

  if (!ticket) {
    throw new GateError(
      400,
      "INVALID",
      "Ingresso não encontrado ou código inválido.",
    );
  }

  if (ticket.eventId !== input.eventId) {
    throw new GateError(
      409,
      "WRONG_EVENT",
      "Este ingresso pertence a outro evento.",
    );
  }

  if (ticket.status === "USED") {
    throw new GateError(
      409,
      "ALREADY_USED",
      "Ingresso já utilizado.",
      ticket.validatedAt,
    );
  }

  if (ticket.status !== "VALID") {
    throw new GateError(
      400,
      "INVALID",
      "Ingresso inválido.",
    );
  }

  const validatedAt = new Date();

  const updated =
    await prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        status: "VALID",
      },

      data: {
        status: "USED",
        validatedAt,
        validatedById: gatekeeperId,
      },
    });

  if (updated.count === 0) {
    const currentTicket =
      await prisma.ticket.findUnique({
        where: {
          id: ticket.id,
        },

        select: {
          validatedAt: true,
        },
      });

    throw new GateError(
      409,
      "ALREADY_USED",
      "Ingresso já utilizado.",
      currentTicket?.validatedAt,
    );
  }

  return {
    status: "VALID" as const,
    message: "Ingresso validado com sucesso.",
    ticketId: ticket.id,
    eventId: ticket.eventId,
  };
}

export const gateService = {
  validateTicket,
};