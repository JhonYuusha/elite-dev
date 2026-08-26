import { Router } from "express";

import {
  getSharedTicket,
  listMyTickets,
} from "../controllers/ticket.controller.js";

import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const ticketRouter = Router();

ticketRouter.get(
  "/me",
  authenticate,
  authorize("CLIENT"),
  listMyTickets,
);

ticketRouter.get(
  "/shared/:shareToken",
  getSharedTicket,
);
