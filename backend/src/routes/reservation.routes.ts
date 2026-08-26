import { Router } from "express";

import { createReservation } from "../controllers/reservation.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const reservationRouter = Router();

reservationRouter.post(
  "/",
  authenticate,
  authorize("CLIENT"),
  createReservation,
);
