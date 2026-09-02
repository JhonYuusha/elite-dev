import { z } from "zod";

export const createEventSchema = z.object({
  externalId: z
    .union([z.string(), z.number()])
    .transform((value) => String(value)),

  startsAt: z
    .string()
    .min(1, "A data e o horário são obrigatórios."),

  venueName: z
    .string()
    .trim()
    .min(1, "O nome do local é obrigatório."),

  venueAddress: z
    .string()
    .trim()
    .min(1, "O endereço do local é obrigatório."),

  capacity: z
    .number()
    .int("A capacidade deve ser um número inteiro.")
    .positive("A capacidade deve ser maior que zero."),

  priceCents: z
    .number()
    .int("O preço deve ser um número inteiro.")
    .positive("O preço deve ser maior que zero."),
});

export const updateEventSchema = z
  .object({
    addCapacity: z
      .number()
      .int("A quantidade de novos lugares deve ser um número inteiro.")
      .positive(
        "A quantidade de novos lugares deve ser maior que zero.",
      )
      .optional(),

    priceCents: z
      .number()
      .int("O preço deve ser um número inteiro.")
      .positive("O preço deve ser maior que zero.")
      .optional(),
  })
  .refine(
    (data) =>
      data.addCapacity !== undefined ||
      data.priceCents !== undefined,
    {
      message: "Nenhuma alteração foi informada.",
    },
  );

export type CreateEventInput =
  z.infer<typeof createEventSchema>;

export type UpdateEventInput =
  z.infer<typeof updateEventSchema>;
