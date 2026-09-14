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

  let seatIds: string[];

  beforeAll(async () => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ||
      "test-secret";

    clientToken =
      jwt.sign(
        {
          role:
            "CLIENT",
        },
        process.env.JWT_SECRET,
        {
          subject:
            clientId,

          expiresIn:
            "1h",
        },
      );

    await prisma.user.upsert({
      where: {
        id: organizerId,
      },

      update: {},

      create: {
        id: organizerId,

        name:
          "Organizador Teste",

        email:
          "organizer-payment-test@elite.dev",

        passwordHash:
          "not-used",

        role:
          "ORGANIZER",
      },
    });

    await prisma.user.upsert({
      where: {
        id: clientId,
      },

      update: {},

      create: {
        id: clientId,

        name:
          "Cliente Teste",

        email:
          "client-payment-test@elite.dev",

        passwordHash:
          "not-used",

        role:
          "CLIENT",
      },
    });

    const event =
      await prisma.event.create({
        data: {
          organizerId,

          externalProvider:
            "TEST",

          externalId:
            "payment-declined-test",

          title:
            "Evento Pagamento Recusado",

          description:
            "Evento criado por teste automatizado.",

          startsAt:
            new Date(
              Date.now() +
                24 *
                  60 *
                  60 *
                  1000,
            ),

          venueName:
            "Cinema Teste",

          venueAddress:
            "Rua Teste, 123",

          capacity: 10,

          availableTickets:
            10,

          priceCents:
            2500,

          status:
            "PUBLISHED",
        },
      });

    eventId =
      event.id;

    const seats =
      await Promise.all(
        Array.from(
          {
            length: 10,
          },
          (_, index) =>
            prisma.seat.create({
              data: {
                eventId,

                row:
                  index < 8
                    ? "A"
                    : "B",

                number:
                  index < 8
                    ? index + 1
                    : index - 7,

                label:
                  index < 8
                    ? `A${String(
                        index + 1,
                      ).padStart(
                        2,
                        "0",
                      )}`
                    : `B${String(
                        index - 7,
                      ).padStart(
                        2,
                        "0",
                      )}`,

                type:
                  "STANDARD",

                status:
                  "AVAILABLE",
              },
            }),
        ),
      );

    seatIds =
      seats
        .slice(0, 3)
        .map(
          (seat) =>
            seat.id,
        );

    const reservationResponse =
      await request(app)
        .post(
          "/reservations",
        )
        .set(
          "Authorization",
          `Bearer ${clientToken}`,
        )
        .send({
          eventId,
          seatIds,
        });

    expect(
      reservationResponse.status,
    ).toBe(201);

    reservationId =
      reservationResponse.body.id;
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

  it(
    "deve devolver os assentos ao estoque quando o pagamento for recusado",
    async () => {
      const beforePayment =
        await prisma.event.findUnique({
          where: {
            id: eventId,
          },
        });

      expect(
        beforePayment
          ?.availableTickets,
      ).toBe(7);

      const beforeSeats =
        await prisma.seat.findMany({
          where: {
            id: {
              in: seatIds,
            },
          },
        });

      expect(
        beforeSeats.every(
          (seat) =>
            seat.status ===
            "RESERVED",
        ),
      ).toBe(true);

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
            result:
              "DECLINED",
          });

      expect(
        response.status,
      ).toBe(200);

      expect(
        response.body
          .paymentStatus,
      ).toBe(
        "DECLINED",
      );

      expect(
        response.body
          .reservation.status,
      ).toBe(
        "PAYMENT_FAILED",
      );

      const afterPayment =
        await prisma.event.findUnique({
          where: {
            id: eventId,
          },
        });

      expect(
        afterPayment
          ?.availableTickets,
      ).toBe(10);

      const afterSeats =
        await prisma.seat.findMany({
          where: {
            id: {
              in: seatIds,
            },
          },
        });

      expect(
        afterSeats.every(
          (seat) =>
            seat.status ===
            "AVAILABLE" &&
            seat.reservationId ===
              null,
        ),
      ).toBe(true);
    },
  );
});