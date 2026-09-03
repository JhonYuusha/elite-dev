import axios from "axios";

import { api } from "./api";

import type {
  CreateEventResponse,
  OrganizerEvent,
} from "../types/event";

export type CreateEventInput = {
  externalId: string;
  startsAt: string;
  venueName: string;
  venueAddress: string;
  capacity: number;
  priceCents: number;
};

export type UpdateEventInput = {
  priceCents: number;
  addCapacity?: number;
};

function getRequestErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      fallbackMessage
    );
  }

  return fallbackMessage;
}

async function getOrganizerEvents(): Promise<
  OrganizerEvent[]
> {
  try {
    const { data } =
      await api.get<OrganizerEvent[]>(
        "/events/organizer",
      );

    return data;
  } catch (error) {
    throw new Error(
      getRequestErrorMessage(
        error,
        "Não foi possível carregar suas sessões.",
      ),
      {
        cause: error,
      },
    );
  }
}

async function createEvent(
  input: CreateEventInput,
): Promise<CreateEventResponse> {
  try {
    const { data } =
      await api.post<CreateEventResponse>(
        "/events",
        input,
      );

    return data;
  } catch (error) {
    throw new Error(
      getRequestErrorMessage(
        error,
        "Não foi possível publicar o evento.",
      ),
      {
        cause: error,
      },
    );
  }
}

async function updateEvent(
  eventId: string,
  input: UpdateEventInput,
): Promise<OrganizerEvent> {
  try {
    const { data } =
      await api.patch<OrganizerEvent>(
        `/events/${eventId}`,
        input,
      );

    return data;
  } catch (error) {
    throw new Error(
      getRequestErrorMessage(
        error,
        "Não foi possível atualizar a sessão.",
      ),
      {
        cause: error,
      },
    );
  }
}

export const eventService = {
  getOrganizerEvents,
  createEvent,
  updateEvent,
};