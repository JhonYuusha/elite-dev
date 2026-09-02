import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

import type {
  CreateEventInput,
  UpdateEventInput,
} from "../schemas/event.schema.js";

import { getTmdbMovie } from "./tmdb.service.js";

async function listPublishedEvents() {
  return prisma.event.findMany({
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
}

async function getPublishedEventById(id: string) {
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
    throw new AppError(
      "Evento não encontrado.",
      404,
      "EVENT_NOT_FOUND",
    );
  }

  return event;
}

async function listOrganizerEvents(organizerId: string) {
  return prisma.event.findMany({
    where: {
      organizerId,
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
      venueAddress: true,
      capacity: true,
      availableTickets: true,
      priceCents: true,
      status: true,
      createdAt: true,
    },
  });
}

async function createEvent(
  organizerId: string,
  input: CreateEventInput,
) {
  const parsedStartsAt = new Date(input.startsAt);

  if (
    Number.isNaN(parsedStartsAt.getTime()) ||
    parsedStartsAt <= new Date()
  ) {
    throw new AppError(
      "O evento deve acontecer em uma data futura.",
      400,
      "INVALID_EVENT_DATE",
    );
  }

  let movie;

  try {
    movie = await getTmdbMovie(input.externalId);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TMDB_MOVIE_NOT_FOUND"
    ) {
      throw new AppError(
        "Filme não encontrado no catálogo TMDb.",
        404,
        "TMDB_MOVIE_NOT_FOUND",
      );
    }

    if (
      error instanceof Error &&
      error.message === "TMDB_NOT_CONFIGURED"
    ) {
      throw new AppError(
        "Integração com TMDb não configurada.",
        500,
        "TMDB_NOT_CONFIGURED",
      );
    }

    if (
      error instanceof Error &&
      error.message === "TMDB_REQUEST_FAILED"
    ) {
      throw new AppError(
        "Não foi possível consultar o catálogo TMDb.",
        502,
        "TMDB_REQUEST_FAILED",
      );
    }

    throw error;
  }

  const cleanVenueName = input.venueName.trim();
  const cleanVenueAddress = input.venueAddress.trim();

  const conflictStart = new Date(
    parsedStartsAt.getTime() - 30 * 60 * 1000,
  );

  const conflictEnd = new Date(
    parsedStartsAt.getTime() + 30 * 60 * 1000,
  );

  const conflictingEvent =
    await prisma.event.findFirst({
      where: {
        organizerId,

        externalProvider: "TMDB",
        externalId: movie.externalId,

        venueName: {
          equals: cleanVenueName,
          mode: "insensitive",
        },

        status: {
          not: "CANCELLED",
        },

        startsAt: {
          gte: conflictStart,
          lte: conflictEnd,
        },
      },
    });

  if (conflictingEvent) {
    throw new AppError(
      "Já existe uma sessão deste filme neste local em um horário muito próximo.",
      409,
      "EVENT_TIME_CONFLICT",
    );
  }

  return prisma.event.create({
    data: {
      organizerId,

      externalProvider: "TMDB",
      externalId: movie.externalId,

      title: movie.title,
      description: movie.description,
      imageUrl: movie.imageUrl,

      startsAt: parsedStartsAt,

      venueName: cleanVenueName,
      venueAddress: cleanVenueAddress,

      capacity: input.capacity,
      availableTickets: input.capacity,

      priceCents: input.priceCents,

      status: "PUBLISHED",
    },
  });
}

async function updateEvent(
  organizerId: string,
  eventId: string,
  input: UpdateEventInput,
) {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      organizerId,
    },
  });

  if (!event) {
    throw new AppError(
      "Evento não encontrado.",
      404,
      "EVENT_NOT_FOUND",
    );
  }

  if (event.status !== "PUBLISHED") {
    throw new AppError(
      "Apenas sessões publicadas podem ser alteradas.",
      409,
      "EVENT_NOT_PUBLISHED",
    );
  }

  return prisma.event.update({
    where: {
      id: event.id,
    },

    data: {
      ...(input.priceCents !== undefined && {
        priceCents: input.priceCents,
      }),

      ...(input.addCapacity !== undefined && {
        capacity: {
          increment: input.addCapacity,
        },

        availableTickets: {
          increment: input.addCapacity,
        },
      }),
    },
  });
}

export const eventService = {
  listPublishedEvents,
  getPublishedEventById,
  listOrganizerEvents,
  createEvent,
  updateEvent,
};
