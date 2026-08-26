import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { AuthenticatedUser } from "../types/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

type TokenPayload = {
  role: AuthenticatedUser["role"];
};

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Token de autenticação não informado.",
    });
  }

  const token = authorization.slice(7);

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET não definida.");
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as TokenPayload & {
      sub?: string;
    };

    if (!payload.sub || !payload.role) {
      return res.status(401).json({
        message: "Token inválido.",
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }
}
