import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { getTmdbMovie } from "../services/tmdb.service.js";

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
}

export async function listOrganizerEvents(
  req: Request,
  res: Response,
) {
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

export async function createEvent(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: "Usuário não autenticado.",
    });
  }

  const {
    externalId,
    startsAt,
    venueName,
    venueAddress,
    capacity,
    priceCents,
  } = req.body;

  if (
    !externalId ||
    !startsAt ||
    !venueName ||
    !venueAddress ||
    !Number.isInteger(capacity) ||
    capacity <= 0 ||
    !Number.isInteger(priceCents) ||
    priceCents <= 0
  ) {
    return res.status(400).json({
      message: "Dados do evento inválidos.",
    });
  }

  const parsedStartsAt = new Date(startsAt);

  if (Number.isNaN(parsedStartsAt.getTime())) {
    return res.status(400).json({
      message: "Data do evento inválida.",
    });
  }

  if (parsedStartsAt <= new Date()) {
    return res.status(400).json({
      message: "O evento deve acontecer em uma data futura.",
    });
  }

  try {
    const movie = await getTmdbMovie(String(externalId));

    const event = await prisma.event.create({
      data: {
        organizerId: req.user.id,

        externalProvider: "TMDB",
        externalId: movie.externalId,

        title: movie.title,
        description: movie.description,
        imageUrl: movie.imageUrl,

        startsAt: parsedStartsAt,

        venueName: String(venueName).trim(),
        venueAddress: String(venueAddress).trim(),

        capacity,
        availableTickets: capacity,

        priceCents,

        status: "PUBLISHED",
      },
    });

    return res.status(201).json(event);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TMDB_MOVIE_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Filme não encontrado no catálogo TMDb.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "TMDB_NOT_CONFIGURED"
    ) {
      return res.status(500).json({
        message: "Integração com TMDb não configurada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "TMDB_REQUEST_FAILED"
    ) {
      return res.status(502).json({
        message: "Não foi possível consultar o catálogo TMDb.",
      });
    }

    console.error("Erro ao criar evento:", error);

    return res.status(500).json({
      message: "Não foi possível criar o evento.",
    });
  }
};