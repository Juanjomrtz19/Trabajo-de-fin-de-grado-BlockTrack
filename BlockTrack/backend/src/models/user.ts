import { Role } from "../generated/prisma"; // o donde tengas el cliente generado

export interface User {
  dni: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  password: string;
}

export interface UserUpdate {
  dni: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  id: number;
}
