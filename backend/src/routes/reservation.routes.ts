import { Router } from "express";

import {
  createReservation,
  getReservationById,
} from "../controllers/reservation.controller.js";

import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const reservationRouter = Router();

reservationRouter.get(
  "/:id",
  authenticate,
  authorize("CLIENT"),
  getReservationById,
);

reservationRouter.post(
  "/",
  authenticate,
  authorize("CLIENT"),
  createReservation,
);