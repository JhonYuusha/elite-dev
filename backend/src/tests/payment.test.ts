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

describe("Payment", () => {
  const clientId =
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

  const organizerId =
    "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

  let clientToken: string;
  let eventId: string;
  let reservationId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ||
      "test-secret";

    clientToken = jwt.sign(
      {
        role: "CLIENT",
      },
      process.env.JWT_SECRET,
      {
        subject: clientId,
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
        name: "Organizador Teste",
        email:
          "organizer-payment-test@elite.dev",
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
        name: "Cliente Teste",
        email:
          "client-payment-test@elite.dev",
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
            "payment-declined-test",

          title:
            "Evento Pagamento Recusado",

          description:
            "Evento criado por teste automatizado.",

          startsAt:
            new Date(
              Date.now() +
                24 * 60 * 60 * 1000,
            ),

          venueName:
            "Cinema Teste",

          venueAddress:
            "Rua Teste, 123",

          capacity: 10,
          availableTickets: 10,
          priceCents: 2500,

          status: "PUBLISHED",
        },
      });

    eventId = event.id;

    const reservation =
      await prisma.reservation.create({
        data: {
          clientId,
          eventId,

          quantity: 3,

          totalCents:
            3 * 2500,

          status: "PENDING",
        },
      });

    reservationId =
      reservation.id;

    await prisma.event.update({
      where: {
        id: eventId,
      },

      data: {
        availableTickets: {
          decrement: 3,
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: {
        reservationId,
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
            clientId,
            organizerId,
          ],
        },
      },
    });

    await prisma.$disconnect();
  });

  it("deve devolver os ingressos ao estoque quando o pagamento for recusado", async () => {
    const beforePayment =
      await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    expect(
      beforePayment?.availableTickets,
    ).toBe(7);

    const response =
      await request(app)
        .post(
          `/payments/reservations/${reservationId}/pay`,
        )
        .set(
          "Authorization",
          `Bearer ${clientToken}`,
        )
        .send({
          result: "DECLINED",
        });

    expect(response.status).toBe(200);

    expect(
      response.body.paymentStatus,
    ).toBe("DECLINED");

    expect(
      response.body.reservation.status,
    ).toBe("PAYMENT_FAILED");

    const afterPayment =
      await prisma.event.findUnique({
        where: {
          id: eventId,
        },
      });

    expect(
      afterPayment?.availableTickets,
    ).toBe(10);
  });
});
