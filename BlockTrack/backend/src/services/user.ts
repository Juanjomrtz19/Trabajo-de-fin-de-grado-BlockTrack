import prisma from "../config/prisma";
import { Role } from "../generated/prisma";
import { User, UserUpdate } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

export const registerUser = async (data: User) => {
  const { dni, name, lastName, email, phone, role, password } = data;

  try {
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

    const user = await prisma.user.findUnique({
      where: { dni },
      select: { id: true },
    });

    if (!user?.id) {
      throw new Error("User ID is missing");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role.toUpperCase() === "SENDER") {
      await prisma.sender.create({
        data: { userId: user.id, password: hashedPassword },
      });
    } else if (role.toUpperCase() === "RECEIVER") {
      await prisma.receiver.create({
        data: { userId: user.id, password: hashedPassword },
      });
    }

    return { message: "User registered successfully" };
  } catch (err) {
    console.error("Error", err);
  }
};

export const loginUser = async (email: string, password: string) => {
  console.log("llego aqui");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  let userPasswordRecord: { password: string } | null = null;
  if (user.role === "SENDER") {
    userPasswordRecord = await prisma.sender.findUnique({
      where: { userId: user.id },
      select: { password: true },
    });
  } else if (user.role === "RECEIVER") {
    userPasswordRecord = await prisma.receiver.findUnique({
      where: { userId: user.id },
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
      name: user.name,
      lastName: user.lastName,
      phone: user.phone,
      id: user.id,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

export const updateUser = async (data: UserUpdate) => {
  const { dni, name, lastName, email, phone, id } = data;
  console.log("data", data);
  const result = await prisma.user.update({
    where: { id: Number(id) },
    data: {
      dni,
      name,
      lastName,
      email,
      phone,
    },
  });
  return result;
};

export const verifyToken = async (token: string) => {
  try {
    const result = jwt.verify(token, JWT_SECRET) as {
      dni: string;
      email: string;
      role: Role;
      name: string;
      lastName: string;
      phone: string;
      id: number;
    };

    const currentUser = await prisma.user.findUnique({
      where: { id: result.id },
    });

    return { ...currentUser };
  } catch (err) {
    throw new Error("Invalid token");
  }
};
