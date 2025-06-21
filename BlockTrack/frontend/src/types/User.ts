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
