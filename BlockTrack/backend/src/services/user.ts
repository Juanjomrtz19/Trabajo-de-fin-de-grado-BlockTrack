import prisma from "../config/prisma";
import { Role } from "../generated/prisma";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

export const registerUser = async (data: User) => {
  const { dni, name, lastName, email, phone, role, password } = data;

  await prisma.user.create({
    data: {
      dni,
      name,
      lastName,
      email,
      phone,
      role: role.toUpperCase() as Role,
    },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (role.toUpperCase() === "SENDER") {
    await prisma.sender.create({
      data: { dni, password: hashedPassword },
    });
  } else if (role.toUpperCase() === "RECEIVER") {
    await prisma.receiver.create({
      data: { dni, password: hashedPassword },
    });
  }

  return { message: "User registered successfully" };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  let userPasswordRecord: { password: string } | null = null;
  if (user.role === "SENDER") {
    userPasswordRecord = await prisma.sender.findUnique({
      where: { dni: user.dni },
      select: { password: true },
    });
  } else if (user.role === "RECEIVER") {
    userPasswordRecord = await prisma.receiver.findUnique({
      where: { dni: user.dni },
      select: { password: true },
    });
  }

  if (!userPasswordRecord) {
    throw new Error("Contraseña no encontrada para el usuario");
  }

  const isMatch = await bcrypt.compare(password, userPasswordRecord.password);

  if (!isMatch) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      dni: user.dni,
      email: user.email,
      role: user.role,
      firstName: user.name,
      lastName: user.lastName,
      phone: user.phone,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      dni: string;
      email: string;
      role: Role;
      firstName: string;
      lastName: string;
      phone: string;
    };
  } catch (err) {
    throw new Error("Invalid token");
  }
};
