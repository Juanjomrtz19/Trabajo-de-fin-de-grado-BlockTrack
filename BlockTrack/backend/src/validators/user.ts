import { z } from "zod";
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  DNI_REGEX,
  PASSWORD_REGEX,
} from "../utils/regex";

export const registerUserSchema = z.object({
  firstName: z.string().trim().min(1, "First Name cannot be empty"),
  lastName: z.string().trim().min(1, "Last Name cannot be empty"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(EMAIL_REGEX, "Please enter a valid email address"),

  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Please enter a valid phone number"),

  dni: z.string().trim().regex(DNI_REGEX, "Please enter a valid DNI"),

  password: z
    .string()
    .regex(PASSWORD_REGEX, "Password must be 8+ chars, 1 letter & 1 number"),

  role: z.string().trim().min(1, "Role cannot be empty"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
