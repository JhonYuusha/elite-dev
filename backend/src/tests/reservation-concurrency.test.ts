import jwt from "jsonwebtoken";
import request from "supertest";

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import { app } from "../app.js";
import { prisma } from "../lib/prisma.js";

describe("Reservation concurrency", () => {
  const organizerId =
    "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

  const clientOneId =
    "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

  const clientTwoId =
    "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

  let eventId: string;

  let clientOneToken: string;
  let clientTwoToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ||
      "test-secret";

    clientOneToken = jwt.sign(
      {
        role: "CLIENT",
      },
      process.env.JWT_SECRET,
      {
        subject: clientOneId,
        expiresIn: "1h",
      },
    );

    clientTwoToken = jwt.sign(
      {
        role: "CLIENT",
      },
      process.env.JWT_SECRET,
      {
        subject: clientTwoId,
        expiresIn: "1h",
      },
    );

    await prisma.user.upsert({
      where: {
        id: organizerId,
      },

      update: {},

      create: {
        id: organizerId,
        name: "Organizador Concorrência",
        email:
          "organizer-concurrency-test@elite.dev",
        passwordHash: "not-used",
        role: "ORGANIZER",
      },
    });

    await prisma.user.upsert({
      where: {
        id: clientOneId,
      },

      update: {},

      create: {
        id: clientOneId,
        name: "Cliente Concorrência Um",
        email:
          "client-one-concurrency-test@elite.dev",
        passwordHash: "not-used",
        role: "CLIENT",
      },
    });

    await prisma.user.upsert({
      where: {
        id: clientTwoId,
      },

      update: {},

      create: {
        id: clientTwoId,
        name: "Cliente Concorrência Dois",
        email:
          "client-two-concurrency-test@elite.dev",
        passwordHash: "not-used",
        role: "CLIENT",
      },
    });

    const event =
      await prisma.event.create({
        data: {
          organizerId,

          externalProvider: "TEST",
          externalId:
            "reservation-concurrency-test",

          title:
            "Último Ingresso",

          description:
            "Evento para teste automatizado de concorrência.",

          startsAt:
            new Date(
              Date.now() +
                24 * 60 * 60 * 1000,
            ),

          venueName:
            "Cinema Concorrência",

          venueAddress:
            "Rua Teste, 456",

          capacity: 1,
          availableTickets: 1,
          priceCents: 3000,

          status: "PUBLISHED",
        },
      });

    eventId = event.id;
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: {
        eventId,
      },
    });

    await prisma.reservation.deleteMany({
      where: {
        eventId,
      },
    });

    await prisma.event.deleteMany({
      where: {
        id: eventId,
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: {
          in: [
            organizerId,
            clientOneId,
            clientTwoId,
          ],
        },
      },
    });

    await prisma.$disconnect();
  });

  it("deve permitir apenas uma reserva quando dois clientes disputam o último ingresso", async () => {
    const createReservation = (
      token: string,
    ) =>
      request(app)
        .post("/reservations")
        .set(
          "Authorization",
          `Bearer ${token}`,
        )
        .send({
          eventId,
          quantity: 1,
        });

    const [
      firstResponse,
      secondResponse,
    ] = await Promise.all([
      createReservation(
        clientOneToken,
      ),

      createReservation(
        clientTwoToken,
      ),
    ]);

    const responses = [
      firstResponse,
      secondResponse,
    ];

    const successfulResponses =
      responses.filter(
        (response) =>
          response.status === 201,
      );

    const conflictResponses =
      responses.filter(
        (response) =>
          response.status === 409,
      );

    expect(
      successfulResponses,
    ).toHaveLength(1);

    expect(
      conflictResponses,
    ).toHaveLength(1);

    expect(
      conflictResponses[0].body,
    ).toEqual({
      message:
        "Quantidade de ingressos indisponível.",
      code: "INSUFFICIENT_TICKETS",
    });

    const event =
      await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    expect(
      event?.availableTickets,
    ).toBe(0);

    const reservations =
      await prisma.reservation.findMany({
        where: {
          eventId,
        },
      });

    expect(
      reservations,
    ).toHaveLength(1);

    expect(
      reservations[0].quantity,
    ).toBe(1);
  });
});
