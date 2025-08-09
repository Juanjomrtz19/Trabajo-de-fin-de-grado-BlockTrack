export type UserRole = "TRANSPORTISTA" | "CLIENTE";

export interface RegisterUserPayload {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  contrasenia: string;
  dni: string;
  rol: "TRANSPORTISTA" | "CLIENTE" | "";
  direccionPrincipal?: string | null;
  zonaOperativa?: string | null;
}

export interface LoginUserPayload {
  email: string;
  password: string;
}

export interface User {
  dni: string;
  email: string;
  rol: "TRANSPORTISTA" | "CLIENTE" | "";
  nombre: string;
  apellidos: string;
  telefono: string;
  id: number;
}
