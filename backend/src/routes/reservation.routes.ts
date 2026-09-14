import {
  Router,
} from "express";

import {
  createReservation,
  getReservationById,
  updateReservationItems,
} from "../controllers/reservation.controller.js";

import {
  authenticate,
} from "../middlewares/authenticate.js";

import {
  authorize,
} from "../middlewares/authorize.js";

export const reservationRouter =
  Router();

reservationRouter.get(
  "/:id",
  authenticate,
  authorize("CLIENT"),
  getReservationById,
);

reservationRouter.put(
  "/:id/items",
  authenticate,
  authorize("CLIENT"),
  updateReservationItems,
);

reservationRouter.post(
  "/",
  authenticate,
  authorize("CLIENT"),
  createReservation,
);