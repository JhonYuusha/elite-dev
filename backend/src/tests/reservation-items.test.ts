import {
  afterAll,
  describe,
  expect,
  it,
} from "vitest";

import { randomUUID } from "node:crypto";

import { prisma } from "../lib/prisma.js";

import {
  updateReservationItemsSchema,
} from "../schemas/reservation-items.schema.js";

import {
  paymentService,
} from "../services/payment.service.js";

import {
  reservationService,
} from "../services/reservation.service.js";

const createdUserIds: string[] = [];
const createdEventIds: string[] = [];
const createdProductIds: string[] = [];

async function createScenario() {
  const uniqueId =
    randomUUID();

  const organizer =
    await prisma.user.create({
      data: {
        name:
          "Organizador Teste",

        email:
          `organizer-${uniqueId}@test.local`,

        passwordHash:
          "test",

        role:
          "ORGANIZER",
      },
    });

  createdUserIds.push(
    organizer.id,
  );

  const client =
    await prisma.user.create({
      data: {
        name:
          "Cliente Teste",

        email:
          `client-${uniqueId}@test.local`,

        passwordHash:
          "test",

        role:
          "CLIENT",
      },
    });

  createdUserIds.push(
    client.id,
  );

  const event =
    await prisma.event.create({
      data: {
        organizerId:
          organizer.id,

        externalProvider:
          "TEST",

        externalId:
          `movie-${uniqueId}`,

        title:
          "Sessão Teste",

        description:
          "Sessão usada nos testes da bomboniere.",

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

        capacity: 2,

        availableTickets: 2,

        priceCents: 3000,

        status:
          "PUBLISHED",
      },
    });

  createdEventIds.push(
    event.id,
  );

  const seats =
    await Promise.all([
      prisma.seat.create({
        data: {
          eventId:
            event.id,

          row: "A",
          number: 1,
          label: "A01",

          type:
            "STANDARD",

          status:
            "AVAILABLE",
        },
      }),

      prisma.seat.create({
        data: {
          eventId:
            event.id,

          row: "A",
          number: 2,
          label: "A02",

          type:
            "STANDARD",

          status:
            "AVAILABLE",
        },
      }),
    ]);

  const product =
    await prisma.product.create({
      data: {
        slug:
          `pipoca-${uniqueId}`,

        name:
          "Pipoca Teste",

        description:
          "Produto usado no teste.",

        category:
          "POPCORN",

        priceCents: 1800,

        active: true,

        sortOrder: 1,
      },
    });

  createdProductIds.push(
    product.id,
  );

  const reservation =
    await reservationService.createReservation(
      client.id,
      {
        eventId:
          event.id,

        seatIds:
          seats.map(
            (seat) =>
              seat.id,
          ),
      },
    );

  return {
    client,
    event,
    product,
    reservation,
  };
}

afterAll(async () => {
  if (
    createdEventIds.length >
    0
  ) {
    await prisma.ticket.deleteMany({
      where: {
        eventId: {
          in: createdEventIds,
        },
      },
    });

    await prisma.reservationItem.deleteMany({
      where: {
        reservation: {
          eventId: {
            in: createdEventIds,
          },
        },
      },
    });

    await prisma.seat.deleteMany({
      where: {
        eventId: {
          in: createdEventIds,
        },
      },
    });

    await prisma.reservation.deleteMany({
      where: {
        eventId: {
          in: createdEventIds,
        },
      },
    });

    await prisma.event.deleteMany({
      where: {
        id: {
          in: createdEventIds,
        },
      },
    });
  }

  if (
    createdProductIds.length >
    0
  ) {
    await prisma.product.deleteMany({
      where: {
        id: {
          in: createdProductIds,
        },
      },
    });
  }

  if (
    createdUserIds.length >
    0
  ) {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: createdUserIds,
        },
      },
    });
  }
});

describe(
  "Itens da reserva",
  () => {
    it(
      "deve calcular os produtos e o total da reserva no servidor",
      async () => {
        const {
          client,
          product,
          reservation,
        } =
          await createScenario();

        const updatedReservation =
          await reservationService.updateReservationItems(
            client.id,
            reservation.id,
            {
              items: [
                {
                  productId:
                    product.id,

                  quantity: 2,
                },
              ],
            },
          );

        expect(
          updatedReservation.ticketUnitPriceCents,
        ).toBe(3000);

        expect(
          updatedReservation.ticketsSubtotalCents,
        ).toBe(6000);

        expect(
          updatedReservation.productsSubtotalCents,
        ).toBe(3600);

        expect(
          updatedReservation.totalCents,
        ).toBe(9600);

        expect(
          updatedReservation.items,
        ).toHaveLength(1);

        expect(
          updatedReservation.items[0],
        ).toMatchObject({
          productId:
            product.id,

          quantity: 2,

          unitPriceCents: 1800,

          totalCents: 3600,
        });
      },
    );

    it(
      "deve impedir quantidades abusivas de produtos",
      () => {
        const productId =
          randomUUID();

        const result =
          updateReservationItemsSchema.safeParse(
            {
              items: [
                {
                  productId,
                  quantity: 900,
                },
              ],
            },
          );

        expect(
          result.success,
        ).toBe(false);

        if (
          result.success
        ) {
          throw new Error(
            "A validação deveria ter falhado.",
          );
        }

        expect(
          result.error.issues.some(
            (issue) =>
              issue.message.includes(
                "no máximo 4 unidades",
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "deve impedir mais de 8 itens no total da bomboniere",
      () => {
        const result =
          updateReservationItemsSchema.safeParse(
            {
              items: [
                {
                  productId:
                    randomUUID(),
                  quantity: 4,
                },

                {
                  productId:
                    randomUUID(),
                  quantity: 4,
                },

                {
                  productId:
                    randomUUID(),
                  quantity: 1,
                },
              ],
            },
          );

        expect(
          result.success,
        ).toBe(false);

        if (
          result.success
        ) {
          throw new Error(
            "A validação deveria ter falhado.",
          );
        }

        expect(
          result.error.issues.some(
            (issue) =>
              issue.message.includes(
                "no máximo 8 itens",
              ),
          ),
        ).toBe(true);
      },
    );

    it(
      "deve impedir alteração da bomboniere depois do pagamento",
      async () => {
        const {
          client,
          product,
          reservation,
        } =
          await createScenario();

        await reservationService.updateReservationItems(
          client.id,
          reservation.id,
          {
            items: [
              {
                productId:
                  product.id,

                quantity: 1,
              },
            ],
          },
        );

        await paymentService.processPayment(
          client.id,
          reservation.id,
          {
            result:
              "APPROVED",
          },
        );

        await expect(
          reservationService.updateReservationItems(
            client.id,
            reservation.id,
            {
              items: [
                {
                  productId:
                    product.id,

                  quantity: 2,
                },
              ],
            },
          ),
        ).rejects.toThrow(
          "A bomboniere só pode ser alterada enquanto a reserva estiver pendente.",
        );
      },
    );
  },
);
