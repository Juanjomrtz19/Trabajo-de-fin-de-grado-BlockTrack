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
  direccionPrincipalCP?: number | null;
  direccionPrincipalCiudad?: string | null;
  direccionPrincipalLat?: number | null;
  direccionPrincipalLon?: number | null;
  zonaOperativaCP?: number | null;
  zonaOperativaCiudad?: string | null;
  zonaOperativaLat?: number | null;
  zonaOperativaLon?: number | null;
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
  clienteId?: number | null;
  transportistaId?: number | null;
}
