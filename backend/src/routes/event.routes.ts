import { Router } from "express";

import {
  getEventById,
  listEvents,
} from "../controllers/event.controller.js";

export const eventRouter = Router();

eventRouter.get("/", listEvents);
eventRouter.get("/:id", getEventById);