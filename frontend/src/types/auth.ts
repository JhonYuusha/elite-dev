export type UserRole = "ORGANIZER" | "CLIENT" | "GATEKEEPER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type LoginResponse = {
  token: string;
  user: User;
};
