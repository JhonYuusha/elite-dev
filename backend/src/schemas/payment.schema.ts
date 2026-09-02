import { z } from "zod";

export const processPaymentSchema = z.object({
  result: z.enum(["APPROVED", "DECLINED"], {
    message: "Resultado do pagamento inválido.",
  }),
});

export type ProcessPaymentInput =
  z.infer<typeof processPaymentSchema>;
