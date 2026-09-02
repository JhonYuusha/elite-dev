import type { Request, Response } from "express";

import { loginSchema } from "../schemas/auth.schema.js";
import { authService } from "../services/auth.service.js";

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);

  const result = await authService.login(input);

  return res.json(result);
}