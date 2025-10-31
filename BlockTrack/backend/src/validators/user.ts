import { z } from "zod";
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  DNI_REGEX,
  PASSWORD_REGEX,
} from "../helpers/regex";

export const registerUserSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre no puede estar vacío"),
  apellidos: z.string().trim().min(1, "Los apellidos no pueden estar vacíos"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, "Introduce un correo electrónico válido"),

  telefono: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Introduce un número de teléfono válido"),

  dni: z.string().trim().regex(DNI_REGEX, "Introduce un DNI válido"),

  contrasenia: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "La contraseña debe tener al menos 8 caracteres, una letra y un número"
    ),

  rol: z.enum(["CLIENTE", "TRANSPORTISTA"], {
    errorMap: () => ({ message: "El rol debe ser CLIENTE o TRANSPORTISTA" }),
  }),

  direccionPrincipal: z.string().trim().nullable().optional(),
  zonaOperativa: z.string().trim().nullable().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
