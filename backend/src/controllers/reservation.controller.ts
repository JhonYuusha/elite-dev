import type {
  Request,
  Response,
} from "express";

import {
  updateReservationItemsSchema,
} from "../schemas/reservation-items.schema.js";

import {
  createReservationSchema,
} from "../schemas/reservation.schema.js";

import {
  reservationService,
} from "../services/reservation.service.js";

export async function createReservation(
  req: Request,
  res: Response,
) {
  const input =
    createReservationSchema.parse(
      req.body,
    );

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
  req: Request<{
    id: string;
  }>,
  res: Response,
) {
  const reservation =
    await reservationService.getReservationById(
      req.user!.id,
      req.params.id,
    );

  return res.json(
    reservation,
  );
}

export async function updateReservationItems(
  req: Request<{
    id: string;
  }>,
  res: Response,
) {
  const input =
    updateReservationItemsSchema.parse(
      req.body,
    );

  const reservation =
    await reservationService.updateReservationItems(
      req.user!.id,
      req.params.id,
      input,
    );

  return res.json(
    reservation,
  );
}