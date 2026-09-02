import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { AppError } from "../errors/app-error.js";

import type {
  AuthenticatedUser,
} from "../types/auth.js";

export function authorize(
  ...roles: AuthenticatedUser["role"][]
) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      throw new AppError(
        "Usuário não autenticado.",
        401,
        "UNAUTHENTICATED",
      );
    }

    if (
      !roles.includes(
        req.user.role,
      )
    ) {
      throw new AppError(
        "Você não tem permissão para acessar este recurso.",
        403,
        "FORBIDDEN",
      );
    }

    next();
  };
}