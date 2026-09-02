import type {
  Request,
  Response,
} from "express";

import { validateTicketSchema } from "../schemas/gate.schema.js";
import { gateService } from "../services/gate.service.js";

export async function validateTicket(
  req: Request,
  res: Response,
) {
  const input =
    validateTicketSchema.parse(req.body);

  const result =
    await gateService.validateTicket(
      req.user!.id,
      input,
    );

  return res.json(result);
}