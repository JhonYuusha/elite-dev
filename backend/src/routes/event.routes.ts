import { Router } from "express";

import {
  createEvent,
  getEventById,
  listEvents,
  listOrganizerEvents,
  updateEvent,
} from "../controllers/event.controller.js";

import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const eventRouter = Router();

eventRouter.get("/", listEvents);

eventRouter.get(
  "/organizer",
  authenticate,
  authorize("ORGANIZER"),
  listOrganizerEvents,
);

eventRouter.get("/:id", getEventById);

eventRouter.post(
  "/",
  authenticate,
  authorize("ORGANIZER"),
  createEvent,
);

eventRouter.patch(
  "/:id",
  authenticate,
  authorize("ORGANIZER"),
  updateEvent,
);