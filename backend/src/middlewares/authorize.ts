import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../generated/prisma/enums.js";

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Você não possui permissão para acessar este recurso.",
      });
    }

    next();
  };
}
