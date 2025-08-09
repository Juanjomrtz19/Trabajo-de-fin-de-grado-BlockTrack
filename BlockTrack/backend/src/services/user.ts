import prisma from "../config/prisma";
import { Rol } from "@prisma/client";
import { Transportista, Usuario, UsuarioUpdate } from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

export const registerUser = async (data: Usuario) => {
  const {
    dni,
    nombre,
    apellidos,
    email,
    telefono,
    rol,
    contrasenia,
    direccionPrincipal,
    zonaOperativa,
    disponibilidadActual,
    documentacionValidad,
  } = data;

  try {
    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    await prisma.usuario.create({
      data: {
        dni,
        nombre,
        apellidos,
        email,
        telefono,
        rol: rol.toUpperCase() as Rol,
        contrasenia: hashedPassword,
      },
    });

    const usuario = await prisma.usuario.findUnique({
      where: { dni },
      select: { id: true },
    });

    if (!usuario?.id) {
      throw new Error("User ID is missing");
    }

    if (rol.toUpperCase() === "CLIENTE") {
      if (!direccionPrincipal) {
        throw new Error("direccionPrincipal is required for CLIENTE");
      }
      await prisma.cliente.create({
        data: { usuarioId: usuario.id, direccionPrincipal: direccionPrincipal },
      });
    } else if (rol.toUpperCase() === "TRANSPORTISTA") {
      await prisma.transportista.create({
        data: {
          usuarioId: usuario.id,
          zonaOperativa: zonaOperativa ?? "",
          disponibilidaActual: disponibilidadActual ?? true,
          documentacionValidad: documentacionValidad ?? true,
        },
      });
    }

    return { message: "User registered successfully" };
  } catch (err) {
    console.error("Error", err);
    throw new Error("Error al registrar usuario");
  }
};

export const loginUser = async (email: string, password: string) => {
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  const userPasswordRecord = await prisma.usuario.findUnique({
    where: { id: usuario.id },
    select: { contrasenia: true },
  });

  if (!userPasswordRecord) {
    throw new Error("Contraseña no encontrada para el usuario");
  }

  const isMatch = await bcrypt.compare(
    password,
    userPasswordRecord.contrasenia
  );

  if (!isMatch) {
    throw new Error("Credenciales inválidas");
  }

  const token = jwt.sign(
    {
      dni: usuario.dni,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      telefono: usuario.telefono,
      id: usuario.id,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

export const updateUser = async (data: UsuarioUpdate) => {
  const { dni, nombre, apellidos, email, telefono, id } = data;
  console.log("data", data);
  const result = await prisma.usuario.update({
    where: { id: Number(id) },
    data: {
      dni,
      nombre,
      apellidos,
      email,
      telefono,
    },
  });
  return result;
};

export const verifyToken = async (token: string) => {
  try {
    const result = jwt.verify(token, JWT_SECRET) as {
      dni: string;
      email: string;
      rol: Rol;
      nombre: string;
      apellidos: string;
      telefono: string;
      id: number;
    };

    const currentUser = await prisma.usuario.findUnique({
      where: { id: result.id },
    });

    return {
      nombre: currentUser?.nombre ?? "",
      apellidos: currentUser?.apellidos ?? "",
      email: currentUser?.email ?? "",
      telefono: currentUser?.telefono ?? "",
      rol: currentUser?.rol ?? "",
      dni: currentUser?.dni ?? "",
    };
  } catch (err) {
    throw new Error("Invalid token");
  }
};
