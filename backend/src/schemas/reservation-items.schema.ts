import { z } from "zod";

const MAX_QUANTITY_PER_PRODUCT = 4;
const MAX_TOTAL_ITEMS = 8;

const reservationItemSchema =
  z.object({
    productId: z
      .string()
      .uuid(
        "Informe um produto válido.",
      ),

    quantity: z
      .number()
      .int(
        "A quantidade deve ser inteira.",
      )
      .min(
        1,
        "A quantidade mínima é 1.",
      )
      .max(
        MAX_QUANTITY_PER_PRODUCT,
        `É possível adicionar no máximo ${MAX_QUANTITY_PER_PRODUCT} unidades do mesmo produto.`,
      ),
  });

export const updateReservationItemsSchema =
  z
    .object({
      items: z
        .array(
          reservationItemSchema,
        )
        .max(
          10,
          "A reserva possui produtos demais.",
        ),
    })
    .refine(
      (data) =>
        new Set(
          data.items.map(
            (item) =>
              item.productId,
          ),
        ).size ===
        data.items.length,
      {
        message:
          "O mesmo produto não pode aparecer mais de uma vez.",
        path: ["items"],
      },
    )
    .refine(
      (data) =>
        data.items.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.quantity,
          0,
        ) <= MAX_TOTAL_ITEMS,
      {
        message:
          `É possível adicionar no máximo ${MAX_TOTAL_ITEMS} itens da bomboniere por reserva.`,
        path: ["items"],
      },
    );

export type UpdateReservationItemsInput =
  z.infer<
    typeof updateReservationItemsSchema
  >;