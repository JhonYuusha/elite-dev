import type { Request, Response } from "express";

import { createReservationSchema } from "../schemas/reservation.schema.js";
import { reservationService } from "../services/reservation.service.js";

export async function createReservation(
  req: Request,
  res: Response,
) {
  const input =
    createReservationSchema.parse(req.body);

  const reservation =
    await reservationService.createReservation(
      req.user!.id,
      input,
    );

  return res
    .status(201)
    .json(reservation);
}

export async function getReservationById(
  req: Request<{ id: string }>,
  res: Response,
) {
  const reservation =
    await reservationService.getReservationById(
      req.user!.id,
      req.params.id,
    );

  return res.json(reservation);
}