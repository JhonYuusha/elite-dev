import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

export async function listEvents(_req: Request, res: Response) {
  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      startsAt: {
        gte: new Date(),
      },
    },
    orderBy: {
      startsAt: "asc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      startsAt: true,
      venueName: true,
      venueAddress: true,
      priceCents: true,
      availableTickets: true,
    },
  });

  return res.json(events);
}

export async function getEventById(
  req: Request<{ id: string }>,
  res: Response,
) {
  const { id } = req.params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      startsAt: true,
      venueName: true,
      venueAddress: true,
      capacity: true,
      availableTickets: true,
      priceCents: true,
    },
  });

  if (!event) {
    return res.status(404).json({
      message: "Evento não encontrado.",
    });
  }

  return res.json(event);
};