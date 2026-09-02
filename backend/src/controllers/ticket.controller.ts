import type {
  Request,
  Response,
} from "express";

import { ticketService } from "../services/ticket.service.js";

export async function listMyTickets(
  req: Request,
  res: Response,
) {
  const tickets =
    await ticketService.listMyTickets(
      req.user!.id,
    );

  return res.json(tickets);
}

export async function getSharedTicket(
  req: Request<{ shareToken: string }>,
  res: Response,
) {
  const ticket =
    await ticketService.getSharedTicket(
      req.params.shareToken,
    );

  return res.json(ticket);
}