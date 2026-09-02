import { z } from "zod";

export const validateTicketSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "O código do ingresso é obrigatório."),

  eventId: z
    .string()
    .uuid("Informe um evento válido."),
});

export type ValidateTicketInput =
  z.infer<typeof validateTicketSchema>;
