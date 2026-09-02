import type { Request, Response } from "express";

import {
  createEventSchema,
  updateEventSchema,
} from "../schemas/event.schema.js";

import { eventService } from "../services/event.service.js";

export async function listEvents(
  _req: Request,
  res: Response,
) {
  const events =
    await eventService.listPublishedEvents();

  return res.json(events);
}

export async function getEventById(
  req: Request<{ id: string }>,
  res: Response,
) {
  const event =
    await eventService.getPublishedEventById(
      req.params.id,
    );

  return res.json(event);
}

export async function listOrganizerEvents(
  req: Request,
  res: Response,
) {
  const events =
    await eventService.listOrganizerEvents(
      req.user!.id,
    );

  return res.json(events);
}

export async function createEvent(
  req: Request,
  res: Response,
) {
  const input = createEventSchema.parse(req.body);

  const event = await eventService.createEvent(
    req.user!.id,
    input,
  );

  return res.status(201).json(event);
}

export async function updateEvent(
  req: Request<{ id: string }>,
  res: Response,
) {
  const input = updateEventSchema.parse(req.body);

  const event = await eventService.updateEvent(
    req.user!.id,
    req.params.id,
    input,
  );

  return res.json(event);
}