import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";

import type {
  UpdateReservationItemsInput,
} from "../schemas/reservation-items.schema.js";

import type {
  CreateReservationInput,
} from "../schemas/reservation.schema.js";

const reservationInclude = {
  event: {
    select: {
      id: true,
      title: true,
      imageUrl: true,
      startsAt: true,
      venueName: true,
      venueAddress: true,
      priceCents: true,
    },
  },

  seats: {
    select: {
      id: true,
      row: true,
      number: true,
      label: true,
      type: true,
      status: true,
    },

    orderBy: [
      {
        row: "asc" as const,
      },
      {
        number: "asc" as const,
      },
    ],
  },

  items: {
    select: {
      id: true,
      productId: true,
      quantity: true,
      unitPriceCents: true,
      totalCents: true,

      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          imageUrl: true,
          category: true,
        },
      },
    },

    orderBy: {
      createdAt:
        "asc" as const,
    },
  },
};

async function createReservation(
  clientId: string,
  input: CreateReservationInput,
) {
  const {
    eventId,
    seatIds,
  } = input;

  const quantity =
    seatIds.length;

  return prisma.$transaction(
    async (tx) => {
      const event =
        await tx.event.findFirst({
          where: {
            id: eventId,
            status:
              "PUBLISHED",

            startsAt: {
              gte: new Date(),
            },
          },
        });

      if (!event) {
        throw new AppError(
          "Evento não encontrado ou indisponível.",
          404,
          "EVENT_NOT_FOUND",
        );
      }

      const selectedSeats =
        await tx.seat.findMany({
          where: {
            eventId,

            id: {
              in: seatIds,
            },
          },

          select: {
            id: true,
          },
        });

      if (
        selectedSeats.length !==
        quantity
      ) {
        throw new AppError(
          "Um ou mais assentos não pertencem a esta sessão.",
          400,
          "INVALID_SEATS",
        );
      }

      const ticketUnitPriceCents =
        event.priceCents;

      const ticketsSubtotalCents =
        ticketUnitPriceCents *
        quantity;

      const reservation =
        await tx.reservation.create({
          data: {
            clientId,
            eventId,
            quantity,

            ticketUnitPriceCents,
            ticketsSubtotalCents,

            productsSubtotalCents:
              0,

            totalCents:
              ticketsSubtotalCents,

            status:
              "PENDING",
          },
        });

      const reservedSeats =
        await tx.seat.updateMany({
          where: {
            eventId,

            id: {
              in: seatIds,
            },

            status:
              "AVAILABLE",

            reservationId:
              null,
          },

          data: {
            status:
              "RESERVED",

            reservationId:
              reservation.id,
          },
        });

      if (
        reservedSeats.count !==
        quantity
      ) {
        throw new AppError(
          "Um ou mais assentos não estão mais disponíveis.",
          409,
          "SEAT_UNAVAILABLE",
        );
      }

      const updatedEvent =
        await tx.event.updateMany({
          where: {
            id: eventId,

            availableTickets: {
              gte: quantity,
            },
          },

          data: {
            availableTickets: {
              decrement:
                quantity,
            },
          },
        });

      if (
        updatedEvent.count === 0
      ) {
        throw new AppError(
          "O inventário desta sessão está inconsistente.",
          409,
          "SEAT_INVENTORY_CONFLICT",
        );
      }

      const result =
        await tx.reservation.findUnique({
          where: {
            id: reservation.id,
          },

          include:
            reservationInclude,
        });

      if (!result) {
        throw new AppError(
          "Não foi possível concluir a reserva.",
          500,
          "RESERVATION_CREATION_FAILED",
        );
      }

      return result;
    },
  );
}

async function getReservationById(
  clientId: string,
  reservationId: string,
) {
  const reservation =
    await prisma.reservation.findFirst({
      where: {
        id: reservationId,
        clientId,
      },

      include:
        reservationInclude,
    });

  if (!reservation) {
    throw new AppError(
      "Reserva não encontrada.",
      404,
      "RESERVATION_NOT_FOUND",
    );
  }

  return reservation;
}

async function updateReservationItems(
  clientId: string,
  reservationId: string,
  input: UpdateReservationItemsInput,
) {
  return prisma.$transaction(
    async (tx) => {
      const reservation =
        await tx.reservation.findFirst({
          where: {
            id: reservationId,
            clientId,
          },

          select: {
            id: true,
            status: true,
            ticketsSubtotalCents:
              true,
          },
        });

      if (!reservation) {
        throw new AppError(
          "Reserva não encontrada.",
          404,
          "RESERVATION_NOT_FOUND",
        );
      }

      if (
        reservation.status !==
        "PENDING"
      ) {
        throw new AppError(
          "A bomboniere só pode ser alterada enquanto a reserva estiver pendente.",
          409,
          "RESERVATION_ALREADY_PROCESSED",
        );
      }

      const productIds =
        input.items.map(
          (item) =>
            item.productId,
        );

      const products =
        productIds.length > 0
          ? await tx.product.findMany({
              where: {
                id: {
                  in: productIds,
                },

                active: true,
              },

              select: {
                id: true,
                priceCents: true,
              },
            })
          : [];

      if (
        products.length !==
        productIds.length
      ) {
        throw new AppError(
          "Um ou mais produtos não estão disponíveis.",
          400,
          "INVALID_PRODUCTS",
        );
      }

      const productMap =
        new Map(
          products.map(
            (product) => [
              product.id,
              product,
            ],
          ),
        );

      const items =
        input.items.map(
          (item) => {
            const product =
              productMap.get(
                item.productId,
              );

            if (!product) {
              throw new AppError(
                "Produto indisponível.",
                400,
                "INVALID_PRODUCTS",
              );
            }

            const totalCents =
              product.priceCents *
              item.quantity;

            return {
              reservationId:
                reservation.id,

              productId:
                product.id,

              quantity:
                item.quantity,

              unitPriceCents:
                product.priceCents,

              totalCents,
            };
          },
        );

      const productsSubtotalCents =
        items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.totalCents,
          0,
        );

      const totalCents =
        reservation.ticketsSubtotalCents +
        productsSubtotalCents;

      const updated =
        await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            clientId,
            status:
              "PENDING",
          },

          data: {
            productsSubtotalCents,
            totalCents,
          },
        });

      if (
        updated.count === 0
      ) {
        throw new AppError(
          "Esta reserva já foi processada.",
          409,
          "RESERVATION_ALREADY_PROCESSED",
        );
      }

      await tx.reservationItem.deleteMany({
        where: {
          reservationId:
            reservation.id,
        },
      });

      if (
        items.length > 0
      ) {
        await tx.reservationItem.createMany({
          data: items,
        });
      }

      const result =
        await tx.reservation.findUnique({
          where: {
            id: reservation.id,
          },

          include:
            reservationInclude,
        });

      if (!result) {
        throw new AppError(
          "Reserva não encontrada.",
          404,
          "RESERVATION_NOT_FOUND",
        );
      }

      return result;
    },
  );
}

export const reservationService = {
  createReservation,
  getReservationById,
  updateReservationItems,
};