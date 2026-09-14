import {
  Router,
} from "express";

import {
  listProducts,
} from "../controllers/product.controller.js";

export const productRouter =
  Router();

productRouter.get(
  "/",
  listProducts,
);
