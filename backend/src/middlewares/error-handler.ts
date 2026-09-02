import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../errors/app-error.js";
import { GateError } from "../errors/gate-error.js";

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Dados inválidos.",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  if (error instanceof GateError) {
    res.status(error.statusCode).json({
      status: error.gateStatus,
      message: error.message,

      ...(error.validatedAt && {
        validatedAt: error.validatedAt,
      }),
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Erro interno do servidor.",
  });
};