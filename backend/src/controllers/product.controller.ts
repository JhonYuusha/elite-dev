import type {
  Request,
  Response,
} from "express";

import {
  productService,
} from "../services/product.service.js";

export async function listProducts(
  _req: Request,
  res: Response,
) {
  const products =
    await productService.listActiveProducts();

  return res.json(
    products,
  );
}
