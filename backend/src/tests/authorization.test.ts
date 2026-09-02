import jwt from "jsonwebtoken";
import request from "supertest";

import {
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import { app } from "../app.js";

describe("Authorization", () => {
  beforeAll(() => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET ||
      "test-secret";
  });

  it("deve impedir CLIENT de acessar rota exclusiva de ORGANIZER", async () => {
    const token = jwt.sign(
      {
        role: "CLIENT",
      },
      process.env.JWT_SECRET!,
      {
        subject:
          "11111111-1111-4111-8111-111111111111",
        expiresIn: "1h",
      },
    );

    const response =
      await request(app)
        .get("/events/organizer")
        .set(
          "Authorization",
          `Bearer ${token}`,
        );

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      message:
        "Você não tem permissão para acessar este recurso.",
      code: "FORBIDDEN",
    });
  });
});
