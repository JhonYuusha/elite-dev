import { Router } from "express";

import { validateTicket } from "../controllers/gate.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const gateRouter = Router();

gateRouter.post(
  "/validate",
  authenticate,
  authorize("GATEKEEPER"),
  validateTicket,
);
