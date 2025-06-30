export type UserRole = "RECEIVER" | "SENDER";

export interface RegisterUserPayload {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  dni: string;
  id: number;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface User {
  dni: string;
  email: string;
  role: UserRole;
  name: string;
  lastName: string;
  phone: string;
  id: number;
}
