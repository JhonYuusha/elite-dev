import { z } from "zod";

export const createReservationSchema = z.object({
  eventId: z
    .string()
    .uuid("Informe um evento válido."),

  quantity: z
    .number()
    .int("A quantidade deve ser um número inteiro.")
    .positive("A quantidade deve ser maior que zero."),
});

export type CreateReservationInput =
  z.infer<typeof createReservationSchema>;
