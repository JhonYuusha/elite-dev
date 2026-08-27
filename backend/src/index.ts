import express from "express";
import cors from "cors";
import "dotenv/config";

import { authRouter } from "./routes/auth.routes.js";
import { eventRouter } from "./routes/event.routes.js";
import { reservationRouter } from "./routes/reservation.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { ticketRouter } from "./routes/ticket.routes.js";
import { gateRouter } from "./routes/gate.routes.js";
import { catalogRouter } from "./routes/catalog.routes.js";

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
app.use("/events", eventRouter);
app.use("/reservations", reservationRouter);
app.use("/payments", paymentRouter);
app.use("/tickets", ticketRouter);
app.use("/gate", gateRouter);
app.use("/catalog", catalogRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
