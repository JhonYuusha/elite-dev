import request from "supertest";

import { describe, expect, it } from "vitest";

import { app } from "../app.js";

describe("App", () => {
  it("deve responder que a API está funcionando", async () => {
    const response =
      await request(app).get("/");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "Elite Dev API is running 🚀",
    });
  });
});
