import type {
  NextFunction,
  Request,
  Response,
} from "express";

import jwt from "jsonwebtoken";

import { AppError } from "../errors/app-error.js";

import type {
  AuthenticatedUser,
} from "../types/auth.js";

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
  _res: Response,
  next: NextFunction,
) {
  const authorization =
    req.headers.authorization;

  if (
    !authorization?.startsWith(
      "Bearer ",
    )
  ) {
    throw new AppError(
      "Token de autenticação não informado.",
      401,
      "AUTH_TOKEN_MISSING",
    );
  }

  const token =
    authorization.slice(7);

  const jwtSecret =
    process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "JWT_SECRET não definida.",
    );
  }

  try {
    const payload = jwt.verify(
      token,
      jwtSecret,
    ) as TokenPayload & {
      sub?: string;
    };

    if (
      !payload.sub ||
      !payload.role
    ) {
      throw new AppError(
        "Token inválido.",
        401,
        "INVALID_AUTH_TOKEN",
      );
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Token inválido ou expirado.",
      401,
      "INVALID_AUTH_TOKEN",
    );
  }
}