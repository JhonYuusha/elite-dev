import type { Request, Response } from "express";

import { processPaymentSchema } from "../schemas/payment.schema.js";
import { paymentService } from "../services/payment.service.js";

export async function processPayment(
  req: Request<{ id: string }>,
  res: Response,
) {
  const input =
    processPaymentSchema.parse(req.body);

  const response =
    await paymentService.processPayment(
      req.user!.id,
      req.params.id,
      input,
    );

  return res.json(response);
}