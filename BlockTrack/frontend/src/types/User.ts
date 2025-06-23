export type UserRole = "RECEIVER" | "SENDER";

export interface RegisterUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  password: string;
  role: UserRole;
  dni: string;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface User {
  dni: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
}
