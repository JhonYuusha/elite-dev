import express from "express";
import cors from "cors";
import "dotenv/config";

import { authRouter } from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Elite Dev API is running 🚀",
  });
});

app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});