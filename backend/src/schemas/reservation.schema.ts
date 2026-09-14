import { z } from "zod";

export const createReservationSchema = z
  .object({
    eventId: z
      .string()
      .uuid(
        "Informe um evento válido.",
      ),

    seatIds: z
      .array(
        z
          .string()
          .uuid(
            "Informe assentos válidos.",
          ),
      )
      .min(
        1,
        "Selecione pelo menos um assento.",
      )
      .max(
        6,
        "É possível reservar no máximo 6 assentos por vez.",
      ),
  })
  .refine(
    (data) =>
      new Set(data.seatIds).size ===
      data.seatIds.length,
    {
      message:
        "Não é possível selecionar o mesmo assento mais de uma vez.",
      path: ["seatIds"],
    },
  );

export type CreateReservationInput =
  z.infer<
    typeof createReservationSchema
  >;