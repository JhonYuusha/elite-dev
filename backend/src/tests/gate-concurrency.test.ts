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

describe("Gate concurrency", () => {
  const organizerId =
    "11111111-2222-4111-8111-111111111111";

  const clientId =
    "22222222-3333-4222-8222-222222222222";

  const gatekeeperId =
    "33333333-4444-4333-8333-333333333333";

  let eventId: string;
  let reservationId: string;
  let ticketId: string;

  let gatekeeperToken: string;
  let ticketCode: string;

  beforeAll(async () => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ||
      "test-secret";

    gatekeeperToken = jwt.sign(
      {
        role: "GATEKEEPER",
      },
      process.env.JWT_SECRET,
      {
        subject: gatekeeperId,
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
        name: "Organizador Gate Test",
        email:
          "organizer-gate-test@elite.dev",
        passwordHash: "not-used",
        role: "ORGANIZER",
      },
    });

    await prisma.user.upsert({
      where: {
        id: clientId,
      },

      update: {},

      create: {
        id: clientId,
        name: "Cliente Gate Test",
        email:
          "client-gate-test@elite.dev",
        passwordHash: "not-used",
        role: "CLIENT",
      },
    });

    await prisma.user.upsert({
      where: {
        id: gatekeeperId,
      },

      update: {},

      create: {
        id: gatekeeperId,
        name: "Portaria Gate Test",
        email:
          "gatekeeper-test@elite.dev",
        passwordHash: "not-used",
        role: "GATEKEEPER",
      },
    });

    const event =
      await prisma.event.create({
        data: {
          organizerId,

          externalProvider: "TEST",
          externalId:
            "gate-concurrency-test",

          title:
            "Evento Validação Concorrente",

          description:
            "Evento criado para teste automatizado da portaria.",

          startsAt:
            new Date(
              Date.now() +
                24 * 60 * 60 * 1000,
            ),

          venueName:
            "Cinema Gate Test",

          venueAddress:
            "Rua Gate Test, 789",

          capacity: 1,
          availableTickets: 0,
          priceCents: 3000,

          status: "PUBLISHED",
        },
      });

    eventId = event.id;

    const reservation =
      await prisma.reservation.create({
        data: {
          clientId,
          eventId,
          quantity: 1,
          totalCents: 3000,
          status: "PAID",
        },
      });

    reservationId =
      reservation.id;

    const ticket =
      await prisma.ticket.create({
        data: {
          reservationId,
          eventId,
          ownerId: clientId,
          status: "VALID",
        },
      });

    ticketId = ticket.id;

    ticketCode = jwt.sign(
      {
        ticketId,
        eventId,
        type: "TICKET",
      },
      process.env.JWT_SECRET,
    );
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: {
        id: ticketId,
      },
    });

    await prisma.reservation.deleteMany({
      where: {
        id: reservationId,
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
            clientId,
            gatekeeperId,
          ],
        },
      },
    });

    await prisma.$disconnect();
  });

  it("deve permitir apenas uma validação quando duas requisições usam o mesmo ingresso", async () => {
    const validateTicket = () =>
      request(app)
        .post("/gate/validate")
        .set(
          "Authorization",
          `Bearer ${gatekeeperToken}`,
        )
        .send({
          code: ticketCode,
          eventId,
        });

    const [
      firstResponse,
      secondResponse,
    ] = await Promise.all([
      validateTicket(),
      validateTicket(),
    ]);

    const responses = [
      firstResponse,
      secondResponse,
    ];

    const successfulResponses =
      responses.filter(
        (response) =>
          response.status === 200,
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
      successfulResponses[0].body,
    ).toEqual({
      status: "VALID",
      message:
        "Ingresso validado com sucesso.",
      ticketId,
      eventId,
    });

    expect(
      conflictResponses[0].body.status,
    ).toBe("ALREADY_USED");

    expect(
      conflictResponses[0].body.message,
    ).toBe(
      "Ingresso já utilizado.",
    );

    const ticket =
      await prisma.ticket.findUnique({
        where: {
          id: ticketId,
        },
      });

    expect(ticket?.status).toBe("USED");

    expect(
      ticket?.validatedById,
    ).toBe(gatekeeperId);

    expect(
      ticket?.validatedAt,
    ).not.toBeNull();
  });
});
