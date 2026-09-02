export type GateStatus =
  | "INVALID"
  | "WRONG_EVENT"
  | "ALREADY_USED";

export class GateError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly gateStatus: GateStatus,
    message: string,
    public readonly validatedAt?: Date | null,
  ) {
    super(message);

    this.name = "GateError";
  }
}
