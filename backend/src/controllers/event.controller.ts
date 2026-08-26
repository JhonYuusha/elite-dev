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
export async function createEvent(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const {
    externalProvider,
    externalId,
    title,
    description,
    imageUrl,
    startsAt,
    venueName,
    venueAddress,
    capacity,
    priceCents,
  } = req.body;

  if (
    !externalProvider ||
    !externalId ||
    !title ||
    !startsAt ||
    !venueName ||
    capacity === undefined ||
    priceCents === undefined
  ) {
    return res.status(400).json({
      message: "Dados obrigatórios do evento não informados.",
    });
  }

  if (
    !Number.isInteger(capacity) ||
    capacity <= 0 ||
    !Number.isInteger(priceCents) ||
    priceCents < 0
  ) {
    return res.status(400).json({
      message: "Capacidade ou preço inválido.",
    });
  }

  const eventDate = new Date(startsAt);

  if (Number.isNaN(eventDate.getTime()) || eventDate <= new Date()) {
    return res.status(400).json({
      message: "A data do evento deve ser válida e estar no futuro.",
    });
  }

  const event = await prisma.event.create({
    data: {
      organizerId: req.user.id,

      externalProvider,
      externalId,

      title,
      description,
      imageUrl,

      startsAt: eventDate,

      venueName,
      venueAddress,

      capacity,
      availableTickets: capacity,

      priceCents,

      status: "PUBLISHED",
    },
  });

  return res.status(201).json(event);
}
export async function listOrganizerEvents(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const events = await prisma.event.findMany({
    where: {
      organizerId: req.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      startsAt: true,
      venueName: true,
      capacity: true,
      availableTickets: true,
      priceCents: true,
      status: true,
      createdAt: true,
    },
  });

  return res.json(events);
}
