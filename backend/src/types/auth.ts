import type { UserRole } from "../generated/prisma/enums.js";

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
};
