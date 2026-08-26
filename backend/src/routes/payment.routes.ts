import { Router } from "express";

import { processPayment } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const paymentRouter = Router();

paymentRouter.post(
  "/reservations/:id/pay",
  authenticate,
  authorize("CLIENT"),
  processPayment,
);
