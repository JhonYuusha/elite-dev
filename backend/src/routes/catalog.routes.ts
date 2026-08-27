import { Router } from "express";

import { searchMovies } from "../controllers/catalog.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

export const catalogRouter = Router();

catalogRouter.get(
  "/movies",
  authenticate,
  authorize("ORGANIZER"),
  searchMovies,
);
