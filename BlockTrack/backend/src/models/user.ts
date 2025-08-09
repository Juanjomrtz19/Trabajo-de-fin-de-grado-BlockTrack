import { Rol } from "@prisma/client"; // o donde tengas el cliente generado

export interface Usuario {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: Rol;
  contrasenia: string;
  direccionPrincipal?: string | null;
  zonaOperativa?: string | null;
  disponibilidadActual?: boolean | null;
  documentacionValidad?: boolean | null;
}

export interface UsuarioUpdate {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: Rol;
  id: number;
}

export interface Transportista {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  rol: Rol;
  contrasenia: string;
  IdUsuario: number;
}
