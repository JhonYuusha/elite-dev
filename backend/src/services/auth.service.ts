import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AppError } from "../errors/app-error.js";
import { prisma } from "../lib/prisma.js";
import type { LoginInput } from "../schemas/auth.schema.js";

async function login({ email, password }: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(
      "E-mail ou senha inválidos.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError(
      "E-mail ou senha inválidos.",
      401,
      "INVALID_CREDENTIALS",
    );
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET não definida.");
  }

  const token = jwt.sign(
    {
      role: user.role,
    },
    jwtSecret,
    {
      subject: user.id,
      expiresIn: "8h",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export const authService = {
  login,
};
