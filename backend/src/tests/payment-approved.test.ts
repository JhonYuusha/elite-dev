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

describe("Approved payment", () => {
  const organizerId =
    "11111111-1111-4111-8111-111111111111";

  const clientId =
    "22222222-2222-4222-8222-222222222222";

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
        name:
          "Organizador Pagamento Aprovado",

        email:
          "organizer-payment-approved-test@elite.dev",

        passwordHash:
          "not-used",

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
        name:
          "Cliente Pagamento Aprovado",

        email:
          "client-payment-approved-test@elite.dev",

        passwordHash:
          "not-used",

        role: "CLIENT",
      },
    });

    const event =
      await prisma.event.create({
        data: {
          organizerId,

          externalProvider:
            "TEST",

          externalId:
            "payment-approved-test",

          title:
            "Evento Pagamento Aprovado",

          description:
            "Evento criado para testar pagamento aprovado com assentos.",

          startsAt:
            new Date(
              Date.now() +
                24 *
                  60 *
                  60 *
                  1000,
            ),

          venueName:
            "Cinema Pagamento Aprovado",

          venueAddress:
            "Rua dos Testes, 777",

          capacity: 4,

          availableTickets: 4,

          priceCents: 3000,

          status:
            "PUBLISHED",
        },
      });

    eventId = event.id;

    const seats =
      await Promise.all(
        Array.from(
          {
            length: 4,
          },
          (_, index) =>
            prisma.seat.create({
              data: {
                eventId,

                row: "A",

                number:
                  index + 1,

                label:
                  `A${String(
                    index + 1,
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
        .slice(0, 2)
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
            clientId,
          ],
        },
      },
    });

    await prisma.$disconnect();
  });

  it(
    "deve vender os assentos e criar um ingresso para cada lugar reservado",
    async () => {
      const reservationBeforePayment =
        await prisma.reservation.findUnique({
          where: {
            id: reservationId,
          },

          include: {
            seats: true,
          },
        });

      expect(
        reservationBeforePayment
          ?.status,
      ).toBe(
        "PENDING",
      );

      expect(
        reservationBeforePayment
          ?.quantity,
      ).toBe(2);

      expect(
        reservationBeforePayment
          ?.totalCents,
      ).toBe(6000);

      expect(
        reservationBeforePayment
          ?.seats,
      ).toHaveLength(2);

      expect(
        reservationBeforePayment
          ?.seats.every(
            (seat) =>
              seat.status ===
              "RESERVED",
          ),
      ).toBe(true);

      const eventBeforePayment =
        await prisma.event.findUnique({
          where: {
            id: eventId,
          },
        });

      expect(
        eventBeforePayment
          ?.availableTickets,
      ).toBe(2);

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
              "APPROVED",
          });

      expect(
        response.status,
      ).toBe(200);

      expect(
        response.body
          .paymentStatus,
      ).toBe(
        "APPROVED",
      );

      expect(
        response.body
          .reservation.status,
      ).toBe(
        "PAID",
      );

      expect(
        response.body.tickets,
      ).toHaveLength(2);

      const reservationAfterPayment =
        await prisma.reservation.findUnique({
          where: {
            id: reservationId,
          },

          include: {
            seats: true,
            tickets: true,
          },
        });

      expect(
        reservationAfterPayment
          ?.status,
      ).toBe(
        "PAID",
      );

      expect(
        reservationAfterPayment
          ?.seats,
      ).toHaveLength(2);

      expect(
        reservationAfterPayment
          ?.seats.every(
            (seat) =>
              seat.status ===
              "SOLD",
          ),
      ).toBe(true);

      expect(
        reservationAfterPayment
          ?.tickets,
      ).toHaveLength(2);

      const ticketSeatIds =
        reservationAfterPayment
          ?.tickets
          .map(
            (ticket) =>
              ticket.seatId,
          )
          .filter(
            (
              seatId,
            ): seatId is string =>
              seatId !== null,
          )
          .sort();

      expect(
        ticketSeatIds,
      ).toEqual(
        [...seatIds].sort(),
      );

      const tickets =
        await prisma.ticket.findMany({
          where: {
            reservationId,
          },

          include: {
            seat: true,
          },
        });

      expect(
        tickets,
      ).toHaveLength(2);

      expect(
        tickets.every(
          (ticket) =>
            ticket.seatId !==
              null &&
            ticket.seat !==
              null &&
            ticket.seat.status ===
              "SOLD" &&
            ticket.seat
              .reservationId ===
              reservationId,
        ),
      ).toBe(true);

      const uniqueTicketSeatIds =
        new Set(
          tickets.map(
            (ticket) =>
              ticket.seatId,
          ),
        );

      expect(
        uniqueTicketSeatIds.size,
      ).toBe(2);

      const eventAfterPayment =
        await prisma.event.findUnique({
          where: {
            id: eventId,
          },
        });

      expect(
        eventAfterPayment
          ?.availableTickets,
      ).toBe(2);
    },
  );
});
