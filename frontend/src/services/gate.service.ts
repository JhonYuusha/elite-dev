import axios from "axios";

import { api } from "./api";

export type GateResult =
  | {
      status: "VALID";
      message: string;
      ticketId: string;
      eventId: string;
    }
  | {
      status:
        | "INVALID"
        | "WRONG_EVENT"
        | "ALREADY_USED";
      message: string;
      validatedAt?: string;
    };

export type GateEventOption = {
  id: string;
  title: string;
  startsAt: string;
};

export type ValidateGateInput = {
  code: string;
  eventId: string;
};

async function getEvents(): Promise<
  GateEventOption[]
> {
  try {
    const { data } =
      await api.get<GateEventOption[]>(
        "/events",
      );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "Não foi possível carregar os eventos.",
        { cause: error },
      );
    }

    throw new Error(
      "Não foi possível carregar os eventos.",
      { cause: error },
    );
  }
}

async function validate(
  input: ValidateGateInput,
): Promise<GateResult> {
  try {
    const { data } =
      await api.post<GateResult>(
        "/gate/validate",
        input,
      );

    return data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.data
    ) {
      return error.response.data as GateResult;
    }

    throw new Error(
      "Não foi possível validar este ingresso.",
      { cause: error },
    );
  }
}

export const gateService = {
  getEvents,
  validate,
};
